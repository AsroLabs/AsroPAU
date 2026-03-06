<script lang="ts">
  import { Sparkles, ChevronRight, RotateCcw, BookOpen, Calculator, FlaskConical, Atom, Sigma } from '@lucide/svelte'

  // ── PAU-style practice problems per subject ─────────────────────
  interface Problem {
    id: number
    subject: string
    topic: string
    statement: string
    solverQuery: string
    difficulty: 'Fácil' | 'Medio' | 'Difícil'
    hint: string
    subjectColor: string
    subjectBg: string
  }

  const allProblems: Problem[] = [
    // Matemáticas II
    {
      id: 1,
      subject: 'Matemáticas II',
      topic: 'Cálculo Diferencial',
      statement: 'Calcula la derivada de f(x) = x³ − 3x² + 2x y determina sus puntos críticos.',
      solverQuery: 'd/dx(x**3 - 3*x**2 + 2*x)',
      difficulty: 'Medio',
      hint: 'Aplica la regla de la potencia término a término.',
      subjectColor: '#EA580C',
      subjectBg: '#FFF7ED',
    },
    {
      id: 2,
      subject: 'Matemáticas II',
      topic: 'Cálculo Integral',
      statement: 'Calcula la integral indefinida ∫(2x² − 4x + 1) dx.',
      solverQuery: 'integrate(2*x**2 - 4*x + 1, x)',
      difficulty: 'Fácil',
      hint: 'Usa la regla de la potencia: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C.',
      subjectColor: '#EA580C',
      subjectBg: '#FFF7ED',
    },
    {
      id: 3,
      subject: 'Matemáticas II',
      topic: 'Álgebra',
      statement: 'Resuelve la ecuación de segundo grado: 2x² − 7x + 3 = 0.',
      solverQuery: '2*x**2 - 7*x + 3 = 0',
      difficulty: 'Fácil',
      hint: 'Usa la fórmula cuadrática: x = (−b ± √(b²−4ac)) / 2a.',
      subjectColor: '#EA580C',
      subjectBg: '#FFF7ED',
    },
    {
      id: 4,
      subject: 'Matemáticas II',
      topic: 'Límites',
      statement: 'Calcula el límite: lim(x→0) sin(x) / x.',
      solverQuery: 'lim x->0 sin(x)/x',
      difficulty: 'Medio',
      hint: 'Límite notable. Si no es directo, prueba la regla de L\'Hôpital.',
      subjectColor: '#EA580C',
      subjectBg: '#FFF7ED',
    },
    // Matemáticas CCSS
    {
      id: 5,
      subject: 'Matemáticas CCSS',
      topic: 'Álgebra',
      statement: 'Resuelve el sistema de ecuaciones: 3x + 2y = 12, x − y = 1.',
      solverQuery: '3*x + 2*y = 12',
      difficulty: 'Fácil',
      hint: 'Usa sustitución: despeja x de la segunda ecuación y sustituye.',
      subjectColor: '#0EA5E9',
      subjectBg: '#F0F9FF',
    },
    {
      id: 6,
      subject: 'Matemáticas CCSS',
      topic: 'Cálculo',
      statement: 'Calcula la derivada de f(x) = x² · sin(x) usando la regla del producto.',
      solverQuery: 'd/dx(x**2 * sin(x))',
      difficulty: 'Medio',
      hint: 'Regla del producto: (u·v)\' = u\'·v + u·v\'.',
      subjectColor: '#0EA5E9',
      subjectBg: '#F0F9FF',
    },
    // Física
    {
      id: 7,
      subject: 'Física',
      topic: 'Cinemática',
      statement: 'La posición de un cuerpo viene dada por x(t) = t³ − 6t² + 9t. Halla la velocidad y la aceleración en t = 2 s.',
      solverQuery: 'd/dx(x**3 - 6*x**2 + 9*x)',
      difficulty: 'Medio',
      hint: 'v(t) = x\'(t), a(t) = x\'\'(t). Deriva dos veces.',
      subjectColor: '#7C3AED',
      subjectBg: '#F5F3FF',
    },
    {
      id: 8,
      subject: 'Física',
      topic: 'Oscilaciones',
      statement: 'Calcula el límite lim(x→∞) e^x / x² para analizar el crecimiento exponencial frente al polinomial.',
      solverQuery: 'lim x->oo exp(x)/x**2',
      difficulty: 'Difícil',
      hint: 'Aplica la regla de L\'Hôpital dos veces.',
      subjectColor: '#7C3AED',
      subjectBg: '#F5F3FF',
    },
    // Química
    {
      id: 9,
      subject: 'Química',
      topic: 'Estequiometría',
      statement: 'Resuelve: x² − 6x + 8 = 0 (modelo de equilibrio químico simplificado).',
      solverQuery: 'x**2 - 6*x + 8 = 0',
      difficulty: 'Fácil',
      hint: 'Factoriza o usa la fórmula cuadrática.',
      subjectColor: '#059669',
      subjectBg: '#F0FDF4',
    },
    {
      id: 10,
      subject: 'Química',
      topic: 'Cinética Química',
      statement: 'Calcula la integral ∫e^(−kt) dt que aparece en la ley de velocidad de primer orden.',
      solverQuery: 'integrate(exp(-x), x)',
      difficulty: 'Medio',
      hint: 'La integral de e^(ax) es (1/a)·e^(ax) + C.',
      subjectColor: '#059669',
      subjectBg: '#F0FDF4',
    },
  ]

  // ── State ────────────────────────────────────────────────────────
  const subjects = ['Todos', 'Matemáticas II', 'Matemáticas CCSS', 'Física', 'Química']
  const difficulties = ['Todos', 'Fácil', 'Medio', 'Difícil']

  let activeSubject    = $state('Todos')
  let activeDifficulty = $state('Todos')
  let shownHints       = $state<Set<number>>(new Set())

  let filtered = $derived(
    allProblems.filter(p => {
      const matchSubj = activeSubject    === 'Todos' || p.subject    === activeSubject
      const matchDiff = activeDifficulty === 'Todos' || p.difficulty === activeDifficulty
      return matchSubj && matchDiff
    })
  )

  function toggleHint(id: number) {
    const next = new Set(shownHints)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    shownHints = next
  }

  const subjectIcons: Record<string, typeof BookOpen> = {
    'Matemáticas II': Sigma,
    'Matemáticas CCSS': Calculator,
    'Física': Atom,
    'Química': FlaskConical,
  }

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    'Fácil':   { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    'Medio':   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    'Difícil': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  }
</script>

