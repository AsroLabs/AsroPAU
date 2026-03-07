<script lang="ts">
  import { onMount } from "svelte";
  import { ArrowRight, FileSearch, Calculator, Wand2, CheckCircle2 } from "@lucide/svelte";
  import exams from "$lib/assets/exams.svg";
  import calculator from "$lib/assets/calculator.svg";
  import printer from "$lib/assets/printer.svg";

  type Feature = {
    id: string;
    label: string;
    title: string;
    description: string;
    bullets: string[];
    image: string;
    href: string;
    bgColor: string;
    borderColor: string;
    shadowColor: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    Icon: typeof FileSearch;
  };

  const features: Feature[] = [
    {
      id: "examenes",
      label: "Exámenes",
      title: "Acceso total a exámenes oficiales",
      description: "Acceso ilimitado a todos los PDF de exámenes pasados y soluciones oficiales de cualquier comunidad autónoma.",
      bullets: [
        "Más de 5.000 exámenes organizados",
        "Soluciones y criterios de corrección",
        "Búsqueda por asignatura, año y CCAA",
      ],
      image: exams,
      href: "/examen",
      bgColor: "#EA580C",
      borderColor: "#9a3412",
      shadowColor: "rgba(234,88,12,0.25)",
      badgeBg: "#FFF7ED",
      badgeText: "#EA580C",
      iconBg: "#FFF7ED",
      iconColor: "#EA580C",
      Icon: FileSearch,
    },
    {
      id: "calculadora",
      label: "Calculadora",
      title: "Calcula tu nota de selectividad",
      description: "Simula diferentes escenarios para planificar tu acceso a la universidad. Compatible con todas las fases de la EvAU.",
      bullets: [
        "Nota de acceso y admisión",
        "Fase general y específica",
        "Comparativa con notas de corte",
      ],
      image: calculator,
      href: "/media",
      bgColor: "#F59E0B",
      borderColor: "#d97706",
      shadowColor: "rgba(245,158,11,0.25)",
      badgeBg: "#FFFBEB",
      badgeText: "#92400E",
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
      Icon: Calculator,
    },
    {
      id: "creadorIA",
      label: "Exámenes IA",
      title: "Genera exámenes con inteligencia artificial",
      description: "Crea nuevos exámenes personalizados generados con IA junto a sus soluciones detalladas al instante.",
      bullets: [
        "Elige asignatura y dificultad",
        "Exámenes únicos adaptados a ti",
        "Soluciones detalladas con IA",
      ],
      image: printer,
      href: "/resolutor",
      bgColor: "#8B5CF6",
      borderColor: "#6d28d9",
      shadowColor: "rgba(139,92,246,0.25)",
      badgeBg: "#F5F3FF",
      badgeText: "#5B21B6",
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
      Icon: Wand2,
    },
  ];

  let activeTab = $state("examenes");
  let sectionRef: HTMLElement;
  let visible = $state(false);

  const activeFeature = $derived(features.find((f) => f.id === activeTab) ?? features[0]);

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.1 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });
</script>

<section
  id="features"
  bind:this={sectionRef}
  class="py-28 px-6 relative overflow-hidden"
  style="background: linear-gradient(180deg, #fff 0%, #FFF7ED 100%);"
