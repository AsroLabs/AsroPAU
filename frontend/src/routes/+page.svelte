<script>
    import Hero from "../components/Hero.svelte";
    import ExamSearch from "../components/ExamSearch.svelte";
    import Features from "../components/Features.svelte";
    import Footer from "../components/Footer.svelte";
    import SpainSection from "../components/SpainSection.svelte";
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