<script lang="ts">
	import type { PageData, ActionData } from './$types';

	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import Scanner from '$lib/components/scanner.svelte';

	export let data: PageData;
	export let form: ActionData;

	let party = form?.party ?? (data.parties.length === 1 ? data.parties[0].slug : '');
	let scan_active: boolean;
	let ticket = '';

	// Everytime form changes, set animated to false
	let animated: boolean;
	$: animated = !!form && false;

	let success: boolean | null = null;
	$: success = animated ? null : form?.success ?? null;

	const duration = 1000;
	$: {
		// I have NO IDEA why success isn't triggering the reactivity
		form;
		// I even have to wait a tick for it to update
		tick().then(() => {
			if (success !== null) {
				setTimeout(() => {
					animated = true;
					success = null;
				}, duration);
			}
		});
	}

	let submit: HTMLButtonElement;
	$: if (scan_active && ticket && submit && success === null) {
		// Let the form update the ticket value
		tick().then(() => submit.click());
	}
</script>

<svelte:head>
	<title>TicketON - Scan</title>
</svelte:head>

<form class="flex flex-col items-center space-y-2 mt-4" method="POST" use:enhance>
	<!-- Party -->
	<select name="party" bind:value={party} required>
		{#each data.parties as { name, slug }}
			<option value={slug}>{name}</option>
		{/each}
	</select>

	{#if party}
		<!-- Camera -->
		<Scanner bind:data={ticket} bind:scan_active bind:success />

		<!-- QR Value -->
		<input
			type="text"
			name="ticket"
			bind:value={ticket}
			class:hide={scan_active}
			class="border-2 rounded-md border-black text-center m-0"
			required
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
