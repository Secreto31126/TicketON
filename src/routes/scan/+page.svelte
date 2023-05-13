<script lang="ts">
	import type { PageData, ActionData } from './$types';

	import QrScanner from 'qr-scanner';
	import { enhance } from '$app/forms';
	import { spring } from 'svelte/motion';
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy, tick } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	const duration = 1000;
	const scanner_animation = new Promise((r) => (form ? setTimeout(r, duration) : r(void 0)));

	let coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.1,
			damping: 0.5
		}
	);

	let form_html: HTMLFormElement;

	let party = form?.party ?? '';
	let ticket = '';

	let qrScanner: QrScanner;
	let camera: HTMLVideoElement;
	let scan_active: boolean = false;
	let camera_overlay: HTMLDivElement;
	let camera_list: Awaited<ReturnType<typeof QrScanner.listCameras>> | null = null;
	let selected_camera: string;
	onMount(async () => {
		if (!(await QrScanner.hasCamera())) {
			alert('No se detectó ninguna cámara');
			return;
		}

		qrScanner = new QrScanner(
			camera,
			(result) => {
				ticket = result.data;
				coords.set(result.cornerPoints[0]);
			},
			{
				maxScansPerSecond: 1,
				overlay: camera_overlay,
				highlightCodeOutline: true,
				returnDetailedScanResult: true
			}
		);

		camera_list = await QrScanner.listCameras(true);

		await tick();
		scan_active = true;
	});

	onDestroy(() => {
		qrScanner?.destroy();
	});

	$: if (scan_active) {
		qrScanner?.start();
	} else {
		qrScanner?.stop();
	}

	$: if (selected_camera) {
		qrScanner?.setCamera(selected_camera);
	}

	let submit: HTMLButtonElement;
	$: if (scan_active && ticket) {
		console.log(party, ticket);
		submit?.click();
	}
</script>

<form class="flex flex-col items-center space-y-4" method="POST" use:enhance bind:this={form_html}>
	<!-- Party -->
	<select name="party" bind:value={party}>
		{#each data.parties as { name, slug }}
			<option value={slug}>{name}</option>
		{/each}
	</select>

	<!-- Camera Picker -->
	{#if camera_list}
		<select name="camera" bind:value={selected_camera}>
			{#each camera_list as { label, id }}
				<option value={id}>{label}</option>
			{/each}
		</select>
	{/if}

	<!-- Camera -->
	<!-- svelte-ignore a11y-media-has-caption doesn't apply -->
	<video bind:this={camera} class:hide={!scan_active} class="h-[60vh]" />

	<!-- Toggle Camera -->
	<button on:click|preventDefault={() => (scan_active = !scan_active)}>
		{scan_active ? 'Desactivar' : 'Activar'} cámara
	</button>

	<!-- QR Value -->
	<input
		type="text"
		name="ticket"
		bind:value={ticket}
		class:hide={scan_active}
		class="border-2 rounded-md border-black text-center"
	/>

	<!-- Submit -->
	<button type="submit" class:hide={scan_active} bind:this={submit}>Verificar</button>
</form>

<!-- Scan border -->
<div class="border-2 border-green-600 rounded-lg w-4 h-4" bind:this={camera_overlay} in:scale>
	{#await scanner_animation}
		<!-- Fade in -->
		<div transition:fade>
			{#if form?.success}
				<img src="/checkmark.svg" alt="Accepted" />
			{:else if form}
				<img src="/cross.svg" alt="Rejected" />
			{/if}
		</div>
	{:then}
		<!-- Fade out -->
	{/await}
</div>

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
		/* Safari breaks if you use diplay: none; */
		opacity: 0;
		width: 0px;
		height: 0px;
	}
</style>
