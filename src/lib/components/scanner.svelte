<script lang="ts">
	import QrScanner from 'qr-scanner';
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy, tick } from 'svelte';

	export let success: boolean | null = false;
	export let scan_active: boolean = false;
	export let data: string = '';
	export let duration = 1000;

	$: console.log(success);

	let qrScanner: QrScanner;
	let camera: HTMLVideoElement;
	let camera_list: Awaited<ReturnType<typeof QrScanner.listCameras>> | null = null;
	let selected_camera: string;

	const scanner_animation =
		success !== null
			? new Promise<void>((r) =>
					setTimeout(() => {
						success = null;
						r();
					}, duration)
			  )
			: Promise.reject();

	onMount(async () => {
		if (!(await QrScanner.hasCamera())) {
			alert('No se detectó ninguna cámara');
			return;
		}

		qrScanner = new QrScanner(
			camera,
			(result) => {
				if (result.data !== data) {
					data = result.data;
				}
			},
			{
				maxScansPerSecond: 1,
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
</script>

<!-- Camera Picker -->
{#if camera_list && camera_list.length > 1}
	<select name="camera" bind:value={selected_camera}>
		{#each camera_list as { label, id }}
			<option value={id}>{label}</option>
		{/each}
	</select>
{/if}

<!-- Camera -->
<div class="relative">
	<!-- svelte-ignore a11y-media-has-caption doesn't apply -->
	<video bind:this={camera} class:hide-video={!scan_active} class="h-[60vh]" />
	<div class="absolute top-0 left-0 flex items-center justify-center w-full h-full z-10">
		{#await scanner_animation}
			<!-- Fade in -->
			<div transition:fade>
				<!-- Scale -->
				<div in:scale>
					{#if success}
						<img src="/checkmark.svg" alt="Accepted" class="w-full h-full" />
					{:else}
						<img src="/cross.svg" alt="Rejected" class="w-full h-full" />
					{/if}
				</div>
			</div>
		{:then}
			<!-- Fade out -->
		{/await}
	</div>
</div>

<style>
	.hide-video {
		/* Safari breaks if you use diplay: none; */
		opacity: 0;
		width: 0px;
		height: 0px;
	}
</style>
