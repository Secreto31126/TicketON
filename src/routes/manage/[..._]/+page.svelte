<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { renderStudio } from 'sanity';
	import { page } from '$app/stores';
	import Studio from '$lib/sanity/studio';

	export let data: PageData;

	const config = Studio(data.sanity.projectId, data.sanity.dataset, $page.url.pathname);

	let app: HTMLDivElement;
	onMount(() => {
		renderStudio(app, config);
	});
</script>

<svelte:head>
	<title>TicketON - Manage</title>
</svelte:head>

<div bind:this={app} class="h-screen m-0 overflow-hidden antialiased" />

<style lang="postcss">
	div {
		-webkit-text-size-adjust: 100%;
		text-size-adjust: 100%;
		-webkit-tap-highlight-color: transparent;
	}
</style>
