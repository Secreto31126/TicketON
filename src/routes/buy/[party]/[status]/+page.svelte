<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>TicketON</title>
</svelte:head>

<div class="text-center">
	<h1 class="first-letter:uppercase">{data.status}</h1>
	{#if data.ticket}
		<p>Here is your ticket id: {data.ticket}</p>
		<p>Revisá tu mail {data.email} para confirmar la compra</p>
		<a href="/pass/{data.ticket}">Abrir QR Pass</a>
	{:else if data.status == 'success'}
		<p>Huh, se produjo un error inesperado</p>
		<p>Si crees que se produjo un error de nuestro lado, por favor contáctanos</p>
	{:else}
		<a href="/buy/{data.party}">Volver a intentar</a>
	{/if}
</div>
