<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { backOut, cubicOut } from 'svelte/easing'
  import { animate, stagger } from 'animejs'
  import MathRenderer from './MathRenderer.svelte'
  import RulePopup from './RulePopup.svelte'
  import FunctionPlot from './FunctionPlot.svelte'
  import { analyzeTransformation, generateExplanation, diffTrees, type ExplanationOutput } from './explanation-engine'
  import { buildStepAnimation, getColoredSpans } from './animation-engine'
  import type { Timeline } from './animation-engine'

  interface Step {
    step_number:        number
    description:        string
    expr_latex:         string
    highlighted_latex?: string
    explanation?:       string
    rule_name?:         string
    highlight_color?:   string
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

  let beforeLatex  = $state('')
  let afterLatex   = $state('')
  let beforeHighlighted = $state('')
  let afterHighlighted  = $state('')
  let beforeDisplay = $state('')
  let afterDisplay  = $state('')

  let beforeLit = $state(false)
  let afterLit  = $state(false)
  let beforeColor = $state('#f5c842')
  let afterColor  = $state('#4ecdc4')

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
  const T_BEFORE  = prefersReduced ? 0 : 1400
  const T_AFTER   = prefersReduced ? 0 : 1400
  const T_CHAIN   = prefersReduced ? 0 : 500
  const T_SETTLE  = prefersReduced ? 0 : 80

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

  // ── Chain transition ───────────────────────────────────────────────────────
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
  function playTimeline(timeline: Timeline, container: HTMLElement | undefined) {
    if (!container || prefersReduced || timeline.animations.length === 0) return

    for (const entry of timeline.animations) {
      const id = t(() => {
        const targets = getColoredSpans(container)
        if (!targets.length) return

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
          const fromRight = op.from === 'left'
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

    beforeLatex      = s.expr_latex ?? ''
    beforeHighlighted = s.highlighted_latex ?? s.expr_latex ?? ''
    beforeColor      = s.highlight_color ?? '#f5c842'

    const finalExpr   = result?.latex ?? result?.result ?? s.expr_latex ?? ''
    afterLatex       = next?.expr_latex ?? finalExpr
    afterHighlighted  = next?.highlighted_latex ?? next?.expr_latex ?? finalExpr
    afterColor       = next?.highlight_color ?? '#4ecdc4'

    try {
      const analysis = analyzeTransformation(beforeLatex, afterLatex)
      currentExplanation = generateExplanation(analysis)
      const ops = diffTrees(beforeLatex, afterLatex)
      currentTimeline = buildStepAnimation(analysis.transformation, ops)
    } catch {
      currentExplanation = null
      currentTimeline    = null
    }

    beforeDisplay = beforeLatex
    afterDisplay  = afterLatex
    beforeLit     = false
    afterLit      = false

    if (beforePanelEl) { beforePanelEl.style.opacity = '1'; beforePanelEl.style.transform = '' }
    if (afterPanelEl)  { afterPanelEl.style.opacity  = '1'; afterPanelEl.style.transform  = '' }
    const arrowEl = beforePanelEl?.parentElement?.querySelector<HTMLElement>('.step-arrow')
    if (arrowEl) arrowEl.style.opacity = '1'

    if (!autoMode) {
      phase         = 'show-after'
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

    t(() => {
      beforeDisplay = beforeHighlighted
      beforeLit     = true
      t(() => {
        popColoredSpans(beforeEl)
        if (currentTimeline) playTimeline(currentTimeline, beforeEl)
      }, 30)

      if (!autoMode) return

      t(() => {
        phase         = 'show-after'
        beforeDisplay = beforeLatex
        beforeLit     = false
        afterDisplay  = afterHighlighted
        afterLit      = true
        t(() => {
          popColoredSpans(afterEl)
          if (currentTimeline) playTimeline(currentTimeline, afterEl)
        }, 30)

        if (!autoMode) return

        t(() => {
          if (!next) {
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

  function advanceManualNext() {
    clearAll()
    const next = steps[currentIndex + 1]
    if (!next) { phase = 'done'; return }
    runStep(currentIndex + 1)
  }

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

  $effect(() => {
    if (!autoMode && (phase === 'show-before' || phase === 'show-after')) {
      clearTimers()
      clearAnims()
    }
  })

  const step        = $derived(steps[currentIndex] ?? null)
  const nextStep    = $derived(steps[currentIndex + 1] ?? null)
  const isDone      = $derived(phase === 'done')
  const showManual  = $derived(!autoMode && (phase === 'show-before' || phase === 'show-after'))

  async function copyLatex() {
    const text = result?.latex ?? result?.result ?? ''
    if (!text) return
    try { await navigator.clipboard.writeText(text) } catch {}
    copyDone = true
    t(() => (copyDone = false), 2000)
  }

  function typeLabel(type: string) {
    return ({ equation:'Ecuación', expression:'Expresión', derivative:'Derivada',
              integral:'Integral', limit:'Límite', no_solution:'Sin solución' } as Record<string,string>)[type] ?? type
  }

  // Map type → mth color token class
  function typeBadgeClass(type: string) {
    return ({
      equation:    'mth-badge--violet',
      expression:  'mth-badge--cyan',
      derivative:  'mth-badge--green',
      integral:    'mth-badge--violet',
      limit:       'mth-badge--coral',
      no_solution: 'mth-badge--dim',
    } as Record<string,string>)[type] ?? 'mth-badge--yellow'
  }

  // Map highlight_color (hex) → mth accent
  function accentClass(color?: string) {
    return ({
      '#EA580C': 'mth-badge--yellow',
      '#2563EB': 'mth-badge--cyan',
      '#16A34A': 'mth-badge--green',
      '#DC2626': 'mth-badge--coral',
    } as Record<string,string>)[color ?? ''] ?? 'mth-badge--yellow'
  }
</script>

<section
  class="mth-solver-root"
  aria-label="Resolución paso a paso"
>
  {#if steps.length > 0}

    <!-- Header -->
    <div
      in:fade={{ duration: prefersReduced ? 0 : 260, easing: cubicOut }}
      class="mth-solver-header"
    >
      <div class="mth-header-left">
        <h2 class="mth-solver-title">Resolución paso a paso</h2>
        {#if result && isDone}
          <span
            in:scale={{ duration: prefersReduced ? 0 : 240, easing: backOut }}
            class="mth-badge {typeBadgeClass(result.type)}"
          >{typeLabel(result.type)}</span>
        {/if}
      </div>
      <div class="mth-header-right">
        <span class="mth-header-label">Ritmo:</span>
        <div class="mth-mode-toggle">
          <button
            onclick={() => { autoMode = true }}
            aria-label="Ritmo automático"
            class="mth-mode-btn {autoMode ? 'mth-mode-btn--active' : ''}"
          >Auto</button>
          <button
            onclick={() => { autoMode = false }}
            aria-label="Ritmo manual"
            class="mth-mode-btn {!autoMode ? 'mth-mode-btn--active' : ''}"
          >Manual</button>
        </div>
      </div>
    </div>

    <div class="mth-solver-body">

      <!-- Progress dots -->
      {#if !isDone && steps.length > 1}
        <div
          class="mth-progress-row"
          aria-label="Progreso: paso {currentIndex + 1} de {steps.length}"
          role="status"
        >
          {#each steps as s, i}
            <span
              title="Paso {s.step_number}"
              aria-hidden="true"
              class="mth-progress-dot
                {i === currentIndex ? 'mth-progress-dot--active'
                  : i < currentIndex ? 'mth-progress-dot--done'
                  : ''}"
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
            class="mth-step-label-row"
          >
            <div class="mth-step-label-left">
              <span class="mth-step-num-badge">{step.step_number}</span>
              <p class="mth-step-desc">{step.description}</p>
            </div>
            {#if step.rule_name}
              <div class="mth-step-rule-row">
                <span class="mth-badge {accentClass(step.highlight_color)}">{step.rule_name}</span>
                <button
                  type="button"
                  onclick={() => whyOpen = true}
                  aria-label="¿Por qué se aplica {step.rule_name}?"
                  title="¿Por qué?"
                  class="mth-why-btn"
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
            class="mth-hint"
            aria-label="Explicación pedagógica del paso"
          >
            <div class="mth-hint-header">
              <span class="mth-badge mth-badge--yellow">{currentExplanation.rule_category}</span>
              <span class="mth-hint-rule">{currentExplanation.rule_name}</span>
            </div>
            <p class="mth-hint-text">{currentExplanation.explanation}</p>
            <details class="mth-hint-details">
              <summary class="mth-hint-summary">Razonamiento conceptual</summary>
              <p class="mth-hint-detail-text">{currentExplanation.conceptual_reasoning}</p>
              <p class="mth-hint-detail-text mth-hint-italic">{currentExplanation.algebraic_justification}</p>
            </details>
            <p class="mth-hint-note">{currentExplanation.educational_note}</p>
          </div>
        {/key}
      {/if}

      <!-- Manual buttons -->
      {#if showManual}
        <div class="mth-manual-row">
          <button
            in:fade={{ duration: prefersReduced ? 0 : 160 }}
            onclick={advanceManualNext}
            class="mth-next-btn"
          >
            Siguiente paso →
          </button>
        </div>
      {/if}

      <!-- Final result -->
      {#if isDone && result}

        <div in:scale={{ duration: prefersReduced ? 0 : 480, easing: backOut, start: 0.92 }}
          class="mth-result-card"
        >
          <div class="mth-result-header">
            <div class="mth-result-header-left">
              <svg class="mth-result-icon" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 10l4.5 4.5L16 6"/>
              </svg>
              <span class="mth-result-title">Resultado final</span>
            </div>
            <button onclick={copyLatex} class="mth-copy-btn {copyDone ? 'mth-copy-btn--done' : ''}">
              {#if copyDone}
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l3 3 7-7"/>
                </svg>Copiado
              {:else}
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="5" width="8" height="9" rx="1.5"/>
                  <path d="M3 3h6v1H3z" stroke-linecap="round"/>
                </svg>Copiar LaTeX
              {/if}
            </button>
          </div>
          <div class="mth-result-body">
            {#if result.type === 'no_solution'}
              <p class="mth-result-no-sol">
                {result.message ?? 'No existe solución real.'}
              </p>
            {:else}
              <div class="mth-result-math">
                <MathRenderer latex={result.latex ?? result.result ?? ''} inline={false} />
              </div>
            {/if}
          </div>
          {#if result.solutions && result.solutions.length > 0}
            <div class="mth-solutions-row">
              {#each result.solutions as sol, i}
                <span
                  in:scale={{ duration: prefersReduced ? 0 : 220, delay: prefersReduced ? 0 : i * 80, easing: backOut }}
                  class="mth-solution-pill"
                >
                  <span class="mth-solution-label">
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
            class="mth-breakdown"
            aria-label="Desglose de pasos"
          >
            <h3 class="mth-breakdown-title">Desglose de pasos</h3>
            <ol class="mth-breakdown-list">
              {#each steps as s, i}
                <li
                  in:fade={{ duration: prefersReduced ? 0 : 220, delay: prefersReduced ? 0 : 320 + i * 60, easing: cubicOut }}
                  class="mth-breakdown-item"
                >
                  <!-- Step spine: number + connector line -->
                  <div class="mth-breakdown-spine">
                    <span class="mth-breakdown-num" style="--sc: {s.highlight_color ?? '#f5c842'}">
                      {s.step_number}
                    </span>
                    {#if i < steps.length - 1}
                      <span class="mth-breakdown-line"></span>
                    {/if}
                  </div>

                  <!-- Content -->
                  <div class="mth-breakdown-content">
                    <div class="mth-breakdown-header">
                      <p class="mth-breakdown-desc">{s.description}</p>
                      {#if s.rule_name}
                        <div class="mth-breakdown-rule-row">
                          <span class="mth-badge {accentClass(s.highlight_color)}">{s.rule_name}</span>
                          <button
                            type="button"
                            onclick={() => breakdownWhyStep = s}
                            aria-label="¿Por qué se aplica {s.rule_name}?"
                            title="¿Por qué?"
                            class="mth-why-btn"
                          >?</button>
                        </div>
                      {/if}
                    </div>
                    <div class="mth-breakdown-math">
                      <MathRenderer latex={s.expr_latex} inline={false} />
                    </div>
                    {#if s.explanation}
                      <p class="mth-breakdown-explanation">{s.explanation}</p>
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
  /* ══════════════════════════════════════════════════════════════════════════
     Math UI Library — Design Tokens (Blackboard Mathematics aesthetic)
     Sourced from math-ui.css
  ══════════════════════════════════════════════════════════════════════════ */
  :root {
    --mth-board:       #1a2420;
    --mth-board-light: #22302b;
    --mth-board-mid:   #2a3d36;
    --mth-chalk:       #e8ede6;
    --mth-chalk-dim:   rgba(232, 237, 230, 0.55);
    --mth-yellow:      #f5c842;
    --mth-coral:       #ff6b6b;
    --mth-cyan:        #4ecdc4;
    --mth-violet:      #a78bfa;
    --mth-green:       #6ee7b7;
    --mth-yellow-glow: 0 0 12px rgba(245, 200, 66, 0.6);
    --mth-coral-glow:  0 0 12px rgba(255, 107, 107, 0.6);
    --mth-cyan-glow:   0 0 12px rgba(78, 205, 196, 0.6);
    --mth-violet-glow: 0 0 12px rgba(167, 139, 250, 0.6);
    --mth-green-glow:  0 0 12px rgba(110, 231, 183, 0.6);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Keyframes (from math-ui.css)
  ══════════════════════════════════════════════════════════════════════════ */
  @keyframes mth-fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mth-scaleIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes mth-chalkDraw {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0); }
  }
  @keyframes mth-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  @keyframes mth-bounceIn {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Root shell
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-solver-root {
    background: var(--mth-board);
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow:
      inset 0 0 60px rgba(0, 0, 0, 0.35),
      inset 0 0 120px rgba(0, 0, 0, 0.15),
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3);
    border: 1.5px solid rgba(232, 237, 230, 0.08);
    /* Subtle radial chalkboard glow */
    background-image: radial-gradient(
      ellipse at 50% 30%,
      rgba(255, 255, 255, 0.025) 0%,
      transparent 70%
    );
    font-family: 'Nunito', system-ui, sans-serif;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Header
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-solver-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(232, 237, 230, 0.1);
    background: rgba(0, 0, 0, 0.18);
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .mth-header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .mth-header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .mth-solver-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--mth-chalk);
    margin: 0;
    letter-spacing: 0.01em;
    font-family: 'Caveat', cursive, system-ui;
    font-size: 1.15rem;
  }
  .mth-header-label {
    font-size: 0.7rem;
    color: var(--mth-chalk-dim);
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* ── Mode toggle ─────────────────────────────────────────────────────────── */
  .mth-mode-toggle {
    display: flex;
    gap: 0;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 0.625rem;
    padding: 0.2rem;
    border: 1px solid rgba(232, 237, 230, 0.1);
  }
  .mth-mode-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    border-radius: 0.4rem;
    border: none;
    background: transparent;
    color: var(--mth-chalk-dim);
    cursor: pointer;
    transition: background 150ms, color 150ms;
    letter-spacing: 0.03em;
    font-family: 'Nunito', system-ui, sans-serif;
  }
  .mth-mode-btn--active {
    background: var(--mth-yellow);
    color: var(--mth-board);
    box-shadow: var(--mth-yellow-glow);
  }
  .mth-mode-btn:not(.mth-mode-btn--active):hover {
    color: var(--mth-chalk);
    background: rgba(232, 237, 230, 0.08);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Body
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-solver-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  /* ── Progress dots (mth-progress-dot style) ──────────────────────────────── */
  .mth-progress-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .mth-progress-dot {
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: rgba(232, 237, 230, 0.18);
    transition: all 300ms ease;
    display: inline-block;
  }
  .mth-progress-dot--active {
    width: 20px;
    height: 10px;
    background: var(--mth-yellow);
    box-shadow: var(--mth-yellow-glow);
  }
  .mth-progress-dot--done {
    background: var(--mth-green);
    box-shadow: 0 0 6px rgba(110, 231, 183, 0.5);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Before / After row
  ══════════════════════════════════════════════════════════════════════════ */
  .before-after-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .step-arrow {
    flex-shrink: 0;
    color: rgba(232, 237, 230, 0.25);
    transition: color 300ms ease;
  }

  /* ── Individual panel (mth-equation style) ───────────────────────────────── */
  .math-panel {
    flex: 1;
    min-width: 0;
    border-radius: 0.875rem;
    border: 1.5px solid rgba(232, 237, 230, 0.1);
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    background: var(--mth-board-light);
    transition: border-color 300ms ease, box-shadow 300ms ease, opacity 300ms ease;
    will-change: opacity, transform;
    position: relative;
    overflow: hidden;
  }
  /* subtle chalkboard texture line at top */
  .math-panel::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(232,237,230,0.06), transparent);
    border-radius: 0.875rem 0.875rem 0 0;
  }

  .math-panel.is-dim {
    opacity: 0.35;
    border-color: rgba(232, 237, 230, 0.07);
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
    border-color: color-mix(in srgb, var(--pc) 60%, transparent);
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--pc) 12%, transparent),
      0 6px 28px color-mix(in srgb, var(--pc) 20%, transparent),
      inset 0 0 20px color-mix(in srgb, var(--pc) 4%, transparent);
  }

  .math-panel.is-lit + .step-arrow {
    color: rgba(232, 237, 230, 0.5);
  }

  /* ── Panel label ─────────────────────────────────────────────────────────── */
  .panel-label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mth-chalk-dim);
    transition: color 300ms ease;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  }
  .math-panel.is-lit .panel-label {
    color: color-mix(in srgb, var(--pc) 90%, var(--mth-chalk));
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

  /* KaTeX color override: ensure colored terms read well on dark bg */
  :global(.math-panel .katex) {
    color: var(--mth-chalk) !important;
  }
  :global(.math-panel.is-lit .katex [style*="color:"]) {
    display: inline-block;
    filter: brightness(1.2) saturate(1.1);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Step label row
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-step-label-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0 0.125rem;
    animation: mth-fadeUp 200ms ease both;
  }
  .mth-step-label-left {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
  }
  .mth-step-num-badge {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--mth-yellow);
    color: var(--mth-board);
    font-size: 0.65rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--mth-yellow-glow);
    font-family: 'JetBrains Mono', monospace;
  }
  .mth-step-desc {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--mth-chalk);
    line-height: 1.4;
    margin: 0;
  }
  .mth-step-rule-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  /* ── Why button ──────────────────────────────────────────────────────────── */
  .mth-why-btn {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 1.5px solid rgba(245, 200, 66, 0.4);
    background: rgba(245, 200, 66, 0.12);
    color: var(--mth-yellow);
    font-size: 0.65rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 150ms, border-color 150ms, box-shadow 150ms;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
    line-height: 1;
  }
  .mth-why-btn:hover {
    background: rgba(245, 200, 66, 0.22);
    border-color: var(--mth-yellow);
    box-shadow: var(--mth-yellow-glow);
  }
  .mth-why-btn:focus-visible {
    outline: 2px solid var(--mth-yellow);
    outline-offset: 2px;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Badges (mth-badge style)
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .mth-badge--yellow {
    background: rgba(245, 200, 66, 0.15);
    color: var(--mth-yellow);
    border-color: rgba(245, 200, 66, 0.3);
  }
  .mth-badge--coral {
    background: rgba(255, 107, 107, 0.15);
    color: var(--mth-coral);
    border-color: rgba(255, 107, 107, 0.3);
  }
  .mth-badge--cyan {
    background: rgba(78, 205, 196, 0.15);
    color: var(--mth-cyan);
    border-color: rgba(78, 205, 196, 0.3);
  }
  .mth-badge--violet {
    background: rgba(167, 139, 250, 0.15);
    color: var(--mth-violet);
    border-color: rgba(167, 139, 250, 0.3);
  }
  .mth-badge--green {
    background: rgba(110, 231, 183, 0.15);
    color: var(--mth-green);
    border-color: rgba(110, 231, 183, 0.3);
  }
  .mth-badge--dim {
    background: rgba(232, 237, 230, 0.08);
    color: var(--mth-chalk-dim);
    border-color: rgba(232, 237, 230, 0.12);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Hint / Explanation panel (mth-hint style)
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-hint {
    border-radius: 0.875rem;
    border: 1px solid rgba(245, 200, 66, 0.2);
    border-left: 3px solid var(--mth-yellow);
    background: rgba(245, 200, 66, 0.05);
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    animation: mth-fadeUp 260ms ease both;
  }
  .mth-hint-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .mth-hint-rule {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--mth-yellow);
    line-height: 1.3;
    font-family: 'Caveat', cursive;
    font-size: 0.95rem;
  }
  .mth-hint-text {
    font-size: 0.8rem;
    color: var(--mth-chalk);
    margin: 0;
    line-height: 1.55;
  }
  .mth-hint-details {
    margin: 0;
  }
  .mth-hint-summary {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--mth-cyan);
    cursor: pointer;
    user-select: none;
    padding: 0.1rem 0;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.62rem;
  }
  .mth-hint-detail-text {
    font-size: 0.75rem;
    color: var(--mth-chalk-dim);
    margin: 0.25rem 0 0;
    line-height: 1.5;
  }
  .mth-hint-italic {
    font-style: italic;
    color: rgba(232, 237, 230, 0.35);
  }
  .mth-hint-note {
    font-size: 0.72rem;
    color: rgba(245, 200, 66, 0.6);
    margin: 0;
    line-height: 1.5;
    padding-top: 0.375rem;
    border-top: 1px solid rgba(245, 200, 66, 0.12);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Manual next button
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-manual-row {
    display: flex;
    gap: 0.5rem;
  }
  .mth-next-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    background: var(--mth-yellow);
    color: var(--mth-board);
    font-weight: 800;
    font-size: 0.85rem;
    border: none;
    cursor: pointer;
    transition: background 150ms, box-shadow 150ms, transform 100ms;
    font-family: 'Nunito', system-ui;
    letter-spacing: 0.02em;
    box-shadow: var(--mth-yellow-glow);
  }
  .mth-next-btn:hover {
    background: #f7d060;
    box-shadow: 0 0 20px rgba(245, 200, 66, 0.7);
  }
  .mth-next-btn:active {
    transform: scale(0.97);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Final result card (mth-board + mth-equation--cyan style)
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-result-card {
    border-radius: 1rem;
    overflow: hidden;
    background: var(--mth-board-light);
    border: 1.5px solid rgba(78, 205, 196, 0.3);
    box-shadow:
      0 0 0 4px rgba(78, 205, 196, 0.06),
      0 8px 32px rgba(78, 205, 196, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.4);
    animation: mth-scaleIn 480ms ease both;
  }
  .mth-result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.18) 0%, rgba(78, 205, 196, 0.06) 100%);
    border-bottom: 1px solid rgba(78, 205, 196, 0.18);
  }
  .mth-result-header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .mth-result-icon {
    width: 1rem;
    height: 1rem;
    color: var(--mth-green);
    flex-shrink: 0;
  }
  .mth-result-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--mth-cyan);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
  }
  .mth-copy-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.3rem 0.875rem;
    border-radius: 9999px;
    border: 1px solid rgba(78, 205, 196, 0.3);
    background: rgba(78, 205, 196, 0.1);
    color: var(--mth-cyan);
    cursor: pointer;
    transition: background 150ms, border-color 150ms, box-shadow 150ms;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
  }
  .mth-copy-btn:hover {
    background: rgba(78, 205, 196, 0.18);
    border-color: rgba(78, 205, 196, 0.5);
    box-shadow: var(--mth-cyan-glow);
  }
  .mth-copy-btn--done {
    background: rgba(110, 231, 183, 0.15);
    border-color: rgba(110, 231, 183, 0.35);
    color: var(--mth-green);
  }
  .mth-result-body {
    padding: 1.25rem;
  }
  .mth-result-math {
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
  }
  :global(.mth-result-math .katex) {
    color: var(--mth-chalk) !important;
    font-size: 1.5rem !important;
  }
  .mth-result-no-sol {
    text-align: center;
    color: var(--mth-coral);
    font-weight: 600;
    font-size: 0.85rem;
    margin: 0;
  }

  /* Solutions pills */
  .mth-solutions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0 1.25rem 1.125rem;
    border-top: 1px solid rgba(78, 205, 196, 0.12);
    padding-top: 0.75rem;
  }
  .mth-solution-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: rgba(167, 139, 250, 0.15);
    border: 1px solid rgba(167, 139, 250, 0.3);
    color: var(--mth-violet);
    font-size: 0.82rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    padding: 0.35rem 0.875rem;
    border-radius: 0.625rem;
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.2);
    animation: mth-bounceIn 220ms ease both;
  }
  .mth-solution-label {
    opacity: 0.6;
    font-size: 0.7rem;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Steps breakdown (mth-step style)
  ══════════════════════════════════════════════════════════════════════════ */
  .mth-breakdown {
    margin-top: 0.25rem;
    border-top: 1px solid rgba(232, 237, 230, 0.08);
    padding-top: 1.25rem;
  }
  .mth-breakdown-title {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mth-chalk-dim);
    margin: 0 0 1rem;
    padding-left: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
  }
  .mth-breakdown-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .mth-breakdown-item {
    display: flex;
    gap: 0.875rem;
    align-items: flex-start;
    animation: mth-fadeUp 220ms ease both;
  }

  /* Left spine: number bubble + connector line */
  .mth-breakdown-spine {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 1.5rem;
  }
  .mth-breakdown-num {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.62rem;
    font-weight: 800;
    color: var(--mth-board);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    background: var(--sc, var(--mth-yellow));
    box-shadow: 0 0 10px color-mix(in srgb, var(--sc, var(--mth-yellow)) 50%, transparent);
    font-family: 'JetBrains Mono', monospace;
  }
  .mth-breakdown-line {
    width: 2px;
    flex: 1;
    min-height: 1rem;
    background: rgba(232, 237, 230, 0.12);
    margin: 0.2rem 0;
  }

  /* Right content */
  .mth-breakdown-content {
    flex: 1;
    min-width: 0;
    padding-bottom: 1.25rem;
  }
  .mth-breakdown-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .mth-breakdown-desc {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--mth-chalk);
    line-height: 1.4;
    margin: 0;
  }
  .mth-breakdown-rule-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }
  .mth-breakdown-math {
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid rgba(232, 237, 230, 0.08);
    border-radius: 0.625rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0.5rem 0.75rem;
  }
  :global(.mth-breakdown-math .katex) {
    color: var(--mth-chalk) !important;
  }
  .mth-breakdown-explanation {
    font-size: 0.72rem;
    color: var(--mth-chalk-dim);
    margin: 0.375rem 0 0;
    line-height: 1.5;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     Reduced motion overrides
  ══════════════════════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    .math-panel,
    .step-arrow,
    .panel-label,
    .mth-next-btn,
    .mth-progress-dot {
      transition: none !important;
      animation: none !important;
    }
    .mth-result-card,
    .mth-hint,
    .mth-step-label-row,
    .mth-breakdown-item {
      animation: none !important;
    }
  }
</style>
