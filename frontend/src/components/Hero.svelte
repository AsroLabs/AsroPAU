<script lang="ts">
  import { ChevronsDownIcon } from "@lucide/svelte";
  import grid from "$lib/assets/grid.png";
  import spain from "$lib/assets/spain.svg";
  import hat from "$lib/assets/hat.svg";
  import printer from "$lib/assets/printer.svg";
  import calculator from "$lib/assets/calculator.svg";
  import exams from "$lib/assets/exams.svg";
  import { onMount } from "svelte";

  let mounted = $state(false);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let canvasEl: HTMLCanvasElement;

  onMount(() => {
    mounted = true;
    initParticles();
  });

  function handleMouseMove(e: MouseEvent) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  }

  function initParticles() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const colors = ["#0EA5E9", "#F97316", "#38BDF8", "#7C3AED", "#06B6D4"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvasEl.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvasEl.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#0EA5E9";
            ctx.globalAlpha = (1 - dist / 120) * 0.12;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };
    animate();
  }
</script>

<!-- DESKTOP HERO SECTION -->
<section
  class="hero-desktop hidden md:relative md:block w-full h-screen pt-20 pb-16 text-center overflow-hidden"
  role="presentation"
  onmousemove={handleMouseMove}
>
  <!-- Canvas particle background -->
  <canvas
    bind:this={canvasEl}
    class="absolute inset-0 w-full h-full pointer-events-none"
    style="z-index: 0;"
  ></canvas>

  <!-- Grid background -->
  <div class="absolute top-0 flex justify-center items-center w-full h-full" style="z-index: 1;">
    <img
      src={grid}
      alt=""
      aria-hidden="true"
      class="inset-0 w-full h-full object-cover opacity-40"
    />
  </div>

  <!-- Animated radial glow blobs -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden" style="z-index: 1;" aria-hidden="true">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <!-- Left title - 3D rotated -->
  <h1
    class="prevent-select hero-title-left ubuntu text-5xl max-xl:text-4xl max-xl:left-[20%] max-lg:left-[10%] mb-4 absolute left-[15%] top-[18%] z-10 rotate-y-55 -rotate-x-[25deg]"
    class:fade-in-left={mounted}
  >
    Supera la <span class="text-gradient">Selectividad </span> <br /> con éxito
  </h1>

  <!-- Right title - 3D rotated -->
  <h1
    class="prevent-select hero-title-right ubuntu text-5xl max-xl:text-4xl max-xl:right-[25%] max-lg:right-[15%] mb-4 absolute right-[22.5%] top-[20%] z-10 -rotate-y-55 -rotate-x-[25deg]"
    class:fade-in-right={mounted}
  >
    Toda la PAU <br /> <span class="text-gradient">centralizada.</span>
  </h1>

  <!-- Central Spain map + floating icons -->
  <div
    class="relative flex justify-center items-center w-full h-screen overflow-hidden"
    style="z-index: 5;"
    style:transform="perspective(1200px) rotateX({mouseY * 0.03}deg) rotateY({mouseX * 0.03}deg)"
  >
    <!-- Floating icon: hat -->
    <img
      src={hat}
      alt="Gorra de graduación"
      class="hero-icon-hat absolute top-[20%] max-xl:top-[25%] max-lg:top-[30%] right-[30%] w-[12vw] aspect-square drop-shadow-2xl cursor-pointer float-anim float-anim-1"
    />

    <!-- Floating icon: printer/AI -->
    <img
      src={printer}
      alt="Generador IA"
      class="hero-icon-printer absolute top-[25%] max-xl:top-[30%] max-lg:top-[35%] left-[27.5%] w-[10vw] aspect-square drop-shadow-2xl cursor-pointer float-anim float-anim-2"
    />

    <!-- Floating icon: exams -->
    <img
      src={exams}
      alt="Exámenes oficiales"
      class="hero-icon-exams absolute bottom-[20%] max-xl:bottom-[25%] max-lg:bottom-[30%] right-[35%] w-[11vw] aspect-square drop-shadow-2xl cursor-pointer float-anim float-anim-3"
    />

    <!-- Floating icon: calculator -->
    <img
      src={calculator}
      alt="Calculadora de notas"
      class="hero-icon-calc absolute bottom-[25%] max-xl:bottom-[30%] max-lg:bottom-[35%] left-[27.5%] w-[9vw] aspect-square drop-shadow-2xl cursor-pointer float-anim float-anim-4"
    />

    <!-- Spain map with 3D glow -->
    <div class="spain-container relative">
      <div class="spain-glow"></div>
      <img
        src={spain}
        alt="Mapa de España"
        class="hero-spain w-2/4 object-contain relative z-10 drop-shadow-2xl spain-pulse"
      />
    </div>
  </div>

  <!-- CTA Buttons row -->
  <div
    class="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4"
    style="z-index: 10;"
    class:fade-in-up={mounted}
  >
    <div class="flex gap-4">
      <a
        href="/examen"
        class="cta-primary cursor-pointer"
      >
        Explorar exámenes
      </a>
      <a
        href="/media"
        class="cta-secondary cursor-pointer"
      >
        Calcular nota
      </a>
    </div>
    <a href="#features" class="mt-2">
      <ChevronsDownIcon class="animate-bounce text-slate-400" size={28} />
    </a>
  </div>
