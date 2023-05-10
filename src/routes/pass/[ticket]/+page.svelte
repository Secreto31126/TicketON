<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let view_code = false;
</script>

<svelte:head>
	<title>Tu QR Pass</title>
</svelte:head>

<div class="flex flex-col items-center text-center h-screen">
	<div class="flex flex-col items-center h-1/4">
		{#if data.party.image}
			<img class="h-2/3" src={data.party.image} alt="Party" />
		{/if}
		<h1 class="uppercase">{data.party.name}</h1>
		<p>{data.party.date}</p>
	</div>
	<div class="flex flex-col items-center h-3/4">
		{#if data.ticket.qr}
			<h2>Acá tenés tu QR Pass para entrar</h2>
			<img
				class="h-2/3"
				src={data.ticket.qr}
				alt="QR Pass"
				on:click={() => (view_code = !view_code)}
				on:keypress={() => (view_code = !view_code)}
			/>
		{:else}
			<h2>Ups!</h2>
			<p>Hubo un error al cargar tu QR</p>
		{/if}
		{#if view_code}
			<p>Código de ticket: {data.ticket.id}</p>
		{/if}
	</div>
</div>