>
  <!-- Background decoration -->
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" style="background:radial-gradient(circle, #FDBA74, transparent 70%);"></div>
    <div class="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" style="background:radial-gradient(circle, #FED7AA, transparent 70%);"></div>
  </div>

  <div class="max-w-6xl mx-auto relative z-10">

    <!-- Section header -->
    <div
      class="text-center mb-14 section-reveal"
      class:show={visible}
    >
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
        Herramientas
      </div>
      <h2 class="font-display font-bold text-slate-900 mb-3" style="font-size:clamp(1.8rem,3vw,2.5rem);">
        Todo lo que necesitas para la PAU
      </h2>
      <p class="text-slate-500 max-w-md mx-auto">
        Tres herramientas diseñadas para que prepares la selectividad de forma eficiente.
      </p>
    </div>

    <!-- Tab pills -->
    <div
      class="flex justify-center mb-10 section-reveal"
      style="transition-delay:0.1s;"
      class:show={visible}
    >
      <div class="inline-flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        {#each features as feature}
          <button
            onclick={() => (activeTab = feature.id)}
            class="
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200 cursor-pointer
              {activeTab === feature.id ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}
            "
            style={activeTab === feature.id
              ? `background-color:${feature.bgColor}; box-shadow:0 4px 14px ${feature.shadowColor}; border-bottom:2px solid ${feature.borderColor};`
              : ""}
          >
            <feature.Icon size={14} />
            {feature.label}
          </button>
          <button
            onclick={() => (activeTab = feature.id)}
            class="
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200 cursor-pointer
              {activeTab === feature.id ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}
            "
            style={activeTab === feature.id
              ? `background-color:${feature.bgColor}; box-shadow:0 4px 14px ${feature.shadowColor}; border-bottom:2px solid ${feature.borderColor};`
              : ""}
          >
            <feature.Icon size={14} />
            {feature.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Feature card -->
    {#key activeFeature.id}
      <div
        class="feature-card grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center
               bg-white rounded-3xl p-8 md:p-12
               section-reveal"
        class:show={visible}
        style="
          transition-delay:0.2s;
          border: 2px solid {activeFeature.bgColor}18;
          border-bottom: 4px solid {activeFeature.bgColor}40;
          box-shadow: 0 24px 64px {activeFeature.shadowColor}, 0 4px 16px rgba(0,0,0,0.04);
        "
      >
        <!-- Text column -->
        <div class="flex flex-col justify-center">
          <!-- Badge -->
          <div class="flex items-center gap-2.5 mb-5">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
              style="background:{activeFeature.iconBg}; border:2px solid {activeFeature.bgColor}25;"
            >
              <activeFeature.Icon size={20} style="color:{activeFeature.iconColor};" />
            </div>
            <span
              class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style="background:{activeFeature.badgeBg}; color:{activeFeature.badgeText};"
            >
              {activeFeature.label}
            </span>
          </div>

          <h3 class="font-display font-bold text-slate-900 mb-3 leading-tight" style="font-size:clamp(1.4rem,2.5vw,1.9rem);">
            {activeFeature.title}
          </h3>
          <p class="text-slate-500 mb-5 leading-relaxed">
            {activeFeature.description}
          </p>

          <!-- Bullet points -->
          <ul class="space-y-2.5 mb-8">
            {#each activeFeature.bullets as bullet}
              <li class="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                <CheckCircle2 size={16} style="color:{activeFeature.bgColor}; flex-shrink:0;" />
                {bullet}
              </li>
            {/each}
          </ul>

          <a
            href={activeFeature.href}
            class="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer w-fit"
            style="
              background:{activeFeature.bgColor};
              border-bottom:3px solid {activeFeature.borderColor};
              box-shadow:0 6px 20px {activeFeature.shadowColor};
            "
          >
            Ir a la herramienta
            <ArrowRight size={15} class="transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        <!-- Image column -->
        <div class="flex justify-center items-center">
          <div class="relative">
            <div
              class="absolute inset-0 rounded-3xl blur-3xl opacity-25 scale-75"
              style="background: radial-gradient(circle, {activeFeature.bgColor}, transparent 70%);"
              aria-hidden="true"
            ></div>
            <img
              src={activeFeature.image}
              alt={activeFeature.title}
              class="relative w-full max-w-[280px] h-auto object-contain transition-transform duration-500 hover:-translate-y-2"
              style="filter: drop-shadow(0 16px 40px {activeFeature.shadowColor});"
            />
          </div>
        </div>
      </div>
    {/key}

    <!-- Mini cards row -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 section-reveal"
      style="transition-delay:0.35s;"
      class:show={visible}
    >
      {#each features as feature}
        <button
          onclick={() => (activeTab = feature.id)}
          class="
            flex items-center gap-3 p-4 rounded-2xl border-2 text-left cursor-pointer
            transition-all duration-200 hover:-translate-y-0.5
            {activeTab === feature.id ? 'bg-white shadow-md' : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'}
          "
          style={activeTab === feature.id
            ? `border-color:${feature.bgColor}30; box-shadow:0 4px 20px ${feature.shadowColor};`
            : "border-color:transparent;"}
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background:{feature.iconBg};"
          >
            <feature.Icon size={16} style="color:{feature.iconColor};" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-700">{feature.label}</p>
            <p class="text-xs text-slate-400 line-clamp-1">{feature.description}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .section-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .section-reveal.show {
    opacity: 1;
    transform: translateY(0);
  }

  .feature-card {
    animation: cardIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(10px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .section-reveal { opacity: 1; transform: none; transition: none; }
    .feature-card { animation: none; }
  }
</style>
