<script lang="ts">
  import { CheckCircle } from '@lucide/svelte';
</script>

<div class="bg-[#2b6cee] p-6 rounded-xl text-white">
  <h3 class="text-sm font-bold mb-2">Próximos Pasos</h3>
  <ul class="space-y-3">
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} /> Preinscripción: 12-25 Junio
    </li>
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} /> Listas de admitidos: 12 Julio
    </li>
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} /> Reclamaciones: 12-14 Julio
    </li>
  </ul>
  <button class="mt-4 w-full bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
    Ver Calendario Completo
  </button>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
