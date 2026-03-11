<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="theme-color" content="#FFF7ED" />

</svelte:head>

<!-- Skip to main content (accessibility) -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-9999 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-orange-600 focus:text-white focus:font-bold focus:text-sm focus:shadow-lg"
>
  Saltar al contenido principal
</a>

<Header />

<div id="main-content" class="pt-[72px]">
	{@render children()}
</div>