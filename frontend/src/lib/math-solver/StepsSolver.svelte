<script>
  import { fly } from 'svelte/transition'
  import MathRenderer from './MathRenderer.svelte'

  export let steps = []
  export let result = null

  function copyLatex() {
    if (result?.latex) {
      navigator.clipboard.writeText(result.latex)
    }
  }
</script>

<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">

  <div class="flex items-center justify-between mb-5">
    <h2 class="font-semibold text-lg">Resolución paso a paso</h2>
    <span class="text-xs text-gray-400 dark:text-slate-500">{steps.length} pasos</span>
  </div>

  <!-- Steps -->
  <div class="flex flex-col gap-3">
    {#each steps as step, i (step.step_number)}
      <div
        in:fly={{ y: 20, duration: 350, delay: i * 80 }}
        class="rounded-xl border {i === steps.length - 1 ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40'} p-4"
      >
        <div class="flex items-start gap-3">
          <!-- Step number badge -->
          <span class="shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 {i === steps.length - 1 ? 'bg-emerald-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}">
            {step.step_number}
          </span>

          <div class="flex-1 min-w-0">
            <!-- Description -->
            <p class="text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{step.description}</p>

            <!-- LaTeX expression -->
            <div class="overflow-x-auto">
              <MathRenderer latex={step.expr_latex} inline={false} />
            </div>

            <!-- Explanation (if any) -->
            {#if step.explanation}
              <p class="text-xs text-gray-400 dark:text-slate-500 mt-2">{step.explanation}</p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Final result card -->
  {#if result}
    <div
      in:fly={{ y: 20, duration: 400, delay: steps.length * 80 }}
      class="mt-5 rounded-xl bg-blue-600 dark:bg-blue-700 text-white p-5"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="font-semibold">Resultado final</span>
        <button
          on:click={copyLatex}
          class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          title="Copiar LaTeX"
        >Copiar LaTeX</button>
      </div>

      <div class="overflow-x-auto bg-white/10 rounded-lg p-3">
        <MathRenderer latex={result.latex || result.result} inline={false} />
      </div>

      {#if result.solutions?.length > 0}
        <div class="flex flex-wrap gap-2 mt-3">
          {#each result.solutions as sol, i}
            <span class="bg-white/20 rounded-lg px-3 py-1 text-sm font-mono">
              x{#if result.solutions.length > 1}_{i+1}{/if} = {sol}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

</section>
