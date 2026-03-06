<script lang="ts">
  import { onMount } from 'svelte'
  import { Search, Filter, BookOpen, Download, Star, Clock, ChevronRight, Flame, Trophy, GraduationCap, Calculator, Sparkles } from '@lucide/svelte'

  // ── Data ─────────────────────────────────────────────────────────
  const subjects = ['Todos', 'Matemáticas', 'Física', 'Química', 'Historia', 'Lengua', 'Inglés', 'Biología']
  const regions  = ['Todas', 'Madrid', 'Cataluña', 'Andalucía', 'C. Valenciana', 'País Vasco', 'Galicia', 'Aragón', 'Canarias']
  const years    = ['Todos', '2024', '2023', '2022', '2021', '2020', '2019']

  interface Exam {
    id: number
    title: string
    subject: string
    region: string
    year: number
    difficulty: 'Fácil' | 'Medio' | 'Difícil'
    pages: number
    downloads: number
    rating: number
    hot?: boolean
    isNew?: boolean
    /** Representative expression for the math solver (only math/science exams) */
    solverQuery?: string
  }

  const allExams: Exam[] = [
    { id:1,  title: 'Matemáticas CCSS — Fase General',    subject: 'Matemáticas', region: 'Madrid',       year: 2024, difficulty: 'Medio',  pages: 4, downloads: 1840, rating: 4.8, isNew: true, solverQuery: 'x**2 - 5*x + 6 = 0' },
    { id:2,  title: 'Matemáticas II — Opción A',           subject: 'Matemáticas', region: 'Cataluña',     year: 2024, difficulty: 'Difícil', pages: 6, downloads: 2210, rating: 4.9, hot: true,   solverQuery: 'd/dx(x**3 - 3*x**2 + 2*x)' },
    { id:3,  title: 'Física — Electricidad y Magnetismo',  subject: 'Física',      region: 'Andalucía',    year: 2024, difficulty: 'Difícil', pages: 5, downloads: 980,  rating: 4.6,              solverQuery: 'd/dx(x**2 + 4*x - 7)' },
    { id:4,  title: 'Química Orgánica — Reacciones',       subject: 'Química',     region: 'Madrid',       year: 2023, difficulty: 'Difícil', pages: 5, downloads: 1120, rating: 4.7, hot: true,   solverQuery: '2*x**2 + 3*x - 5 = 0' },
    { id:5,  title: 'Historia de España — Siglo XX',       subject: 'Historia',    region: 'C. Valenciana',year: 2024, difficulty: 'Medio',  pages: 4, downloads: 760,  rating: 4.5 },
    { id:6,  title: 'Lengua Castellana — Comentario',      subject: 'Lengua',      region: 'País Vasco',   year: 2023, difficulty: 'Fácil',  pages: 3, downloads: 430,  rating: 4.3 },
    { id:7,  title: 'Matemáticas CCSS — Fase Específica',  subject: 'Matemáticas', region: 'Galicia',      year: 2023, difficulty: 'Medio',  pages: 4, downloads: 620,  rating: 4.4,              solverQuery: 'integrate(x**2 + 3*x, x)' },
    { id:8,  title: 'Inglés — Reading & Writing',          subject: 'Inglés',      region: 'Aragón',       year: 2024, difficulty: 'Fácil',  pages: 4, downloads: 890,  rating: 4.6 },
    { id:9,  title: 'Biología Celular y Genética',         subject: 'Biología',    region: 'Canarias',     year: 2024, difficulty: 'Difícil', pages: 6, downloads: 1350, rating: 4.8, isNew: true },
    { id:10, title: 'Física — Ondas y Óptica',             subject: 'Física',      region: 'Madrid',       year: 2023, difficulty: 'Medio',  pages: 5, downloads: 740,  rating: 4.5,              solverQuery: 'lim x->0 sin(x)/x' },
    { id:11, title: 'Química — Equilibrio Químico',        subject: 'Química',     region: 'Cataluña',     year: 2023, difficulty: 'Medio',  pages: 4, downloads: 680,  rating: 4.4,              solverQuery: 'x**2 - 4 = 0' },
    { id:12, title: 'Historia del Arte — Contemporáneo',   subject: 'Historia',    region: 'Andalucía',    year: 2022, difficulty: 'Fácil',  pages: 3, downloads: 390,  rating: 4.2 },
    { id:13, title: 'Matemáticas II — Cálculo Integral',   subject: 'Matemáticas', region: 'Madrid',       year: 2022, difficulty: 'Difícil', pages: 5, downloads: 1560, rating: 4.7, hot: true,   solverQuery: 'integrate(sin(x)*x, x)' },
    { id:14, title: 'Biología — Ecología y Medio Ambiente',subject: 'Biología',    region: 'C. Valenciana',year: 2023, difficulty: 'Fácil',  pages: 4, downloads: 480,  rating: 4.3 },
    { id:15, title: 'Inglés — Use of English',             subject: 'Inglés',      region: 'País Vasco',   year: 2022, difficulty: 'Medio',  pages: 3, downloads: 560,  rating: 4.4 },
    { id:16, title: 'Física — Mecánica y Energía',         subject: 'Física',      region: 'Galicia',      year: 2022, difficulty: 'Medio',  pages: 5, downloads: 820,  rating: 4.6,              solverQuery: 'd/dx(sin(x)*x**2)' },
  ]

  // ── Filters ───────────────────────────────────────────────────────
  let searchQuery   = $state('')
  let activeSubject = $state('Todos')
  let activeRegion  = $state('Todas')
  let activeYear    = $state('Todos')
  let showFilters   = $state(false)

  let filtered = $derived(
    allExams.filter(e => {
      const q = searchQuery.toLowerCase()
      const matchSearch  = !q || e.title.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.region.toLowerCase().includes(q)
      const matchSubject = activeSubject === 'Todos'  || e.subject === activeSubject
      const matchRegion  = activeRegion  === 'Todas'  || e.region  === activeRegion
      const matchYear    = activeYear    === 'Todos'  || e.year    === Number(activeYear)
      return matchSearch && matchSubject && matchRegion && matchYear
    })
  )

  // ── Animations ───────────────────────────────────────────────────
  let sectionRef: HTMLElement
  let visible = $state(false)

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true },
      { threshold: 0.05 }
    )
    if (sectionRef) observer.observe(sectionRef)
    return () => observer.disconnect()
  })

  // ── Helpers ───────────────────────────────────────────────────────
  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    'Fácil':   { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    'Medio':   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    'Difícil': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  }

  function formatDownloads(n: number) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
  }

  const stats = [
    { value: '2.400+', label: 'Exámenes',   icon: BookOpen, color: '#EA580C' },
    { value: '17',     label: 'Comunidades',icon: GraduationCap, color: '#f97316' },
    { value: '12',     label: 'Asignaturas',icon: Calculator, color: '#0EA5E9' },
    { value: '50k+',   label: 'Descargas',  icon: Download, color: '#22C55E' },
  ]
