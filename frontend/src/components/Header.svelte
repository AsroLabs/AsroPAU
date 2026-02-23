<script lang="ts">
    import { UserRound, Menu, X } from "@lucide/svelte";
    import { AppBar } from "@skeletonlabs/skeleton-svelte";

    let mobileMenuOpen = false;

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }
</script>

<!-- DESKTOP HEADER -->
<AppBar class="hidden md:block bg-white fixed shadow-md z-50 opacity-95 py-2 w-full">
    <AppBar.Toolbar class="grid-cols-[auto_auto_auto] px-30">
        <AppBar.Headline class="flex items-center *:mx-2">
            <div
                class="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center"
            >
                <span class="text-white font-bold text-lg">A</span>
            </div>
            <span class="text-xl font-bold text-[#1E293B]">AsroPAU</span>
        </AppBar.Headline>
        <div class="group relative inline-block">
            <button class="py-2 px-4 rounded focus:outline-none"> Menú </button>
            <button
                class="hidden group-hover:block hover:block group-focus:block absolute bg-white shadow-md rounded w-40 z-10"
            >
                <a
                    href="#"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Link 1</a
                >
                <a
                    href="#"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Link 2</a
                >
                <a
                    href="#"
                    class="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >Link 3</a
                >
            </button>
        </div>
        <AppBar.Trail>
            <button type="button" class="px-4 transition-opacity duration-300"
                >Registrarse</button
            >

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
<div class="max-md:flex hidden bg-white fixed shadow-md z-50 opacity-95 w-full items-center justify-between px-6 py-4">
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
        on:click={toggleMobileMenu}
        class="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Toggle menu"
    >
        {#if mobileMenuOpen}
            <X size={24} class="text-[#1E293B]" />
        {:else}
            <Menu size={24} class="text-[#1E293B]" />
        {/if}
    </button>
</div>

<!-- MOBILE SIDEBAR -->
{#if mobileMenuOpen}
    <div
        class="max-md:fixed hidden md:hidden inset-0 bg-black/50 z-40 top-14"
        on:click={() => (mobileMenuOpen = false)}
        role="presentation"
    />
    <div
        class="max-md:fixed hidden md:hidden right-0 top-14 bg-white w-64 z-40 shadow-lg max-h-[calc(100vh-56px)] overflow-y-auto"
    >
        <nav class="flex flex-col">
            <a
                href="#"
                class="block px-6 py-4 text-[#1E293B] hover:bg-gray-100 border-b border-gray-100"
                on:click={() => (mobileMenuOpen = false)}
            >
                Link 1
            </a>
            <a
                href="#"
                class="block px-6 py-4 text-[#1E293B] hover:bg-gray-100 border-b border-gray-100"
                on:click={() => (mobileMenuOpen = false)}
            >
                Link 2
            </a>
            <a
                href="#"
                class="block px-6 py-4 text-[#1E293B] hover:bg-gray-100 border-b border-gray-100"
                on:click={() => (mobileMenuOpen = false)}
            >
                Link 3
            </a>
            <div class="px-6 py-4 space-y-3 border-t border-gray-100">
                <button
                    type="button"
                    class="w-full px-4 py-2 text-[#1E293B] hover:bg-gray-100 rounded transition-colors text-left"
                    on:click={() => (mobileMenuOpen = false)}
                >
                    Registrarse
                </button>
                <button
                    type="button"
                    class="w-full btn bg-blue-400 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                    on:click={() => (mobileMenuOpen = false)}
                >
                    <span>Iniciar sesión</span>
                    <UserRound size={18} />
                </button>
            </div>
        </nav>
    </div>
{/if}
