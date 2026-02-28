<script lang="ts">
    import { Calculator } from "@lucide/svelte";
    import DatosAcademicos from "./components/FormularioNotas.svelte";
    import ResultadosCalificacion from "./components/ResultadosCalificacion.svelte";
    import Universidades from "./components/Universidades.svelte";

    // State
    let bachGrade = $state(0);

    // Fase de Acceso - 4 asignaturas fijas
    let accesoLengua = $state(0.0);
    let accesoHistoriaFilosofia = $state(0.0);
    let accesoIngles = $state(0.0);
    let accesoTroncal = $state("");
    let accesoTroncalGrade = $state(0.0);

    // Fase de Admisión - 4 asignaturas seleccionables
    let admisionAsignaturas = $state([
        { name: "", grade: 0.0, weight: 0.1 },
        { name: "", grade: 0.0, weight: 0.1 },
        { name: "", grade: 0.0, weight: 0.1 },
        { name: "", grade: 0.0, weight: 0.1 },
    ]);

    let searchQuery = $state("");

    // Derived
    let bachPart = $derived(bachGrade * 0.6);
    let accesoPart = $derived(
        ((accesoLengua +
            accesoHistoriaFilosofia +
            accesoIngles +
            accesoTroncalGrade) /
            4) *
            0.4,
    );
    
    // Calcula la media ponderada de las 4 asignaturas de admisión
    let admisionMediaPonderada = $derived.by(() => {
        const totalWeight = admisionAsignaturas.reduce((acc, a) => acc + (a.grade > 0 ? a.weight : 0), 0);
        const totalPonderado = admisionAsignaturas.reduce((acc, a) => acc + (a.grade * a.weight), 0);
        
        if (totalWeight === 0) return 0;
        return totalPonderado / totalWeight;
    });
    
    // Obtiene las dos mejores notas de admisión SIN ponderar
    let admisionPart = $derived.by(() => {
        // Filtrar solo asignaturas con notas > 0
        const conNotas = admisionAsignaturas.filter(a => a.grade > 0);
        
        if (conNotas.length === 0) return 0;
        
        // Ordenar de mayor a menor por nota (SIN ponderar)
        const ordenadas = conNotas.sort((a, b) => b.grade - a.grade);
        
        // Tomar las 2 mejores (o menos si hay pocas)
        const mejores = ordenadas.slice(0, 2);
        
        // Calcular media de las 2 mejores notas
        const suma = mejores.reduce((acc, n) => acc + n.grade, 0);
        const media = suma / mejores.length;
        
        // Aplicar 0.4 a la media
        return media * 0.4;
    });
    
    let totalGrade = $derived(bachPart + accesoPart + admisionPart);

</script>

<main class="min-h-screen bg-[#f6f6f8] text-slate-800">
    <!-- Navigation -->
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div
            class="max-w-360 mx-auto px-6 h-16 flex items-center justify-between"
        >
            <div class="flex items-center gap-2">
                <div class="bg-[#2b6cee] p-1.5 rounded-lg text-white">
                    <Calculator size={20} />
                </div>
                <h1 class="text-xl font-bold tracking-tight text-slate-900">
                    EduGrade<span class="text-[#2b6cee]">Pro</span>
                </h1>
            </div>
            <div class="flex items-center gap-6 text-sm font-medium">
                <a href="/" class="hover:text-[#2b6cee] transition-colors"
                    >Notas de Corte 2024</a
                >
                <a href="/" class="hover:text-[#2b6cee] transition-colors"
                    >Ponderaciones</a
                >
                <button
                    class="bg-[#2b6cee]/10 text-[#2b6cee] px-4 py-2 rounded-lg hover:bg-[#2b6cee] hover:text-white transition-all"
                >
                    Guardar Resultados
                </button>
            </div>
        </div>
    </nav>

    <main class="max-w-360 mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Column: Inputs -->
            <aside class="lg:col-span-5 space-y-6">
                <DatosAcademicos
                    bind:bachGrade
                    bind:accesoLengua
                    bind:accesoHistoriaFilosofia
                    bind:accesoIngles
                    bind:accesoTroncal
                    bind:accesoTroncalGrade
                    bind:admisionAsignaturas
                />
            </aside>

            <!-- Right Column: Results -->
            <div class="lg:col-span-7 space-y-6">
                <!-- Result Hero -->
                <ResultadosCalificacion
                    {totalGrade}
                    {bachPart}
                    {accesoPart}
                    {admisionPart}
                />

                <!-- Comparison List -->
                <Universidades {totalGrade} bind:searchQuery />

                <!-- Map/Location Shortcut -->
            </div>
        </div>
    </main>

    <footer class="mt-12 py-8 border-t border-slate-200 bg-white">
        <div class="max-w-360 mx-auto px-6 text-center">
            <p class="text-sm text-slate-400">
                © 2024 EduGrade Pro. Datos actualizados con las notas de corte
                del curso 2023/24.
            </p>
            <div class="flex justify-center gap-6 mt-4">
                <a
                    href="/"
                    class="text-xs text-slate-500 hover:text-[#2b6cee] transition-colors"
                    >Aviso Legal</a
                >
                <a
                    href="/"
                    class="text-xs text-slate-500 hover:text-[#2b6cee] transition-colors"
                    >Política de Privacidad</a
                >
                <a
                    href="/"
                    class="text-xs text-slate-500 hover:text-[#2b6cee] transition-colors"
                    >Contacto</a
                >
            </div>
        </div>
    </footer>
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
