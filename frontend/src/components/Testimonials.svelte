<script lang="ts">
  import { onMount } from "svelte";
  import { Star, ArrowRight, Quote } from "@lucide/svelte";

  const testimonials = [
    {
      name: "Lucía M.",
      role: "2º Bachillerato, Madrid",
      text: "Gracias a AsroPAU pude practicar con exámenes reales de años anteriores. Aprobé la EvAU con un 9,4.",
      stars: 5,
      initial: "L",
      bgColor: "#4F46E5",
      score: "9.4",
    },
    {
      name: "Carlos D.",
      role: "Estudiante, Andalucía",
      text: "La calculadora de notas me ayudó a planificar qué asignaturas subir para entrar en Medicina.",
      stars: 5,
      initial: "C",
      bgColor: "#F59E0B",
      score: "13.6",
    },
    {
      name: "Sara P.",
      role: "Estudiante, Cataluña",
      text: "El generador de exámenes con IA es una pasada. Me hizo practicar de una forma que ningún libro puede hacer.",
      stars: 5,
      initial: "S",
      bgColor: "#8B5CF6",
      score: "11.2",
    },
  ];

  let sectionRef: HTMLElement;
  let visible = $state(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.1 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });
</script>

<section bind:this={sectionRef} class="py-28 px-6 relative overflow-hidden" style="background:#fff;">
  <!-- Top border -->
  <div class="absolute top-0 left-0 right-0 h-px" style="background:linear-gradient(90deg,transparent,#C7D2FE,transparent);" aria-hidden="true"></div>

  <div class="max-w-6xl mx-auto">

    <!-- Header -->
    <div class="text-center mb-14 t-reveal" class:show={visible}>
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
        Testimonios
      </div>
      <h2 class="font-display font-bold text-slate-900 mb-3" style="font-size:clamp(1.8rem,3vw,2.5rem);">
        Lo que dicen nuestros estudiantes
      </h2>
      <p class="text-slate-500 max-w-md mx-auto">
        Miles de estudiantes ya han aprobado la Selectividad con AsroPAU.
      </p>
    </div>

    <!-- Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      {#each testimonials as t, i}
        <div
          class="t-card flex flex-col bg-white rounded-3xl p-6 cursor-default"
          class:show={visible}
          style="
            transition-delay:{i * 0.12}s;
            border:2px solid {t.bgColor}12;
            border-bottom:4px solid {t.bgColor}35;
            box-shadow:0 4px 20px {t.bgColor}10;
          "
        >
          <!-- Quote icon -->
          <Quote size={22} style="color:{t.bgColor}30;" class="mb-3" />

          <p class="text-slate-600 leading-relaxed mb-5 text-sm flex-1">"{t.text}"</p>

          <!-- Score badge -->
          <div class="mb-4">
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold" style="background:{t.bgColor};">
              Nota final: {t.score}
            </div>
          </div>

          <div class="flex items-center justify-between pt-4" style="border-top:1px solid {t.bgColor}15;">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style="background:{t.bgColor};"
              >
                {t.initial}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">{t.name}</p>
                <p class="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
            <div class="flex gap-0.5">
              {#each Array(t.stars) as _}
                <Star size={12} class="text-amber-400 fill-amber-400" />
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- CTA Banner -->
    <div
      class="t-reveal relative rounded-3xl overflow-hidden"
      style="transition-delay:0.5s;"
      class:show={visible}
    >
      <!-- Background -->
      <div class="absolute inset-0 cta-bg" aria-hidden="true"></div>
      <!-- Dot pattern -->
      <div
        class="absolute inset-0 opacity-[0.07]"
        style="background-image:radial-gradient(circle at 25% 50%,white 1px,transparent 1px),radial-gradient(circle at 75% 50%,white 1px,transparent 1px);background-size:40px 40px;"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 text-center py-16 px-8">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-white/30">
          Empieza hoy gratis
        </div>
        <h2 class="font-display font-bold text-white mb-4" style="font-size:clamp(1.8rem,3.5vw,2.8rem);">
          ¿Listo para dominar la PAU?
        </h2>
        <p class="text-indigo-200 text-lg mb-9 max-w-md mx-auto">
          Únete a miles de estudiantes que ya están preparando la Selectividad con AsroPAU.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/examen"
            class="group inline-flex items-center justify-center gap-2 px-7 py-3.5
                   bg-white text-indigo-700 font-bold rounded-2xl
                   shadow-xl hover:shadow-2xl hover:-translate-y-0.5
                   transition-all duration-200 cursor-pointer text-sm"
            style="border-bottom:3px solid #c7d2fe;"
          >
            Explorar exámenes
            <ArrowRight size={15} class="transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a
            href="/resolutor"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5
                   bg-white/15 backdrop-blur-sm text-white font-semibold rounded-2xl
                   border-2 border-white/30 hover:bg-white/25
                   transition-all duration-200 cursor-pointer text-sm"
          >
            Probar resolutor
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .t-reveal {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .t-reveal.show { opacity: 1; transform: translateY(0); }

  .t-card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
  }
  .t-card.show { opacity: 1; transform: translateY(0); }
  .t-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }

  .cta-bg {
    background: linear-gradient(135deg, #312E81 0%, #4F46E5 40%, #6366f1 70%, #818CF8 100%);
    background-size: 300% 300%;
    animation: gradShift 10s ease infinite;
  }
  @keyframes gradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .t-reveal, .t-card { opacity: 1; transform: none; transition: box-shadow 0.25s ease; }
    .cta-bg { animation: none; }
  }
</style>
