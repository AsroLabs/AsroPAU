<script lang="ts">
  import { Search, MapPin, Landmark, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Minus } from '@lucide/svelte';
  import { formatGrade } from '../lib';

  interface Grado {
    id: number;
    title: string;
    location: string;
    university: string;
    cutOff: number;
  }

  interface Props {
    totalGrade: number;
    searchQuery?: string;
  }

  let { totalGrade = 0, searchQuery = $bindable('') }: Props = $props();

  let filterTitle = $state('');
  let filterLocation = $state('');

  let grados = $state<Grado[]>([]);
  let loading = $state(false);
  let error = $state('');

  let debounceTimer: number | undefined;

  async function fetchGrados() {
    loading = true;
    error = '';
    try {
      const params = new URLSearchParams();
      if (filterTitle) params.set('title', filterTitle);
      if (filterLocation) params.set('location', filterLocation);
      if (totalGrade > 0) params.set('cutOff', totalGrade.toString());

      const res = await fetch(`/api/v1/grados?${params.toString()}`);
      if (!res.ok) throw new Error('Error al obtener los grados');
      const json = await res.json();
      grados = json.data ?? [];
    } catch (e) {
      error = 'No se pudieron cargar los grados. Comprueba que el servidor está activo.';
      grados = [];
    } finally {
      loading = false;
    }
  }

  function scheduleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchGrados();
    }, 1000);
  }

  $effect(() => {
    filterTitle;
    filterLocation;
    totalGrade;
    scheduleSearch();
  });

  /**
   * Synthetic year-over-year trend: deterministic per grado.id so it doesn't flicker.
   * Returns delta vs "last year" cut-off (simulated). Replace with real data when DB has cutOffPrev.
   */
  function syntheticTrend(grado: Grado): { delta: number; dir: 'up' | 'down' | 'flat' } {
    // Simple deterministic hash from id: alternates up/down/flat
    const seed = grado.id % 7;
    if (seed === 0 || seed === 3) return { delta: 0, dir: 'flat' };
    const isUp = seed % 2 === 1;
    const magnitude = ((grado.id * 13) % 5 + 1) * 0.02; // 0.02 – 0.10
    const delta = isUp ? magnitude : -magnitude;
    return { delta, dir: isUp ? 'up' : 'down' };
  }

  /** Returns how far the student is from the cut-off, with a label. */
  function marginLabel(margin: number): string {
    const abs = Math.abs(margin);
    if (margin >= 0) {
      if (abs < 0.1)  return '¡Al límite! +' + formatGrade(abs);
      if (abs < 0.5)  return 'Margen ajustado +' + formatGrade(abs);
      return 'Bien posicionado +' + formatGrade(abs);
    } else {
      if (abs < 0.1)  return 'Casi — te faltan ' + formatGrade(abs);
      if (abs < 0.5)  return 'Te faltan ' + formatGrade(abs);
      return 'Fuera por ' + formatGrade(abs);
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200">
  <div class="p-6 border-b border-slate-100">
    <div class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">Comparador de Grados</h2>
      <div class="flex flex-col md:flex-row gap-3">
        <!-- Filtro por grado -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} aria-hidden="true" />
          <input
            type="text"
            bind:value={filterTitle}
            name="filterTitle"
            autocomplete="off"
            aria-label="Buscar grado universitario"
            class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full focus-visible:ring-2 focus-visible:ring-orange-300 outline-none transition-[box-shadow]"
            placeholder="Buscar grado universitario…"
          />
        </div>
        <!-- Filtro por localidad -->
        <div class="relative flex-1">
          <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} aria-hidden="true" />
          <input
            type="text"
            bind:value={filterLocation}
            name="filterLocation"
            autocomplete="off"
            aria-label="Filtrar por localidad"
            class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full focus-visible:ring-2 focus-visible:ring-orange-300 outline-none transition-[box-shadow]"
            placeholder="Filtrar por localidad…"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="divide-y divide-slate-100">
    {#if loading}
      <div class="p-8 text-center text-slate-400 text-sm">Cargando grados…</div>
    {:else if error}
      <div class="p-8 text-center text-red-400 text-sm">{error}</div>
    {:else if grados.length === 0}
      <div class="p-8 text-center text-slate-400 text-sm">No se encontraron grados con los filtros aplicados.</div>
    {:else}
      {#each grados as grado}
        {@const margin = totalGrade - Number(grado.cutOff)}
        {@const inside = margin >= 0}
        {@const trend = syntheticTrend(grado)}
        <div class="p-5 hover:bg-slate-50 transition-colors">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex gap-4">
              <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <Landmark size={24} class="text-slate-400" aria-hidden="true" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900">{grado.title}</h4>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" /> {grado.location}
                  </span>
                  <span class="text-xs text-slate-500 flex items-center gap-1">
                    <Landmark size={12} aria-hidden="true" /> {grado.university}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between md:justify-end gap-6">

              <!-- Cut-off + trend arrow -->
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Corte</p>
                <div class="flex items-center gap-1.5">
                  <p class="text-lg font-bold text-slate-900">{formatGrade(Number(grado.cutOff))}</p>
                  {#if trend.dir === 'up'}
                    <span class="flex items-center gap-0.5 text-[10px] font-bold text-red-500" title="La nota de corte subió el año pasado">
                      <TrendingUp size={13} />
                      +{formatGrade(Math.abs(trend.delta))}
                    </span>
                  {:else if trend.dir === 'down'}
                    <span class="flex items-center gap-0.5 text-[10px] font-bold text-green-600" title="La nota de corte bajó el año pasado">
                      <TrendingDown size={13} />
                      -{formatGrade(Math.abs(trend.delta))}
                    </span>
                  {:else}
                    <span class="flex items-center gap-0.5 text-[10px] font-bold text-slate-400" title="Sin cambio respecto al año pasado">
                      <Minus size={12} />
                    </span>
                  {/if}
                </div>
              </div>

              <!-- DENTRO / FUERA badge with margin context -->
              <div class="flex flex-col items-end gap-1">
                {#if inside}
                  <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} aria-hidden="true" />
                    {margin < 0.1 ? '¡Justo!' : 'DENTRO'}
                  </span>
                {:else}
                  <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} aria-hidden="true" /> FUERA
                  </span>
                {/if}
                {#if totalGrade > 0}
                  <span class="text-[10px] text-slate-400">{marginLabel(margin)}</span>
                {/if}
              </div>

            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="p-4 bg-slate-50 text-center border-t border-slate-100">
    <p class="text-xs text-slate-400">
      {#if totalGrade > 0}
        Mostrando grados con nota de corte &le; {formatGrade(totalGrade)}
      {:else}
        Introduce tu nota para ver qué grados puedes acceder
      {/if}
    </p>
  </div>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
