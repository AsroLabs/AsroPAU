<script lang="ts">
  import { onMount } from "svelte";
  import { Star, ArrowRight, Quote } from "@lucide/svelte";

  const testimonials = [
    {
      name: "Lucía M.",
      role: "Estudiante de 2º Bachillerato, Madrid",
      text: "Gracias a AsroPAU pude practicar con exámenes reales de años anteriores. Aprobé la EvAU con un 9,4.",
      stars: 5,
      initial: "L",
      color: "bg-blue-500",
    },
    {
      name: "Carlos D.",
      role: "Estudiante, Andalucía",
      text: "La calculadora de notas me ayudó a planificar qué asignaturas subir para entrar en Medicina. ¡Increíble herramienta!",
      stars: 5,
      initial: "C",
      color: "bg-orange-500",
    },
    {
      name: "Sara P.",
      role: "Estudiante, Cataluña",
      text: "El generador de exámenes con IA es una pasada. Me hizo practicar de una forma que ningún libro puede hacer.",
      stars: 5,
      initial: "S",
      color: "bg-violet-500",
    },
  ];

  let sectionRef: HTMLElement;
  let visible = $state(false);

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true; },
      { threshold: 0.15 }
    );
    if (sectionRef) observer.observe(sectionRef);
    return () => observer.disconnect();
  });
</script>

<section bind:this={sectionRef} class="py-24 px-6 bg-slate-50 relative overflow-hidden">
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
  </div>

  <div class="max-w-6xl mx-auto">
    <!-- Section header -->
    <div
      class="text-center mb-14 transition-all duration-700"
      class:opacity-0={!visible}
      class:translate-y-5={!visible}
    >
      <span class="inline-block px-4 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
        Testimonios
      </span>
      <h2 class="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
        Lo que dicen nuestros estudiantes
      </h2>
      <p class="text-slate-500 max-w-md mx-auto">
        Miles de estudiantes ya han aprobado la Selectividad con AsroPAU.
      </p>
    </div>

    <!-- Testimonial cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      {#each testimonials as t, i}
        <div
          class="testimonial-card bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default"
          class:card-visible={visible}
          style="transition-delay: {i * 0.12}s;"
        >
          <Quote size={20} class="text-slate-200 mb-4" />
          <p class="text-slate-600 leading-relaxed mb-6 text-sm">"{t.text}"</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 {t.color} rounded-full flex items-center justify-center text-white font-bold text-sm">
                {t.initial}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">{t.name}</p>
                <p class="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
            <div class="flex gap-0.5">
              {#each Array(t.stars) as _}
                <Star size={12} class="text-yellow-400 fill-yellow-400" />
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- CTA Banner -->
    <div
      class="relative rounded-3xl overflow-hidden transition-all duration-700 delay-500"
      class:opacity-0={!visible}
      class:translate-y-6={!visible}
    >
      <!-- Animated gradient background -->
      <div class="absolute inset-0 cta-gradient" aria-hidden="true"></div>
      <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px); background-size: 40px 40px;" aria-hidden="true"></div>

      <div class="relative z-10 text-center py-16 px-8">
        <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4">
          ¿Listo para dominar la PAU?
        </h2>
        <p class="text-blue-100 text-lg mb-8 max-w-md mx-auto">
          Únete a miles de estudiantes que ya están preparando la Selectividad con AsroPAU.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/examen"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5
                   bg-white text-blue-700 font-bold rounded-full
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5
                   transition-all duration-200 cursor-pointer text-sm"
          >
            Explorar exámenes
            <ArrowRight size={16} />
          </a>
          <a
            href="/media"
            class="inline-flex items-center justify-center gap-2 px-7 py-3.5
                   bg-white/15 backdrop-blur-sm text-white font-semibold rounded-full
                   border border-white/30 hover:bg-white/25
                   transition-all duration-200 cursor-pointer text-sm"
          >
            Calcular mi nota
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .testimonial-card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, translate 0.2s ease;
  }
  .testimonial-card.card-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .testimonial-card:nth-child(1) { transition-delay: 0s; }
  .testimonial-card:nth-child(2) { transition-delay: 0.12s; }
  .testimonial-card:nth-child(3) { transition-delay: 0.24s; }

  .cta-gradient {
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 30%, #0ea5e9 60%, #0284c7 100%);
    background-size: 300% 300%;
    animation: gradientShift 8s ease infinite;
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-gradient { animation: none; }
    .testimonial-card { opacity: 1; transform: none; transition: box-shadow 0.3s ease; }
  }
</style>
