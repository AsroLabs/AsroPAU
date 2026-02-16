<script lang="ts">
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import exam1 from "$lib/assets/exam1.png";
    import exam2 from "$lib/assets/exam2.png";
    import exam3 from "$lib/assets/exam3.png";
    import calculator from "$lib/assets/calculator.svg";
</script>

<Tabs class="flex items-center" defaultValue="examenes">
    <Tabs.List class="max-w-3xl mx-auto mt-20">
        <Tabs.Trigger class="flex-1" value="examenes">Examenes</Tabs.Trigger>
        <Tabs.Trigger class="flex-1" value="calculadora"
            >Calculadora</Tabs.Trigger
        >
        <Tabs.Trigger class="flex-1" value="creadorIA">Creador IA</Tabs.Trigger>
        <Tabs.Indicator />
    </Tabs.List>

    <Tabs.Content
        class="flex max-w-10xl mx-auto justify-between items-center"
        value="examenes"
    >
        <div class="text-balance">
            <h1 class="text-2xl font-extrabold text-[#1E293B] mb-4">
                Acceso total a exámenes oficiales
            </h1>
            <p class="text-lg ">
                Acceso ilimitado a todos los PDF de exámenes pasados y
                soluciones oficiales de todas las comunidades autónomas
            </p>
        </div>

        <div
            class="relative w-full h-100 *:transition-transform *:absolute *:object-cover *:h-3/5 flex items-center "
        >
            <img
                src={exam1}
                alt="Examen 1"
                class="right-20 rotate-12 hover:-translate-y-10 hover:translate-10"
            />
            <img
                src={exam2}
                alt="Examen 2"
                class="right-30 hover:-translate-y-10"
            />
            <img
                src={exam3}
                alt="Examen 3"
                class="right-40 -rotate-12 hover:-translate-y-10 hover:-translate-10"
            />
        </div>
    </Tabs.Content>
    <Tabs.Content
        class="flex max-w-6xl mx-auto justify-between items-center"
        value="calculadora"
    >
        <div class="text-balance">
            <h1 class="text-2xl font-extrabold text-[#1E293B] mb-4">
                Calcula tu nota media de selectividad
            </h1>
            <p class="text-lg text-balance">
                Calcula tu nota media de selectividad introduciendo tus notas
                de bachillerato y eligiendo las asignaturas que has cursado
            </p>
        </div>

        <div
            class="w-full flex justify-end *:transition-transform  *:object-cover"
        >
            <img
                src={calculator}
                alt="Calculadora de notas"
                class="w-100 transition-transform hover:-translate-y-5"
            />
        </div>
    </Tabs.Content>
    <Tabs.Content
        class="flex max-w-10xl mx-auto justify-between items-center px-30"
        value="creadorIA"
    >
        <div class="text-balance">
            <h1 class="text-2xl font-extrabold text-[#1E293B] mb-4">
                Genera exámenes gracias a la IA
            </h1>
            <p class="text-lg text-balance">
                Crea nuevos exámenes generados con IA junto a sus soluciones
            </p>
        </div>

        <div class="overflow-hidden shadow-2xl">
            <img
                src="../lib/assets/exam1.png"
                alt="Estudio"
                class="w-50 h-100 object-cover"
            />
        </div>
    </Tabs.Content>
</Tabs>
