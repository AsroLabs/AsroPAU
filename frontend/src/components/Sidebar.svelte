<script lang="ts">
	import {
		BookIcon,
		SettingsIcon,
		HouseIcon,
	} from '@lucide/svelte';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';

	export let isOpen = false;

	const linksSidebar = {
		recursos: [
			{ label: 'Exámenes', href: '/#', icon: BookIcon },
			{ label: 'Calculadora', href: '/#', icon: BookIcon },
			{ label: 'Creador IA', href: '/#', icon: BookIcon },
		],
		comunidad: [
			{ label: 'Blog', href: '/#', icon: BookIcon },
			{ label: 'Foro', href: '/#', icon: BookIcon },
			{ label: 'Colaboradores', href: '/#', icon: BookIcon },
		],
	};

	function closeSidebar() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/50 z-40 md:hidden"
		on:click={closeSidebar}
		role="presentation"
	/>
	<div
		class="fixed left-0 top-16 bottom-0 w-72 bg-white z-50 shadow-lg overflow-y-auto md:hidden"
	>
		<Navigation layout="sidebar" class="h-full grid grid-rows-[auto_1fr_auto]">
			<Navigation.Header>
				<button
					on:click={closeSidebar}
					class="btn-icon btn-icon-lg preset-filled-primary-500"
					aria-label="Close sidebar"
				>
					<span class="text-white font-bold">A</span>
				</button>
			</Navigation.Header>
			<Navigation.Content>
				<Navigation.Group>
					<Navigation.Menu>
						<button
							on:click={closeSidebar}
							class="w-full text-left"
						>
							<Navigation.TriggerAnchor href="/">
								<HouseIcon class="size-4" />
								<Navigation.TriggerText>Inicio</Navigation.TriggerText>
							</Navigation.TriggerAnchor>
						</button>
					</Navigation.Menu>
				</Navigation.Group>
				{#each Object.entries(linksSidebar) as [category, links]}
					<Navigation.Group>
						<Navigation.Label class="capitalize pl-2">{category}</Navigation.Label>
						<Navigation.Menu>
							{#each links as link (link.label)}
								{@const Icon = link.icon}
								<button
									on:click={closeSidebar}
									class="w-full text-left"
								>
									<Navigation.TriggerAnchor href={link.href} title={link.label} aria-label={link.label}>
										<Icon class="size-4" />
										<Navigation.TriggerText>{link.label}</Navigation.TriggerText>
									</Navigation.TriggerAnchor>
								</button>
							{/each}
						</Navigation.Menu>
					</Navigation.Group>
				{/each}
			</Navigation.Content>
			<Navigation.Footer>
				<button
					on:click={closeSidebar}
					class="w-full text-left"
				>
					<Navigation.TriggerAnchor href="/" title="Settings" aria-label="Settings">
						<SettingsIcon class="size-4" />
						<Navigation.TriggerText>Configuración</Navigation.TriggerText>
					</Navigation.TriggerAnchor>
				</button>
			</Navigation.Footer>
		</Navigation>
	</div>
{/if}
