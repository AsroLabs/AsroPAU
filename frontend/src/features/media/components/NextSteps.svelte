<script lang="ts">
  import { CheckCircle } from '@lucide/svelte';
</script>

<div class="bg-orange-300 p-6 rounded-xl text-white">
  <h3 class="text-sm font-bold mb-2">Próximos Pasos</h3>
  <ul class="space-y-3">
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} aria-hidden="true" /> Preinscripción: 12-25 Junio
    </li>
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} aria-hidden="true" /> Listas de admitidos: 12 Julio
    </li>
    <li class="flex items-center gap-2 text-xs">
      <CheckCircle size={14} aria-hidden="true" /> Reclamaciones: 12-14 Julio
    </li>
  </ul>
  <button type="button" class="mt-4 w-full bg-white/20 hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white transition-colors py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer">
    Ver Calendario Completo
  </button>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
