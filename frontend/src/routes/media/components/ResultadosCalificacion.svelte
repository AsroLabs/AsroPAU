<script lang="ts">
  import { formatGrade } from '../lib';

  interface Props {
    totalGrade: number;
    bachPart: number;
    accesoPart: number;
    admisionPart: number;
  }


  let { totalGrade = 0, bachPart = 0, accesoPart = 0, admisionPart = 0 }: Props = $props();
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  <div class="bg-[#2b6cee] p-8 text-center text-white">
    <p class="text-sm font-medium opacity-80 mb-2 uppercase tracking-widest">Tu Calificación de Acceso Estimada</p>
    <div class="flex items-baseline justify-center gap-2">
      <span class="text-6xl font-bold tracking-tighter">{formatGrade(totalGrade)}</span>
      <span class="text-2xl font-light opacity-60">/ 14,000</span>
    </div>
  </div>
  <div class="p-4 bg-slate-50 flex justify-around border-t border-slate-100">
    <div class="text-center">
      <p class="text-[10px] text-slate-400 font-bold uppercase">Bach + Acceso</p>
      <p class="text-sm font-semibold">{formatGrade(bachPart + accesoPart)}</p>
    </div>
    <div class="w-px h-8 bg-slate-200"></div>
    <div class="text-center">
      <p class="text-[10px] text-slate-400 font-bold uppercase">Fase Admisión</p>
      <p class="text-sm font-semibold text-[#2b6cee]">+ {formatGrade(admisionPart)}</p>
    </div>
  </div>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