</script>

<svelte:head>
  <title>Exámenes PAU – AsroPAU</title>
</svelte:head>

<div class="min-h-screen bg-[#FFF7ED]">

  <!-- ── Hero banner ──────────────────────────────────────────── -->
  <div class="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500 text-white">
    <!-- Dot grid decoration -->
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;"
      aria-hidden="true"
    ></div>
    <!-- Blurred orbs -->
    <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-400/30 blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-orange-300/20 blur-2xl pointer-events-none" aria-hidden="true"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-14 md:py-20">
      <div class="max-w-2xl">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
          <Trophy size={13} />
          Archivo oficial de selectividad
        </div>
        <h1 class="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Banco de Exámenes<br />de Selectividad
        </h1>
        <p class="text-orange-200 text-lg leading-relaxed mb-8 max-w-lg">
          Más de 2.400 exámenes oficiales de la EBAU/PAU ordenados por asignatura, comunidad y año. Descarga, practica y supera la prueba.
        </p>

        <!-- Stats pills row -->
        <div class="flex flex-wrap gap-3">
          {#each stats as s}
            {@const Icon = s.icon}
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <Icon size={14} class="opacity-80" />
              <span class="font-bold text-sm">{s.value}</span>
              <span class="text-orange-300 text-xs">{s.label}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- ── Search + Filter bar ──────────────────────────────────── -->
  <div class="sticky top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3">
      <!-- Search -->
      <div class="relative flex-1">
        <Search size={16} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          name="exam-search"
          autocomplete="off"
          bind:value={searchQuery}
          placeholder="Buscar por asignatura, región o título…"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
        />
      </div>
      <!-- Filter toggle -->
      <button
        onclick={() => showFilters = !showFilters}
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-150 cursor-pointer
          {showFilters ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-400 hover:text-orange-600'}"
      >
        <Filter size={15} />
        Filtros
        {#if activeSubject !== 'Todos' || activeRegion !== 'Todas' || activeYear !== 'Todos'}
          <span class="w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-bold flex items-center justify-center">
            {[activeSubject !== 'Todos', activeRegion !== 'Todas', activeYear !== 'Todos'].filter(Boolean).length}
          </span>
        {/if}
      </button>
    </div>

    <!-- Expandable filter panels -->
    {#if showFilters}
      <div class="max-w-6xl mx-auto px-6 pb-4 border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Subject filter -->
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Asignatura</p>
          <div class="flex flex-wrap gap-1.5">
            {#each subjects as subj}
              <button
                onclick={() => activeSubject = subj}
                class="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                  {activeSubject === subj ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600'}"
              >{subj}</button>
            {/each}
          </div>
        </div>
        <!-- Region filter -->
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comunidad</p>
          <div class="flex flex-wrap gap-1.5">
            {#each regions as reg}
              <button
                onclick={() => activeRegion = reg}
                class="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                  {activeRegion === reg ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600'}"
              >{reg}</button>
            {/each}
          </div>
        </div>
        <!-- Year filter -->
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Año</p>
          <div class="flex flex-wrap gap-1.5">
            {#each years as yr}
              <button
                onclick={() => activeYear = yr}
                class="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                  {activeYear === yr ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600'}"
              >{yr}</button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Subject quick-pills (horizontal scroll) ──────────────── -->
  <div class="max-w-6xl mx-auto px-6 pt-6 pb-2 overflow-x-auto">
    <div class="flex gap-2 w-max">
      {#each subjects as subj}
        <button
          onclick={() => activeSubject = subj}
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150 cursor-pointer
            {activeSubject === subj
              ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-200'
              : 'bg-white border-orange-100 text-slate-600 hover:border-orange-400 hover:text-orange-600'}"
        >{subj}</button>
      {/each}
    </div>
  </div>

  <!-- ── Results grid ─────────────────────────────────────────── -->
  <div bind:this={sectionRef} class="max-w-6xl mx-auto px-6 py-6">

    <!-- Results count -->
    <div class="flex items-center justify-between mb-5">
      <p class="text-sm text-slate-500">
        <span class="font-bold text-orange-700">{filtered.length}</span> exámenes encontrados
      </p>
      {#if activeSubject !== 'Todos' || activeRegion !== 'Todas' || activeYear !== 'Todos' || searchQuery}
        <button
          onclick={() => { activeSubject = 'Todos'; activeRegion = 'Todas'; activeYear = 'Todos'; searchQuery = '' }}
          class="text-xs text-orange-500 hover:text-orange-700 font-semibold transition-colors cursor-pointer"
        >
          Limpiar filtros
        </button>
      {/if}
    </div>

    {#if filtered.length === 0}
      <!-- Empty state -->
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
          <Search size={28} class="text-orange-400" />
        </div>
        <h3 class="font-bold text-slate-700 text-lg mb-2">Sin resultados</h3>
        <p class="text-slate-400 text-sm max-w-xs">Prueba a cambiar los filtros o el término de búsqueda.</p>
      </div>
    {:else}
      <!-- Card grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filtered as exam, i (exam.id)}
          {@const diff = difficultyColors[exam.difficulty]}
          <div
            class="group bg-white rounded-2xl border-2 border-orange-50 hover:border-orange-300 shadow-sm hover:shadow-lg hover:shadow-orange-100 transition-all duration-200 overflow-hidden section-reveal flex flex-col"
            style="border-bottom: 4px solid #FED7AA; animation-delay: {Math.min(i, 8) * 40}ms;"
            class:show={visible}
          >
            <!-- Card top color bar by subject -->
            <div class="h-1.5 w-full bg-gradient-to-r from-orange-500 to-orange-400" aria-hidden="true"></div>

            <div class="p-5 flex flex-col flex-1">
              <!-- Badges row -->
              <div class="flex items-center gap-2 mb-3 flex-wrap">
                <!-- Difficulty badge -->
                <span
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                  style="background-color:{diff.bg}; color:{diff.text}; border-color:{diff.border};"
                >{exam.difficulty}</span>

                {#if exam.hot}
                  <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                    <Flame size={10} />
                    Popular
                  </span>
                {/if}
                {#if exam.isNew}
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Nuevo</span>
                {/if}

                <span class="ml-auto text-xs font-bold text-slate-400">{exam.year}</span>
              </div>

              <!-- Title -->
              <h3 class="font-bold text-slate-800 text-sm leading-snug mb-1 group-hover:text-orange-700 transition-colors">{exam.title}</h3>
              <p class="text-xs text-slate-400 mb-4">{exam.region} · {exam.pages} páginas</p>

              <!-- Meta row -->
              <div class="flex items-center justify-between text-xs text-slate-400 mt-auto">
                <div class="flex items-center gap-3">
                  <!-- Star rating -->
                  <span class="flex items-center gap-1">
                    <Star size={11} class="text-amber-400 fill-amber-400" />
                    <span class="font-semibold text-slate-600">{exam.rating}</span>
                  </span>
                  <!-- Downloads -->
                  <span class="flex items-center gap-1">
                    <Download size={11} />
                    {formatDownloads(exam.downloads)}
                  </span>
                  <!-- Time estimate -->
                  <span class="flex items-center gap-1">
                    <Clock size={11} />
                    ~{exam.pages * 15}min
                  </span>
                </div>

                <!-- CTA arrow -->
                <div class="w-7 h-7 rounded-full bg-orange-50 group-hover:bg-orange-600 flex items-center justify-center transition-all duration-200">
                  <ChevronRight size={14} class="text-orange-400 group-hover:text-white transition-colors" />
                </div>
              </div>

              <!-- Resolver CTA — only for math/science exams -->
              {#if exam.solverQuery}
                <div class="mt-4 pt-4 border-t border-slate-100">
                  <a
                    href="/resolutor?q={encodeURIComponent(exam.solverQuery)}"
                    class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl
                      bg-orange-50 hover:bg-orange-600 border border-orange-200 hover:border-orange-600
                      text-orange-700 hover:text-white text-xs font-bold
                      transition-all duration-150"
                    title="Resolver una ecuación típica de este examen paso a paso"
                  >
                    <Sparkles size={13} />
                    Resolver paso a paso
                  </a>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- ── Bottom CTA ───────────────────────────────────────────── -->
  <div class="max-w-6xl mx-auto px-6 py-10">
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-orange-500 p-8 md:p-10 text-white text-center">
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"
        aria-hidden="true"
      ></div>
      <div class="relative z-10">
        <h2 class="font-display text-2xl md:text-3xl font-extrabold mb-3">¿Ya tienes el examen?</h2>
        <p class="text-orange-200 mb-6 max-w-md mx-auto">Usa nuestro resolutor paso a paso para comprobar tus resultados y entender cada operación.</p>
        <a
          href="/resolutor"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-lg shadow-orange-900/20"
          style="border-bottom: 3px solid #FDBA74;"
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
  .section-reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .section-reveal.show {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .section-reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