</section>

<!-- MOBILE HERO SECTION -->
<section
  class="hidden max-md:flex w-full min-h-screen relative flex-col items-center justify-between px-6 pt-28 pb-20 overflow-hidden"
>
  <!-- Mobile blobs -->
  <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div class="blob blob-1" style="opacity: 0.4;"></div>
    <div class="blob blob-2" style="opacity: 0.3;"></div>
  </div>
  <div class="absolute inset-0" style="z-index: 0;">
    <img src={grid} alt="" aria-hidden="true" class="w-full h-full object-cover opacity-30" />
  </div>

  <div class="text-center relative z-10">
    <div class="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide">
      Plataforma PAU #1 de España
    </div>
    <h2 class="text-[clamp(2rem,6vw,4rem)] ubuntu mb-4 leading-tight">
      Domina toda la <span class="text-gradient">PAU de España</span>
    </h2>
    <p class="text-[clamp(0.95rem,2vw,1.2rem)] text-slate-500 max-w-sm mx-auto leading-relaxed">
      Acceso a recursos de selectividad de todas las comunidades autónomas en una sola plataforma.
    </p>
    <div class="flex gap-3 justify-center mt-6">
      <a href="/examen" class="cta-primary text-sm cursor-pointer">Ver exámenes</a>
      <a href="/media" class="cta-secondary text-sm cursor-pointer">Calcular nota</a>
    </div>
  </div>

  <div class="absolute opacity-20 -translate-y-1/2 bottom-30 -z-10 w-full flex justify-center">
    <img src={spain} alt="spain" class="w-3/4" />
  </div>

  <a href="#features" class="relative z-10">
    <ChevronsDownIcon class="animate-bounce text-slate-400" size={28} />
  </a>
</section>

