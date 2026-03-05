<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition'
  import { backOut, cubicOut } from 'svelte/easing'
  import MathRenderer from './MathRenderer.svelte'

  // ── Types ─────────────────────────────────────────────────────────────────
  interface Step {
    step_number:       number
    description:       string
    expr_latex:        string              // plain LaTeX — no \textcolor
    highlighted_latex?: string            // LaTeX with \textcolor on active parts
    explanation?:      string
    rule_name?:        string
    highlight_color?:  string
  }

  interface Result {
    type:       string
    latex?:     string
    result?:    string
    solutions?: string[]
    message?:   string
  }

  // ── Props ─────────────────────────────────────────────────────────────────
  let { steps = [], result = null }: { steps: Step[]; result: Result | null } = $props()

  // ── Phase machine ─────────────────────────────────────────────────────────
  type Phase = 'idle' | 'intro' | 'stepping' | 'result'
  let phase        = $state<Phase>('idle')
  let visibleCount = $state(0)
  let autoMode     = $state(true)
  let copyDone     = $state(false)

  // The highlight pulse: tracks which step is currently "highlighting"
  let highlightIndex = $state(-1)

  // Timers cleanup
  let timers: ReturnType<typeof setTimeout>[] = []
  function clearTimers() { timers.forEach(clearTimeout); timers = [] }

  // ── Timeline SVG ──────────────────────────────────────────────────────────
  let segmentVisible: boolean[] = $state([])

  // ── Step reveal logic ─────────────────────────────────────────────────────
  const INTRO_MS          = 200
  const STEP_ENTER_MS     = 320
  const STEP_HIGHLIGHT_MS = 420
  const STEP_EXPLAIN_MS   = 220
  const STEP_GAP_MS       = 180
  const RESULT_EXTRA_MS   = 380

  function revealStep(index: number) {
    if (index >= steps.length) {
      timers.push(setTimeout(() => { phase = 'result' }, RESULT_EXTRA_MS))
      return
    }

    visibleCount = index + 1

    // Highlight phase
    timers.push(setTimeout(() => {
      highlightIndex = index
    }, STEP_ENTER_MS))

    // Show timeline segment to next step
    if (index < steps.length - 1) {
      timers.push(setTimeout(() => {
        segmentVisible[index] = true
      }, STEP_ENTER_MS + 100))
    }

    if (autoMode) {
      const totalStepMs = STEP_ENTER_MS + STEP_HIGHLIGHT_MS + STEP_EXPLAIN_MS + STEP_GAP_MS
      timers.push(setTimeout(() => {
        highlightIndex = -1
        revealStep(index + 1)
      }, totalStepMs))
    }
  }

  function advanceManual() {
    if (phase !== 'stepping') return
    if (visibleCount < steps.length) {
      highlightIndex = -1
      revealStep(visibleCount)
    } else {
      phase = 'result'
    }
  }

  $effect(() => {
    // Access steps.length to track the dependency
    const _len = steps.length

    // Reset fully whenever steps array changes (new solve)
    clearTimers()
    phase          = 'idle'
    visibleCount   = 0
    highlightIndex = -1
    copyDone       = false
    segmentVisible = []

    if (!_len) return

    phase = 'intro'
    timers.push(setTimeout(() => {
      phase = 'stepping'
      revealStep(0)
    }, INTRO_MS))

    return () => {
      clearTimers()
    }
  })

  // ── Copy LaTeX ────────────────────────────────────────────────────────────
  async function copyLatex() {
    const text = result?.latex ?? result?.result ?? ''
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    copyDone = true
    setTimeout(() => (copyDone = false), 2000)
  }

  // ── Labels ────────────────────────────────────────────────────────────────
  function typeLabel(type: string): string {
    const map: Record<string, string> = {
      equation:    'Ecuación',
      expression:  'Expresión',
      derivative:  'Derivada',
      integral:    'Integral',
      limit:       'Límite',
      no_solution: 'Sin solución',
    }
    return map[type] ?? type
  }

  function typeColor(type: string): string {
    const map: Record<string, string> = {
      equation:    'bg-violet-500',
      expression:  'bg-blue-500',
      derivative:  'bg-teal-500',
      integral:    'bg-indigo-500',
      limit:       'bg-pink-500',
      no_solution: 'bg-slate-400',
    }
    return map[type] ?? 'bg-orange-500'
  }

  function rulePillColor(color?: string): string {
    if (!color) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
    const map: Record<string, string> = {
      '#EA580C': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      '#2563EB': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      '#16A34A': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      '#DC2626': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    }
    return map[color] ?? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
  }

  const SEG_H = 72  // px per timeline segment
