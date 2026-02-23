<script>
    import Header from "../components/Header.svelte";
    import Hero from "../components/Hero.svelte";
    import ExamSearch from "../components/ExamSearch.svelte";
    import Features from "../components/Features.svelte";
    import spain from "$lib/assets/spain.svg";
</script>

<main class="min-h-screen flex flex-col">
    <Header />
    <Hero />
    <Features />

    <!-- España Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-500 py-24 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="flex gap-16 items-center">
                <!-- Contenido de texto -->
                <div class="flex-1 text-white">
                    <h2 class="text-4xl font-extrabold mb-4">Toda España a un clic</h2>
                    <p class="text-lg mb-8 leading-relaxed text-blue-100 max-w-md">
                        Hemos recopilado las pruebas de todas las comunidades autónomas para que no te falte material de práctica, sin importar donde vivas.
                    </p>
                    
                    <!-- Comunidades en dos columnas -->
                    <div class="flex gap-12">
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">Madrid</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">Cataluña</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">C. Valenciana</span>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">Andalucía</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">País Vasco</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xl">📍</span>
                                <span class="font-semibold">Galicia</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Imagen de España -->
                <div class="flex-1 flex justify-center">
                    <img 
                        src={spain} 
                        alt="Mapa de España"
                        class="w-full max-w-md h-auto object-contain filter drop-shadow-2xl transition-transform duration-200 hover:-translate-y-2.5"
                    />
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-white border-t border-slate-100 pt-20 pb-10 px-6">
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                <div class="md:col-span-4">
                    <div class="flex items-center gap-2 mb-6">
                        <div
                            class="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center"
                        >
                            <span class="text-white font-bold">A</span>
                        </div>
                        <span class="text-xl font-bold text-[#1E293B]"
                            >AsroPAU</span
                        >
                    </div>
                    <p
                        class="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs"
                    >
                        La plataforma definitiva para el estudiante
                        pre-universitario. Todo lo que necesitas para tu acceso
                        a la universidad.
                    </p>
                    <div class="flex items-center gap-4 text-slate-400">
                        <a
                            href=":www.facebook.com"
                            class="hover:text-[#2563EB] transition-colors"
                            ><span class="material-icons-round">facebook</span
                            ></a
                        >
                        <a
                            href=":www.twitter.com"
                            class="hover:text-[#2563EB] transition-colors"
                            ><span class="material-icons-round"
                                >alternate_email</span
                            ></a
                        >
                        <a
                            href=":www.instagram.com"
                            class="hover:text-[#2563EB] transition-colors"
                            ><span class="material-icons-round">language</span
                            ></a
                        >
                    </div>
                </div>

                <div class="md:col-span-2">
                    <h5
                        class="font-bold text-sm text-[#1E293B] uppercase tracking-wider mb-6"
                    >
                        Recursos
                    </h5>
                    <ul class="space-y-4 text-sm text-slate-500">
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]"
                                >Archivo de Exámenes</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]"
                                >Calculadora de Notas</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]">Corrector IA</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]">Notas de Corte</a
                            >
                        </li>
                    </ul>
                </div>

                <div class="md:col-span-3">
                    <h5
                        class="font-bold text-sm text-[#1E293B] uppercase tracking-wider mb-6"
                    >
                        Comunidad
                    </h5>
                    <ul class="space-y-4 text-sm text-slate-500">
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]"
                                >Blog de Selectividad</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]"
                                >Guía de Universidades</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]">Foro de Dudas</a
                            >
                        </li>
                        <li>
                            <a
                                href="localhost:5173"
                                class="hover:text-[#2563EB]">Colaboradores</a
                            >
                        </li>
                    </ul>
                </div>

                <div class="md:col-span-3">
                    <div
                        class="bg-slate-50 border border-slate-100 p-6 rounded-2xl"
                    >
                        <span
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4"
                            >Publicidad</span
                        >
                        <div
                            class="aspect-square bg-slate-200/50 rounded-xl flex items-center justify-center text-slate-400 text-xs"
                        >
                            Ad Slot
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="pt-8 border-t border-slate-100 flex flex-col md:row justify-between items-center gap-4 text-[11px] text-slate-400 font-medium"
            >
                <p>© 2024 AsroPAU. Todos los derechos reservados.</p>
                <div class="flex gap-6 uppercase tracking-widest">
                    <a href="localhost:5173" class="hover:text-[#2563EB]"
                        >Términos</a
                    >
                    <a href="localhost:5173" class="hover:text-[#2563EB]"
                        >Privacidad</a
                    >
                    <a href="localhost:5173" class="hover:text-[#2563EB]"
                        >Cookies</a
                    >
                    <a href="localhost:5173" class="hover:text-[#2563EB]"
                        >Contacto</a
                    >
                </div>
            </div>
        </div>
    </footer>
</main>
