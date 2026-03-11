<script lang="ts">
  import { ChevronLeft, ChevronRight, Facebook, Globe } from '@lucide/svelte'
  import { createDebounceFetch } from "$lib/debounceFetch"
  
  import {
    ExamsFilter,
    ExamsGrid,
    ExamsHeader,
    ExamsPromo,
    type Exam,
  } from '$features/examenes'

  // State
  let selectedRegion = $state('')
  let selectedSubjects = $state<string[]>([])
  let selectedYear = $state<number | string>(2024)
  let selectedConvocatoria = $state('')
  let exams = $state<Exam[]>([])
  let loading = $state(false)
  let error = $state<string | null>(null)
  let viewMode = $state<'grid' | 'list'>('grid')
  let searchSubject = $state('')

  // Create debounced fetch
  const debouncedFetchExams = createDebounceFetch(
    async (
      region: string,
      subjects: string[],
      year: number | string,
      convocatoria: string,
    ) => {
      loading = true
      error = null

      try {
        const params = new URLSearchParams()

        if (region) params.append('localidad', region)
        if (subjects.length > 0) params.append('asignatura', subjects.join(','))
        params.append('anyo', String(year))
        if (convocatoria) params.append('convocatoria', convocatoria)

        const response = await fetch(
          `http://localhost:3000/exams?${params.toString()}`,
        )
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        exams = Array.isArray(data) ? data : data.data || []
      } catch (err) {
        error = err instanceof Error ? err.message : 'Error desconocido'
        exams = []
      } finally {
        loading = false
      }
    },
    500, // 500ms debounce
  )

  // Watch for filter changes and debounce
  $effect(() => {
    selectedRegion
    selectedSubjects
    selectedYear
    selectedConvocatoria

    debouncedFetchExams(
      selectedRegion,
      selectedSubjects,
      selectedYear,
      selectedConvocatoria,
    )
  })

  function handleClearFilters() {
    selectedRegion = ''
    selectedSubjects = []
    selectedYear = 2024
    selectedConvocatoria = ''
    searchSubject = ''
  }
</script>

<div class="min-h-screen flex flex-col">
  <main class="max-w-[1440px] mx-auto w-full flex gap-8 p-6 flex-1">
    <!-- Filter Sidebar -->
    <ExamsFilter
      {selectedRegion}
      {selectedSubjects}
      {selectedYear}
      {selectedConvocatoria}
      {searchSubject}
      onRegionChange={(value) => (selectedRegion = value)}
      onSubjectsChange={(subjects) => (selectedSubjects = subjects)}
      onYearChange={(year) => (selectedYear = year)}
      onConvocatoriaChange={(value) => (selectedConvocatoria = value)}
      onSearchChange={(value) => (searchSubject = value)}
    />

    <!-- Content -->
    <div class="flex-1">
      <!-- Header with title and controls -->
      <ExamsHeader
        {selectedSubjects}
        {selectedRegion}
        examsCount={exams.length}
        {loading}
        {viewMode}
        onViewModeChange={(mode) => (viewMode = mode)}
        onClearFilters={handleClearFilters}
      />

      <!-- Promo Banner -->
      <ExamsPromo />

      <!-- Exam Cards Grid -->
      <ExamsGrid {exams} {loading} {error} {viewMode} />

      <!-- Pagination -->
      <div class="mt-12 flex items-center justify-center gap-2">
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-md shadow-orange-300/40"
          style="border-bottom: 2px solid #9a3412;">1</button
        >
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
          >2</button
        >
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
          >3</button
        >
        <span class="px-2 text-slate-400 font-medium">...</span>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
          >8</button
        >
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-200 py-16 mt-12">
    <div class="max-w-[1440px] mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-9 h-9 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-300/50"
              style="border: 2px solid #f97316;"
            >
              <span
                class="font-display font-bold text-white text-sm leading-none"
                >A</span
              >
            </div>
            <h1
              class="font-display text-xl font-bold text-slate-800 tracking-tight"
            >
              AsroPAU
            </h1>
          </div>
          <p class="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
            La mayor base de datos abierta de exámenes EvAU y PAU de España.
            Ayudamos a miles de estudiantes a preparar su acceso a la
            universidad con recursos gratuitos y de calidad.
          </p>
          <div class="flex gap-4">
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 class="font-bold text-slate-900 mb-6">Enlaces rápidos</h4>
          <ul class="space-y-4 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Todos los Exámenes</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Notas de Corte 2026</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Calculadora de EvAU</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Blog de Orientación</a
              >
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-slate-900 mb-6">Soporte</h4>
          <ul class="space-y-4 text-sm text-slate-500">
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Contacto</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Preguntas Frecuentes</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Privacidad</a
              >
            </li>
            <li>
              <a href="#" class="hover:text-orange-600 transition-colors"
                >Cookies</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <p class="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} AsroPAU — Buscador de Exámenes Selectividad.
          Todos los derechos reservados.
        </p>
        <div
          class="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
        >
          <img
            src="https://picsum.photos/seed/edu1/100/40"
            alt="Ministerio"
            class="h-8"
            referrerPolicy="no-referrer"
          />
          <img
            src="https://picsum.photos/seed/univ1/100/40"
            alt="Universidad"
            class="h-8"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #fed7aa;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #fdba74;
  }
</style>
