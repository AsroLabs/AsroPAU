<script lang="ts">
    import { UserRound } from "@lucide/svelte";
    import { AppBar } from "@skeletonlabs/skeleton-svelte";
</script>

<AppBar class="bg-white shadow-md sticky z-50 opacity-95">
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
