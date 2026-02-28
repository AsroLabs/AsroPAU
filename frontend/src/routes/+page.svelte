<script lang="ts">
  import Header from "../components/Header.svelte";
  import Hero from "../components/Hero.svelte";
  import Stats from "../components/Stats.svelte";
  import Features from "../components/Features.svelte";
  import SpainSection from "../components/SpainSection.svelte";
  import Testimonials from "../components/Testimonials.svelte";
  import Footer from "../components/Footer.svelte";
</script>

<main class="min-h-screen flex flex-col">
  <Header />
  <Hero />
  <Stats />
  <Features />
  <SpainSection />
  <Testimonials />
  <Footer />
</main>

<style>
  main {
    scroll-behavior: smooth;
  }
</style>
