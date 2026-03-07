<script lang="ts">
  import { fade } from 'svelte/transition'

  interface Props {
    /** Expression in SymPy/Python syntax, e.g. "x**2 + 2*x - 3" */
    expr: string
  }

  let { expr }: Props = $props()

  let containerEl: HTMLDivElement | undefined = $state()
  let fsContainerEl: HTMLDivElement | undefined = $state()
  let error      = $state(false)
  let fullscreen = $state(false)
  // Trigger re-animation when the plot is drawn
  let plotKey    = $state(0)

  interface CritPoint { x: number; y: number; kind: 'root' | 'minimum' | 'maximum' | 'inflection' }
  let critPoints = $state<CritPoint[]>([])

  // Convert SymPy syntax → function-plot / math.js syntax
  function toJsSyntax(s: string): string {
    return s
      .replace(/\*\*/g, '^')
      .replace(/\bE\b/g, 'e')
      .replace(/\bpi\b/gi, 'pi')
      .replace(/\boo\b/g, 'Infinity')
      .replace(/\bln\(/g, 'log(')
      .replace(/\s*\+\s*C\s*$/i, '')
      .trim()
  }

  function isPlottable(s: string): boolean {
    return /\bx\b/.test(s)
  }

  const clean     = $derived(toJsSyntax(expr))
  const plottable = $derived(isPlottable(clean))

  // Fetch critical points from backend whenever expr changes
  $effect(() => {
    if (!plottable) { critPoints = []; return }
    const currentExpr = expr
    fetch('/api/critical-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expr: currentExpr })
    })
      .then(r => r.json())
      .then(d => { critPoints = d.points ?? [] })
      .catch(() => { critPoints = [] })
  })

  // Chalkboard color palette for critical points (matches mth tokens)
  const KIND_COLOR: Record<string, string> = {
    root:       '#4ecdc4',  // --mth-cyan
    minimum:    '#6ee7b7',  // --mth-green
    maximum:    '#ff6b6b',  // --mth-coral
    inflection: '#a78bfa',  // --mth-violet
  }

  const KIND_LABEL: Record<string, string> = {
    root:       'Raíz',
    minimum:    'Mínimo',
    maximum:    'Máximo',
    inflection: 'Inflexión',
  }

  // Glow colors for legend dots
  const KIND_GLOW: Record<string, string> = {
    root:       'rgba(78, 205, 196, 0.6)',
    minimum:    'rgba(110, 231, 183, 0.5)',
    maximum:    'rgba(255, 107, 107, 0.6)',
    inflection: 'rgba(167, 139, 250, 0.6)',
  }

  function buildData(pts: CritPoint[]) {
    const groups: Record<string, number[][]> = {}
    for (const p of pts) {
      if (!groups[p.kind]) groups[p.kind] = []
      groups[p.kind].push([p.x, p.y])
    }
    return Object.entries(groups).map(([kind, points]) => ({
      points,
      fnType: 'points' as const,
      graphType: 'scatter' as const,
      color: KIND_COLOR[kind] ?? '#e8ede6',
    }))
  }

  function drawPlot(target: HTMLDivElement, width: number, height: number) {
    target.innerHTML = ''
    import('function-plot').then(({ default: functionPlot }) => {
      try {
        functionPlot({
          target,
          width,
          height,
          grid: true,
          xAxis: { domain: [-6, 6] },
          yAxis: { domain: [-8, 8] },
          data: [
            { fn: clean, color: '#f5c842', graphType: 'polyline' },
            ...buildData(critPoints),
          ],
        })
        // Style the SVG inline so it matches the chalkboard theme
        styleInlineSvg(target)
        plotKey++
      } catch (e) {
        console.warn('[FunctionPlot] render error:', e)
        error = true
      }
    }).catch(e => {
      console.warn('[FunctionPlot] import error:', e)
      error = true
    })
  }

  /**
   * Post-processes the SVG rendered by function-plot so it uses the
   * chalkboard color palette (dark bg, chalk axes, yellow curve).
   * function-plot renders into a <div> with a nested <svg>; we reach in
   * and override the relevant fill/stroke attributes.
   */
  function styleInlineSvg(target: HTMLDivElement) {
    const svg = target.querySelector('svg')
    if (!svg) return

    // Background rect — make transparent so our CSS background shows
    const bgRect = svg.querySelector<SVGRectElement>('rect.background, rect[fill="#fff"], rect[fill="white"]')
    if (bgRect) {
      bgRect.setAttribute('fill', 'transparent')
    }

    // Grid lines → subtle chalk tint
    svg.querySelectorAll<SVGElement>('.graph-content .tick line, line.grid').forEach(l => {
      l.setAttribute('stroke', 'rgba(232,237,230,0.08)')
    })

    // Axes
    svg.querySelectorAll<SVGElement>('.x.axis path, .y.axis path, .x.axis line, .y.axis line').forEach(el => {
      el.setAttribute('stroke', 'rgba(232,237,230,0.3)')
    })

    // Axis tick labels
    svg.querySelectorAll<SVGElement>('.axis text').forEach(el => {
      el.setAttribute('fill', 'rgba(232,237,230,0.4)')
    })

    // Main curve — ensure chalk-yellow
    svg.querySelectorAll<SVGElement>('path.line').forEach((p, i) => {
      if (i === 0) p.setAttribute('stroke', '#f5c842')
    })
  }

  // Normal plot — ResizeObserver
  $effect(() => {
    if (!plottable || !containerEl) return
    error = false
    const el = containerEl
    const _pts = critPoints
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width || 480
      drawPlot(el, w, 260)
    })
    ro.observe(el)
    return () => ro.disconnect()
  })

  // Fullscreen plot
  $effect(() => {
    if (!fullscreen || !fsContainerEl) return
    const el = fsContainerEl
    const _pts = critPoints
    const id = requestAnimationFrame(() => {
      const w = el.offsetWidth  || window.innerWidth
      const h = el.offsetHeight || window.innerHeight - 80
      drawPlot(el, w, h)
    })
    return () => cancelAnimationFrame(id)
  })

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && fullscreen) fullscreen = false
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if plottable}
  <div in:fade={{ duration: 300 }} class="mth-graph-wrap">
    <!-- Header -->
    <div class="mth-graph-header">
      <p class="mth-graph-label">Gráfica</p>
      <button
        type="button"
        onclick={() => (fullscreen = true)}
        class="mth-expand-btn"
        aria-label="Ver gráfica en pantalla completa"
        title="Pantalla completa"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M9 1h5v5M6 14H1V9M14 1l-5 5M1 14l5-5"/>
        </svg>
      </button>
    </div>

    {#if error}
      <p class="mth-graph-error">No se pudo representar la función gráficamente.</p>
    {:else}
      <!-- mth-graph container (dark chalkboard) -->
      <div class="mth-graph">
        <!-- CSS grid lines (decorative) -->
        <div class="mth-graph__grid" aria-hidden="true"></div>
        <!-- function-plot renders here; styled via JS post-processing -->
        <div bind:this={containerEl} class="mth-graph__inner"></div>
        <!-- Chalk-draw reveal overlay — animates away after mount -->
        {#key plotKey}
          <div class="mth-graph__chalk-reveal" aria-hidden="true"></div>
        {/key}
      </div>

      {#if critPoints.length > 0}
        <div class="mth-graph-legend">
          {#each critPoints as p}
            {@const color = KIND_COLOR[p.kind] ?? '#e8ede6'}
            {@const glow  = KIND_GLOW[p.kind]  ?? 'rgba(232,237,230,0.3)'}
            {@const label = KIND_LABEL[p.kind]  ?? p.kind}
            {@const fx = Number.isInteger(p.x) ? p.x.toString() : p.x.toFixed(2).replace(/\.?0+$/, '')}
            {@const fy = Number.isInteger(p.y) ? p.y.toString() : p.y.toFixed(2).replace(/\.?0+$/, '')}
            <span class="mth-legend-item">
              <span class="mth-legend-dot" style="background:{color}; box-shadow: 0 0 6px {glow}"></span>
              <span class="mth-legend-kind" style="color:{color}">{label}</span>
              <span class="mth-legend-coord">({fx}, {fy})</span>
            </span>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  <!-- Fullscreen overlay -->
  {#if fullscreen}
    <div
      class="mth-fs-overlay"
      in:fade={{ duration: 160 }}
      out:fade={{ duration: 120 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mth-fs-label"
    >
      <div class="mth-fs-header">
        <span class="mth-graph-label" id="mth-fs-label">Gráfica</span>
        <button
          type="button"
          onclick={() => (fullscreen = false)}
          class="mth-close-btn"
          aria-label="Cerrar pantalla completa"
          title="Cerrar (Esc)"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M1 9h5v5M14 6H9V1M6 9l-5 5M14 1l-5 5"/>
          </svg>
          <span>Cerrar</span>
        </button>
      </div>
      <div bind:this={fsContainerEl} class="mth-fs-container"></div>
    </div>
  {/if}
{/if}

<style>
  /* ── Design tokens (match MorphSolver) ──────────────────────────────────── */
  :root {
    --mth-board:       #1a2420;
    --mth-board-light: #22302b;
    --mth-chalk:       #e8ede6;
    --mth-chalk-dim:   rgba(232, 237, 230, 0.55);
    --mth-yellow:      #f5c842;
  }

  @keyframes mth-chalkDraw {
    from { clip-path: inset(0 100% 0 0); opacity: 1; }
    to   { clip-path: inset(0 0% 0 0);   opacity: 0; }
  }
  @keyframes mth-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Wrap ────────────────────────────────────────────────────────────────── */
  .mth-graph-wrap {
    border-top: 1px solid rgba(232, 237, 230, 0.08);
    padding-top: 1.25rem;
    margin-top: 0.25rem;
    animation: mth-fadeUp 300ms ease both;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */
  .mth-graph-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0 0.125rem;
  }
  .mth-graph-label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mth-chalk-dim, rgba(232,237,230,0.55));
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Mono', monospace;
  }
  .mth-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(232, 237, 230, 0.12);
    background: rgba(0, 0, 0, 0.2);
    color: var(--mth-chalk-dim, rgba(232,237,230,0.55));
    cursor: pointer;
    touch-action: manipulation;
    transition: background 150ms, color 150ms, border-color 150ms, box-shadow 150ms;
  }
  .mth-expand-btn:hover {
    background: rgba(245, 200, 66, 0.12);
    color: var(--mth-yellow, #f5c842);
    border-color: rgba(245, 200, 66, 0.3);
    box-shadow: 0 0 10px rgba(245, 200, 66, 0.25);
  }
  .mth-expand-btn:focus-visible {
    outline: 2px solid var(--mth-yellow, #f5c842);
    outline-offset: 2px;
  }

  /* ── mth-graph container (chalkboard canvas) ─────────────────────────────── */
  .mth-graph {
    position: relative;
    width: 100%;
    border-radius: 0.875rem;
    background: var(--mth-board, #1a2420);
    border: 1.5px solid rgba(232, 237, 230, 0.1);
    overflow: hidden;
    box-shadow:
      inset 0 0 40px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.35);
  }

  /* Decorative CSS grid lines (always-on visual layer) */
  .mth-graph__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(232,237,230,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,237,230,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* function-plot output layer */
  .mth-graph__inner {
    position: relative;
    z-index: 1;
    width: 100%;
  }

  /* Override function-plot SVG background */
  .mth-graph__inner :global(.function-plot) {
    width: 100% !important;
    background: transparent !important;
  }
  .mth-graph__inner :global(svg) {
    border-radius: 0.875rem;
    touch-action: none;
    background: transparent !important;
  }
  /* Axes styling via global CSS as post-processing fallback */
  .mth-graph__inner :global(.axis path),
  .mth-graph__inner :global(.axis line) {
    stroke: rgba(232,237,230,0.25) !important;
  }
  .mth-graph__inner :global(.axis text) {
    fill: rgba(232,237,230,0.35) !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 10px !important;
  }
  .mth-graph__inner :global(.graph-content .tick line) {
    stroke: rgba(232,237,230,0.07) !important;
  }
  /* Main curve → chalk-yellow */
  .mth-graph__inner :global(path.line:first-of-type) {
    stroke: #f5c842 !important;
    stroke-width: 2.5px !important;
    filter: drop-shadow(0 0 4px rgba(245, 200, 66, 0.5));
  }
  /* Scatter dots → keep their colors but add a glow-like stroke */
  .mth-graph__inner :global(.graph-content circle) {
    stroke: none !important;
    filter: drop-shadow(0 0 4px currentColor);
  }

  /* ── Chalk-draw reveal animation overlay ─────────────────────────────────── */
  /* A colored left-to-right reveal that fades away, simulating chalk drawing */
  .mth-graph__chalk-reveal {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--mth-board, #1a2420) 0%, transparent 100%);
    pointer-events: none;
    z-index: 2;
    animation: mth-chalkDraw 900ms cubic-bezier(0.4, 0, 0.2, 1) 120ms forwards;
  }

  /* ── Error state ─────────────────────────────────────────────────────────── */
  .mth-graph-error {
    font-size: 0.78rem;
    color: var(--mth-chalk-dim, rgba(232,237,230,0.55));
    text-align: center;
    padding: 1.5rem 0;
    margin: 0;
  }

  /* ── Legend ──────────────────────────────────────────────────────────────── */
  .mth-graph-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.875rem;
    padding: 0.75rem 0.25rem 0;
  }
  .mth-legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
  }
  .mth-legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mth-legend-kind {
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.6rem;
  }
  .mth-legend-coord {
    color: var(--mth-chalk-dim, rgba(232,237,230,0.55));
    font-variant-numeric: tabular-nums;
  }

  /* ── Fullscreen overlay ──────────────────────────────────────────────────── */
  .mth-fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--mth-board, #1a2420);
    display: flex;
    flex-direction: column;
    overscroll-behavior: contain;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    /* chalkboard texture */
    background-image: radial-gradient(
      ellipse at 50% 30%,
      rgba(255, 255, 255, 0.02) 0%,
      transparent 70%
    );
  }
  .mth-fs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid rgba(232, 237, 230, 0.1);
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.25);
  }
  .mth-close-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.875rem;
    border-radius: 0.625rem;
    border: 1px solid rgba(232, 237, 230, 0.14);
    background: rgba(0, 0, 0, 0.2);
    color: var(--mth-chalk-dim, rgba(232,237,230,0.55));
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
    transition: background 150ms, border-color 150ms, color 150ms, box-shadow 150ms;
    font-family: 'Nunito', system-ui;
  }
  .mth-close-btn:hover {
    background: rgba(245, 200, 66, 0.1);
    border-color: rgba(245, 200, 66, 0.3);
    color: var(--mth-yellow, #f5c842);
    box-shadow: 0 0 10px rgba(245, 200, 66, 0.2);
  }
  .mth-close-btn:focus-visible {
    outline: 2px solid var(--mth-yellow, #f5c842);
    outline-offset: 2px;
  }
  .mth-fs-container {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .mth-fs-container :global(.function-plot) {
    width: 100% !important;
  }
  .mth-fs-container :global(svg) {
    touch-action: none;
    background: transparent !important;
  }
  .mth-fs-container :global(.axis path),
  .mth-fs-container :global(.axis line) {
    stroke: rgba(232,237,230,0.25) !important;
  }
  .mth-fs-container :global(.axis text) {
    fill: rgba(232,237,230,0.35) !important;
    font-family: 'JetBrains Mono', monospace !important;
  }
  .mth-fs-container :global(path.line:first-of-type) {
    stroke: #f5c842 !important;
    stroke-width: 2.5px !important;
    filter: drop-shadow(0 0 5px rgba(245, 200, 66, 0.55));
  }
</style>
