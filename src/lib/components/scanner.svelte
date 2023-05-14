<script lang="ts">
	import QrScanner from 'qr-scanner';
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy, tick } from 'svelte';

	export let success: boolean | null = false;
	export let scan_active: boolean = false;
	export let data: string = '';

	let qrScanner: QrScanner;
	let camera: HTMLVideoElement;
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
				if (result.data !== data) {
					data = result.data;
				}
			},
			{
				maxScansPerSecond: 1,
				highlightScanRegion: true,
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

<svelte:head>
	<link rel="prefetch" href="/checkmark.svg" />
	<link rel="prefetch" href="/cross.svg" />
</svelte:head>

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
	{#if success !== null}
		<div class="absolute top-0 left-0 flex items-center justify-center w-full h-full z-10">
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
		</div>
	{/if}
</div>

<!-- Toggle Camera -->
{#if qrScanner}
	<button on:click|preventDefault={() => (scan_active = !scan_active)}>
		{scan_active ? 'Desactivar' : 'Activar'} cámara
	</button>
{/if}

<style>
	.hide-video {
		/* Safari breaks if you use diplay: none; */
		opacity: 0;
		width: 0px;
		height: 0px;
	}
</style>
