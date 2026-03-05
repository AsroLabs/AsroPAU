<script>
  import { createEventDispatcher } from 'svelte'
  import MathRenderer from './MathRenderer.svelte'

  export let value = ''

  const dispatch = createEventDispatcher()

  const quickSymbols = [
    { label: 'x²', insert: '**2' },
    { label: '√', insert: 'sqrt(' },
    { label: 'π', insert: 'pi' },
    { label: '∞', insert: 'oo' },
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'log', insert: 'log(' },
    { label: 'ln', insert: 'ln(' },
    { label: 'd/dx', insert: 'd/dx(' },
  ]

  function insertSymbol(sym) {
    value = value + sym
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      dispatch('submit')
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Quick symbols -->
  <div class="flex flex-wrap gap-1.5">
    {#each quickSymbols as sym}
      <button
        type="button"
        on:click={() => insertSymbol(sym.insert)}
        class="px-2.5 py-1 text-sm font-mono border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
      >{sym.label}</button>
    {/each}
  </div>

  <!-- Text input -->
  <input
    bind:value
    on:keydown={handleKeydown}
    type="text"
    placeholder="Ej: x**2 - 5*x + 6 = 0"
    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-mono text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
  />

  <!-- KaTeX preview -->
  {#if value.trim()}
    <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-dashed border-gray-200 dark:border-slate-600 rounded-xl min-h-[3rem] flex items-center overflow-x-auto">
      <MathRenderer latex={value} inline={false} />
    </div>
  {/if}
</div>
