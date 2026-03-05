<script lang="ts">
  import { ArrowRight, Star, TrendingUp, Users, Zap } from "@lucide/svelte";
  import { onMount } from "svelte";
  import spain from "$lib/assets/spain.svg";
  import grid from "$lib/assets/grid.png";

  let mounted = $state(false);
  let mouseX = $state(0);
  let mouseY = $state(0);

  onMount(() => { mounted = true; });

  function handleMouseMove(e: MouseEvent) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 12;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 12;
  }

  const badges = [
    { icon: Users, label: "50k+ estudiantes", color: "bg-green-500" },
    { icon: Star, label: "4.9 valoración", color: "bg-amber-500" },
    { icon: TrendingUp, label: "#1 en España", color: "bg-orange-500" },
  ];

  const floatingCards = [
    { top: "18%", left: "6%",  delay: "0s",    label: "Matemáticas", score: "+9.2",  color: "#EA580C", bg: "#FFF7ED" },
    { top: "40%", left: "3%",  delay: "0.4s",  label: "Física",      score: "+8.8",  color: "#22C55E", bg: "#F0FDF4" },
    { top: "18%", right: "6%", delay: "0.2s",  label: "Historia",    score: "+9.4",  color: "#F59E0B", bg: "#FFFBEB" },
    { top: "40%", right: "3%", delay: "0.6s",  label: "Biología",    score: "+9.1",  color: "#EC4899", bg: "#FDF2F8" },
  ];
</script>

<!-- ── DESKTOP HERO ── -->
<section
  class="hero-section hidden md:block relative w-full overflow-hidden"
  style="background: linear-gradient(160deg, #FFF7ED 0%, #FED7AA 40%, #FDBA74 100%); min-height: 100vh;"
  onmousemove={handleMouseMove}
  role="presentation"
