<script lang="ts">
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import exams from "$lib/assets/exams.svg";
    import calculator from "$lib/assets/calculator.svg";
    import printer from "$lib/assets/printer.svg";

    const features = [
        {
            id: "examenes",
            label: "Examenes",
            title: "Acceso total a exámenes oficiales",
            description: "Acceso ilimitado a todos los PDF de exámenes pasados y soluciones oficiales",
            image: exams
        },
        {
            id: "calculadora",
            label: "Calculadora",
            title: "Calcula tu nota media de selectividad",
            description: "Calcula tu nota de selectividad introduciendo tus notas de bachillerato",
            image: calculator
        },
        {
            id: "creadorIA",
            label: "Creador IA",
            title: "Genera exámenes gracias a la IA",
            description: "Crea nuevos exámenes generados con IA junto a sus soluciones",
            image: printer
        }
    ];
</script>

<Tabs defaultValue="examenes">
    <Tabs.List class="max-w-3xl mx-auto mt-20">
        {#each features as feature}
            <Tabs.Trigger class="flex-1" value={feature.id}>
                {feature.label}
            </Tabs.Trigger>
        {/each}
        <Tabs.Indicator />
    </Tabs.List>

    {#each features as feature}
        <Tabs.Content value={feature.id} class="my-12">
            <div class="max-w-5xl mx-auto px-4">
                <div class="flex gap-12 items-center lg:gap-16">
                    <!-- Texto y enlace -->
                    <div class="flex-1 flex flex-col justify-center">
                        <h2 class="text-2xl font-extrabold text-[#1E293B] mb-3">
                            {feature.title}
                        </h2>
                        <p class="text-base text-gray-700 mb-6 leading-snug">
                            {feature.description}
                        </p>
                        <a 
                            href="#" 
                            class="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 transition-colors group w-fit"
                        >
                            Más información
                            <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
                        </a>
                    </div>
                    
                    <!-- Imagen -->
                    <div class="flex-1 flex justify-center">
                        <img 
                            src={feature.image} 
                            alt={feature.title}
                            class="w-full max-w-xs h-auto object-contain transition-transform hover:scale-105 duration-300"
                        />
                    </div>
                </div>
            </div>
        </Tabs.Content>
    {/each}
</Tabs>
