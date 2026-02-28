<script lang="ts">
  import { UserRound, Menu, X, BookOpen, Calculator, Sparkles, ChevronDown } from "@lucide/svelte";
  import Sidebar from "./Sidebar.svelte";

  interface Props {
    fixed?: boolean;
  }

  let mobileMenuOpen = $state(false);
  let menuOpen = $state(false);
  let scrolled = $state(false);

  const { fixed = true }: Props = $props();

  $effect(() => {
    const onScroll = () => { scrolled = window.scrollY > 10; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  const navLinks = [
    { href: "/examen",      label: "Exámenes",    Icon: BookOpen },
    { href: "/media",       label: "Calculadora", Icon: Calculator },
    { href: "/examenes-ia", label: "Exámenes IA", Icon: Sparkles },
  ];
</script>

<!-- DESKTOP HEADER -->
<header
  class="
    hidden md:flex items-center justify-between
    {fixed ? 'fixed' : 'relative'}
    top-0 left-0 right-0 z-50
    px-8 py-3
    transition-all duration-300
    {scrolled
      ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-white/50'
      : 'bg-white/60 backdrop-blur-md border-b border-transparent'}
  "
>
  <!-- Logo -->
  <a href="/" class="flex items-center gap-2.5 group">
    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
      <span class="text-white font-bold text-lg leading-none">A</span>
    </div>
    <span class="text-xl font-bold text-slate-800 tracking-tight">AsroPAU</span>
  </a>

  <!-- Nav links -->
  <nav class="flex items-center gap-1">
    {#each navLinks as link}
      <a
        href={link.href}
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150 cursor-pointer"
      >
        <link.Icon size={15} class="opacity-70" />
        {link.label}
      </a>
    {/each}
  </nav>

  <!-- CTA -->
  <div class="flex items-center gap-3">
    <a
      href="#"
      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-full shadow-md shadow-blue-200 transition-all duration-200 hover:shadow-blue-300 hover:-translate-y-0.5 cursor-pointer"
    >
      <UserRound size={15} />
      Iniciar sesión
    </a>
  </div>
</header>

<!-- MOBILE HEADER -->
<header
  class="
    max-md:flex hidden fixed z-50 top-0 left-0 right-0
    items-center justify-between px-5 py-3.5
    transition-all duration-300
    {scrolled
      ? 'bg-white/85 backdrop-blur-xl shadow-md'
      : 'bg-white/70 backdrop-blur-md'}
    border-b border-white/50
  "
>
  <a href="/" class="flex items-center gap-2 group">
    <div class="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-500 rounded-md flex items-center justify-center shadow-sm">
      <span class="text-white font-bold text-sm">A</span>
    </div>
    <span class="text-lg font-bold text-slate-800">AsroPAU</span>
  </a>

  <button
    onclick={toggleMobileMenu}
    class="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
    aria-label="Toggle menu"
  >
    {#if mobileMenuOpen}
      <X size={22} class="text-slate-700" />
    {:else}
      <Menu size={22} class="text-slate-700" />
    {/if}
  </button>
</header>

<!-- MOBILE SIDEBAR -->
<Sidebar bind:isOpen={mobileMenuOpen} />
