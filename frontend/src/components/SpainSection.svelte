<script lang="ts">
  import { onMount } from "svelte";
  import { MapPin } from "@lucide/svelte";
  import spain from "$lib/assets/spain.svg";

  const regions = [
    "Madrid", "Cataluña", "C. Valenciana",
    "Andalucía", "País Vasco", "Galicia",
    "Castilla-La Mancha", "Aragón", "Canarias",
  ];

  let sectionRef: HTMLElement;
  let visible = $state(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.2 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });
</script>

<section
  bind:this={sectionRef}
  class="relative py-24 px-6 overflow-hidden"
>
  <!-- Animated gradient background -->
  <div class="absolute inset-0 bg-gradient-to-br from-orange-800 via-orange-600 to-orange-500" aria-hidden="true"></div>

  <!-- Noise texture overlay -->
  <div
    class="absolute inset-0 opacity-[0.04]"
    style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E&quot;); background-size: 200px 200px;"
    aria-hidden="true"
  ></div>

  <!-- Decorative circles -->
  <div class="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" aria-hidden="true"></div>
  <div class="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-orange-900/30 blur-2xl pointer-events-none" aria-hidden="true"></div>

  <div class="max-w-7xl mx-auto relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

      <!-- Left: text + regions -->
      <div
        class="text-white transition-all duration-700"
        class:opacity-0={!visible}
        class:translate-x-[-24px]={!visible}
      >
        <div class="inline-block mb-5 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest rounded-full">
          Cobertura nacional
        </div>

        <h2 class="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
          Toda España<br />a un clic
        </h2>
        <p class="text-orange-200 text-lg mb-10 leading-relaxed max-w-md">
          Hemos recopilado las pruebas de todas las comunidades autónomas para que no te falte material de práctica, sin importar donde vivas.
        </p>

        <!-- Region chips -->
        <div class="flex flex-wrap gap-3">
          {#each regions as region, i}
            <div
              class="region-chip flex items-center gap-1.5 px-3.5 py-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-default hover:-translate-y-0.5"
              class:chip-visible={visible}
              style="transition-delay: {i * 60}ms;"
            >
              <MapPin size={13} class="opacity-80" />
              {region}
            </div>
          {/each}
        </div>
      </div>

      <!-- Right: Spain map with 3D glow effect -->
      <div
        class="hidden md:flex justify-center items-center transition-all duration-700 delay-200"
        class:opacity-0={!visible}
        class:translate-x-6={!visible}
      >
        <div class="relative">
          <!-- Glow ring -->
          <div class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div class="w-3/4 h-3/4 rounded-full bg-white/20 blur-3xl"></div>
          </div>

          <!-- Map with float animation -->
          <img
            src={spain}
            alt="Mapa de España"
            class="relative w-full max-w-lg h-auto object-contain
                   drop-shadow-2xl spain-map-anim"
            style="filter: drop-shadow(0 0 40px rgba(255,255,255,0.4)) brightness(1.1) contrast(0.95);"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .region-chip {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease, background 0.2s ease, translate 0.2s ease;
  }
  .region-chip.chip-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .spain-map-anim {
    animation: spainFloat 6s ease-in-out infinite;
  }
  @keyframes spainFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(0.5deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spain-map-anim { animation: none; }
    .region-chip { opacity: 1; transform: none; transition: background 0.2s ease; }
  }
</style>
