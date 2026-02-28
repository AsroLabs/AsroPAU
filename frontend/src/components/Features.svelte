<script lang="ts">
  import { onMount } from "svelte";
  import { ArrowRight, FileSearch, Calculator, Wand2 } from "@lucide/svelte";
  import exams from "$lib/assets/exams.svg";
  import calculator from "$lib/assets/calculator.svg";
  import printer from "$lib/assets/printer.svg";

  type Feature = {
    id: string;
    label: string;
    title: string;
    description: string;
    detail: string;
    image: string;
    href: string;
    accentColor: string;
    badgeColor: string;
    Icon: typeof FileSearch;
  };

  const features: Feature[] = [
    {
      id: "examenes",
      label: "Exámenes",
      title: "Acceso total a exámenes oficiales",
      description: "Acceso ilimitado a todos los PDF de exámenes pasados y soluciones oficiales de cualquier comunidad autónoma.",
      detail: "Más de 5.000 exámenes organizados por asignatura, año y comunidad. Con soluciones detalladas y criterios de corrección.",
      image: exams,
      href: "/examen",
      accentColor: "blue",
      badgeColor: "bg-blue-100 text-blue-700",
      Icon: FileSearch,
    },
    {
      id: "calculadora",
      label: "Calculadora",
      title: "Calcula tu nota media de selectividad",
      description: "Calcula tu nota de selectividad introduciendo tus notas de bachillerato y los pesos de las asignaturas.",
      detail: "Simula diferentes escenarios para planificar tu acceso a la universidad. Compatible con todas las fases de la EvAU.",
      image: calculator,
      href: "/media",
      accentColor: "orange",
      badgeColor: "bg-orange-100 text-orange-700",
      Icon: Calculator,
    },
    {
      id: "creadorIA",
      label: "Creador IA",
      title: "Genera exámenes con inteligencia artificial",
      description: "Crea nuevos exámenes personalizados generados con IA junto a sus soluciones detalladas al instante.",
      detail: "Elige asignatura, dificultad y temario. La IA genera exámenes únicos adaptados a tu nivel y necesidades.",
      image: printer,
      href: "/examenes-ia",
      accentColor: "violet",
      badgeColor: "bg-violet-100 text-violet-700",
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
      { threshold: 0.15 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });

  const colorAccent: Record<string, { pill: string; glow: string; icon: string; link: string }> = {
    blue:   { pill: "bg-blue-600",   glow: "rgba(37,99,235,0.15)",   icon: "bg-blue-100 text-blue-600",   link: "text-blue-600 hover:text-blue-800" },
    orange: { pill: "bg-orange-500", glow: "rgba(249,115,22,0.15)",  icon: "bg-orange-100 text-orange-600", link: "text-orange-600 hover:text-orange-800" },
    violet: { pill: "bg-violet-600", glow: "rgba(124,58,237,0.15)",  icon: "bg-violet-100 text-violet-600", link: "text-violet-600 hover:text-violet-800" },
  };
</script>

<section
  id="features"
  bind:this={sectionRef}
  class="py-24 px-6 bg-white relative overflow-hidden"
>
  <!-- Section background decoration -->
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 -translate-x-1/2 translate-y-1/2"></div>
    <div class="absolute top-0 right-0 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
  </div>

  <div class="max-w-6xl mx-auto relative z-10">
    <!-- Header -->
    <div
      class="text-center mb-14 transition-all duration-700"
      class:opacity-0={!visible}
      class:translate-y-6={!visible}
    >
      <span class="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
        Herramientas
      </span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
        Todo lo que necesitas para la PAU
      </h2>
      <p class="text-slate-500 max-w-md mx-auto">
        Tres herramientas diseñadas para que prepares la selectividad de forma eficiente.
      </p>
    </div>

    <!-- Tab pills -->
    <div
      class="flex justify-center mb-12 transition-all duration-700 delay-100"
      class:opacity-0={!visible}
      class:translate-y-4={!visible}
    >
      <div class="inline-flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
        {#each features as feature}
          {@const c = colorAccent[feature.accentColor]}
          <button
            onclick={() => (activeTab = feature.id)}
            class="
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-200 cursor-pointer
              {activeTab === feature.id
                ? `{c.pill} text-white shadow-md`
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/70'}
            "
            style={activeTab === feature.id ? `background: linear-gradient(135deg, var(--tw-shadow-color, #2563EB), transparent); background: ${c.pill.replace("bg-", "")}` : ""}
          >
            <feature.Icon size={15} />
            {feature.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Feature content -->
    {#key activeFeature.id}
      {@const c = colorAccent[activeFeature.accentColor]}
      <div
        class="feature-panel grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center
               bg-white rounded-3xl border border-slate-100 p-8 md:p-12
               shadow-xl transition-all duration-700 delay-200"
        class:opacity-0={!visible}
        class:translate-y-4={!visible}
        style="box-shadow: 0 20px 60px {c.glow}, 0 4px 20px rgba(0,0,0,0.05);"
      >
        <!-- Text column -->
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 {c.icon} rounded-xl flex items-center justify-center">
              <activeFeature.Icon size={20} />
            </div>
            <span class="{activeFeature.badgeColor} text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {activeFeature.label}
            </span>
          </div>

          <h3 class="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3 leading-tight">
            {activeFeature.title}
          </h3>
          <p class="text-slate-600 mb-4 leading-relaxed">
            {activeFeature.description}
          </p>
          <p class="text-slate-400 text-sm mb-7 leading-relaxed border-l-2 border-slate-100 pl-4">
            {activeFeature.detail}
          </p>

          <a
            href={activeFeature.href}
            class="inline-flex items-center gap-2 font-semibold {c.link} transition-colors group w-fit cursor-pointer"
          >
            Ir a la herramienta
            <ArrowRight size={16} class="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <!-- Image column -->
        <div class="flex justify-center items-center">
          <div
            class="relative"
            style="filter: drop-shadow(0 20px 40px {c.glow});"
          >
            <div
              class="absolute inset-0 rounded-3xl blur-2xl opacity-30"
              style="background: radial-gradient(circle, {c.glow} 0%, transparent 70%);"
            ></div>
            <img
              src={activeFeature.image}
              alt={activeFeature.title}
              class="relative w-full max-w-sm h-auto object-contain transition-transform duration-500 hover:scale-105 hover:-translate-y-2"
            />
          </div>
        </div>
      </div>
    {/key}

    <!-- Feature mini cards (bottom) -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 transition-all duration-700 delay-300"
      class:opacity-0={!visible}
      class:translate-y-4={!visible}
    >
      {#each features as feature}
        {@const c = colorAccent[feature.accentColor]}
        <button
          onclick={() => (activeTab = feature.id)}
          class="
            flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer
            {activeTab === feature.id
              ? 'border-slate-200 bg-slate-50 shadow-sm'
              : 'border-transparent hover:border-slate-100 hover:bg-slate-50/50'}
          "
        >
          <div class="w-9 h-9 {c.icon} rounded-lg flex items-center justify-center flex-shrink-0">
            <feature.Icon size={17} />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-700">{feature.label}</p>
            <p class="text-xs text-slate-400 line-clamp-1">{feature.description}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .feature-panel {
    animation: panelIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes panelIn {
    from { opacity: 0; transform: translateY(12px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .feature-panel { animation: none; }
  }
</style>
