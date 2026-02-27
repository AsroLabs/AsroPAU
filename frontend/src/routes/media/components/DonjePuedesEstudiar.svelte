<script lang="ts">
  import { Map } from '@lucide/svelte';
</script>

<div class="bg-white p-6 rounded-xl border border-slate-200">
  <h3 class="text-sm font-bold mb-4">¿Dónde puedes estudiar?</h3>
  <div class="relative rounded-lg overflow-hidden h-32 bg-slate-100">
    <img 
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR5VRmzxdQP8rbKy3VAWqhL0ENVry1a2BhLtm7I7wOCaPahbhML-8i-Yj1gVE_agRVflsm1jG1t9sQsvkld_zFY-0VmjHXcYWJNH03jJooj8ev8p2ZSIP8qrjmIss3vOW4DYmGE_ttDD4ZHdLSm1MDgmaZb1tX3p4gTgWsp__8XBmC3dmh7ogY9oWZKGDCPWxadTGtBuffK4o5sfQ42_FboGE5eQRic0CQPMH4k3WPNmVwqBeHV3rF6MSguNgRylNZE-ER_I3erKc" 
      alt="Mapa de España" 
      class="w-full h-full object-cover opacity-50 grayscale"
      referrerPolicy="no-referrer"
    />
    <div class="absolute inset-0 flex items-center justify-center">
      <button class="bg-white shadow-lg px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
        <Map size={14} class="text-[#2b6cee]" /> Abrir Mapa Interactivo
      </button>
    </div>
  </div>
</div>

<style>
  /* Estilos específicos si es necesario */
</style>
