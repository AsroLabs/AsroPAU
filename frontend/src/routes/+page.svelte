<script>
    import Hero from "$lib/components/Hero.svelte";
    import ExamSearch from "$lib/components/ExamSearch.svelte";
    import Features from "$lib/components/Features.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import SpainSection from "$lib/components/SpainSection.svelte";
</script>

<svelte:head>
    <title>AsroPAU – Preparación PAU y Selectividad</title>
</svelte:head>

<main class="min-h-screen flex flex-col">
    <Hero />
    <Features />
    <SpainSection />
    <Footer />
</main>

<style>
    main {
        scroll-behavior: smooth;
    }
</style>