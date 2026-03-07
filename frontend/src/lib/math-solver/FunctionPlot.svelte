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

  // Color per point kind
  const KIND_COLOR: Record<string, string> = {
    root:       '#2563EB',
    minimum:    '#16A34A',
    maximum:    '#DC2626',
    inflection: '#9333EA',
  }

  const KIND_LABEL: Record<string, string> = {
    root:       'Raíz',
    minimum:    'Mínimo',
    maximum:    'Máximo',
    inflection: 'Inflexión',
  }

  function buildData(pts: CritPoint[]) {
    // Group by kind → separate scatter series so each gets its own color
    const groups: Record<string, number[][]> = {}
    for (const p of pts) {
      if (!groups[p.kind]) groups[p.kind] = []
      groups[p.kind].push([p.x, p.y])
    }
    return Object.entries(groups).map(([kind, points]) => ({
      points,
      fnType: 'points' as const,
      graphType: 'scatter' as const,
      color: KIND_COLOR[kind] ?? '#6b7280',
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
            { fn: clean, color: '#EA580C', graphType: 'polyline' },
            ...buildData(critPoints),
          ],
        })
      } catch (e) {
        console.warn('[FunctionPlot] render error:', e)
        error = true
      }
    }).catch(e => {
      console.warn('[FunctionPlot] import error:', e)
      error = true
    })
  }

  // Normal plot — use ResizeObserver to avoid forced reflow inside $effect
  $effect(() => {
    if (!plottable || !containerEl) return
    error = false
    const el = containerEl
    // also re-run when critPoints change
    const _pts = critPoints
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width || 480
      drawPlot(el, w, 260)
    })
    ro.observe(el)
    return () => ro.disconnect()
  })

  // Fullscreen plot — defer dimension read to rAF to avoid forced reflow
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

  // Close on Escape
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && fullscreen) fullscreen = false
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if plottable}
  <div in:fade={{ duration: 300 }} class="function-plot-wrap">
    <div class="plot-header">
      <p class="plot-label">Gráfica</p>
      <button
        type="button"
        onclick={() => (fullscreen = true)}
        class="expand-btn"
        aria-label="Ver gráfica en pantalla completa"
        title="Pantalla completa"
      >
        <!-- Expand icon -->
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M9 1h5v5M6 14H1V9M14 1l-5 5M1 14l5-5"/>
        </svg>
      </button>
    </div>
    {#if error}
      <p class="plot-error">No se pudo representar la función gráficamente.</p>
    {:else}
      <div bind:this={containerEl} class="plot-container"></div>
      {#if critPoints.length > 0}
        <div class="plot-legend">
          {#each critPoints as p}
            {@const color = KIND_COLOR[p.kind] ?? '#6b7280'}
            {@const label = KIND_LABEL[p.kind] ?? p.kind}
            {@const fx = Number.isInteger(p.x) ? p.x.toString() : p.x.toFixed(2).replace(/\.?0+$/, '')}
            {@const fy = Number.isInteger(p.y) ? p.y.toString() : p.y.toFixed(2).replace(/\.?0+$/, '')}
            <span class="legend-item">
              <span class="legend-dot" style="background:{color}"></span>
              <span class="legend-kind" style="color:{color}">{label}</span>
              <span class="legend-coord">({fx}, {fy})</span>
            </span>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  <!-- Fullscreen overlay -->
  {#if fullscreen}
    <div
      class="fs-overlay"
      in:fade={{ duration: 160 }}
      out:fade={{ duration: 120 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fs-dialog-label"
    >
      <div class="fs-header">
        <span class="fs-label" id="fs-dialog-label">Gráfica</span>
        <button
          type="button"
          onclick={() => (fullscreen = false)}
          class="close-btn"
          aria-label="Cerrar pantalla completa"
          title="Cerrar (Esc)"
        >
          <!-- Compress / close icon -->
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M1 9h5v5M14 6H9V1M6 9l-5 5M14 1l-5 5"/>
          </svg>
          <span>Cerrar</span>
        </button>
      </div>
      <div bind:this={fsContainerEl} class="fs-container"></div>
    </div>
  {/if}
{/if}

<style>
  .function-plot-wrap {
    border-top: 1.5px solid #f3f4f6;
    padding-top: 1.25rem;
    margin-top: 0.25rem;
  }

  .plot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding: 0 0.25rem;
  }

  .plot-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #9ca3af;
    margin: 0;
  }

  .expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background: white;
    color: #6b7280;
    cursor: pointer;
    touch-action: manipulation;
    transition: background 150ms, color 150ms, border-color 150ms;
  }

  .expand-btn:hover {
    background: #fff7ed;
    color: #ea580c;
    border-color: #fed7aa;
  }

  .expand-btn:focus-visible {
    outline: 2px solid #ea580c;
    outline-offset: 2px;
  }

  .plot-container {
    width: 100%;
    border-radius: 0.75rem;
    background: #fafafa;
    border: 1px solid #e5e7eb;
  }

  .plot-container :global(.function-plot) {
    width: 100% !important;
  }

  .plot-container :global(svg) {
    border-radius: 0.75rem;
    touch-action: none;
  }

  .plot-error {
    font-size: 0.8rem;
    color: #9ca3af;
    text-align: center;
    padding: 1.5rem 0;
  }

  .plot-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    padding: 0.6rem 0.25rem 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-kind {
    font-weight: 600;
  }

  .legend-coord {
    color: #9ca3af;
    font-variant-numeric: tabular-nums;
  }

  /* ── Fullscreen overlay ─────────────────────────────────────────────── */
  .fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    overscroll-behavior: contain;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  .fs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
    background: white;
  }

  .fs-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #9ca3af;
  }

  .close-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.875rem;
    border-radius: 0.625rem;
    border: 1px solid #e5e7eb;
    background: white;
    color: #6b7280;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    touch-action: manipulation;
    transition: background 150ms, border-color 150ms, color 150ms;
  }

  .close-btn:hover {
    background: #fff7ed;
    border-color: #fed7aa;
    color: #ea580c;
  }

  .close-btn:focus-visible {
    outline: 2px solid #ea580c;
    outline-offset: 2px;
  }

  .fs-container {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fs-container :global(.function-plot) {
    width: 100% !important;
  }

  .fs-container :global(svg) {
    touch-action: none;
  }
</style>