<style>
  /* ── Gradient text ── */
  :global(.text-gradient) {
    background: linear-gradient(135deg, #F97316 0%, #EF4444 50%, #F59E0B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Animated entrance ── */
  .fade-in-left {
    animation: slideInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .fade-in-right {
    animation: slideInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
  }
  .fade-in-up {
    animation: slideInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px) rotateY(55deg) rotateX(-25deg); }
    to   { opacity: 1; transform: translateX(0)    rotateY(55deg) rotateX(-25deg); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px) rotateY(-55deg) rotateX(-25deg); }
    to   { opacity: 1; transform: translateX(0)    rotateY(-55deg) rotateX(-25deg); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Floating icons animation ── */
  .float-anim { transition: filter 0.3s ease; }
  .float-anim:hover { filter: drop-shadow(0 8px 24px rgba(14,165,233,0.5)); }
  .float-anim-1 { animation: float1 6s ease-in-out infinite; }
  .float-anim-2 { animation: float2 7s ease-in-out infinite 1s; }
  .float-anim-3 { animation: float3 5.5s ease-in-out infinite 0.5s; }
  .float-anim-4 { animation: float4 6.5s ease-in-out infinite 1.5s; }

  @keyframes float1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-14px) rotate(2deg); }
    66%       { transform: translateY(-6px) rotate(-1.5deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-10px) rotate(-2deg); }
    66%       { transform: translateY(-18px) rotate(1deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(1.5deg); }
  }
  @keyframes float4 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-16px) rotate(-1deg); }
    70%       { transform: translateY(-8px) rotate(2deg); }
  }

  /* ── Spain map pulse + glow ── */
  .spain-container { display: flex; justify-content: center; align-items: center; }
  .spain-glow {
    position: absolute;
    width: 55%;
    height: 55%;
    background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
    animation: glowPulse 4s ease-in-out infinite;
    border-radius: 50%;
    filter: blur(20px);
  }
  .spain-pulse {
    animation: mapPulse 4s ease-in-out infinite;
  }
  @keyframes glowPulse {
    0%, 100% { transform: scale(1);   opacity: 0.6; }
    50%       { transform: scale(1.1); opacity: 1;   }
  }
  @keyframes mapPulse {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(14,165,233,0.3)); }
    50%       { filter: drop-shadow(0 0 30px rgba(14,165,233,0.6)); }
  }

  /* ── Blobs ── */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
    top: -100px; left: -100px;
    animation: blobMove1 12s ease-in-out infinite;
  }
  .blob-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
    bottom: -80px; right: -80px;
    animation: blobMove2 15s ease-in-out infinite;
  }
  .blob-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%);
    top: 40%; left: 50%;
    animation: blobMove3 18s ease-in-out infinite;
  }
  @keyframes blobMove1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(60px, 40px) scale(1.1); }
    66%       { transform: translate(-30px, 60px) scale(0.9); }
  }
  @keyframes blobMove2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%       { transform: translate(-50px, -40px) scale(1.15); }
  }
  @keyframes blobMove3 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50%       { transform: translate(-60%, -40%) scale(1.2); }
  }

  /* ── CTA buttons ── */
  :global(.cta-primary) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.75rem;
    background: linear-gradient(135deg, #2563EB, #0EA5E9);
    color: white;
    font-weight: 600;
    border-radius: 9999px;
    font-size: 0.95rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 20px rgba(37,99,235,0.35);
    text-decoration: none;
  }
  :global(.cta-primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(37,99,235,0.5);
  }
  :global(.cta-secondary) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.75rem;
    background: white;
    color: #1E293B;
    font-weight: 600;
    border-radius: 9999px;
    font-size: 0.95rem;
    border: 1.5px solid #E2E8F0;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    text-decoration: none;
  }
  :global(.cta-secondary:hover) {
    transform: translateY(-2px);
    border-color: #0EA5E9;
    box-shadow: 0 6px 24px rgba(14,165,233,0.2);
  }

  /* ── Prevent text select ── */
  .prevent-select {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .ubuntu { font-family: "Ubuntu-bold", sans-serif; }

  /* ── Responsive breakpoints ── */
  @media (min-width: 1440px) {
    :global(.hero-desktop .hero-title-left)   { font-size: 3rem; left: 15%; top: 18%; }
    :global(.hero-desktop .hero-title-right)  { font-size: 3rem; right: 22.5%; top: 20%; }
    :global(.hero-desktop .hero-icon-hat)     { width: 12vw; top: 20%; right: 30%; }
    :global(.hero-desktop .hero-icon-printer) { width: 10vw; top: 25%; left: 27.5%; }
    :global(.hero-desktop .hero-icon-exams)   { width: 11vw; bottom: 20%; right: 35%; }
    :global(.hero-desktop .hero-icon-calc)    { width: 9vw; bottom: 25%; left: 27.5%; }
    :global(.hero-desktop .hero-spain)        { width: 50%; }
  }
  @media (min-width: 1200px) and (max-width: 1439px) {
    :global(.hero-desktop .hero-title-left)   { font-size: 2.75rem; left: 16%; top: 20%; }
    :global(.hero-desktop .hero-title-right)  { font-size: 2.75rem; right: 24%; top: 22%; }
    :global(.hero-desktop .hero-icon-hat)     { width: 11.5vw; top: 22%; right: 31%; }
    :global(.hero-desktop .hero-icon-printer) { width: 9.5vw; top: 27%; left: 28%; }
    :global(.hero-desktop .hero-icon-exams)   { width: 10.5vw; bottom: 22%; right: 36%; }
    :global(.hero-desktop .hero-icon-calc)    { width: 8.5vw; bottom: 27%; left: 28%; }
    :global(.hero-desktop .hero-spain)        { width: 50%; }
  }
  @media (min-width: 1080px) and (max-width: 1199px) {
    :global(.hero-desktop .hero-title-left)   { font-size: 2.5rem; left: 14%; top: 22%; }
    :global(.hero-desktop .hero-title-right)  { font-size: 2.5rem; right: 20%; top: 24%; }
    :global(.hero-desktop .hero-icon-hat)     { width: 11vw; top: 24%; right: 32%; }
    :global(.hero-desktop .hero-icon-printer) { width: 9vw; top: 29%; left: 29%; }
    :global(.hero-desktop .hero-icon-exams)   { width: 10vw; bottom: 24%; right: 37%; }
    :global(.hero-desktop .hero-icon-calc)    { width: 8vw; bottom: 29%; left: 29%; }
    :global(.hero-desktop .hero-spain)        { width: 48%; }
  }
  @media (min-width: 1024px) and (max-width: 1079px) {
    :global(.hero-desktop .hero-title-left)   { font-size: 2.25rem; left: 12%; top: 24%; }
    :global(.hero-desktop .hero-title-right)  { font-size: 2.25rem; right: 18%; top: 26%; }
    :global(.hero-desktop .hero-icon-hat)     { width: 10.5vw; top: 26%; right: 33%; }
    :global(.hero-desktop .hero-icon-printer) { width: 8.5vw; top: 31%; left: 30%; }
    :global(.hero-desktop .hero-icon-exams)   { width: 9.5vw; bottom: 26%; right: 38%; }
    :global(.hero-desktop .hero-icon-calc)    { width: 7.5vw; bottom: 31%; left: 30%; }
    :global(.hero-desktop .hero-spain)        { width: 46%; }
  }
  @media (min-width: 800px) and (max-width: 1023px) {
    :global(.hero-desktop .hero-title-left)   { font-size: 2rem; left: 8%; top: 26%; }
    :global(.hero-desktop .hero-title-right)  { font-size: 2rem; right: 12%; top: 28%; }
    :global(.hero-desktop .hero-icon-hat)     { width: 10vw; top: 28%; right: 34%; }
    :global(.hero-desktop .hero-icon-printer) { width: 8vw; top: 33%; left: 31%; }
    :global(.hero-desktop .hero-icon-exams)   { width: 9vw; bottom: 28%; right: 39%; }
    :global(.hero-desktop .hero-icon-calc)    { width: 7vw; bottom: 33%; left: 31%; }
    :global(.hero-desktop .hero-spain)        { width: 44%; }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    .float-anim-1, .float-anim-2, .float-anim-3, .float-anim-4,
    .spain-pulse, .spain-glow, .blob-1, .blob-2, .blob-3 {
      animation: none;
    }
  }
</style>
