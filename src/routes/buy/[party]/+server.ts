import type { RequestHandler } from './$types';
import type { CreatePaymentPayload } from 'mercadopago/models/payment/create-payload.model';

import mercadopago from 'mercadopago';
import { getParty } from '$lib/server/sanity';
import { error, json } from '@sveltejs/kit';

import { MERCADO_PAGO_TOKEN } from '$env/static/private';

mercadopago.configurations.setAccessToken(MERCADO_PAGO_TOKEN);

export const POST: RequestHandler = async ({ params, request }) => {
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

	const body = await request.json();

	if (!body.payer || !body.transaction_amount || !body.payment_method_id || !body.installments) {
		throw error(400, 'Missing parameters');
	}

	if (body.transaction_amount !== party.price) {
		throw error(400, 'Invalid transaction amount');
	}

	let payment;
	try {
		payment = await mercadopago.payment.save({
			...body,
			external_reference: params.party
		} as CreatePaymentPayload);
	} catch (e) {
		throw error(500, 'Internal server error');
	}

	if (((payment.status / 100) | 0) > 2) {
		throw error(payment.status, {
			message: payment.response.status
		});
	}

	return json(payment.response);
};
