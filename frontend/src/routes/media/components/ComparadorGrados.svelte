<script lang="ts">
  import { Search, MapPin, Landmark, CheckCircle, AlertCircle } from '@lucide/svelte';
  import { formatGrade, UNIVERSITIES } from '../lib';

  interface Props {
    totalGrade: number;
    searchQuery?: string;
  }

  let { totalGrade = 0, searchQuery = $bindable('') }: Props = $props();

  let filteredUniversities = $derived(
    UNIVERSITIES.filter(u => 
      u.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200">
  <div class="p-6 border-b border-slate-100">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 class="text-lg font-semibold">Comparador de Grados</h2>
      <div class="relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          bind:value={searchQuery}
          class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full md:w-64 focus:ring-2 focus:ring-[#2b6cee] outline-none transition-all"
          placeholder="Buscar grado o ciudad..."
        />
      </div>
    </div>
  </div>
  <div class="divide-y divide-slate-100">
    {#each filteredUniversities as uni}
      <div class="p-6 hover:bg-slate-50 transition-colors">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex gap-4">
            <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
              <img src={uni.logo} alt={uni.university} class="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900">{uni.degree}</h4>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={12} /> {uni.city}
                </span>
                <span class="text-xs text-slate-500 flex items-center gap-1">
                  <Landmark size={12} /> {uni.university}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between md:justify-end gap-8">
            <div class="text-right">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Corte 2023</p>
              <p class="text-lg font-bold text-slate-900">{formatGrade(uni.cutOff)}</p>
            </div>
            <div class="flex flex-col items-end">
              {#if totalGrade >= uni.cutOff}
                <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-600 flex items-center gap-1">
                  <CheckCircle size={12} /> DENTRO (+{formatGrade(totalGrade - uni.cutOff)})
                </span>
              {:else}
                <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> FUERA ({formatGrade(totalGrade - uni.cutOff)})
                </span>
              {/if}
              <p class="text-[10px] text-slate-400 mt-1">{uni.note}</p>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="p-4 bg-slate-50 text-center border-t border-slate-100">
    <button class="text-[#2b6cee] text-sm font-semibold hover:underline">Ver más universidades</button>
  </div>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
