<script>
    import spain from "$lib/assets/spain.svg";
</script>

<section class="bg-linear-to-r from-orange-600 to-orange-400 py-24 px-6">
    <div class="max-w-7xl mx-auto">
        <div class="flex gap-16 items-center">
            <!-- Contenido de texto -->
            <div class="flex-1 text-white">
                <h2 class="text-4xl font-extrabold mb-4">
                    Toda España a un clic
                </h2>
                <p class="text-lg mb-8 leading-relaxed text-blue-100 max-w-md">
                    Hemos recopilado las pruebas de todas las comunidades
                    autónomas para que no te falte material de práctica, sin
                    importar donde vivas.
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
            <div class="flex-1 max-md:hidden flex justify-center">
                <img
                    src={spain}
                    alt="Mapa de España"
                    class="w-full max-w-md h-auto object-contain filter drop-shadow-2xl transition-transform duration-200 hover:-translate-y-2.5"
                />
            </div>
        </div>
    </div>
</section>
