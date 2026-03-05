<script lang="ts">
    import { UserRound, Menu, X } from "@lucide/svelte";
    import { AppBar } from "@skeletonlabs/skeleton-svelte";
    import Sidebar from "./Sidebar.svelte";

    interface Props {
        fixed?: boolean;
    }

    let mobileMenuOpen = $state(false);

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    const { fixed = true }: Props = $props();
</script>

<!-- DESKTOP HEADER -->
<AppBar
    class="{fixed
        ? 'fixed'
        : 'relative'} hidden md:block bg-white fixed shadow-md z-50 opacity-95 py-2 w-full"
>
    <AppBar.Toolbar class="grid-cols-[auto_auto_auto] px-30">
        <a href="/">
            <AppBar.Headline class="flex items-center *:mx-2">
                <div
                    class="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center"
                >
                    <span class="text-white font-bold text-lg">A</span>
                </div>
                <span class="text-xl font-bold text-[#1E293B]">AsroPAU</span>
            </AppBar.Headline>
        </a>
        <div class="group relative inline-block">
            <button class="py-2 px-4 rounded focus:outline-none"> Menú </button>
            <button
                class="hidden group-hover:block hover:block group-focus:block absolute bg-white shadow-md rounded w-40 z-10"
            >
                <a
                    href="examen"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Exámenes</a
                >
                <a
                    href="/media"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Calculadora</a
                >
                <a
                    href="examenes-ia"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Examenes IA</a
                >
            </button>
        </div>
        <AppBar.Trail>
            <button
                type="button"
                class="btn bg-blue-400 hover:bg-blue-[#2563EB]"
            >
                <span>Iniciar sesión</span>
                <UserRound size={18} />
            </button>
        </AppBar.Trail>
    </AppBar.Toolbar>
</AppBar>

<!-- MOBILE HEADER -->
<header
    class=" {fixed
        ? 'fixed'
        : 'relative'} max-md:flex hidden bg-white fixed shadow-md z-50 opacity-95 w-full items-center justify-between px-6 py-4"
>
    <!-- Logo and Title -->
    <div class="flex items-center gap-2">
        <div
            class="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center"
        >
            <span class="text-white font-bold text-lg">A</span>
        </div>
        <span class="text-lg font-bold text-[#1E293B]">AsroPAU</span>
    </div>

    <!-- Hamburger Button -->
    <button
        onclick={toggleMobileMenu}
        class="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Toggle menu"
    >
        {#if mobileMenuOpen}
            <X size={24} class="text-[#1E293B]" />
        {:else}
            <Menu size={24} class="text-[#1E293B]" />
        {/if}
    </button>
</header>

<!-- MOBILE SIDEBAR -->
<Sidebar bind:isOpen={mobileMenuOpen} />
