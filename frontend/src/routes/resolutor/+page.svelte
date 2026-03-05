<script lang="ts">
  import { onMount } from 'svelte'
  import { History, Trash2, X, Sparkles, RotateCcw, AlertCircle } from '@lucide/svelte'
  import LatexInput from '$lib/math-solver/LatexInput.svelte'
  import MathKeyboard from '$lib/math-solver/MathKeyboard.svelte'
  import MorphSolver from '$lib/math-solver/MorphSolver.svelte'

  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  type Mode = 'text' | 'keyboard'

  interface HistoryEntry {
    id: number
    input: string
    resultLatex: string
    type: string
    ts: string
  }

  interface SolveResult {
    type: string
    latex?: string
    result?: string
    solutions?: string[]
    message?: string
  }

  interface SolveStep {
    step_number:       number
    description:       string
    expr_latex:        string
    highlighted_latex?: string
    explanation?:      string
    rule_name?:        string
    highlight_color?:  string
  }

  let activeMode = $state<Mode>('text')
  let inputValue  = $state('')
  let steps       = $state<SolveStep[]>([])
  let result      = $state<SolveResult | null>(null)
  let loading     = $state(false)
  let error       = $state<string | null>(null)

  // ── History ────────────────────────────────────────────────────────
  let history     = $state<HistoryEntry[]>([])
  let showHistory = $state(false)
  const HISTORY_KEY = 'math-solver-history'
  const MAX_HISTORY = 20

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      history = raw ? (JSON.parse(raw) as HistoryEntry[]) : []
    } catch {
      history = []
    }
  }

  function saveToHistory(input: string, res: SolveResult) {
    const entry: HistoryEntry = {
      id: Date.now(),
      input,
      resultLatex: res?.latex ?? res?.result ?? '',
      type: res?.type ?? 'expression',
      ts: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    history = [entry, ...history.filter(h => h.input !== input)].slice(0, MAX_HISTORY)
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch { /* quota exceeded */ }
  }

  function loadFromHistory(entry: HistoryEntry) {
    inputValue  = entry.input
    activeMode  = 'text'
    showHistory = false
  }

  function clearHistory() {
    history = []
    try { localStorage.removeItem(HISTORY_KEY) } catch {}
  }

  onMount(() => {
    loadHistory()
  })

  // ── Solver ─────────────────────────────────────────────────────────
  function onKeyboardInput(e: CustomEvent<string>) {
    inputValue = e.detail
  }

  // Friendly error messages for common backend errors
  function humanizeError(raw: string): string {
    if (raw.includes('SyntaxError') || raw.includes('parse_expr'))
      return 'No se pudo analizar la expresión. Revisa la sintaxis (usa ** para potencias, * para multiplicar).'
    if (raw.includes('antiderivada en forma cerrada'))
      return raw // Already friendly
    if (raw.includes('vacía'))
      return 'Escribe una expresión antes de resolver.'
    if (raw.includes('demasiado larga'))
      return 'La expresión es demasiado larga.'
    return raw
  }

  async function solve() {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    loading = true
    error   = null
    steps   = []
    result  = null

    try {
      const res = await fetch(`${API_URL}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed, mode: 'text' })
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        throw new Error(errBody.detail ?? 'Error desconocido del servidor')
      }

      const data = await res.json()
      steps  = data.steps  ?? []
      result = data.result ?? null
      if (result) saveToHistory(trimmed, result)
    } catch (e: unknown) {
      error = humanizeError((e as Error).message)
    } finally {
      loading = false
    }
  }

  function clear() {
    inputValue = ''
    steps      = []
    result     = null
    error      = null
  }

  // ── Example presets ────────────────────────────────────────────────
  const examples: { label: string; val: string; category: string }[] = [
    { label: 'x² − 5x + 6 = 0',    val: 'x**2 - 5*x + 6 = 0',    category: 'Álgebra' },
    { label: '2x² + 3x − 5 = 0',   val: '2*x**2 + 3*x - 5 = 0',  category: 'Álgebra' },
    { label: '3x + 5 = 14',         val: '3*x + 5 = 14',           category: 'Álgebra' },
    { label: "d/dx(x³ + 2x²)",      val: 'd/dx(x**3 + 2*x**2)',    category: 'Derivadas' },
    { label: 'd/dx(sin(x)·x²)',     val: 'd/dx(sin(x)*x**2)',      category: 'Derivadas' },
    { label: '∫(x² + 3x)dx',        val: 'x**2 + 3*x',             category: 'Integrales' },
    { label: '∫sin(x)dx',           val: 'integrate(sin(x), x)',   category: 'Integrales' },
    { label: 'lim x→0 sin(x)/x',    val: 'lim x->0 sin(x)/x',     category: 'Límites' },
    { label: 'lim x→∞ 1/x',         val: 'lim x->oo 1/x',         category: 'Límites' },
  ]

  // Group examples by category for display
  const exampleGroups = [...new Set(examples.map(e => e.category))].map(cat => ({
    cat,
    items: examples.filter(e => e.category === cat)
  }))
</script>

<div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 py-10 px-4">
  <div class="max-w-2xl mx-auto space-y-5">

    <!-- ── Page header ──────────────────────────────────────────────── -->
    <header
      class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 p-7 text-white shadow-xl shadow-orange-200"
      aria-label="Resolutor de Matemáticas"
    >
      <!-- Decorative dot grid -->
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
               radial-gradient(circle at 80% 50%, white 1px, transparent 1px);
               background-size: 32px 32px;"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold mb-1 tracking-tight">Resolutor de Matemáticas</h1>
          <p class="text-orange-200 text-sm leading-relaxed">
            Ecuaciones, derivadas, integrales y límites — con solución paso a paso animada.
          </p>
        </div>

        {#if history.length > 0}
          <button
            onclick={() => (showHistory = !showHistory)}
            class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25
              border border-white/20 text-sm font-medium transition-all duration-150 cursor-pointer"
            aria-label="Ver historial de ecuaciones"
            aria-expanded={showHistory}
          >
            <History size={15} />
            <span class="hidden sm:inline">Historial</span>
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold"
              >{history.length}</span>
          </button>
        {/if}
      </div>
    </header>

    <!-- ── History panel ─────────────────────────────────────────────── -->
    {#if showHistory}
      <div class="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800 text-sm">Historial reciente</h2>
          <div class="flex items-center gap-3">
            {#if history.length > 0}
              <button
                onclick={clearHistory}
                class="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                aria-label="Borrar todo el historial"
              >
                <Trash2 size={12} />
                Borrar todo
              </button>
            {/if}
            <button
              onclick={() => (showHistory = false)}
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
              class="w-full text-left flex items-center justify-between px-4 py-3 rounded-xl
                border border-slate-100 hover:border-orange-200 hover:bg-orange-50
                transition-all duration-150 cursor-pointer group"
            >
              <div class="min-w-0">
                <p class="font-mono text-sm truncate text-slate-700 group-hover:text-orange-700">
                  {entry.input}
                </p>
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

    <!-- ── Input Panel ───────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

      <!-- Mode tabs -->
      <div
        class="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit"
        role="tablist"
        aria-label="Modo de entrada"
      >
        <button
          role="tab"
          aria-selected={activeMode === 'text'}
          onclick={() => (activeMode = 'text')}
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer
            {activeMode === 'text' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
        >Texto / LaTeX</button>
        <button
          role="tab"
          aria-selected={activeMode === 'keyboard'}
          onclick={() => (activeMode = 'keyboard')}
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

      <!-- Quick examples grouped by category -->
      <div class="mt-5 space-y-2.5">
        {#each exampleGroups as group}
          <div>
            <p class="text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">
              {group.cat}
            </p>
            <div class="flex flex-wrap gap-1.5">
              {#each group.items as ex}
                <button
                  onclick={() => { inputValue = ex.val; activeMode = 'text' }}
                  class="text-xs px-3 py-1.5 rounded-full border border-slate-200 font-mono
                    hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50
                    transition-all duration-150 cursor-pointer"
                  title="Cargar: {ex.val}"
                >{ex.label}</button>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 mt-5">
        <button
          onclick={solve}
          disabled={loading || !inputValue.trim()}
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white
            bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150 cursor-pointer shadow-md shadow-orange-200"
          aria-busy={loading}
        >
          {#if loading}
            <div
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></div>
            Calculando…
          {:else}
            <Sparkles size={16} />
            Resolver
          {/if}
        </button>
        <button
          onclick={clear}
          class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-slate-200
            hover:bg-slate-50 transition-colors duration-150 cursor-pointer text-slate-600"
          aria-label="Limpiar entrada y resultado"
        >
          <RotateCcw size={15} />
          Limpiar
        </button>
      </div>
    </div>

    <!-- ── Error banner ──────────────────────────────────────────────── -->
    {#if error}
      <div
        role="alert"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3"
      >
        <AlertCircle size={18} class="shrink-0 mt-0.5 text-red-500" />
        <div>
          <p class="font-semibold text-red-700 mb-1 text-sm">Error al resolver</p>
          <p class="text-sm text-red-600">{error}</p>
          <p class="text-xs text-red-400 mt-2">
            Sintaxis: usa <code class="font-mono bg-red-100 px-1 rounded">**</code> para potencias,
            <code class="font-mono bg-red-100 px-1 rounded">*</code> para multiplicar.
            Ej: <code class="font-mono bg-red-100 px-1 rounded">x**2 + 2*x - 3 = 0</code>
          </p>
        </div>
      </div>
    {/if}

    <!-- ── Loading skeleton ──────────────────────────────────────────── -->
    {#if loading}
      <div
        role="status"
        aria-label="Calculando solución"
        class="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center gap-3"
      >
        <div
          class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        ></div>
        <span class="text-slate-500 text-sm">Calculando solución…</span>
      </div>
    {:else if steps.length > 0}
      <MorphSolver {steps} {result} />
    {/if}

  </div>
</div>