<svelte:head>
  <title>Exámenes IA – AsroPAU</title>
</svelte:head>

<div class="min-h-screen bg-[#FFF7ED]">

  <!-- ── Hero ──────────────────────────────────────────────────── -->
  <div class="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white">
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;"
      aria-hidden="true"
    ></div>
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-violet-400/30 blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-300/20 blur-2xl pointer-events-none" aria-hidden="true"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 py-14 md:py-20">
      <div class="max-w-2xl">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles size={13} />
          Nuevo · Práctica inteligente
        </div>
        <h1 class="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Practica con<br />Problemas PAU
        </h1>
        <p class="text-violet-200 text-lg leading-relaxed mb-8 max-w-lg">
          Problemas estilo Selectividad con solución paso a paso animada. Elige asignatura, intenta resolverlo y comprueba cada paso del proceso.
        </p>

        <!-- Stats row -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
            <BookOpen size={14} class="opacity-80" />
            <span class="font-bold text-sm">{allProblems.length}</span>
            <span class="text-violet-300 text-xs">Problemas</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
            <Sigma size={14} class="opacity-80" />
            <span class="font-bold text-sm">4</span>
            <span class="text-violet-300 text-xs">Asignaturas</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15">
            <Sparkles size={14} class="opacity-80" />
            <span class="font-bold text-sm">Paso a paso</span>
            <span class="text-violet-300 text-xs">Animado</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Filters ───────────────────────────────────────────────── -->
  <div class="sticky top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
    <div class="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-4">
      <!-- Subject filters -->
      <div class="flex flex-wrap gap-1.5 items-center">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Asignatura:</span>
        {#each subjects as subj}
          <button
            onclick={() => activeSubject = subj}
            class="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150 cursor-pointer
              {activeSubject === subj
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-slate-200 text-slate-500 hover:border-violet-400 hover:text-violet-600 bg-white'}"
          >{subj}</button>
        {/each}
      </div>
      <!-- Difficulty filters -->
      <div class="flex flex-wrap gap-1.5 items-center sm:ml-auto">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Nivel:</span>
        {#each difficulties as diff}
          <button
            onclick={() => activeDifficulty = diff}
            class="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150 cursor-pointer
              {activeDifficulty === diff
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-slate-200 text-slate-500 hover:border-violet-400 hover:text-violet-600 bg-white'}"
          >{diff}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- ── Problem list ──────────────────────────────────────────── -->
  <div class="max-w-5xl mx-auto px-6 py-8">
    {#if filtered.length === 0}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
          <RotateCcw size={28} class="text-violet-400" />
        </div>
        <h3 class="font-bold text-slate-700 text-lg mb-2">Sin problemas para estos filtros</h3>
        <p class="text-slate-400 text-sm max-w-xs">Prueba a cambiar la asignatura o el nivel de dificultad.</p>
      </div>
    {:else}
      <p class="text-sm text-slate-500 mb-6">
        <span class="font-bold text-violet-700">{filtered.length}</span> problemas disponibles
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {#each filtered as problem (problem.id)}
          {@const diff = difficultyColors[problem.difficulty]}
          {@const SubjectIcon = subjectIcons[problem.subject] ?? BookOpen}
          <div
            class="bg-white rounded-2xl border-2 border-slate-100 hover:border-violet-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            style="border-bottom: 4px solid {problem.subjectColor}22;"
          >
            <!-- Top stripe -->
            <div class="h-1 w-full" style="background: linear-gradient(to right, {problem.subjectColor}, {problem.subjectColor}99);" aria-hidden="true"></div>

            <div class="p-5 flex flex-col flex-1">
              <!-- Header row -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:{problem.subjectBg};">
                    <SubjectIcon size={18} style="color:{problem.subjectColor};" />
                  </div>
                  <div>
                    <p class="text-xs font-bold" style="color:{problem.subjectColor};">{problem.subject}</p>
                    <p class="text-xs text-slate-400">{problem.topic}</p>
                  </div>
                </div>
                <span
                  class="shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full border"
                  style="background-color:{diff.bg}; color:{diff.text}; border-color:{diff.border};"
                >{problem.difficulty}</span>
              </div>

              <!-- Problem statement -->
              <p class="text-sm text-slate-700 leading-relaxed mb-4 flex-1">{problem.statement}</p>

              <!-- Hint (toggle) -->
              <div class="mb-4">
                <button
                  onclick={() => toggleHint(problem.id)}
                  class="text-xs text-slate-400 hover:text-violet-600 font-semibold transition-colors cursor-pointer"
                >
                  {shownHints.has(problem.id) ? '▲ Ocultar pista' : '▼ Ver pista'}
                </button>
                {#if shownHints.has(problem.id)}
                  <div class="mt-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-100 text-xs text-violet-700">
                    {problem.hint}
                  </div>
                {/if}
              </div>

              <!-- Resolver CTA -->
              <a
                href="/resolutor?q={encodeURIComponent(problem.solverQuery)}"
                class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl
                  font-bold text-sm transition-all duration-150
                  text-white"
                style="background:{problem.subjectColor};"
                onmouseenter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onmouseleave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                <Sparkles size={15} />
                Resolver paso a paso
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- ── Bottom CTA ───────────────────────────────────────────── -->
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white text-center"
      style="background: linear-gradient(135deg, #7C3AED, #4F46E5);">
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"
        aria-hidden="true"
      ></div>
      <div class="relative z-10">
        <h2 class="font-display text-2xl md:text-3xl font-extrabold mb-3">¿Tienes un problema específico?</h2>
        <p class="text-violet-200 mb-6 max-w-md mx-auto">Escribe cualquier ecuación, derivada, integral o límite directamente en el resolutor.</p>
        <a
          href="/resolutor"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white font-bold text-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-lg"
          style="color: #7C3AED; border-bottom: 3px solid #DDD6FE;"
        >
          <Calculator size={16} />
          Ir al Resolutor
          <ChevronRight size={15} />
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; }
  }
</style>