>
  <!-- Grid texture -->
  <div class="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
    <img src={grid} alt="" class="w-full h-full object-cover" />
  </div>

  <!-- Blob decorations -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <div class="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] rounded-full bg-orange-300/25 blur-3xl hero-blob-1"></div>
    <div class="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-amber-300/20 blur-3xl hero-blob-2"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-orange-200/30 blur-3xl"></div>
  </div>

  <!-- Floating achievement cards (left) -->
  {#each floatingCards.slice(0,2) as card, i}
    <div
      class="absolute z-20 float-card"
      style="top:{card.top}; left:{card.left}; animation-delay:{card.delay};"
      class:mounted-in={mounted}
    >
      <div
        class="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border border-white/80"
        style="background:{card.bg}; border-bottom:3px solid {card.color}20;"
      >
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background:{card.color}15;">
          <Zap size={14} style="color:{card.color};" />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500">{card.label}</p>
          <p class="text-sm font-bold" style="color:{card.color};">{card.score}</p>
        </div>
      </div>
    </div>
  {/each}

  <!-- Floating achievement cards (right) -->
  {#each floatingCards.slice(2) as card}
    <div
      class="absolute z-20 float-card"
      style="top:{card.top}; right:{card.right}; animation-delay:{card.delay};"
      class:mounted-in={mounted}
    >
      <div
        class="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border border-white/80"
        style="background:{card.bg}; border-bottom:3px solid {card.color}20;"
      >
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background:{card.color}15;">
          <Zap size={14} style="color:{card.color};" />
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500">{card.label}</p>
          <p class="text-sm font-bold" style="color:{card.color};">{card.score}</p>
        </div>
      </div>
    </div>
  {/each}

  <!-- Main content -->
  <div class="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20" style="min-height:100vh;">
    <!-- Social proof badges -->
    <div
      class="flex flex-wrap justify-center gap-2 mb-8 hero-fade-up"
      style="animation-delay:0.1s"
      class:show={mounted}
    >
      {#each badges as badge}
        <div class="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-full shadow-sm">
          <div class="w-4 h-4 rounded-full {badge.color} flex items-center justify-center">
            <badge.icon size={9} class="text-white" />
          </div>
          <span class="text-xs font-bold text-slate-700">{badge.label}</span>
        </div>
      {/each}
    </div>

    <!-- Headline -->
    <h1
      class="font-display font-bold text-slate-900 mb-5 max-w-3xl leading-tight hero-fade-up"
      style="font-size: clamp(2.6rem, 5vw, 4rem); animation-delay:0.2s;"
      class:show={mounted}
    >
      Domina la <span class="text-gradient-orange">Selectividad</span><br />
      como los mejores
    </h1>

    <!-- Subheading -->
    <p
      class="text-slate-600 max-w-lg mb-10 leading-relaxed hero-fade-up"
      style="font-size:1.1rem; animation-delay:0.3s;"
      class:show={mounted}
    >
      Más de 5.000 exámenes oficiales, calculadora de notas y resolutor con IA.
      Todo lo que necesitas para tu PAU, en un solo lugar.
    </p>

    <!-- CTA buttons -->
    <div
      class="flex flex-wrap justify-center gap-4 mb-16 hero-fade-up"
      style="animation-delay:0.4s;"
      class:show={mounted}
    >
      <a
        href="/examen"
        class="group flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-300/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-orange-400/60 cursor-pointer text-base"
        style="border-bottom: 4px solid #9a3412;"
      >
        Empezar gratis
        <ArrowRight size={18} class="transition-transform duration-200 group-hover:translate-x-1" />
      </a>
      <a
        href="/resolutor"
        class="flex items-center gap-2 px-8 py-4 bg-white hover:bg-orange-50 text-orange-700 font-bold rounded-2xl shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all duration-200 hover:-translate-y-1 cursor-pointer text-base"
      >
        Probar resolutor
      </a>
    </div>

    <!-- Spain map 3D parallax -->
    <div
      class="relative hero-fade-up"
      style="animation-delay:0.5s; width:min(480px,65vw);"
      class:show={mounted}
    >
      <div
        class="relative transition-transform duration-100 ease-out"
        style="transform: perspective(800px) rotateX({mouseY * 0.04}deg) rotateY({mouseX * 0.04}deg);"
      >
        <!-- Glow -->
        <div class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div class="w-3/4 h-3/4 rounded-full bg-orange-400/20 blur-3xl spain-glow"></div>
        </div>
        <img
          src={spain}
          alt="Mapa de España"
          class="relative w-full object-contain spain-float"
          style="filter: drop-shadow(0 12px 40px rgba(234,88,12,0.35)) drop-shadow(0 0 60px rgba(249,115,22,0.2));"
        />
      </div>

      <!-- Progress bar under map — gamification -->
      <div class="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-orange-100 shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-600">Progreso PAU 2025</span>
          <span class="text-xs font-bold text-orange-600">17 / 17 CCAA</span>
        </div>
        <div class="h-3 bg-orange-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full progress-bar" style="background: linear-gradient(90deg, #EA580C, #fb923c); width:100%;"></div>
        </div>
        <p class="text-[11px] text-slate-500 mt-1.5 text-center font-medium">Cobertura completa de todas las comunidades autónomas</p>
      </div>
    </div>
  </div>
</section>

<!-- ── MOBILE HERO ── -->
<section
  class="hidden max-md:flex flex-col w-full relative overflow-hidden px-5 pt-24 pb-16"
  style="background: linear-gradient(160deg, #FFF7ED 0%, #FED7AA 60%, #FDBA74 100%); min-height:100svh;"
>
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <img src={grid} alt="" class="w-full h-full object-cover opacity-20" />
    <div class="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-orange-300/30 blur-3xl"></div>
  </div>

  <div class="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
    <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/80 border border-orange-100 rounded-full shadow-sm mb-6">
      <div class="w-3.5 h-3.5 rounded-full bg-green-500"></div>
      <span class="text-xs font-bold text-slate-700">Plataforma PAU #1 de España</span>
    </div>

    <h1 class="font-display font-bold text-slate-900 mb-4 leading-tight" style="font-size:clamp(2rem,7vw,2.8rem);">
      Domina la <span class="text-gradient-orange">Selectividad</span>
    </h1>
    <p class="text-slate-600 text-sm leading-relaxed mb-8 max-w-xs">
      5.000+ exámenes, calculadora de notas y resolutor con IA para tu PAU.
    </p>

    <div class="flex gap-3 mb-10">
      <a href="/examen" class="flex items-center gap-1.5 px-5 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-300/40 text-sm cursor-pointer hover:bg-orange-700 transition-colors" style="border-bottom:3px solid #9a3412;">
        Empezar gratis <ArrowRight size={14} />
      </a>
      <a href="/resolutor" class="px-5 py-3 bg-white text-orange-700 font-bold rounded-xl border-2 border-orange-200 text-sm cursor-pointer hover:border-orange-400 transition-colors">
        Resolutor
      </a>
    </div>

    <!-- Mini map -->
    <div class="relative w-full max-w-xs opacity-70 -mb-4">
      <img src={spain} alt="Mapa de España" class="w-full object-contain" style="filter: drop-shadow(0 8px 24px rgba(234,88,12,0.3));" />
    </div>
  </div>
</section>

<style>
  /* ── Gradient text ── */
  :global(.text-gradient-orange) {
    background: linear-gradient(135deg, #EA580C 0%, #f97316 60%, #fb923c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Legacy gradient alias ── */
  :global(.text-gradient) {
    background: linear-gradient(135deg, #EA580C 0%, #fb923c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Fade-up entrance ── */
  .hero-fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .hero-fade-up.show {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Float cards entrance ── */
  .float-card {
    opacity: 0;
    transform: translateX(-16px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .float-card:nth-child(3),
  .float-card:nth-child(4) {
    transform: translateX(16px);
  }
  .float-card.mounted-in {
    opacity: 1;
    transform: translateX(0);
    animation: floatUpDown 5s ease-in-out infinite;
  }
  .float-card:nth-child(2).mounted-in { animation-delay: 1.2s; }
  .float-card:nth-child(3).mounted-in { animation-delay: 0.6s; }
  .float-card:nth-child(4).mounted-in { animation-delay: 1.8s; }

  @keyframes floatUpDown {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }

  /* ── Spain map ── */
  .spain-float {
    animation: spainBob 5s ease-in-out infinite;
  }
  @keyframes spainBob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  .spain-glow {
    animation: glowPulse 4s ease-in-out infinite;
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50%       { opacity: 1; transform: scale(1.1); }
  }

  /* ── Progress bar animation ── */
  .progress-bar {
    animation: fillBar 1.5s ease-out 0.8s both;
  }
  @keyframes fillBar {
    from { width: 0%; }
    to   { width: 100%; }
  }

  /* ── Blob animations ── */
  .hero-blob-1 { animation: blobDrift1 14s ease-in-out infinite; }
  .hero-blob-2 { animation: blobDrift2 18s ease-in-out infinite; }
  @keyframes blobDrift1 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50%       { transform: translate(50px, 40px) scale(1.1); }
  }
  @keyframes blobDrift2 {
    0%, 100% { transform: translate(0,0) scale(1); }
    50%       { transform: translate(-40px,-30px) scale(1.08); }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .float-card, .spain-float, .spain-glow, .hero-blob-1, .hero-blob-2, .progress-bar { animation: none; }
    .float-card.mounted-in { opacity: 1; transform: none; }
    .hero-fade-up { transition: none; }
    .progress-bar { width: 100%; }
  }
</style>
