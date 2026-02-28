<script lang="ts">
  import { onMount } from "svelte";
  import { FileText, Calculator, Brain, MapPin } from "@lucide/svelte";

  const stats = [
    { value: 5000, suffix: "+", label: "Exámenes disponibles", Icon: FileText, color: "blue" },
    { value: 17,   suffix: "",  label: "Comunidades cubiertas", Icon: MapPin,  color: "orange" },
    { value: 98,   suffix: "%", label: "Satisfacción estudiantil", Icon: Brain, color: "violet" },
    { value: 50,   suffix: "k+", label: "Estudiantes activos", Icon: Calculator, color: "cyan" },
  ];

  let displayValues = $state(stats.map(() => 0));
  let sectionRef: HTMLElement;
  let animated = $state(false);

  function animateCount(index: number, target: number) {
    const duration = 1800;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      current = Math.min(Math.round(step * count * (1 - Math.exp(-count / 15))), target);
      displayValues[index] = current;
      if (current >= target) {
        displayValues[index] = target;
        clearInterval(interval);
      }
    }, duration / steps);
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            stats.forEach((s, i) => animateCount(i, s.value));
          }
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });

  const colorMap: Record<string, { bg: string; text: string; shadow: string; border: string }> = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   shadow: "shadow-blue-100",   border: "border-blue-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-500", shadow: "shadow-orange-100", border: "border-orange-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", shadow: "shadow-violet-100", border: "border-violet-100" },
    cyan:   { bg: "bg-cyan-50",   text: "text-cyan-600",   shadow: "shadow-cyan-100",   border: "border-cyan-100" },
  };
</script>

<section
  bind:this={sectionRef}
  class="py-20 px-6 bg-gradient-to-b from-white to-slate-50/80 relative overflow-hidden"
>
  <!-- subtle background decoration -->
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
  </div>

  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14">
      <span class="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
        En números
      </span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
        La plataforma que eligen los estudiantes
      </h2>
      <p class="text-slate-500 max-w-lg mx-auto text-base">
        Miles de estudiantes ya preparan la Selectividad con AsroPAU. Únete a la comunidad.
      </p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {#each stats as stat, i}
        {@const c = colorMap[stat.color]}
        <div
          class="stat-card group relative flex flex-col items-center text-center p-6 rounded-2xl bg-white border {c.border} shadow-sm hover:shadow-xl {c.shadow} transition-all duration-300 hover:-translate-y-1 cursor-default"
          style="animation-delay: {i * 0.1}s"
          class:stat-visible={animated}
        >
          <div class="w-12 h-12 {c.bg} {c.text} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <stat.Icon size={22} />
          </div>
          <div class="text-3xl md:text-4xl font-extrabold text-slate-800 tabular-nums leading-none mb-1">
            {displayValues[i].toLocaleString("es-ES")}{stat.suffix}
          </div>
          <p class="text-sm text-slate-500 font-medium leading-snug">{stat.label}</p>

          <!-- decorative corner glow -->
          <div class="absolute top-0 right-0 w-16 h-16 rounded-tr-2xl {c.bg} opacity-40 pointer-events-none"></div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .stat-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, translate 0.2s ease;
  }
  .stat-card.stat-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .stat-card:nth-child(1) { transition-delay: 0s; }
  .stat-card:nth-child(2) { transition-delay: 0.1s; }
  .stat-card:nth-child(3) { transition-delay: 0.2s; }
  .stat-card:nth-child(4) { transition-delay: 0.3s; }

  @media (prefers-reduced-motion: reduce) {
    .stat-card { opacity: 1; transform: none; transition: none; }
  }
</style>