</script>

<!-- ── Outer section ──────────────────────────────────────────────────────── -->
<section
  class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200
         dark:border-slate-700 overflow-hidden"
  aria-label="Resolución paso a paso"
>

  <!-- ── Header ─────────────────────────────────────────────────────────── -->
  {#if phase !== 'idle'}
    <div
      in:fade={{ duration: 280, easing: cubicOut }}
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100
             dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50"
    >
      <div class="flex items-center gap-3">
        <h2 class="font-semibold text-lg text-gray-800 dark:text-slate-100">
          Resolución paso a paso
        </h2>
        {#if result}
          <span
            in:scale={{ duration: 260, easing: backOut }}
            class="text-xs font-semibold px-2.5 py-1 rounded-full text-white {typeColor(result.type)}"
          >{typeLabel(result.type)}</span>
        {/if}
      </div>

      <!-- Auto / Manual toggle -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-400 dark:text-slate-500 hidden sm:inline">Ritmo:</span>
        <div class="flex gap-0.5 bg-gray-100 dark:bg-slate-700 p-0.5 rounded-lg">
          <button
            onclick={() => { autoMode = true }}
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {autoMode
                ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-400 dark:text-slate-400 hover:text-gray-600'}"
          >Auto</button>
          <button
            onclick={() => { autoMode = false }}
            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer
              {!autoMode
                ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-400 dark:text-slate-400 hover:text-gray-600'}"
          >Manual</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- ── Steps area ─────────────────────────────────────────────────────── -->
  <div
    class="p-5"
    aria-live="polite"
    aria-atomic="false"
  >
    <!-- Relative wrapper for the SVG timeline + cards -->
    <div class="relative">

      <!-- ── SVG Timeline (vertical line between badges) ──────────────── -->
      {#if visibleCount > 1}
        <svg
          class="absolute left-[13px] top-[28px] pointer-events-none"
          width="2"
          height={SEG_H * (visibleCount - 1)}
          aria-hidden="true"
        >
          {#each Array.from({ length: visibleCount - 1 }, (_, i) => i) as i}
            <line
              x1="1" y1={i * SEG_H}
              x2="1" y2={(i + 1) * SEG_H}
              stroke="#EA580C"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray={SEG_H}
              stroke-dashoffset={segmentVisible[i] ? 0 : SEG_H}
              style="transition: stroke-dashoffset 0.35s cubic-bezier(0.4,0,0.2,1)"
            />
          {/each}
        </svg>
      {/if}

      <!-- ── Step cards ──────────────────────────────────────────────── -->
      <div class="flex flex-col gap-3">
        {#each steps.slice(0, visibleCount) as step, i (step.step_number)}
          {@const isLast     = i === steps.length - 1}
          {@const isActive   = i === highlightIndex}
          {@const isComplete = i < visibleCount - 1 || phase === 'result'}
          {@const hColor     = step.highlight_color ?? '#EA580C'}

          <div
            in:fly={{ x: 48, duration: 320, easing: cubicOut }}
            style:--hc={hColor}
            style:box-shadow={isActive ? `0 0 0 3px ${hColor}22, 0 4px 16px ${hColor}18` : undefined}
            class="group rounded-xl border transition-colors duration-300
              {isLast && phase === 'result'
                ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-900/20'
                : isActive
                  ? 'border-orange-300 dark:border-orange-600 shadow-md'
                  : 'border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-700/30'}"
          >
            <div class="flex items-start gap-3 p-4">

              <!-- Badge -->
              <div class="relative shrink-0 mt-0.5">
                <span
                  class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center
                    transition-all duration-300
                    {isLast && phase === 'result'
                      ? 'bg-emerald-500 text-white'
                      : isComplete
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'}"
                >
                  {#if isLast && phase === 'result'}
                    <!-- Checkmark -->
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 7l3 3L11.5 4"/>
                    </svg>
                  {:else}
                    {step.step_number}
                  {/if}
                </span>
                <!-- Pulse ring on the currently-animating badge -->
                {#if isActive}
                  <span
                    class="absolute inset-0 rounded-full animate-ping opacity-50"
                    style:background-color={hColor}
                  ></span>
                {/if}
              </div>

              <div class="flex-1 min-w-0">

                <!-- Description row + rule pill -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <p class="text-sm font-semibold text-gray-700 dark:text-slate-200 leading-snug">
                    {step.description}
                  </p>
                  {#if step.rule_name}
                    <span
                      class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full
                             {rulePillColor(step.highlight_color)}"
                    >{step.rule_name}</span>
                  {/if}
                </div>

                <!-- Math expression — plain when idle, highlighted (colored) when active -->
                <div class="text-lg rounded-xl bg-white dark:bg-slate-900/40
                            border border-gray-100 dark:border-slate-700 overflow-hidden
                            math-expr-box">
                  {#key isActive}
                    <div
                      in:scale={{ duration: isActive ? 240 : 160, easing: backOut, start: isActive ? 0.96 : 1 }}
                      class="katex-highlight-wrap {isActive ? 'is-active' : ''}"
                    >
                      <MathRenderer
                        latex={isActive && step.highlighted_latex ? step.highlighted_latex : step.expr_latex}
                        inline={false}
                      />
                    </div>
                  {/key}
                </div>

                <!-- Explanation -->
                {#if step.explanation && (isComplete || isActive)}
                  <div
                    in:fade={{ duration: 280, delay: 80 }}
                    class="flex items-start gap-1.5 mt-2.5"
                  >
                    <svg class="shrink-0 w-3.5 h-3.5 mt-0.5 text-gray-400 dark:text-slate-500"
                         fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5">
                      <circle cx="8" cy="8" r="6.5"/>
                      <path stroke-linecap="round" d="M8 7.5v4M8 5.5h.01"/>
                    </svg>
                    <p class="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                {/if}

              </div>
            </div>
          </div>

        {/each}

        <!-- ── Pending skeleton (next 2 upcoming steps) ───────────────── -->
        {#if phase === 'stepping' && visibleCount < steps.length}
          {#each steps.slice(visibleCount, visibleCount + 2) as _, i}
            <div
              in:fade={{ duration: 200 }}
              class="rounded-xl border border-dashed border-gray-200 dark:border-slate-700
                     p-4 opacity-35"
            >
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-2.5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-2/5"></div>
                  <div class="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          {/each}
        {/if}

        <!-- ── Manual mode: Next button ───────────────────────────────── -->
        {#if !autoMode && phase === 'stepping'}
          <button
            in:fade={{ duration: 180 }}
            onclick={advanceManual}
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   border-2 border-dashed border-orange-300 dark:border-orange-700
                   text-orange-600 dark:text-orange-400 font-semibold text-sm
                   hover:bg-orange-50 dark:hover:bg-orange-900/20
                   transition-colors duration-150 cursor-pointer"
          >
            {visibleCount >= steps.length ? 'Ver resultado →' : 'Siguiente →'}
          </button>
        {/if}

      </div>
    </div>
  </div>

  <!-- ── Final result card ─────────────────────────────────────────────── -->
  {#if phase === 'result' && result}
    <div
      in:scale={{ duration: 480, easing: backOut, start: 0.93 }}
      class="mx-5 mb-5 rounded-2xl overflow-hidden shadow-xl shadow-orange-100/60
             dark:shadow-orange-900/20 border border-orange-200 dark:border-orange-800/50"
    >
      <!-- Top bar -->
      <div class="flex items-center justify-between px-5 py-3
                  bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 10l4.5 4.5L16 6"/>
          </svg>
          <span class="font-bold text-sm tracking-wide">Resultado final</span>
        </div>
        <button
          onclick={copyLatex}
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/30
            {copyDone ? 'bg-emerald-500/80 border-emerald-400' : 'bg-white/15 hover:bg-white/25'}
            transition-all duration-200 font-medium cursor-pointer"
          title="Copiar LaTeX al portapapeles"
        >
          {#if copyDone}
            <svg class="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l3 3 7-7"/>
            </svg>
            Copiado
          {:else}
            <svg class="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="2">
              <rect x="5" y="5" width="8" height="9" rx="1.5"/>
              <path d="M3 3h6v1H3z" stroke-linecap="round"/>
            </svg>
            Copiar LaTeX
          {/if}
        </button>
      </div>

      <!-- Result math -->
      <div class="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/30
                  dark:to-slate-800/50 px-5 py-5">
        {#if result.type === 'no_solution'}
          <p class="text-center text-orange-700 dark:text-orange-300 font-semibold text-sm">
            {result.message ?? 'No existe solución real.'}
          </p>
        {:else}
          <div
            in:fade={{ duration: 300 }}
            class="h-0.5 w-full mb-4 rounded-full
                   bg-gradient-to-r from-orange-400 via-orange-300 to-transparent
                   dark:from-orange-600 dark:via-orange-800"
          ></div>
          <div class="text-2xl">
            <MathRenderer latex={result.latex ?? result.result ?? ''} inline={false} />
          </div>
        {/if}
      </div>

      <!-- Multiple solutions -->
      {#if result.solutions && result.solutions.length > 0}
        <div
          class="flex flex-wrap gap-2 px-5 pb-4 pt-1
                 bg-orange-50/50 dark:bg-orange-950/20
                 border-t border-orange-200/40 dark:border-orange-800/30"
        >
          {#each result.solutions as sol, i}
            <span
              in:scale={{ duration: 220, delay: i * 80, easing: backOut }}
              class="inline-flex items-center gap-1 bg-orange-600 text-white
                     text-sm font-mono px-3 py-1.5 rounded-lg shadow-sm"
            >
              <span class="opacity-70 text-xs">
                x{#if result.solutions && result.solutions.length > 1}<sub>{i + 1}</sub>{/if} =
              </span>
              {sol}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

</section>

<style>
  /*
   * Photomath-style sub-expression highlight animation.
   *
   * KaTeX renders \textcolor{#hex}{...} as:
   *   <span class="mord" style="color: #hex">...</span>
   *
   * When the parent .katex-highlight-wrap has the class .is-active we
   * fire a one-shot pulse on every colored descendant:
   *   • scale  1 → 1.12 → 1   (pops forward then settles)
   *   • a soft glow via drop-shadow filter
   *   • slight brightness boost
   *
   * We use :global() to pierce the KaTeX-generated DOM.
   */

  @keyframes katex-pop {
    0%   { transform: scale(1);    filter: brightness(1)    drop-shadow(0 0 0px currentColor); }
    35%  { transform: scale(1.13); filter: brightness(1.25) drop-shadow(0 0 6px currentColor); }
    65%  { transform: scale(1.06); filter: brightness(1.15) drop-shadow(0 0 4px currentColor); }
    100% { transform: scale(1);    filter: brightness(1)    drop-shadow(0 0 0px currentColor); }
  }

  /* The wrapper div that holds the MathRenderer output */
  :global(.katex-highlight-wrap) {
    /* nothing special when idle */
  }

  /*
   * When active: every <span> that has an explicit inline color (from \textcolor)
   * gets the pop animation. We target spans whose color was set inline — KaTeX
   * always emits style="color: #..." on \textcolor spans.
   *
   * selector: .is-active .katex [style*="color:"]   (colored KaTeX nodes)
   */
  :global(.katex-highlight-wrap.is-active .katex [style*="color:"]) {
    display: inline-block;        /* required — transform only works on block/inline-block */
    animation: katex-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  /* Stagger sibling colored spans so they don't all fire at once */
  :global(.katex-highlight-wrap.is-active .katex [style*="color:"]:nth-child(2)) {
    animation-delay: 0.06s;
  }
  :global(.katex-highlight-wrap.is-active .katex [style*="color:"]:nth-child(3)) {
    animation-delay: 0.12s;
  }
  :global(.katex-highlight-wrap.is-active .katex [style*="color:"]:nth-child(4)) {
    animation-delay: 0.18s;
  }
</style>
