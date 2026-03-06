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
          data: [{ fn: clean, color: '#EA580C', graphType: 'polyline' }],
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

  // Normal plot
  $effect(() => {
    if (!plottable || !containerEl) return
    error = false
    drawPlot(containerEl, containerEl.offsetWidth || 480, 260)
  })

  // Fullscreen plot — rerenders whenever fsContainerEl mounts or clean changes
  $effect(() => {
    if (!fullscreen || !fsContainerEl) return
    const w = fsContainerEl.offsetWidth  || window.innerWidth
    const h = fsContainerEl.offsetHeight || window.innerHeight - 80
    drawPlot(fsContainerEl, w, h)
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
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M9 1h5v5M6 14H1V9M14 1l-5 5M1 14l5-5"/>
        </svg>
      </button>
    </div>
    {#if error}
      <p class="plot-error">No se pudo representar la función gráficamente.</p>
    {:else}
      <div bind:this={containerEl} class="plot-container"></div>
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
      aria-label="Gráfica en pantalla completa"
    >
      <div class="fs-header">
        <span class="fs-label">Gráfica</span>
        <button
          type="button"
          onclick={() => (fullscreen = false)}
          class="close-btn"
          aria-label="Cerrar pantalla completa"
          title="Cerrar (Esc)"
        >
          <!-- Compress / close icon -->
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
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
    transition: background 150ms, color 150ms, border-color 150ms;
  }

  .expand-btn:hover {
    background: #fff7ed;
    color: #ea580c;
    border-color: #fed7aa;
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

  /* ── Fullscreen overlay ─────────────────────────────────────────────── */
  .fs-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0f172a;
    display: flex;
    flex-direction: column;
  }

  .fs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .fs-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }

  .close-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.875rem;
    border-radius: 0.625rem;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.85);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms, border-color 150ms;
  }

  .close-btn:hover {
    background: rgba(234,88,12,0.25);
    border-color: rgba(234,88,12,0.5);
    color: #fdba74;
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
