<script lang="ts">
  import katex from 'katex'

  let { latex = '', inline = false }: { latex?: string; inline?: boolean } = $props()

  let container = $state<HTMLElement | null>(null)

  $effect(() => {
    if (!container) return
    const l = latex
    const i = inline

    if (!l.trim()) {
      container.innerHTML = ''
      return
    }

    try {
      katex.render(l, container, {
        throwOnError: false,
        displayMode: !i,
        output: 'html',
        trust: true,           // needed for \textcolor
        strict: false,
        macros: {
          '\\diff': '\\,\\mathrm{d}',
          '\\abs':  '\\left|#1\\right|',
        },
        minRuleThickness: 0.06,
      })
    } catch {
      container.textContent = l
    }
  })
</script>

{#if inline}
  <span
    bind:this={container}
    class="inline align-middle"
    aria-label={latex}
  ></span>
{:else}
  <div class="relative">
    <div
      bind:this={container}
      class="overflow-x-auto px-4 py-3 text-center [&_.katex-display]:my-0"
      aria-label={latex}
    ></div>
    <!-- fade-out right edge when content overflows -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-8
             bg-gradient-to-l from-white/80 to-transparent dark:from-slate-900/80"
      aria-hidden="true"
    ></div>
  </div>
{/if}
