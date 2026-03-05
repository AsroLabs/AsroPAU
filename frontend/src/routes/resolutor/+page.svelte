<script lang="ts">
  import { onMount } from 'svelte'
  import { History, Trash2, X, Sparkles, RotateCcw } from '@lucide/svelte'
  import LatexInput from '$lib/math-solver/LatexInput.svelte'
  import MathKeyboard from '$lib/math-solver/MathKeyboard.svelte'
  import StepsSolver from '$lib/math-solver/StepsSolver.svelte'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  let activeMode = $state<'text' | 'keyboard'>('text')
  let inputValue = $state('')
  let steps = $state<any[]>([])
  let result = $state<any>(null)
  let loading = $state(false)
  let error = $state<string | null>(null)

  // ── History ───────────────────────────────────────────────────────
  let history = $state<any[]>([])
  let showHistory = $state(false)
  const HISTORY_KEY = 'math-solver-history'
  const MAX_HISTORY = 20

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      history = raw ? JSON.parse(raw) : []
    } catch {
      history = []
    }
  }

  function saveToHistory(input: string, res: any) {
    const entry = {
      id: Date.now(),
      input,
      resultLatex: res?.latex || res?.result || '',
      type: res?.type || 'expression',
      ts: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    history = [entry, ...history.filter((h: any) => h.input !== input)].slice(0, MAX_HISTORY)
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch {}
  }

  function loadFromHistory(entry: any) {
    inputValue = entry.input
    activeMode = 'text'
    showHistory = false
  }

  function clearHistory() {
    history = []
    try { localStorage.removeItem(HISTORY_KEY) } catch {}
  }

  onMount(() => {
    loadHistory()
  })

  // ── Solver ────────────────────────────────────────────────────────
  function onKeyboardInput(e: CustomEvent) {
    inputValue = e.detail
  }

  async function solve() {
    if (!inputValue.trim()) return
    loading = true
    error = null
    steps = []
    result = null

    try {
      const res = await fetch(`${API_URL}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputValue, mode: 'text' })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Error desconocido')
      }

      const data = await res.json()
      steps = data.steps
      result = data.result
      saveToHistory(inputValue, data.result)
    } catch (e: any) {
      error = e.message
    } finally {
      loading = false
    }
  }

  function clear() {
    inputValue = ''
    steps = []
    result = null
    error = null
  }

  const examples = [
    { label: 'x² - 5x + 6 = 0',    val: 'x**2 - 5*x + 6 = 0' },
    { label: '2x² + 3x - 5 = 0',   val: '2*x**2 + 3*x - 5 = 0' },
    { label: '3x + 5 = 14',         val: '3*x + 5 = 14' },
    { label: "d/dx(x³ + 2x²)",      val: 'd/dx(x**3 + 2*x**2)' },
    { label: '∫(x² + 3x)dx',        val: 'x**2 + 3*x' },
    { label: 'lim x→0 sin(x)/x',    val: 'lim x->0 sin(x)/x' },
  ]
</script>

<div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 py-10 px-4">
  <div class="max-w-2xl mx-auto space-y-5">

    <!-- Page header -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-7 text-white shadow-xl shadow-orange-200">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px); background-size: 32px 32px;" aria-hidden="true"></div>
      <div class="relative z-10 flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-extrabold mb-1 tracking-tight">Resolutor de Matemáticas</h1>
          <p class="text-orange-200 text-sm">Introduce una ecuación o expresión y obtén la solución paso a paso.</p>
        </div>
        {#if history.length > 0}
          <button
            onclick={() => showHistory = !showHistory}
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-medium transition-all duration-150 cursor-pointer"
            aria-label="Ver historial"
          >
            <History size={15} />
            <span class="hidden sm:inline">Historial</span>
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">{history.length}</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- History panel -->
    {#if showHistory}
      <div class="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800 text-sm">Historial de ecuaciones</h3>
          <div class="flex items-center gap-3">
            {#if history.length > 0}
              <button
                onclick={clearHistory}
                class="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                Borrar todo
              </button>
            {/if}
            <button
              onclick={() => showHistory = false}
              class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Cerrar historial"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div class="p-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {#each history as entry (entry.id)}
            <button
              onclick={() => loadFromHistory(entry)}
              class="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-150 cursor-pointer group"
            >
              <div class="min-w-0">
                <p class="font-mono text-sm truncate text-slate-700 group-hover:text-orange-700">{entry.input}</p>
                {#if entry.resultLatex}
                  <p class="text-xs text-slate-400 truncate mt-0.5">{entry.resultLatex}</p>
                {/if}
              </div>
              <span class="shrink-0 text-xs text-slate-400 ml-3">{entry.ts}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Input Panel -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

      <!-- Mode tabs -->
      <div class="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onclick={() => activeMode = 'text'}
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
            {activeMode === 'text' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
        >Texto / LaTeX</button>
        <button
          onclick={() => activeMode = 'keyboard'}
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
            {activeMode === 'keyboard' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
        >Teclado</button>
      </div>

      <!-- Input area -->
      {#if activeMode === 'text'}
        <LatexInput bind:value={inputValue} on:submit={solve} />
      {:else}
        <MathKeyboard bind:value={inputValue} on:change={onKeyboardInput} />
      {/if}

      <!-- Quick examples -->
      <div class="mt-4">
        <p class="text-xs text-slate-400 mb-2 font-medium uppercase tracking-widest">Ejemplos</p>
        <div class="flex flex-wrap gap-1.5">
          {#each examples as ex}
            <button
              onclick={() => { inputValue = ex.val; activeMode = 'text' }}
              class="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-150 font-mono cursor-pointer"
            >{ex.label}</button>
          {/each}
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 mt-5">
        <button
          onclick={solve}
          disabled={loading || !inputValue.trim()}
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer shadow-md shadow-orange-200"
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Calculando...
          {:else}
            <Sparkles size={16} />
            Resolver
          {/if}
        </button>
        <button
          onclick={clear}
          class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-colors duration-150 cursor-pointer text-slate-600"
        >
          <RotateCcw size={15} />
          Limpiar
        </button>
      </div>
    </div>

    <!-- Error -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-2xl p-5">
        <p class="font-semibold text-red-700 mb-1">Error al resolver</p>
        <p class="text-sm text-red-600">{error}</p>
        <p class="text-xs text-red-400 mt-2">Revisa la sintaxis. Ejemplo: <code class="font-mono bg-red-100 px-1 rounded">x**2 + 2*x - 3 = 0</code></p>
      </div>
    {/if}

    <!-- Loading skeleton -->
    {#if loading}
      <div class="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center gap-3">
        <div class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-slate-500 text-sm">Calculando solución...</span>
      </div>
    {:else if steps.length > 0}
      <StepsSolver {steps} {result} />
    {/if}

  </div>
</div>
