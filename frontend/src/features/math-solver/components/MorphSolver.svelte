<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { backOut, cubicOut } from 'svelte/easing'
  import { animate, stagger } from 'animejs'
  import MathRenderer from './MathRenderer.svelte'
  import RulePopup from './RulePopup.svelte'
  import FunctionPlot from './FunctionPlot.svelte'
  import { analyzeTransformation, generateExplanation, diffTrees, type ExplanationOutput } from '../engine/explanation'
  import { buildStepAnimation, getColoredSpans } from '../../../features/math-solver/engine/animation'
  import type { Timeline } from '../../../features/math-solver/engine/animation'
  import { getRuleColor, rulePillClasses } from '../constants'

  interface Step {
    step_number:        number
    description:        string
    expr_latex:         string
    highlighted_latex?: string
    explanation?:       string
    rule_name?:         string
  }
  interface Result {
    type:       string
    latex?:     string
    result?:    string
    solutions?: string[]
    message?:   string
  }

  let { steps = [], result = null }: { steps: Step[]; result: Result | null } = $props()

  // ── Reduced motion preference ──────────────────────────────────────────────
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ── Phase machine ──────────────────────────────────────────────────────────
  // show-before : before is highlighted, after is dim
  // show-after  : before dims out, after lights up
  // chain-out   : after morphs into the next before
  // done        : final result shown
  type Phase = 'idle' | 'show-before' | 'show-after' | 'chain-out' | 'done'

  let currentIndex = $state(0)
  let phase        = $state<Phase>('idle')
  let autoMode     = $state(true)
  let copyDone     = $state(false)
  let whyOpen      = $state(false)
  let breakdownWhyStep = $state<Step | null>(null)

  // ── Explanation engine ─────────────────────────────────────────────────────
  let currentExplanation = $state<ExplanationOutput | null>(null)
  let currentTimeline    = $state<Timeline | null>(null)

  // What each panel shows
  let beforeLatex  = $state('')   // always expr_latex of current step
  let afterLatex   = $state('')   // always expr_latex of next step
  // Highlighted versions (used during respective highlight phases)
  let beforeHighlighted = $state('')
  let afterHighlighted  = $state('')
  // Which version is actually rendered in each panel
  let beforeDisplay = $state('')
  let afterDisplay  = $state('')

  // Panel highlight states (drive CSS classes)
  let beforeLit = $state(false)
  let afterLit  = $state(false)
  let beforeColor = $state('#EA580C')
  let afterColor  = $state('#EA580C')

  // DOM refs
  let beforeEl: HTMLDivElement | undefined = $state()
  let afterEl:  HTMLDivElement | undefined = $state()
  let beforePanelEl: HTMLDivElement | undefined = $state()
  let afterPanelEl:  HTMLDivElement | undefined = $state()

  // ── Timers & anims ─────────────────────────────────────────────────────────
  let timers: ReturnType<typeof setTimeout>[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeAnims: any[] = []
  function t(fn: () => void, ms: number) { const id = setTimeout(fn, ms); timers.push(id); return id }
  function clearTimers() { timers.forEach(clearTimeout); timers = [] }
  function clearAnims()  { activeAnims.forEach(a => { try { a.pause?.() } catch {} }); activeAnims = [] }
  function clearAll()    { clearTimers(); clearAnims() }

  // ── Timing (ms) ────────────────────────────────────────────────────────────
  const T_BEFORE  = prefersReduced ? 0 : 1400  // hold before-highlighted
  const T_AFTER   = prefersReduced ? 0 : 1400  // hold after-highlighted
  const T_CHAIN   = prefersReduced ? 0 : 500   // fade-out duration between steps
  const T_SETTLE  = prefersReduced ? 0 : 80    // gap after fade before next step

  // ── katex-highlight on a container's colored spans ────────────────────────
  function popColoredSpans(container: HTMLElement | undefined) {
    if (!container || prefersReduced) return
    const targets = Array.from(container.querySelectorAll<HTMLElement>('.katex [style*="color:"]'))
    if (!targets.length) return
    targets.forEach(el => { el.style.display = 'inline-block' })
    const a = animate(targets, {
      opacity:  [0.3, 1],
      duration: 380,
      delay:    stagger(40),
      easing:   'easeOutCubic',
      onComplete: () => { activeAnims = activeAnims.filter(x => x !== a) }
    })
    activeAnims.push(a)
  }

  // ── Chain transition: both panels fade out, next step fades in ───────────
  function chainFade(onComplete: () => void) {
    if (prefersReduced) { onComplete(); return }
    const targets: HTMLElement[] = []
    if (beforePanelEl) targets.push(beforePanelEl)
    if (afterPanelEl)  targets.push(afterPanelEl)
    const arrowEl = beforePanelEl?.parentElement?.querySelector<HTMLElement>('.step-arrow')
    if (arrowEl) targets.push(arrowEl)

    if (!targets.length) { onComplete(); return }

    const a = animate(targets, {
      opacity:  [1, 0],
      duration: T_CHAIN,
      easing:   'easeInOutCubic',
      onComplete: () => {
        activeAnims = activeAnims.filter(x => x !== a)
        onComplete()
      }
    })
    activeAnims.push(a)
  }

  // ── Animation timeline player ──────────────────────────────────────────────
  // Plays a Timeline against a KaTeX container using animejs.
  // Each entry targets the colored spans (highlighted nodes from the backend).
  function playTimeline(timeline: Timeline, container: HTMLElement | undefined) {
    if (!container || prefersReduced || timeline.animations.length === 0) return

    for (const entry of timeline.animations) {
      const id = t(() => {
        const targets = getColoredSpans(container)
        if (!targets.length) return

        // Ensure spans are inline-block so transforms work
        targets.forEach(el => { el.style.display = 'inline-block' })

        const op = entry.op
        let anim: ReturnType<typeof animate> | null = null

        if (op.type === 'highlight_term') {
          anim = animate(targets, {
            opacity:  [0.3, 1],
            duration: op.duration,
            delay:    stagger(40),
            easing:   'easeOutCubic',
            onComplete: () => { if (anim) activeAnims = activeAnims.filter(x => x !== anim) }
          })
        } else if (op.type === 'fade_out') {
          anim = animate(targets, {
            opacity:  [1, 0],
            duration: op.duration,
            easing:   'easeInCubic',
            onComplete: () => { if (anim) activeAnims = activeAnims.filter(x => x !== anim) }
          })
        } else if (op.type === 'move_term') {
          // Slide in from off-screen (approximate; exact offset requires measuring)
          const fromRight = op.from === 'left' // moving right → slides in from left
          anim = animate(targets, {
            translateX: [fromRight ? -40 : 40, 0],
            opacity:    [0, 1],
            duration:   op.duration,
            easing:     'cubicBezier(0.16, 1, 0.3, 1)',
            onComplete: () => { if (anim) activeAnims = activeAnims.filter(x => x !== anim) }
          })
        } else if (op.type === 'simplify_number' || op.type === 'rewrite_expression') {
          anim = animate(targets, {
            opacity:  [0.3, 1],
            duration: op.duration,
            delay:    stagger(35),
            easing:   'easeOutCubic',
            onComplete: () => { if (anim) activeAnims = activeAnims.filter(x => x !== anim) }
          })
        }

        if (anim) activeAnims.push(anim)
      }, entry.time)
      timers.push(id)
    }
  }


  function runStep(index: number) {
    if (index >= steps.length) { phase = 'done'; return }

    const s    = steps[index]
    const next = steps[index + 1]

    currentIndex = index
    phase        = 'show-before'
    whyOpen      = false

     // Set panel content
     beforeLatex      = s.expr_latex ?? ''
     beforeHighlighted = s.highlighted_latex ?? s.expr_latex ?? ''
     beforeColor      = getRuleColor(s.rule_name)

     // When there is no next step, show the final result in the "Después" panel
     const finalExpr   = result?.latex ?? result?.result ?? s.expr_latex ?? ''
     afterLatex       = next?.expr_latex ?? finalExpr
     afterHighlighted  = next?.highlighted_latex ?? next?.expr_latex ?? finalExpr
     afterColor       = getRuleColor(next?.rule_name)

    // Compute pedagogical explanation + animation timeline for this transition
    try {
      const analysis = analyzeTransformation(beforeLatex, afterLatex)
      currentExplanation = generateExplanation(analysis)
      const ops = diffTrees(beforeLatex, afterLatex)
      currentTimeline = buildStepAnimation(analysis.transformation, ops)
    } catch {
      currentExplanation = null
      currentTimeline    = null
    }

    // Start with plain versions, before lit
    beforeDisplay = beforeLatex
    afterDisplay  = afterLatex
    beforeLit     = false
    afterLit      = false

    // Reset panel opacities (in case coming from chain-out)
    if (beforePanelEl) { beforePanelEl.style.opacity = '1'; beforePanelEl.style.transform = '' }
    if (afterPanelEl)  { afterPanelEl.style.opacity  = '1'; afterPanelEl.style.transform  = '' }
    const arrowEl = beforePanelEl?.parentElement?.querySelector<HTMLElement>('.step-arrow')
    if (arrowEl) arrowEl.style.opacity = '1'

    if (!autoMode) {
      // Manual mode: immediately show both panels with highlighted content
      // User can click each panel to toggle its highlight
      phase         = 'show-after'  // park in show-after so "Siguiente paso" shows
      beforeDisplay = beforeHighlighted
      afterDisplay  = afterHighlighted
      beforeLit     = true
      afterLit      = true
      t(() => {
        popColoredSpans(beforeEl)
        popColoredSpans(afterEl)
        if (currentTimeline) {
          playTimeline(currentTimeline, beforeEl)
          playTimeline(currentTimeline, afterEl)
        }
      }, 30)
      return
    }

    // 1. Light up before
    t(() => {
      beforeDisplay = beforeHighlighted
      beforeLit     = true
      t(() => {
        popColoredSpans(beforeEl)
        if (currentTimeline) playTimeline(currentTimeline, beforeEl)
      }, 30)

      if (!autoMode) return

      // 2. After T_BEFORE: dim before, light up after
      t(() => {
        phase         = 'show-after'
        beforeDisplay = beforeLatex   // back to plain
        beforeLit     = false
        afterDisplay  = afterHighlighted
        afterLit      = true
        t(() => {
          popColoredSpans(afterEl)
          if (currentTimeline) playTimeline(currentTimeline, afterEl)
        }, 30)

        if (!autoMode) return

          // 3. After T_AFTER: chain morph
        t(() => {
          if (!next) {
            // Last step — fade both out then show result
            phase = 'chain-out'
            if (!prefersReduced) {
              if (beforePanelEl) {
                const a = animate(beforePanelEl, { opacity: [1, 0], duration: 300, easing: 'easeInCubic', onComplete: () => { activeAnims = activeAnims.filter(x => x !== a) } })
                activeAnims.push(a)
              }
              if (afterPanelEl) {
                const a = animate(afterPanelEl, { opacity: [1, 0], duration: 300, easing: 'easeInCubic', onComplete: () => { activeAnims = activeAnims.filter(x => x !== a) } })
                activeAnims.push(a)
              }
            }
            t(() => { phase = 'done' }, prefersReduced ? 0 : 320)
            return
          }

          phase = 'chain-out'
          afterLit = false
          chainFade(() => {
            t(() => runStep(index + 1), T_SETTLE)
          })
        }, T_AFTER)

      }, T_BEFORE)
    }, 40)
  }

  // ── Manual panel clicks ────────────────────────────────────────────────────
  function toggleBeforePanel() {
    if (!showManual) return
    beforeLit = !beforeLit
    if (beforeLit) t(() => popColoredSpans(beforeEl), 30)
  }

  function toggleAfterPanel() {
    if (!showManual) return
    afterLit = !afterLit
    if (afterLit) t(() => popColoredSpans(afterEl), 30)
  }

  // ── Manual next step ───────────────────────────────────────────────────────
  function advanceManualNext() {
    clearAll()
    const next = steps[currentIndex + 1]
    if (!next) { phase = 'done'; return }
    // Manual mode: skip all fade/settle animations, jump instantly
    runStep(currentIndex + 1)
  }

  // ── Reset when steps change ────────────────────────────────────────────────
  $effect(() => {
    const _len = steps.length
    clearAll()
    currentIndex       = 0
    phase              = _len > 0 ? 'show-before' : 'idle'
    beforeLatex        = ''
    afterLatex         = ''
    beforeDisplay      = ''
    afterDisplay       = ''
    beforeLit          = false
    afterLit           = false
    copyDone           = false
    whyOpen            = false
    currentExplanation = null
    currentTimeline    = null
    if (!_len) return
    t(() => runStep(0), 80)
    return () => clearAll()
  })

  // ── Close why popup when step advances ────────────────────────────────────
  // Done inline in runStep() to avoid a reactive effect that writes state it doesn't own.

  // ── Stop auto when switching to Manual ────────────────────────────────────
  $effect(() => {
    if (!autoMode && (phase === 'show-before' || phase === 'show-after')) {
      clearTimers()
      clearAnims()
    }
  })

  // ── Derived ────────────────────────────────────────────────────────────────
  const step        = $derived(steps[currentIndex] ?? null)
  const nextStep    = $derived(steps[currentIndex + 1] ?? null)
  const isDone      = $derived(phase === 'done')
  const showManual  = $derived(!autoMode && (phase === 'show-before' || phase === 'show-after'))

  async function copyLatex() {
    const text = result?.latex ?? result?.result ?? ''
    if (!text) return
    try { await navigator.clipboard.writeText(text) } catch {
      // Clipboard API unavailable — silently ignore
    }
    copyDone = true
    t(() => (copyDone = false), 2000)
  }

  function typeLabel(type: string) {
    return (
      {
        equation: 'Ecuación',
        expression: 'Expresión',
        derivative: 'Derivada',
        integral: 'Integral',
        limit: 'Límite',
        no_solution: 'Sin solución'
      } as Record<string, string>
    )[type] ?? type
  }
  function typeColor(type: string) {
    return (
      {
        equation: 'bg-violet-500',
        expression: 'bg-blue-500',
        derivative: 'bg-teal-500',
        integral: 'bg-indigo-500',
        limit: 'bg-pink-500',
        no_solution: 'bg-slate-400'
      } as Record<string, string>
    )[type] ?? 'bg-orange-500'
  }
</script>

<section
  class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
  aria-label="Resolución paso a paso"
>
  {#if steps.length > 0}

    <!-- Header -->
    <div
      in:fade={{ duration: prefersReduced ? 0 : 260, easing: cubicOut }}
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50"
    >
      <div class="flex items-center gap-3">
        <h2 class="font-semibold text-lg text-gray-800">Resolución paso a paso</h2>
        {#if result && isDone}
          <span in:scale={{ duration: prefersReduced ? 0 : 240, easing: backOut }}
            class="text-xs font-semibold px-2.5 py-1 rounded-full text-white {typeColor(result.type)}"
          >{typeLabel(result.type)}</span>
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 hidden sm:inline">Ritmo:</span>
        <div class="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
          <button onclick={() => { autoMode = true }}
            aria-label="Ritmo automático"
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {autoMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}"
          >Auto</button>
          <button onclick={() => { autoMode = false }}
            aria-label="Ritmo manual"
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {!autoMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}"
          >Manual</button>
        </div>
      </div>
    </div>

    <div class="p-5 space-y-5">

      <!-- Progress dots -->
      {#if !isDone && steps.length > 1}
        <div class="flex items-center justify-center gap-1.5 flex-wrap" aria-label="Progreso: paso {currentIndex + 1} de {steps.length}" role="status">
          {#each steps as s, i}
            <span
              title="Paso {s.step_number}"
              aria-hidden="true"
              class="rounded-full transition-all duration-300
                {i === currentIndex ? 'w-5 h-2.5 bg-orange-500'
                  : i < currentIndex ? 'w-2 h-2 bg-orange-300'
                  : 'w-2 h-2 bg-gray-200'}"
            ></span>
          {/each}
        </div>
      {/if}

      <!-- ── Before / After panels ──────────────────────────────────────────── -->
      {#if !isDone}
        <div class="before-after-row">

          <!-- BEFORE panel -->
          <div
            class="math-panel {beforeLit ? 'is-lit' : 'is-dim'} {showManual ? 'is-clickable' : ''}"
            style="--pc: {beforeColor}"
            bind:this={beforePanelEl}
            onclick={toggleBeforePanel}
            role={showManual ? 'button' : undefined}
            tabindex={showManual ? 0 : undefined}
            onkeydown={showManual ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBeforePanel() } } : undefined}
            aria-label={showManual ? 'Alternar resaltado del panel Antes' : undefined}
          >
            <div class="panel-label">Antes</div>
            <div class="panel-math" bind:this={beforeEl}>
              <MathRenderer latex={beforeDisplay} inline={false} />
            </div>
          </div>

          <!-- Arrow -->
          <div class="step-arrow" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14h16M16 8l6 6-6 6" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- AFTER panel -->
          <div
            class="math-panel {afterLit ? 'is-lit' : 'is-dim'} {showManual ? 'is-clickable' : ''}"
            style="--pc: {afterColor}"
            bind:this={afterPanelEl}
            onclick={toggleAfterPanel}
            role={showManual ? 'button' : undefined}
            tabindex={showManual ? 0 : undefined}
            onkeydown={showManual ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAfterPanel() } } : undefined}
            aria-label={showManual ? 'Alternar resaltado del panel Después' : undefined}
          >
            <div class="panel-label">Después</div>
            <div class="panel-math" bind:this={afterEl}>
              <MathRenderer latex={afterDisplay} inline={false} />
            </div>
          </div>

        </div>
      {/if}

      <!-- Step label -->
      {#if !isDone && step}
        {#key currentIndex}
          <div
            in:fade={{ duration: prefersReduced ? 0 : 200, delay: prefersReduced ? 0 : 40, easing: cubicOut }}
            class="flex items-start justify-between gap-3 px-1"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="shrink-0 w-6 h-6 rounded-full text-[11px] font-bold
                           flex items-center justify-center bg-orange-500 text-white">
                {step.step_number}
              </span>
              <p class="text-sm font-semibold text-gray-700 leading-snug">{step.description}</p>
             </div>
             {#if step.rule_name}
               <div class="flex items-center gap-1.5 shrink-0">
                 <span class="text-[10px] font-bold px-2 py-0.5 rounded-full {rulePillClasses(getRuleColor(step.rule_name))}">
                   {step.rule_name}
                 </span>
                <button
                  type="button"
                  onclick={() => whyOpen = true}
                  aria-label="¿Por qué se aplica {step.rule_name}?"
                  title="¿Por qué?"
                  class="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold
                         flex items-center justify-center leading-none
                         hover:bg-orange-200 transition-colors cursor-pointer
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                >?</button>
              </div>
            {/if}
          </div>
        {/key}
      {/if}

      <!-- ── Explanation panel ──────────────────────────────────────────────── -->
      {#if !isDone && currentExplanation && phase === 'show-after'}
        {#key currentIndex}
          <div
            in:fade={{ duration: prefersReduced ? 0 : 260, delay: prefersReduced ? 0 : 80, easing: cubicOut }}
            class="explanation-panel"
            aria-label="Explicación pedagógica del paso"
          >
            <div class="explanation-header">
              <span class="explanation-pill">{currentExplanation.rule_category}</span>
              <span class="explanation-rule">{currentExplanation.rule_name}</span>
            </div>
            <p class="explanation-text">{currentExplanation.explanation}</p>
            <details class="explanation-details">
              <summary class="explanation-summary">Razonamiento conceptual</summary>
              <p class="explanation-detail-text">{currentExplanation.conceptual_reasoning}</p>
              <p class="explanation-detail-text explanation-justification">{currentExplanation.algebraic_justification}</p>
            </details>
            <p class="explanation-note">{currentExplanation.educational_note}</p>
          </div>
        {/key}
      {/if}

      <!-- Manual buttons -->
      {#if showManual}
        <div class="flex gap-2">
          <button
            in:fade={{ duration: prefersReduced ? 0 : 160 }}
            onclick={advanceManualNext}
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                   bg-orange-500 text-white font-semibold text-sm
                   hover:bg-orange-600 transition-colors duration-150 cursor-pointer"
          >
            Siguiente paso →
          </button>
        </div>
      {/if}

      <!-- Final result -->
      {#if isDone && result}
        <div in:scale={{ duration: prefersReduced ? 0 : 480, easing: backOut, start: 0.92 }}
          class="rounded-2xl overflow-hidden shadow-xl shadow-orange-100/60 border border-orange-200"
        >
          <div class="flex items-center justify-between px-5 py-3
                      bg-gradient-to-r from-orange-600 to-orange-500 text-white">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 10l4.5 4.5L16 6"/>
              </svg>
              <span class="font-bold text-sm">Resultado final</span>
            </div>
            <button onclick={copyLatex}
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/30
                {copyDone ? 'bg-emerald-500/80 border-emerald-400' : 'bg-white/15 hover:bg-white/25'}
                transition-all duration-200 font-medium cursor-pointer"
            >
              {#if copyDone}
                <svg class="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l3 3 7-7"/>
                </svg>Copiado
              {:else}
                <svg class="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="5" width="8" height="9" rx="1.5"/>
                  <path d="M3 3h6v1H3z" stroke-linecap="round"/>
                </svg>Copiar LaTeX
              {/if}
            </button>
          </div>
          <div class="bg-gradient-to-b from-orange-50 to-white px-5 py-5">
            {#if result.type === 'no_solution'}
              <p class="text-center text-orange-700 font-semibold text-sm">
                {result.message ?? 'No existe solución real.'}
              </p>
            {:else}
              <div class="text-2xl">
                <MathRenderer latex={result.latex ?? result.result ?? ''} inline={false} />
              </div>
            {/if}
          </div>
          {#if result.solutions && result.solutions.length > 0}
            <div class="flex flex-wrap gap-2 px-5 pb-4 pt-1 bg-orange-50/50 border-t border-orange-200/40">
              {#each result.solutions as sol, i}
                <span in:scale={{ duration: prefersReduced ? 0 : 220, delay: prefersReduced ? 0 : i * 80, easing: backOut }}
                  class="inline-flex items-center gap-1 bg-orange-600 text-white text-sm font-mono px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <span class="opacity-70 text-xs">
                    x{#if result.solutions && result.solutions.length > 1}<sub>{i+1}</sub>{/if} =
                  </span>{sol}
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <!-- ── Step breakdown ─────────────────────────────────────────────── -->
        {#if steps.length > 0}
          <div
            in:fade={{ duration: prefersReduced ? 0 : 340, delay: prefersReduced ? 0 : 300, easing: cubicOut }}
            class="steps-breakdown"
            aria-label="Desglose de pasos"
          >
            <h3 class="breakdown-title">Desglose de pasos</h3>
            <ol class="breakdown-list">
              {#each steps as s, i}
                <li
                  in:fade={{ duration: prefersReduced ? 0 : 220, delay: prefersReduced ? 0 : 320 + i * 60, easing: cubicOut }}
                  class="breakdown-item"
                 >
                   <!-- Step number + connector line -->
                   <div class="breakdown-spine">
                     <span class="breakdown-num" style="background: {getRuleColor(s.rule_name)}">
                       {s.step_number}
                     </span>
                    {#if i < steps.length - 1}
                      <span class="breakdown-line"></span>
                    {/if}
                  </div>

                  <!-- Content -->
                  <div class="breakdown-content">
                    <div class="breakdown-header">
                       <p class="breakdown-desc">{s.description}</p>
                       {#if s.rule_name}
                         <div class="flex items-center gap-1">
                           <span class="breakdown-pill {rulePillClasses(getRuleColor(s.rule_name))}">{s.rule_name}</span>
                          <button
                            type="button"
                            onclick={() => breakdownWhyStep = s}
                            aria-label="¿Por qué se aplica {s.rule_name}?"
                            title="¿Por qué?"
                            class="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold
                                   flex items-center justify-center leading-none shrink-0
                                   hover:bg-orange-200 transition-colors cursor-pointer
                                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                          >?</button>
                        </div>
                      {/if}
                    </div>
                    <div class="breakdown-math">
                      <MathRenderer latex={s.expr_latex} inline={false} />
                    </div>
                    {#if s.explanation}
                      <p class="breakdown-explanation">{s.explanation}</p>
                    {/if}
                  </div>
                </li>
              {/each}
            </ol>
          </div>
        {/if}

        <!-- ── Function graph ─────────────────────────────────────────────── -->
        {#if result && ['expression', 'derivative', 'integral'].includes(result.type)}
          <FunctionPlot expr={result.result ?? result.latex ?? ''} />
        {/if}
      {/if}

    </div>
  {/if}
</section>

{#if whyOpen && step?.rule_name}
  <RulePopup
    ruleName={step.rule_name}
    explanation={step.explanation}
    onClose={() => whyOpen = false}
  />
{/if}

{#if breakdownWhyStep?.rule_name}
  <RulePopup
    ruleName={breakdownWhyStep.rule_name}
    explanation={breakdownWhyStep.explanation}
    onClose={() => breakdownWhyStep = null}
  />
{/if}

<style>
  /* ── Before / After row ──────────────────────────────────────────────────── */
  .before-after-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .step-arrow {
    flex-shrink: 0;
    color: #d1d5db;
    transition: color 300ms ease;
  }

  /* ── Individual panel ────────────────────────────────────────────────────── */
  .math-panel {
    flex: 1;
    min-width: 0;
    border-radius: 0.875rem;
    border: 2px solid #e5e7eb;
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    transition: border-color 300ms ease, box-shadow 300ms ease, opacity 300ms ease;
    will-change: opacity, transform;
  }

  .math-panel.is-dim {
    opacity: 0.38;
    border-color: #e5e7eb;
    box-shadow: none;
  }

  .math-panel.is-clickable {
    cursor: pointer;
    user-select: none;
  }

  .math-panel.is-clickable:hover {
    border-color: color-mix(in srgb, var(--pc) 30%, transparent);
    opacity: 0.72;
  }

  .math-panel.is-clickable.is-lit:hover {
    opacity: 1;
  }

  .math-panel.is-lit {
    opacity: 1;
    border-color: color-mix(in srgb, var(--pc) 55%, transparent);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--pc) 10%, transparent),
      0 6px 24px color-mix(in srgb, var(--pc) 14%, transparent);
  }

  /* When before is lit, arrow gets its color */
  .math-panel.is-lit + .step-arrow {
    color: #9ca3af;
  }

  /* ── Panel label ─────────────────────────────────────────────────────────── */
  .panel-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9ca3af;
    transition: color 300ms ease;
  }

  .math-panel.is-lit .panel-label {
    color: color-mix(in srgb, var(--pc) 80%, #374151);
  }

  /* ── Math content inside panel ───────────────────────────────────────────── */
  .panel-math {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 0;
    overflow: hidden;
  }

  /* ── katex-pop on lit colored spans ─────────────────────────────────────── */
  :global(.math-panel.is-lit .katex [style*="color:"]) {
    display: inline-block;
  }

  /* ── Steps breakdown ─────────────────────────────────────────────────────── */
  .steps-breakdown {
    margin-top: 0.5rem;
    border-top: 1.5px solid #f3f4f6;
    padding-top: 1.25rem;
  }

  .breakdown-title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 1rem;
    padding-left: 0.25rem;
  }

  .breakdown-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .breakdown-item {
    display: flex;
    gap: 0.875rem;
    align-items: flex-start;
  }

  /* Left spine: number bubble + connecting line */
  .breakdown-spine {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 1.5rem;
  }

  .breakdown-num {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .breakdown-line {
    width: 2px;
    flex: 1;
    min-height: 1rem;
    background: #e5e7eb;
    margin: 0.2rem 0;
  }

  /* Right content */
  .breakdown-content {
    flex: 1;
    min-width: 0;
    padding-bottom: 1.25rem;
  }

  .breakdown-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .breakdown-desc {
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    line-height: 1.4;
    margin: 0;
  }

  .breakdown-pill {
    flex-shrink: 0;
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    white-space: nowrap;
    margin-top: 0.1rem;
  }

  .breakdown-math {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.625rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .breakdown-explanation {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.375rem 0 0;
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: reduce) {
    .math-panel,
    .step-arrow,
    .panel-label {
      transition: none !important;
    }
  }

  /* ── Explanation panel ────────────────────────────────────────────────────── */
  .explanation-panel {
    border-radius: 0.875rem;
    border: 1.5px solid #fed7aa;
    background: #fff7ed;
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .explanation-pill {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    background: #ea580c;
    color: #fff;
  }

  .explanation-rule {
    font-size: 0.75rem;
    font-weight: 700;
    color: #c2410c;
    line-height: 1.3;
  }

  .explanation-text {
    font-size: 0.8rem;
    color: #374151;
    margin: 0;
    line-height: 1.5;
  }

  .explanation-details {
    margin: 0;
  }

  .explanation-summary {
    font-size: 0.72rem;
    font-weight: 600;
    color: #ea580c;
    cursor: pointer;
    user-select: none;
    padding: 0.1rem 0;
  }

  .explanation-detail-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.25rem 0 0;
    line-height: 1.5;
  }

  .explanation-justification {
    font-style: italic;
    color: #9ca3af;
  }

  .explanation-note {
    font-size: 0.72rem;
    color: #b45309;
    margin: 0;
    line-height: 1.5;
    padding-top: 0.25rem;
    border-top: 1px solid #fed7aa;
  }
</style>
