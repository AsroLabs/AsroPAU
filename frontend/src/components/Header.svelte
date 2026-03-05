<script lang="ts">
  import { UserRound, Menu, X, BookOpen, Calculator, Sparkles, FlaskConical } from "@lucide/svelte";
  import Sidebar from "./Sidebar.svelte";
  import { page } from "$app/stores";

  interface Props {
    fixed?: boolean;
  }

  let mobileMenuOpen = $state(false);
  let scrolled = $state(false);

  const { fixed = true }: Props = $props();

  $effect(() => {
    const onScroll = () => { scrolled = window.scrollY > 20; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  const navLinks = [
    { href: "/examen",      label: "Exámenes",    Icon: BookOpen },
    { href: "/media",       label: "Calculadora", Icon: Calculator },
    { href: "/examenes-ia", label: "Exámenes IA", Icon: Sparkles },
    { href: "/resolutor",   label: "Resolutor",   Icon: FlaskConical },
  ];
</script>

<!-- DESKTOP HEADER — floating pill -->
<header
  class="
    hidden md:flex items-center justify-between
    {fixed ? 'fixed' : 'relative'}
    top-0 left-0 right-0 z-50
    transition-all duration-300
    {scrolled ? 'pt-2 px-4' : 'pt-4 px-6'}
  "
>
  <div
    class="
      flex items-center justify-between w-full
      rounded-2xl px-5 py-2.5
      transition-all duration-300
      {scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-orange-100/60 border border-orange-100/80'
        : 'bg-white/80 backdrop-blur-md shadow-md shadow-orange-100/40 border border-white/60'}
    "
  >
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2.5 group cursor-pointer">
      <div class="w-9 h-9 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-300/50 transition-all duration-200 group-hover:shadow-orange-400/60 group-hover:-translate-y-0.5" style="border: 2.5px solid #f97316;">
        <span class="font-display font-bold text-white text-base leading-none">A</span>
      </div>
      <span class="font-display font-bold text-slate-800 text-lg tracking-tight">AsroPAU</span>
    </a>

    <!-- Nav links -->
    <nav class="flex items-center gap-1">
      {#each navLinks as link}
        {@const isActive = $page.url.pathname.startsWith(link.href)}
        <a
          href={link.href}
          class="
            relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
            transition-all duration-200 cursor-pointer
            {isActive
              ? 'bg-orange-600 text-white shadow-md shadow-orange-300/50'
              : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50'}
          "
        >
          <link.Icon size={14} aria-hidden="true" />
          {link.label}
          {#if link.href === '/examenes-ia'}
            <span class="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full leading-none">NEW</span>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- CTA -->
    <a
      href="/login"
      class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-orange-400/50 cursor-pointer"
      style="border-bottom: 3px solid #9a3412;"
    >
      <UserRound size={14} aria-hidden="true" />
      Iniciar sesión
    </a>
  </div>
</header>

<!-- MOBILE HEADER -->
<header
  class="
    max-md:flex hidden fixed z-50 top-0 left-0 right-0
    items-center justify-between px-4 py-3
    transition-all duration-300
    {scrolled
      ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-orange-100/60'
      : 'bg-white/80 backdrop-blur-md border-b border-white/60'}
  "
>
  <a href="/" class="flex items-center gap-2 cursor-pointer">
    <div class="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-sm" style="border: 2px solid #f97316;">
      <span class="font-display font-bold text-white text-sm">A</span>
    </div>
    <span class="font-display font-bold text-slate-800 text-base">AsroPAU</span>
  </a>

  <button
    onclick={() => mobileMenuOpen = !mobileMenuOpen}
    class="p-2 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    aria-label="Toggle menu"
  >
    {#if mobileMenuOpen}
      <X size={22} class="text-slate-700" aria-hidden="true" />
    {:else}
      <Menu size={22} class="text-slate-700" aria-hidden="true" />
    {/if}
  </button>
</header>

<!-- MOBILE SIDEBAR -->
<Sidebar bind:isOpen={mobileMenuOpen} />
