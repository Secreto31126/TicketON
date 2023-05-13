<script lang="ts">
	import type { PageData, ActionData } from './$types';

	import { enhance } from '$app/forms';
	import Scanner from '$lib/components/scanner.svelte';
	import { tick } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	let input_html: HTMLInputElement;

	let party = form?.party ?? '';
	let ticket = '';

	let scan_active: boolean;
	$: success = form?.success ?? null;

	let submit: HTMLButtonElement;
	$: console.log(ticket);
	$: console.log(submit);
	$: console.log(success);
	$: console.log(scan_active, ticket, submit, success);
	$: if (scan_active && ticket && submit && success === null) {
		console.log(party, ticket);
		tick().then(submit.click);
	}
</script>

<form class="flex flex-col items-center space-y-4" method="POST" use:enhance>
	<!-- Party -->
	<select name="party" bind:value={party}>
		{#each data.parties as { name, slug }}
			<option value={slug}>{name}</option>
		{/each}
	</select>

	{#if party}
		<!-- Camera -->
		<Scanner bind:data={ticket} bind:scan_active bind:success />

		<!-- Toggle Camera -->
		<button on:click|preventDefault={() => (scan_active = !scan_active)}>
			{scan_active ? 'Desactivar' : 'Activar'} cámara
		</button>

		<!-- QR Value -->
		<input
			type="text"
			name="ticket"
			bind:this={input_html}
			bind:value={ticket}
			class:hide={scan_active}
			class="border-2 rounded-md border-black text-center"
		/>

		<!-- Submit -->
		<button type="submit" class:hide={scan_active} bind:this={submit}>Verificar</button>
	{/if}
</form>

{#if form}
	<div class="text-center">
		{#if form.success}
			<p class="text-green-600">¡Bienvenido!</p>
		{:else}
			<p class="text-red-600">{form.message}</p>
		{/if}
	</div>
{/if}

<style>
	.hide {
		display: none;
	}
</style>
