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
    // notaAcceso = (0.6 * mediaBachiller) + (0.4 * mediaFaseAcceso)
    let notaAcceso = $derived(
        (bachGrade * 0.6) +
        (((accesoLengua +
            accesoHistoriaFilosofia +
            accesoIngles +
            accesoTroncalGrade) /
            4) *
            0.4)
    );
    
    // Obtiene las dos mejores aportaciones ponderadas de admisión
    // aportacion = notaEspecifica * ponderacion
    let admisionPart = $derived.by(() => {
        // Calcular aportación ponderada para cada asignatura
        const aportaciones = admisionAsignaturas
            .filter(a => a.grade > 0)
            .map(a => ({
                aportacion: a.grade * a.weight,
                nombre: a.name,
                nota: a.grade,
                ponderacion: a.weight
            }))
            .sort((a, b) => b.aportacion - a.aportacion);
        
        if (aportaciones.length === 0) return 0;
        
        // Tomar las 2 mejores aportaciones
        const mejores = aportaciones.slice(0, 2);
        
        // Suma de las 2 mejores aportaciones
        return mejores.reduce((acc, a) => acc + a.aportacion, 0);
    });
    
    // notaAdmision = notaAcceso + mejorAportacion1 + mejorAportacion2
    let totalGrade = $derived(notaAcceso + admisionPart);
    
    // Para mostrar en los resultados
    let bachPart = $derived(bachGrade * 0.6);
    let accesoPart = $derived(
        ((accesoLengua +
            accesoHistoriaFilosofia +
            accesoIngles +
            accesoTroncalGrade) /
            4) *
            0.4
    );

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
                    {notaAcceso}
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
