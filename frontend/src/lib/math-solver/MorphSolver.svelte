<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { backOut, cubicOut } from 'svelte/easing'
  import MathRenderer from './MathRenderer.svelte'

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

  // ── Phase machine ──────────────────────────────────────────────────────────
  type Phase = 'idle' | 'show-plain' | 'highlight' | 'morph-out' | 'morph-in' | 'done'

  let currentIndex = $state(0)
  let phase        = $state<Phase>('idle')
  let autoMode     = $state(true)
  let copyDone     = $state(false)

  // What the single MathRenderer is showing RIGHT NOW
  let displayLatex  = $state('')
  // CSS classes:
  //   boxClass     → on .math-box     (border glow: '' | 'is-highlighted')
  //   contentClass → on .math-content (morph anim: '' | 'is-morphing-in' | 'is-morphing-out')
  let boxClass     = $state('')   // '' | 'is-highlighted'
  let contentClass = $state('')   // '' | 'is-morphing-in' | 'is-morphing-out'

  let timers: ReturnType<typeof setTimeout>[] = []
  function t(fn: () => void, ms: number) { const id = setTimeout(fn, ms); timers.push(id); return id }
  function clearTimers() { timers.forEach(clearTimeout); timers = [] }

  // ── Timing (ms) ────────────────────────────────────────────────────────────
  const T_PLAIN     = 700   // show plain formula
  const T_POP       = 500   // highlighted + katex-pop plays
  const T_OUT       = 280   // morph-out animation duration (must match CSS)
  const T_IN        = 340   // morph-in animation duration (must match CSS)
  const T_GAP       = 40    // brief pause between out & in

  // ── Core step runner ───────────────────────────────────────────────────────
  function runStep(index: number) {
    if (index >= steps.length) { phase = 'done'; boxClass = ''; contentClass = ''; return }

    const s = steps[index]
    currentIndex = index
    phase        = 'show-plain'

    // Snap-show plain formula, start morph-in on content only
    displayLatex = s.expr_latex ?? ''
    boxClass     = ''
    contentClass = 'is-morphing-in'

    // After morph-in animation finishes, settle to plain
    t(() => { contentClass = '' }, T_IN)

    if (!autoMode) return   // manual: stop here

    // 1. After T_PLAIN: show highlighted
    t(() => {
      phase        = 'highlight'
      displayLatex = s.highlighted_latex ?? s.expr_latex ?? ''
      boxClass     = 'is-highlighted'
      contentClass = ''

      if (!autoMode) return

      // 2. After T_POP: morph out
      t(() => {
        doMorphOut(index)
      }, T_POP)

    }, T_PLAIN + T_IN)   // wait for morph-in to finish first
  }

  function doMorphOut(index: number) {
    const s = steps[index]
    phase        = 'morph-out'
    boxClass     = ''          // remove highlight glow immediately
    contentClass = 'is-morphing-out'

    // Midway through out-anim: swap the latex so it's invisible when content changes
    t(() => {
      const next = steps[index + 1]
      displayLatex = next?.expr_latex ?? ''
    }, T_OUT / 2)

    // After out-anim: start morph-in with next step's content
    t(() => {
      t(() => runStep(index + 1), T_GAP)
    }, T_OUT)
  }

  // ── Manual advance ─────────────────────────────────────────────────────────
  function advanceManual() {
    clearTimers()
    if (phase === 'show-plain') {
      // → highlight
      const s = steps[currentIndex]
      phase        = 'highlight'
      displayLatex = s.highlighted_latex ?? s.expr_latex ?? ''
      boxClass     = 'is-highlighted'
      contentClass = ''
    } else if (phase === 'highlight') {
      // → morph out → next step
      doMorphOut(currentIndex)
    }
  }

  // ── Reset when steps change ────────────────────────────────────────────────
  $effect(() => {
    const _len = steps.length
    clearTimers()
    currentIndex = 0
    phase        = 'idle'
    displayLatex = ''
    boxClass     = ''
    contentClass = ''
    copyDone     = false
    if (!_len) return
    t(() => runStep(0), 200)
    return () => clearTimers()
  })

  // ── Derived ────────────────────────────────────────────────────────────────
  const step         = $derived(steps[currentIndex] ?? null)
  const hColor       = $derived(step?.highlight_color ?? '#EA580C')
  const isHighlight  = $derived(phase === 'highlight')
  const isDone       = $derived(phase === 'done')
  const showManual   = $derived(!autoMode && (phase === 'show-plain' || phase === 'highlight'))

  async function copyLatex() {
    const text = result?.latex ?? result?.result ?? ''
    if (!text) return
    try { await navigator.clipboard.writeText(text) } catch {
      const el = document.createElement('textarea')
      el.value = text; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    copyDone = true
    t(() => (copyDone = false), 2000)
  }

  function typeLabel(type: string) {
    return ({ equation:'Ecuación', expression:'Expresión', derivative:'Derivada',
              integral:'Integral', limit:'Límite', no_solution:'Sin solución' } as Record<string,string>)[type] ?? type
  }
  function typeColor(type: string) {
    return ({ equation:'bg-violet-500', expression:'bg-blue-500', derivative:'bg-teal-500',
              integral:'bg-indigo-500', limit:'bg-pink-500', no_solution:'bg-slate-400' } as Record<string,string>)[type] ?? 'bg-orange-500'
  }
  function rulePill(color?: string) {
    return ({ '#EA580C':'bg-orange-100 text-orange-700', '#2563EB':'bg-blue-100 text-blue-700',
              '#16A34A':'bg-green-100 text-green-700',   '#DC2626':'bg-red-100 text-red-700'
            } as Record<string,string>)[color ?? ''] ?? 'bg-orange-100 text-orange-700'
  }
</script>

<section
  class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
  aria-label="Resolución paso a paso"
>
  {#if phase !== 'idle'}

    <!-- Header -->
    <div
      in:fade={{ duration: 260, easing: cubicOut }}
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50"
    >
      <div class="flex items-center gap-3">
        <h2 class="font-semibold text-lg text-gray-800">Resolución paso a paso</h2>
        {#if result && isDone}
          <span in:scale={{ duration: 240, easing: backOut }}
            class="text-xs font-semibold px-2.5 py-1 rounded-full text-white {typeColor(result.type)}"
          >{typeLabel(result.type)}</span>
        {/if}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 hidden sm:inline">Ritmo:</span>
        <div class="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
          <button onclick={() => { autoMode = true }}
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {autoMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}"
          >Auto</button>
          <button onclick={() => { autoMode = false }}
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {!autoMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}"
          >Manual</button>
        </div>
      </div>
    </div>

    <div class="p-5 space-y-4" aria-live="polite" aria-atomic="true">

      <!-- Progress dots -->
      {#if !isDone && steps.length > 1}
        <div class="flex items-center justify-center gap-1.5 flex-wrap">
          {#each steps as s, i}
            <button
              onclick={() => { if (!autoMode) { clearTimers(); runStep(i) } }}
              title="Paso {s.step_number}"
              aria-current={i === currentIndex ? 'step' : undefined}
              class="rounded-full transition-all duration-300 cursor-default
                {i === currentIndex ? 'w-5 h-2.5 bg-orange-500'
                  : i < currentIndex ? 'w-2 h-2 bg-orange-300'
                  : 'w-2 h-2 bg-gray-200'}"
            ></button>
          {/each}
        </div>
      {/if}

      <!-- ── THE single morphing box ───────────────────────────────────────── -->
      {#if !isDone && step}
        <div class="math-box-outer">
          <!--
            One element. CSS keyframes drive:
              .is-morphing-in  → scale(0.88)+blur(5px) → normal
              .is-highlighted  → border glow, colored spans do katex-pop
              .is-morphing-out → normal → scale(1.1)+blur(6px)+opacity(0)
            Content (displayLatex) only swaps mid-morph-out when invisible.
          -->
          <div
            class="math-box {boxClass}"
            style="--hc: {hColor}"
          >
            <div class="math-content {contentClass}">
              <MathRenderer latex={displayLatex} inline={false} />
            </div>
          </div>
        </div>

        <!-- Step label -->
        {#key currentIndex}
          <div
            in:fade={{ duration: 200, delay: 60, easing: cubicOut }}
            class="flex items-start justify-between gap-3 px-1"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="shrink-0 w-6 h-6 rounded-full text-[11px] font-bold
                           flex items-center justify-center bg-orange-500 text-white"
              >{step.step_number}</span>
              <p class="text-sm font-semibold text-gray-700 leading-snug truncate">
                {step.description}
              </p>
            </div>
            {#if step.rule_name}
              <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full {rulePill(step.highlight_color)}">
                {step.rule_name}
              </span>
            {/if}
          </div>
        {/key}

        <!-- Explanation (only during highlight) -->
        {#if step.explanation && isHighlight}
          <div in:fade={{ duration: 200, delay: 80 }} class="flex items-start gap-1.5 px-1">
            <svg class="shrink-0 w-3.5 h-3.5 mt-0.5 text-gray-400" fill="none"
                 viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5">
              <circle cx="8" cy="8" r="6.5"/>
              <path stroke-linecap="round" d="M8 7.5v4M8 5.5h.01"/>
            </svg>
            <p class="text-xs text-gray-500 leading-relaxed">{step.explanation}</p>
          </div>
        {/if}

        <!-- Manual button -->
        {#if showManual}
          <button
            in:fade={{ duration: 160 }}
            onclick={advanceManual}
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   border-2 border-dashed border-orange-300 text-orange-600 font-semibold text-sm
                   hover:bg-orange-50 transition-colors duration-150 cursor-pointer"
          >
            {phase === 'show-plain' ? 'Ver resaltado →' : 'Siguiente paso →'}
          </button>
        {/if}
      {/if}

      <!-- Final result -->
      {#if isDone && result}
        <div in:scale={{ duration: 480, easing: backOut, start: 0.92 }}
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
                <span in:scale={{ duration: 220, delay: i * 80, easing: backOut }}
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
      {/if}

    </div>
  {/if}
</section>

<style>
  /* ── Container ───────────────────────────────────────────────────────────── */
  .math-box-outer {
    position: relative;
    min-height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── The fixed box — border/background never disappear ───────────────────── */
  .math-box {
    width: 100%;
    border-radius: 1rem;
    border: 2px solid #e5e7eb;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Smooth border/shadow transitions for highlight state */
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }

  /* ── Highlight state on the box: border glow only ───────────────────────── */
  .math-box.is-highlighted {
    border-color: color-mix(in srgb, var(--hc) 60%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--hc) 10%, transparent),
                0 8px 28px color-mix(in srgb, var(--hc) 12%, transparent);
  }

  /* ── Inner content wrapper — this is what morphs ────────────────────────── */
  .math-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    transform-origin: center center;
    will-change: transform, opacity, filter;
  }

  /* ── 1. Morph-IN: formula emerges from a blur ────────────────────────────── */
  @keyframes morph-in {
    0%   { opacity: 0; transform: scale(0.88); filter: blur(5px); }
    60%  { opacity: 1; filter: blur(0px); }
    100% { opacity: 1; transform: scale(1);    filter: blur(0px); }
  }

  .math-content.is-morphing-in {
    animation: morph-in 340ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
  }

  /* ── 2. Morph-OUT: formula blurs out ─────────────────────────────────────── */
  @keyframes morph-out {
    0%   { opacity: 1; transform: scale(1);    filter: blur(0px); }
    100% { opacity: 0; transform: scale(1.1);  filter: blur(6px); }
  }

  .math-content.is-morphing-out {
    animation: morph-out 280ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  /* ── 3. Photomath katex-pop on colored sub-expressions ───────────────────── */
  @keyframes katex-pop {
    0%   { transform: scale(1);    filter: brightness(1)   drop-shadow(0 0 0px   currentColor); }
    35%  { transform: scale(1.22); filter: brightness(1.4) drop-shadow(0 0 10px  currentColor); }
    65%  { transform: scale(1.1);  filter: brightness(1.2) drop-shadow(0 0 6px   currentColor); }
    100% { transform: scale(1);    filter: brightness(1)   drop-shadow(0 0 0px   currentColor); }
  }

  :global(.math-box.is-highlighted .katex [style*="color:"]) {
    display: inline-block;
    animation: katex-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  :global(.math-box.is-highlighted .katex [style*="color:"]:nth-child(2)) { animation-delay: 0.07s; }
  :global(.math-box.is-highlighted .katex [style*="color:"]:nth-child(3)) { animation-delay: 0.14s; }
  :global(.math-box.is-highlighted .katex [style*="color:"]:nth-child(4)) { animation-delay: 0.21s; }
  :global(.math-box.is-highlighted .katex [style*="color:"]:nth-child(5)) { animation-delay: 0.28s; }
</style>
