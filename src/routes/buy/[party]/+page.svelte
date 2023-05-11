<script lang="ts">
	import type { PageData } from './$types';

	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';

	import { PUBLIC_MERCADO_PAGO_TOKEN } from '$env/static/public';
	import { redirect } from '@sveltejs/kit';

	export let data: PageData;

	let success: any = null;
	$: if (success) {
		throw redirect(303, $page.url.pathname + '/success?' + new URLSearchParams(success));
	}

	let div: HTMLDivElement;
	let paymentBrickController: any;

	const settings = {
		customization: {
			paymentMethods: {
				mercadoPago: 'all',
				creditCard: 'all',
				debitCard: 'all'
			},
			visual: {
				buttonBackground: 'black' as 'default' | 'black' | 'blue' | 'white'
			},
			maxInstallments: 1
		},
		initialization: {
			preferenceId: data.mp.preference_id,
			amount: data.party.price,
			payer: {
				email: ''
			}
		},
		callbacks: {
			onReady: () => {},
			onSubmit: async ({ formData }: any): Promise<void> => {
				if (formData) {
					const res = await fetch($page.url.pathname, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(formData)
					});

					if (!res.ok) {
						throw new Error('Failed to submit payment form');
					}

					success = await res.json();
					return;
				}
			},
			onError: (error: any) => {
				console.error(error);
			}
		}
	};

	onMount(async () => {
		// @ts-ignore - MercadoPago is globaly defined in index.html
		const mp = new MercadoPago(
			// Reduce impact of ts-ignore
			PUBLIC_MERCADO_PAGO_TOKEN
		);

		paymentBrickController = await mp.bricks().create('payment', div.id, settings);
	});

	onDestroy(() => {
		paymentBrickController?.destroy?.();
	});
</script>

<div class="flex flex-col md:flex-row items-center md:items-baseline justify-center mt-2 md:m-0">
	<div class="md:flex-auto flex flex-col items-center space-y-2 md:w-min mx-4 md:mx-16">
		<div class="flex w-full justify-between">
			<div>
				<h1 class="font-bold uppercase">{data.party.name}</h1>
				<h2>({data.party.date})</h2>
			</div>
			<h2 class="text-3xl text-green-600">${data.party.price}</h2>
		</div>
		<img src={data.party.image} alt="{data.party.name} Poster" class="w-full" />
	</div>
	<div bind:this={div} id="mp" class="md:flex-1 md:w-full md:m-16" />
</div>
