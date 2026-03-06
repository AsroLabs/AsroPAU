<script lang="ts">
  import { fade } from 'svelte/transition'

  interface Props {
    /** Expression in SymPy/Python syntax, e.g. "x**2 + 2*x - 3" */
    expr: string
  }

  let { expr }: Props = $props()

  let containerEl: HTMLDivElement | undefined = $state()
  let error = $state(false)

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

  const clean = $derived(toJsSyntax(expr))
  const plottable = $derived(isPlottable(clean))

  $effect(() => {
    if (!plottable || !containerEl) return
    error = false
    const fn = clean  // capture reactive value
    // Clear previous plot
    containerEl.innerHTML = ''
    import('function-plot').then(({ default: functionPlot }) => {
      try {
        functionPlot({
          target: containerEl!,
          width: containerEl!.offsetWidth || 480,
          height: 260,
          grid: true,
          xAxis: { domain: [-6, 6] },
          yAxis: { domain: [-8, 8] },
          data: [{ fn, color: '#EA580C', graphType: 'polyline' }],
        })
      } catch (e) {
        console.warn('[FunctionPlot] render error:', e)
        error = true
      }
    }).catch(e => {
      console.warn('[FunctionPlot] import error:', e)
      error = true
    })
  })
</script>

{#if plottable}
  <div in:fade={{ duration: 300 }} class="function-plot-wrap">
    <p class="plot-label">Gráfica</p>
    {#if error}
      <p class="plot-error">No se pudo representar la función gráficamente.</p>
    {:else}
      <div bind:this={containerEl} class="plot-container"></div>
    {/if}
  </div>
{/if}

<style>
  .function-plot-wrap {
    border-top: 1.5px solid #f3f4f6;
    padding-top: 1.25rem;
    margin-top: 0.25rem;
  }

  .plot-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 0.75rem;
    padding-left: 0.25rem;
  }

  .plot-container {
    width: 100%;
    border-radius: 0.75rem;
    overflow: hidden;
    background: #fafafa;
    border: 1px solid #e5e7eb;
  }

  /* function-plot injects an svg — make it fill the container */
  .plot-container :global(.function-plot) {
    width: 100% !important;
  }

  .plot-container :global(svg) {
    border-radius: 0.75rem;
  }

  .plot-error {
    font-size: 0.8rem;
    color: #9ca3af;
    text-align: center;
    padding: 1.5rem 0;
  }
</style>
