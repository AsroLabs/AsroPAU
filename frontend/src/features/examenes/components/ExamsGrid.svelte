<script lang="ts">
  import ExamCard from './ExamCard.svelte'

  interface Exam {
    id: number
    region: string
    subject: string
    year: number
    session: string
    type: 'Ordinaria' | 'Extraordinaria'
  }

  interface Props {
    exams: Exam[]
    loading: boolean
    error: string | null
    viewMode: 'grid' | 'list'
  }

  let { exams = [], loading = false, error = null, viewMode = 'grid' }: Props =
    $props()
</script>

{#if error}
  <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center mb-8">
    <p class="text-red-600 font-medium">Error al cargar los exámenes: {error}</p>
  </div>
{/if}

{#if loading}
  <div
    class="grid gap-6 {viewMode === 'grid'
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1'}"
  >
    {#each { length: 6 } as _}
      <div class="group bg-white border border-slate-200 rounded-2xl overflow-hidden p-6 animate-pulse">
        <div class="flex justify-between items-start mb-5">
          <div class="flex flex-col gap-2 flex-1">
            <div class="h-3 bg-slate-200 rounded w-16"></div>
            <div class="h-5 bg-slate-200 rounded w-32"></div>
          </div>
          <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
        </div>
        <div class="flex flex-wrap gap-2 mb-8">
          <div class="h-6 bg-slate-200 rounded w-12"></div>
          <div class="h-6 bg-slate-200 rounded w-20"></div>
        </div>
        <div class="flex gap-2">
          <div class="flex-1 h-10 bg-slate-200 rounded-xl"></div>
          <div class="w-12 h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if exams.length === 0}
  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
    <p class="text-slate-600 font-medium">No se encontraron exámenes con estos filtros</p>
    <p class="text-slate-500 text-sm mt-2">Intenta cambiar los criterios de búsqueda</p>
  </div>
{:else}
  <div
    class="grid gap-6 {viewMode === 'grid'
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1'}"
  >
    {#each exams as exam (exam.id)}
      <ExamCard {exam} />
    {/each}
  </div>
{/if}
