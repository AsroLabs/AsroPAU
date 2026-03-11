<script lang="ts">
  import { Lightbulb } from '@lucide/svelte'
</script>

<div
  class="mb-8 p-6 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 rounded-3xl shadow-lg shadow-orange-300/30 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
>
  <div class="relative z-10 flex items-center gap-6">
    <div
      class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
    >
      <Lightbulb class="text-white" size={32} />
    </div>
    <div>
      <h3 class="text-white font-display font-bold text-xl">
        ¿Quieres subir tu nota?
      </h3>
      <p class="text-white/80 text-sm max-w-md">
        Consigue los mejores apuntes y resúmenes validados por profesores
        expertos en cada materia.
      </p>
    </div>
  </div>
  <button
    class="relative z-10 bg-white text-orange-600 font-bold px-8 py-3 rounded-full text-sm shadow-xl hover:scale-105 transition-transform active:scale-95 hover:shadow-orange-200/60"
  >
    Ver Apuntes
  </button>
  <!-- Decorative circles -->
  <div
    class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute top-0 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-2xl"
  ></div>
</div>
