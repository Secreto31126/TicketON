import type { PageServerLoad } from './$types';
import type { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model';

import { getParty } from '$lib/server/sanity';
import { error } from '@sveltejs/kit';
import mercadopago from 'mercadopago';
import dayjs from 'dayjs';

import { MERCADO_PAGO_TOKEN } from '$env/static/private';

mercadopago.configurations.setAccessToken(MERCADO_PAGO_TOKEN);

export const load = (async ({ url, params }) => {
	let party;
	try {
		party = await getParty(params.party);
	} catch (e) {
		console.error(e);
		throw error(500, 'Internal server error');
	}

	if (!party) {
		throw error(404, 'Party not found');
	}

	const preference: CreatePreferencePayload = {
		purpose: 'wallet_purchase',
		items: [
			{
				id: params.party,
				title: party.name,
				quantity: 1,
				unit_price: party.price,
				picture_url: party.image,
				description: 'Hi :)'
			}
		],
		back_urls: {
			success: url.toString() + '/success',
			failure: url.toString() + '/failure'
		},
		auto_return: 'approved',
		payment_methods: {
			installments: 1
		},
		expires: true,
		expiration_date_to: dayjs().add(30, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS-03:00'),
		external_reference: params.party,
		binary_mode: true
	};

	const mp = await mercadopago.preferences.create(preference);

	if (((mp.status / 100) | 0) > 3) {
		console.error('Failed to create Mercado Pago preference');
		throw error(500, 'Internal server error');
	}

	return {
		mp: {
			preference_id: mp.body.id
		},
		party: {
			name: party.name,
			price: party.price,
			image: party.image,
			date: party.date
		}
	};
}) satisfies PageServerLoad;
