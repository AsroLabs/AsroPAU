<script lang="ts">
    import {
        AcademicForm,
        GradeResults,
        UniversityComparator,
        NextSteps,
        calculateNotaAcceso,
        calculateAdmisionPart,
    } from "$features/media";

    let notaBachiller = $state(0);
    
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

    // notaAcceso = (0.6 * mediaBachiller) + (0.4 * mediaFaseAcceso)
    let notaAcceso = $derived(
        calculateNotaAcceso(
            notaBachiller,
            accesoLengua,
            accesoHistoriaFilosofia,
            accesoIngles,
            accesoTroncalGrade
        )
    );
    
    // Obtiene las dos mejores aportaciones ponderadas de admisión
    let admisionPart = $derived(
        calculateAdmisionPart(admisionAsignaturas)
    );
    
    // notaAdmision = notaAcceso + mejorAportacion1 + mejorAportacion2
    let totalGrade = $derived(notaAcceso + admisionPart);

</script>

<main class="min-h-screen bg-[#f6f6f8] text-slate-800">
    <!-- Navigation -->
    <!-- <Header fixed={false}/> -->

    <main class="max-w-360 mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Column: Inputs -->
            <aside class="lg:col-span-5 space-y-6">
                <AcademicForm
                    bind:notaBachiller
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
                <GradeResults
                    {totalGrade}
                    {notaAcceso}
                    {admisionPart}
                />

                <!-- Comparison List -->
                <UniversityComparator {totalGrade} bind:searchQuery />

                <!-- Next Steps -->
                <NextSteps />
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
