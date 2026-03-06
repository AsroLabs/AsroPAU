<script lang="ts">
  import { Info } from '@lucide/svelte';
  import { TRONCALES_OPTIONS, ADMISION_OPTIONS } from '../lib';

  interface Props {
    notaBachiller: number;
    accesoLengua: number;
    accesoHistoriaFilosofia: number;
    accesoIngles: number;
    accesoTroncal: string;
    accesoTroncalGrade: number;
    admisionAsignaturas: Array<{ name: string; grade: number; weight: number }>;
  }

  let {
    notaBachiller: bachGrade = $bindable(),
    accesoLengua = $bindable(),
    accesoHistoriaFilosofia = $bindable(),
    accesoIngles = $bindable(),
    accesoTroncal = $bindable(),
    accesoTroncalGrade = $bindable(),
    admisionAsignaturas = $bindable()
  }: Props = $props();
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-5 h-5 bg-[#2b6cee] rounded-lg flex items-center justify-center text-white">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
        <path d="M7 10l3 3 6-6" stroke="white" stroke-width="1.5" fill="none" />
      </svg>
    </div>
    <h2 class="text-lg font-semibold">Datos Académicos</h2>
  </div>

  <!-- Bachillerato -->
  <div class="mb-8">
    <div class="flex justify-between items-center mb-3">
      <label for="bachGrade" class="text-sm font-medium text-slate-600">Media de Bachillerato (60%)</label>
      <span class="text-xs font-bold text-[#2b6cee] bg-[#2b6cee]/10 px-2 py-0.5 rounded">Requerido</span>
    </div>
    <input 
      id="bachGrade"
      type="number" 
      bind:value={bachGrade}
      step="0.01" min="0" max="10"
      class="w-full bg-slate-50 border-slate-200 rounded-lg py-3 px-4 text-lg focus:ring-2 focus:ring-[#2b6cee] focus:border-transparent outline-none transition-all"
      placeholder="Ej: 8.75"
    />
  </div>

  <!-- Fase de Acceso -->
  <div class="mb-8">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold">Fase de Acceso (40%)</h3>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label for="accesoLengua" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Lengua Española y Literatura II</label>
        <input 
          id="accesoLengua"
          type="number" 
          bind:value={accesoLengua}
          step="0.01" min="0" max="10"
          class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="accesoHistoria" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Historia de España / Filosofía</label>
        <input 
          id="accesoHistoria"
          type="number" 
          bind:value={accesoHistoriaFilosofia}
          step="0.01" min="0" max="10"
          class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="accesoIngles" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Inglés</label>
        <input 
          id="accesoIngles"
          type="number" 
          bind:value={accesoIngles}
          step="0.01" min="0" max="10"
          class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
          placeholder="0.00"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="accesoTroncal" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Troncal de Modalidad</label>
          <select 
            id="accesoTroncal"
            bind:value={accesoTroncal}
            class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
          >
            <option value="">Selecciona asignatura...</option>
            {#each TRONCALES_OPTIONS as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="accesoTroncalGrade" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Calificación</label>
          <input 
            id="accesoTroncalGrade"
            type="number" 
            bind:value={accesoTroncalGrade}
            step="0.01" min="0" max="10"
            class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  </div>

  <hr class="border-slate-100 my-8" />

  <!-- Fase de Admisión -->
  <div>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold">Fase de Admisión (+0.4 máximo)</h3>
      </div>
    </div>

    {#each admisionAsignaturas as subject, i}
      <div class="space-y-4 mb-4 p-4 rounded-xl border border-dashed border-slate-200">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="admision-asignatura-{i}" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Asignatura</label>
            <select 
              id="admision-asignatura-{i}"
              bind:value={subject.name}
              class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
            >
              <option value="">Selecciona asignatura...</option>
              {#each ADMISION_OPTIONS as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="admision-grade-{i}" class="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Calificación</label>
            <input 
              id="admision-grade-{i}"
              type="number" 
              bind:value={subject.grade}
              step="0.01" min="0" max="10"
              class="w-full bg-white border-slate-200 rounded-lg text-sm p-2 focus:ring-[#2b6cee]"
              placeholder="0.00"
            />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-slate-500">Ponderación:</span>
          <div class="flex bg-slate-100 p-1 rounded-lg w-full">
            <button 
              class="flex-1 py-1 text-xs font-medium rounded-md transition-all {subject.weight === 0.0 ? 'bg-white shadow-sm text-[#2b6cee]' : 'text-slate-500'}"
              onclick={() => subject.weight = 0.0}
            >
              0.0
            </button>
            <button 
              class="flex-1 py-1 text-xs font-medium rounded-md transition-all {subject.weight === 0.1 ? 'bg-white shadow-sm text-[#2b6cee]' : 'text-slate-500'}"
              onclick={() => subject.weight = 0.1}
            >
              0.1
            </button>
            <button 
              class="flex-1 py-1 text-xs font-medium rounded-md transition-all {subject.weight === 0.2 ? 'bg-white shadow-sm text-[#2b6cee]' : 'text-slate-500'}"
              onclick={() => subject.weight = 0.2}
            >
              0.2
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="bg-[#2b6cee]/5 rounded-xl border border-[#2b6cee]/20 p-4 flex items-start gap-3 mt-6">
  <Info class="text-[#2b6cee] shrink-0" size={18} />
  <p class="text-xs leading-relaxed text-slate-600">
    La nota final se calcula automáticamente sumando el 60% de tu media de Bachillerato y el 40% de la Fase de Acceso. La Fase de Admisión puede sumar hasta +0.4 puntos adicionales.
  </p>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
