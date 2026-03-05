<script lang="ts">
  import MathRenderer from './MathRenderer.svelte'

  interface Props {
    value?: string
    onsubmit?: () => void
  }

  let { value = $bindable(''), onsubmit }: Props = $props()

  const quickSymbols: { label: string; insert: string; tip?: string }[] = [
    { label: 'x²',  insert: '**2',   tip: 'Elevar al cuadrado' },
    { label: 'x³',  insert: '**3',   tip: 'Elevar al cubo' },
    { label: 'xⁿ',  insert: '**',    tip: 'Potencia' },
    { label: '√',   insert: 'sqrt(', tip: 'Raíz cuadrada' },
    { label: 'π',   insert: 'pi',    tip: 'Número pi' },
    { label: '∞',   insert: 'oo',    tip: 'Infinito' },
    { label: 'sin', insert: 'sin(',  tip: 'Seno' },
    { label: 'cos', insert: 'cos(',  tip: 'Coseno' },
    { label: 'tan', insert: 'tan(',  tip: 'Tangente' },
    { label: 'log', insert: 'log(',  tip: 'Logaritmo (base e en SymPy)' },
    { label: 'ln',  insert: 'ln(',   tip: 'Logaritmo natural' },
    { label: 'd/dx',insert: 'd/dx(', tip: 'Derivada' },
  ]

  let inputEl: HTMLInputElement | null = null

  /**
   * Insert text at the cursor position (or append if no cursor).
   * BUG FIX: previously just appended to the end, ignoring cursor position.
   */
  function insertSymbol(sym: string) {
    if (!inputEl) {
      value = value + sym
      return
    }
    const start = inputEl.selectionStart ?? value.length
    const end   = inputEl.selectionEnd   ?? value.length
    value = value.slice(0, start) + sym + value.slice(end)
    // Restore cursor after the inserted text
    const newPos = start + sym.length
    // Use requestAnimationFrame so Svelte has applied the new value
    requestAnimationFrame(() => {
      inputEl?.setSelectionRange(newPos, newPos)
      inputEl?.focus()
    })
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onsubmit?.()
    }
  }
</script>

<div class="flex flex-col gap-3">
  <!-- Quick symbols toolbar -->
  <div class="flex flex-wrap gap-1.5" role="toolbar" aria-label="Símbolos matemáticos">
    {#each quickSymbols as sym}
      <button
        type="button"
        title={sym.tip ?? sym.label}
        onclick={() => insertSymbol(sym.insert)}
        class="px-2.5 py-1 text-sm font-mono border border-gray-200 dark:border-slate-600 rounded-lg
          hover:bg-orange-50 dark:hover:bg-slate-700 hover:border-orange-300 dark:hover:border-orange-500
          active:scale-95 transition-all duration-100 cursor-pointer select-none"
      >{sym.label}</button>
    {/each}
  </div>

  <!-- Text input -->
  <input
    bind:this={inputEl}
    bind:value
    onkeydown={handleKeydown}
    type="text"
    id="math-expression"
    name="math-expression"
    aria-label="Expresión matemática"
    autocomplete="off"
    spellcheck="false"
    placeholder="Ej: x**2 - 5*x + 6 = 0  |  d/dx(x**3)  |  lim x->0 sin(x)/x"
    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600
      bg-gray-50 dark:bg-slate-700 font-mono text-base
      focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400
      placeholder:text-gray-300 dark:placeholder:text-slate-500
      transition-[border-color,box-shadow] duration-150"
  />

  <!-- KaTeX live preview -->
  {#if value.trim()}
    <div
      class="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-dashed border-gray-200 dark:border-slate-600
        rounded-xl min-h-[3rem] flex items-center overflow-x-auto"
      aria-label="Vista previa de la expresión"
    >
      <MathRenderer latex={value} inline={false} />
    </div>
  {/if}
</div>
