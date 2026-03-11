<script lang="ts">
  import {
    Search,
    MapPin,
    Landmark,
    CheckCircle,
    AlertCircle,
  } from "@lucide/svelte";
  import { formatGrade } from "../lib";
  import { createDebounceFetch } from "$lib/debounceFetch";

  let LOGOS = $state<Record<string, string>>({});
  fetch("/logos/manifest.json")
    .then((r) => r.json())
    .then((data) => {
      LOGOS = data;
    })
    .catch(() => {
      /* logos remain empty — fallback to Landmark */
    });

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

  let { totalGrade = 0, searchQuery = $bindable("") }: Props = $props();

  let filterTitle = $state("");
  let filterLocation = $state("");

  let grados = $state<Grado[]>([]);
  let loading = $state(false);
  let error = $state("");

  async function fetchGrados() {
    loading = true;
    error = "";
    try {
      const params = new URLSearchParams();
      if (filterTitle) params.set("title", filterTitle);
      if (filterLocation) params.set("location", filterLocation);
      if (totalGrade > 0) params.set("cutOff", totalGrade.toString());

      const res = await fetch(
        `http://localhost:3000/grados?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Error al obtener los grados");
      const json = await res.json();
      grados = json.data ?? [];
    } catch (e) {
      error =
        "No se pudieron cargar los grados. Comprueba que el servidor está activo.";
      grados = [];
    } finally {
      loading = false;
    }
  }

  const debouncedFetch = createDebounceFetch(fetchGrados, 1000);

  $effect(() => {
    filterTitle;
    filterLocation;
    totalGrade;
    debouncedFetch();
  });
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200">
  <div class="p-6 border-b border-slate-100">
    <div class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">Comparador de Grados</h2>
      <div class="flex flex-col md:flex-row gap-3">
        <!-- Filtro por grado -->
        <div class="relative flex-1">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            bind:value={filterTitle}
            class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-[#2b6cee] outline-none transition-all"
            placeholder="Buscar grado universitario..."
          />
        </div>
        <!-- Filtro por localidad -->
        <div class="relative flex-1">
          <MapPin
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            bind:value={filterLocation}
            class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-[#2b6cee] outline-none transition-all"
            placeholder="Filtrar por localidad..."
          />
        </div>
      </div>
    </div>
  </div>

  <div class="divide-y divide-slate-100">
    {#if loading}
      <div class="p-8 text-center text-slate-400 text-sm">
        Cargando grados...
      </div>
    {:else if error}
      <div class="p-8 text-center text-red-400 text-sm">{error}</div>
    {:else if grados.length === 0}
      <div class="p-8 text-center text-slate-400 text-sm">
        No se encontraron grados con los filtros aplicados.
      </div>
    {:else}
      {#each grados as grado}
        <div class="p-6 hover:bg-slate-50 transition-colors">
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div class="flex gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0"
              >
                {#if LOGOS[grado.university]}
                  <img
                    src="/{LOGOS[grado.university]}"
                    alt={grado.university}
                    class="w-full h-full object-contain p-1"
                    loading="lazy"
                    onerror={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                {:else}
                  <Landmark
                    size={24}
                    class="text-slate-400"
                    aria-hidden="true"
                  />
                {/if}
              </div>
              <div>
                <h4 class="font-bold text-slate-900">{grado.title}</h4>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" />
                    {grado.location}
                  </span>
                  <span class="text-xs text-slate-500 flex items-center gap-1">
                    <Landmark size={12} aria-hidden="true" />
                    {grado.university}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between md:justify-end gap-8">
              <div class="text-right">
                <p class="text-[10px] font-bold text-slate-400 uppercase">
                  Corte
                </p>
                <p class="text-lg font-bold text-slate-900">
                  {formatGrade(Number(grado.cutOff))}
                </p>
              </div>
              <div class="flex flex-col items-end">
                {#if totalGrade >= Number(grado.cutOff)}
                  <span
                    class="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-600 flex items-center gap-1"
                  >
                    <CheckCircle size={12} aria-hidden="true" /> DENTRO (+{formatGrade(
                      totalGrade - Number(grado.cutOff),
                    )})
                  </span>
                {:else}
                  <span
                    class="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle size={12} aria-hidden="true" /> FUERA ({formatGrade(
                      totalGrade - Number(grado.cutOff),
                    )})
                  </span>
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
