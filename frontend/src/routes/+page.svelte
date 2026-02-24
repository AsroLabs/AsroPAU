<script>
    import Header from "../components/Header.svelte";
    import Hero from "../components/Hero.svelte";
    import ExamSearch from "../components/ExamSearch.svelte";
    import Features from "../components/Features.svelte";
    import spain from "$lib/assets/spain.svg";
    import Footer from "../components/Footer.svelte";
    import SpainSection from "../components/SpainSection.svelte";
</script>

<main class="min-h-screen flex flex-col">
    <Header />
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