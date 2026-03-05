<script>
  import { createEventDispatcher } from 'svelte'
  import MathRenderer from './MathRenderer.svelte'

  export let value = ''

  const dispatch = createEventDispatcher()

  // ── Key groups ────────────────────────────────────────────────────
  const digits = [
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' },
    { label: '0', val: '0' }, { label: '.', val: '.' }, { label: '=', val: '=' },
  ]

  const ops = [
    { label: '+',  val: '+',   tip: 'Suma' },
    { label: '−',  val: '-',   tip: 'Resta' },
    { label: '×',  val: '*',   tip: 'Producto' },
    { label: '÷',  val: '/',   tip: 'División' },
    { label: 'xⁿ', val: '**',  tip: 'Potencia' },
    { label: '√x', val: 'sqrt(', tip: 'Raíz cuadrada' },
    { label: '∛x', val: 'cbrt(', tip: 'Raíz cúbica' },
    { label: '|x|', val: 'Abs(', tip: 'Valor absoluto' },
    { label: '(',  val: '(' },
    { label: ')',  val: ')' },
    { label: 'x²', val: '**2', tip: 'Al cuadrado' },
    { label: 'x³', val: '**3', tip: 'Al cubo' },
  ]

  const funcs = [
    { label: 'sin',  val: 'sin(',  tip: 'Seno' },
    { label: 'cos',  val: 'cos(',  tip: 'Coseno' },
    { label: 'tan',  val: 'tan(',  tip: 'Tangente' },
    { label: 'log',  val: 'log(',  tip: 'Logaritmo base 10' },
    { label: 'ln',   val: 'log(',  tip: 'Logaritmo natural (ln = log en SymPy)' },
    { label: 'exp',  val: 'exp(',  tip: 'Exponencial eˣ' },
    { label: 'd/dx', val: 'd/dx(', tip: 'Derivada' },
    { label: '∫dx',  val: 'integrate(', tip: 'Integral' },
    { label: 'lim',  val: 'lim x->',  tip: 'Límite' },
  ]

  const consts = [
    { label: 'x', val: 'x' },
    { label: 'y', val: 'y' },
    { label: 'n', val: 'n' },
    { label: 'π', val: 'pi' },
    { label: 'e', val: 'E' },
    { label: '∞', val: 'oo' },
  ]

  // ── Actions ───────────────────────────────────────────────────────
  function press(val) {
    value = value + val
    dispatch('change', value)
  }

  function backspace() {
    value = value.slice(0, -1)
    dispatch('change', value)
  }

  function clear() {
    value = ''
    dispatch('change', value)
  }
</script>

<div class="flex flex-col gap-4">

  <!-- Live preview -->
  <div class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-dashed border-gray-200 dark:border-slate-600 rounded-xl min-h-[3rem] flex items-center overflow-x-auto">
    {#if value}
      <MathRenderer latex={value} inline={false} />
    {:else}
      <span class="text-sm text-gray-300 dark:text-slate-600">Usa los botones para escribir la ecuación...</span>
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

    <!-- LEFT: digits -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Números</p>
      <div class="grid grid-cols-3 gap-1.5">
        {#each digits as k}
          <button
            on:click={() => press(k.val)}
            title={k.tip || k.label}
            class="py-2.5 rounded-lg font-mono text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 transition-colors active:scale-95"
          >{k.label}</button>
        {/each}
      </div>

      <!-- Constants / variables row -->
      <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mt-1">Variables / Constantes</p>
      <div class="grid grid-cols-6 gap-1.5">
        {#each consts as k}
          <button
            on:click={() => press(k.val)}
            title={k.tip || k.label}
            class="py-2 rounded-lg font-mono text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 transition-colors active:scale-95"
          >{k.label}</button>
        {/each}
      </div>
    </div>

    <!-- RIGHT: operators + functions -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Operadores</p>
      <div class="grid grid-cols-4 gap-1.5">
        {#each ops as k}
          <button
            on:click={() => press(k.val)}
            title={k.tip || k.label}
            class="py-2 rounded-lg text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 transition-colors active:scale-95"
          >{k.label}</button>
        {/each}
      </div>

      <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mt-1">Funciones / Cálculo</p>
      <div class="grid grid-cols-3 gap-1.5">
        {#each funcs as k}
          <button
            on:click={() => press(k.val)}
            title={k.tip || k.label}
            class="py-2 rounded-lg text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-300 transition-colors active:scale-95 whitespace-nowrap"
          >{k.label}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Control row -->
  <div class="flex gap-2">
    <button
      on:click={backspace}
      class="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 text-sm font-medium transition-colors active:scale-95"
    >← Borrar</button>
    <button
      on:click={clear}
      class="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 text-sm font-medium transition-colors active:scale-95 text-red-500 dark:text-red-400"
    >Limpiar todo</button>
  </div>
</div>
