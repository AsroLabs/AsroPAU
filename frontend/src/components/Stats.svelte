<script lang="ts">
  import { onMount } from "svelte";
  import { FileText, MapPin, ThumbsUp, Users } from "@lucide/svelte";

  const stats = [
    { value: 5000, suffix: "+", label: "Exámenes disponibles", Icon: FileText,  bgColor: "#EA580C", lightBg: "#FFF7ED", borderColor: "#9a3412" },
    { value: 17,   suffix: "",  label: "Comunidades cubiertas", Icon: MapPin,   bgColor: "#F59E0B", lightBg: "#FFFBEB", borderColor: "#d97706" },
    { value: 98,   suffix: "%", label: "Satisfacción",          Icon: ThumbsUp, bgColor: "#22C55E", lightBg: "#F0FDF4", borderColor: "#16a34a" },
    { value: 50,   suffix: "k+",label: "Estudiantes activos",   Icon: Users,    bgColor: "#F97316", lightBg: "#FFF7ED", borderColor: "#c2410c" },
  ];

  let displayValues = $state(stats.map(() => 0));
  let sectionRef: HTMLElement;
  let animated = $state(false);
  let visible = $state(false);

  function animateCount(index: number, target: number) {
    const duration = 1600;
    const steps = 55;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const progress = count / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      displayValues[index] = Math.min(Math.round(target * eased), target);
      if (count >= steps) {
        displayValues[index] = target;
        clearInterval(interval);
      }
    }, duration / steps);
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          if (!animated) {
            animated = true;
            stats.forEach((s, i) => {
              setTimeout(() => animateCount(i, s.value), i * 120);
            });
          }
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });
</script>

<section
  bind:this={sectionRef}
  class="py-24 px-6 relative overflow-hidden"
  style="background: linear-gradient(180deg, #FFF7ED 0%, #FFF7ED 100%);"
>
  <!-- Top border gradient -->
  <div class="absolute top-0 left-0 right-0 h-px" style="background: linear-gradient(90deg, transparent, #FDBA74, transparent);" aria-hidden="true"></div>

  <div class="max-w-6xl mx-auto">
    <!-- Section header -->
    <div class="text-center mb-14 stat-reveal" class:show={visible}>
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5 shadow-sm">
        En números
      </div>
      <h2 class="font-display font-bold text-slate-900 mb-3" style="font-size:clamp(1.8rem,3vw,2.5rem);">
        La plataforma que eligen los estudiantes
      </h2>
      <p class="text-slate-500 max-w-md mx-auto">
        Miles de estudiantes ya preparan la Selectividad con AsroPAU.
      </p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {#each stats as stat, i}
        <div
          class="stat-card group relative flex flex-col items-center text-center p-7 rounded-3xl bg-white cursor-default"
          class:show={visible}
          style="
            transition-delay:{i * 0.1}s;
            border: 2px solid {stat.bgColor}15;
            border-bottom: 4px solid {stat.bgColor}50;
            box-shadow: 0 4px 24px {stat.bgColor}10;
          "
        >
          <!-- Icon -->
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200"
            style="background:{stat.lightBg}; border:2px solid {stat.bgColor}20;"
          >
            <stat.Icon size={24} style="color:{stat.bgColor};" />
          </div>

          <!-- Number -->
          <div
            class="font-display font-bold tabular-nums leading-none mb-2"
            style="font-size:clamp(2rem,4vw,2.75rem); color:{stat.bgColor};"
          >
            {displayValues[i].toLocaleString("es-ES")}{stat.suffix}
          </div>

          <!-- Label -->
          <p class="text-sm font-semibold text-slate-500 leading-snug">{stat.label}</p>

          <!-- Decorative corner -->
          <div
            class="absolute top-0 right-0 w-12 h-12 rounded-tr-3xl opacity-20 pointer-events-none"
            style="background:{stat.lightBg};"
            aria-hidden="true"
          ></div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .stat-reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .stat-reveal.show { opacity: 1; transform: translateY(0); }

  .stat-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
  }
  .stat-card.show { opacity: 1; transform: translateY(0); }
  .stat-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; transform: translateY(-3px) !important; }

  @media (prefers-reduced-motion: reduce) {
    .stat-reveal, .stat-card { opacity: 1; transform: none; transition: box-shadow 0.25s ease; }
  }
</style>
