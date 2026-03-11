<script lang="ts">
  import { Filter, LayoutGrid, List } from '@lucide/svelte'

  interface Props {
    selectedSubjects: string[]
    selectedRegion: string
    examsCount: number
    loading: boolean
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
    onClearFilters: () => void
  }

  let {
    selectedSubjects = [],
    selectedRegion = '',
    examsCount = 0,
    loading = false,
    viewMode = 'grid',
    onViewModeChange,
    onClearFilters,
  }: Props = $props()
</script>

<div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
  <div>
    <h2 class="font-display text-2xl font-bold text-slate-900">
      Exámenes Encontrados
    </h2>
    <p class="text-slate-500 text-sm mt-1">
      Mostrando <span class="text-orange-600 font-semibold">
        {loading ? '...' : examsCount}
      </span>
      resultados
      {#if selectedSubjects.length > 0}
        para <span class="text-orange-600 font-semibold">
          {selectedSubjects.join(', ')}
        </span>
      {/if}
      {#if selectedRegion}
        en <span class="text-orange-600 font-semibold">{selectedRegion}</span>
      {/if}
    </p>
  </div>
  <div class="flex items-center gap-3">
    <button
      onclick={onClearFilters}
      class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
    >
      <Filter size={16} />
      Limpiar Filtros
    </button>
    <div class="h-8 w-px bg-slate-200 mx-1"></div>
    <div class="flex bg-white border border-slate-200 rounded-xl p-1">
      <button
        onclick={() => onViewModeChange('grid')}
        class="p-1.5 rounded-lg transition-all {viewMode === 'grid'
          ? 'bg-orange-50 text-orange-600'
          : 'text-slate-400 hover:text-slate-600'}"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onclick={() => onViewModeChange('list')}
        class="p-1.5 rounded-lg transition-all {viewMode === 'list'
          ? 'bg-orange-50 text-orange-600'
          : 'text-slate-400 hover:text-slate-600'}"
      >
        <List size={18} />
      </button>
    </div>
  </div>
</div>
