<section class="max-w-6xl mx-auto px-6 -mt-8 mb-12 relative z-10">
    <div
        class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100"
    >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="flex flex-col gap-2">
                <label
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1"
                    for="comunidadAutonoma"
                    >Comunidad</label
                >
                <select
                    id="comunidadAutonoma"
                    class="bg-slate-50 border-none rounded-lg text-sm text-slate-700 py-3 px-4 focus:ring-2 focus:ring-blue-500"
                >
                    <option>Madrid</option>
                    <option>Cataluña</option>
                    <option>Andalucía</option>
                    <option>C. Valenciana</option>
                </select>
            </div>
            <div class="flex flex-col gap-2">
                <label
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1"
                    for="asignatura"
                    >Asignatura</label
                >
                <select
                    id="asignatura"
                    class="bg-slate-50 border-none rounded-lg text-sm text-slate-700 py-3 px-4 focus:ring-2 focus:ring-blue-500"
                >
                    <option>Matemáticas II</option>
                    <option>Historia de España</option>
                    <option>Lengua y Literatura</option>
                    <option>Inglés</option>
                </select>
            </div>
            <div class="flex flex-col gap-2">
                <label
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1"
                    for="anyo"
                    >Año</label
                >
                <select
                    id="anyo"
                    class="bg-slate-50 border-none rounded-lg text-sm text-slate-700 py-3 px-4 focus:ring-2 focus:ring-blue-500"
                >
                    <option>2024</option>
                    <option>2023</option>
                    <option>2022</option>
                    <option>2021</option>
                </select>
            </div>
            <div class="flex items-end">
                <button
                    class="w-full bg-[#2563EB] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                    Filtrar Exámenes
                </button>
            </div>
        </div>
    </div>
</section>
