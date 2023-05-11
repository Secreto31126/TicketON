<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="text-center">
	<h1 class="first-letter:uppercase">{data.status}</h1>
	{#if data.ticket}
		<p>Here is your ticket id: {data.ticket.id}</p>
		<a href="/pass/{data.ticket.id}">Abrir QR Pass</a>
	{:else if data.status == 'success'}
		<p>Huh, se produjo un error inesperado</p>
	{:else}
		<a href="/buy/{data.party}">Volver a intentar</a>
	{/if}
</div>
