<script lang="ts">
  import { Search, BookOpen, Calendar } from '@lucide/svelte'

  interface Props {
    selectedRegion: string
    selectedSubjects: string[]
    selectedYear: number | string
    selectedConvocatoria: string
    searchSubject: string
    onRegionChange: (value: string) => void
    onSubjectsChange: (subjects: string[]) => void
    onYearChange: (year: number | string) => void
    onConvocatoriaChange: (value: string) => void
    onSearchChange: (value: string) => void
  }

  let {
    selectedRegion = '',
    selectedSubjects = [],
    selectedYear = 2024,
    selectedConvocatoria = '',
    searchSubject = '',
    onRegionChange,
    onSubjectsChange,
    onYearChange,
    onConvocatoriaChange,
    onSearchChange,
  }: Props = $props()

  const regions = [
    'Andalucía',
    'Aragón',
    'Asturias',
    'C. Valenciana',
    'Canarias',
    'Castilla y León',
    'Castilla-La Mancha',
    'Cataluña',
    'Extremadura',
    'Galicia',
    'La Rioja',
    'Madrid',
    'Murcia',
    'Navarra',
    'País Vasco',
  ]

  const subjects = [
    'Matemáticas II',
    'Historia de España',
    'Lengua y Literatura',
    'Inglés',
    'Física',
    'Química',
    'Biología',
  ]

  const convocatorias = ['Ordinaria', 'Extraordinaria', 'Modelo']
  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]

  const filteredSubjects = $derived(
    searchSubject
      ? subjects.filter((s) =>
          s.toLowerCase().includes(searchSubject.toLowerCase()),
        )
      : subjects,
  )
</script>

<!-- Sidebar -->
<aside class="w-80 flex-shrink-0 hidden lg:block space-y-6">
  <!-- Community Filter -->
  <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
      Comunidad Autónoma
    </h3>
    <select
      value={selectedRegion}
      onchange={(e) => onRegionChange(e.currentTarget.value)}
      class="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm py-2.5 px-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all text-slate-700"
    >
      <option value="">Seleccionar región...</option>
      {#each regions as region}
        <option value={region}>{region}</option>
      {/each}
    </select>
  </section>

  <!-- Subject Filter -->
  <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
      <BookOpen size={18} class="text-orange-600" />
      Asignatura
    </h3>
    <div class="relative mb-4">
      <input
        type="text"
        value={searchSubject}
        onchange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="Buscar asignatura..."
        class="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm pl-10 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-slate-700 placeholder:text-slate-400"
      />
      <Search size={16} class="absolute left-3.5 top-3 text-slate-400" />
    </div>
    <div class="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
      {#each filteredSubjects as subject}
        <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer group transition-colors">
          <input
            type="checkbox"
            checked={selectedSubjects.includes(subject)}
            onchange={(e) => {
              if (e.currentTarget.checked) {
                onSubjectsChange([...selectedSubjects, subject])
              } else {
                onSubjectsChange(selectedSubjects.filter((s) => s !== subject))
              }
            }}
            class="w-4 h-4 rounded border-slate-300 accent-orange-600 focus:ring-orange-400"
          />
          <span
            class="text-sm {selectedSubjects.includes(subject)
              ? 'text-orange-600 font-semibold'
              : 'text-slate-600 group-hover:text-slate-900'}"
          >
            {subject}
          </span>
        </label>
      {/each}
    </div>
  </section>

  <!-- Year Filter -->
  <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
      <Calendar size={18} class="text-orange-600" />
      Año del Examen
    </h3>
    <div class="grid grid-cols-1 gap-2">
      <select
        value={selectedYear}
        onchange={(e) => onYearChange(Number(e.currentTarget.value) || e.currentTarget.value)}
        class="bg-slate-50 border-none rounded-lg text-sm text-slate-700 py-3 px-4 focus:ring-2 focus:ring-orange-500"
      >
        {#each years as year}
          <option value={year}>{year}</option>
        {/each}
      </select>
    </div>
  </section>

  <!-- Convocatoria Filter -->
  <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
      <Calendar size={18} class="text-orange-600" />
      Convocatoria
    </h3>
    <div class="space-y-2">
      {#each convocatorias as convocatoria}
        <button
          onclick={() =>
            onConvocatoriaChange(
              selectedConvocatoria === convocatoria ? '' : convocatoria,
            )}
          class="w-full text-left text-sm py-2.5 px-4 rounded-xl border font-medium transition-all {selectedConvocatoria ===
          convocatoria
            ? 'bg-orange-50 border-orange-400 text-orange-600'
            : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50'}"
        >
          {convocatoria}
        </button>
      {/each}
    </div>
  </section>

  <!-- Ad Banner -->
  <div class="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4">
      Patrocinado
    </span>
    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
      <div class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg
          class="text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-xs font-bold text-slate-800 mb-1">Cursos Intensivos 2026</p>
      <p class="text-[10px] text-slate-500 mb-4">Prepara tu acceso con los mejores</p>
      <button
        class="w-full py-2 bg-orange-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-orange-700 transition-colors shadow-sm shadow-orange-300/40"
        style="border-bottom: 2px solid #9a3412;"
      >
        Saber más
      </button>
    </div>
  </div>
</aside>

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
