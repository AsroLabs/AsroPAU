<script lang="ts">
  import {
    BookIcon,
    CalculatorIcon,
    HouseIcon,
    Sigma,
    X,
  } from "@lucide/svelte";
  import { page } from "$app/stores";

  let { isOpen = $bindable(false) }: { isOpen?: boolean } = $props();

  function close() {
    isOpen = false;
  }

  const navLinks = [{ label: "Inicio", href: "/", icon: HouseIcon }];

  const recursos = [
    { label: "Exámenes", href: "/examen", icon: BookIcon },
    { label: "Resolutor", href: "/resolutor", icon: Sigma },
    { label: "Calculadora", href: "/media", icon: CalculatorIcon },
  ];

  function isActive(href: string) {
    return $page.url.pathname === href;
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
    onclick={close}
    role="presentation"
  ></div>

  <!-- Drawer -->
  <div
    class="fixed right-0 top-0 bottom-0 w-72 z-50 md:hidden flex flex-col overflow-hidden"
    style="background: #431407; border-left: 2px solid rgba(234,88,12,0.2);"
    role="dialog"
    aria-modal="true"
    aria-label="Menú de navegación"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-5 py-4 border-b"
      style="border-color: rgba(234,88,12,0.2);"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center"
          style="background: linear-gradient(135deg, #EA580C, #f97316); border-bottom: 2px solid #9a3412;"
        >
          <span class="text-white font-extrabold text-sm">A</span>
        </div>
        <span class="text-white font-extrabold text-base tracking-tight"
          >AsroPAU</span
        >
      </div>
      <button
        onclick={close}
        class="w-8 h-8 flex items-center justify-center rounded-lg text-orange-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Cerrar menú"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>

    <!-- Nav content -->
    <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      <!-- Main links -->
      <div>
        {#each navLinks as link}
          {@const Icon = link.icon}
          <a
            href={link.href}
            onclick={close}
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer mb-1"
            style={isActive(link.href)
              ? "background: rgba(234,88,12,0.25); color: white; border-left: 3px solid #fb923c;"
              : "color: rgba(253,186,116,0.8);"}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            <Icon size={16} />
            {link.label}
          </a>
        {/each}
      </div>

      <!-- Recursos section -->
      <div>
        <p
          class="text-xs font-bold uppercase tracking-widest px-4 mb-3"
          style="color: rgba(249,115,22,0.6);"
        >
          Recursos
        </p>
        {#each recursos as link}
          {@const Icon = link.icon}
          <a
            href={link.href}
            onclick={close}
            class="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer mb-1"
            style={isActive(link.href)
              ? "background: rgba(234,88,12,0.25); color: white; border-left: 3px solid #fb923c;"
              : "color: rgba(253,186,116,0.8);"}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            <Icon size={16} />
            {link.label}
          </a>
        {/each}
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-5 border-t" style="border-color: rgba(234,88,12,0.15);">
      <a
        href="/resolutor"
        onclick={close}
        class="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-150 cursor-pointer"
        style="background: #EA580C; border-bottom: 3px solid #9a3412;"
      >
        <Sigma size={15} />
        Abrir Resolutor
      </a>
    </div>
  </div>
{/if}
