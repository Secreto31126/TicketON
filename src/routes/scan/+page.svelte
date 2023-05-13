<script lang="ts">
	import type { PageData, ActionData } from './$types';

	import QrScanner from 'qr-scanner';
	import { enhance } from '$app/forms';
	import { onMount, onDestroy, tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let data: PageData;
	export let form: ActionData;

	const duration = 1000;
	const scanner_animation = new Promise((r) => (form ? setTimeout(r, duration) : r(void 0)));

	let form_html: HTMLFormElement;

	let party = form?.party ?? '';
	let ticket = '';

	let scan: boolean = false;
	let qrScanner: QrScanner;
	let camera: HTMLVideoElement;
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
			async (result) => {
				console.log(result);
				ticket = result.data;
				await tick();
				form_html.dispatchEvent(new Event('submit'));
			},
			{
				maxScansPerSecond: 5,
				overlay: camera_overlay,
				highlightCodeOutline: true,
				returnDetailedScanResult: true
			}
		);

		camera_list = await QrScanner.listCameras(true);

		scan = true;
	});

	onDestroy(() => {
		qrScanner?.destroy();
	});

	$: if (scan) {
		qrScanner?.start();
	} else {
		qrScanner?.stop();
	}

	$: if (selected_camera) {
		qrScanner?.setCamera(selected_camera);
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
	<video bind:this={camera} class:hide={!scan} class="h-[60vh]">
		<div class="border-green-600 rounded-lg" bind:this={camera_overlay} in:scale>
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
	</video>

	<!-- Toggle Camera -->
	<button on:click|preventDefault={() => (scan = !scan)}>
		{scan ? 'Desactivar' : 'Activar'} cámara
	</button>

	<!-- QR Value -->
	<input
		type="text"
		name="ticket"
		bind:value={ticket}
		class:hide={scan}
		class="border-2 rounded-md border-black text-center"
	/>

	<!-- Submit -->
	<button type="submit" class:hide={scan}>Verificar</button>
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
		/* Safari breaks if you use diplay: none; */
		opacity: 0;
		width: 0px;
		height: 0px;
	}
</style>
