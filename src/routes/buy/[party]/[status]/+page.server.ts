import type { PageServerLoad } from './$types';
import type { Ticket } from '$lib/types/ticket';

import { kv } from '@vercel/kv';
import { error } from '@sveltejs/kit';
import { getParty } from '$lib/server/sanity';
import sendMail from '$lib/server/mail';
import mercadopago from 'mercadopago';
import QRCode from 'qrcode';
import dayjs from 'dayjs';

export const load = (async ({ params, url, fetch }) => {
	let payment_id = url.searchParams.get('payment_id') || url.searchParams.get('id');

	let email;
	let party_id;

	if (payment_id && payment_id !== 'null') {
		let payment: Awaited<ReturnType<typeof mercadopago.payment.findById>>;
		try {
			payment = await mercadopago.payment.findById(parseInt(payment_id));
		} catch (e) {
			console.error(payment_id, e);
			throw error(404, 'Payment not found');
		}

		if (((payment.status / 100) | 0) > 3) {
			throw error(payment.status, {
				message: payment.response.status
			});
		}

		// Override with the value from the server, just to be sure
		payment_id = payment.body.id.toString();

		// TS :eye_roll:
		if (!payment_id) {
			throw error(500, 'Missing payment id');
		}

		party_id = payment.body.external_reference;

		if (!party_id) {
			throw error(500, 'Missing external reference');
		}

		if (party_id !== params.party) {
			throw error(409, 'Party mismatch');
		}

		email = payment.body.payer.email;

		if (!email) {
			throw error(500, 'Missing payer email');
		}

		let party;
		try {
			party = await getParty(party_id);
		} catch (e) {
			console.error(payment_id, party_id, e);
			throw error(500, 'Error fetching party');
		}

		if (!party) {
			throw error(409, 'Party not found');
		}

		let ticket: Awaited<ReturnType<typeof kv.hgetall<Ticket>>>;
		try {
			ticket = await kv.hgetall<Ticket>(payment_id);
		} catch (e) {
			console.error(payment_id, e);
			throw error(500, 'Failed to check ticket');
		}

		if (ticket !== null) {
			throw error(409, 'Ticket already exists');
		}

		try {
			await kv.hset(payment_id, {
				party: party_id,
				used: false
			} satisfies Ticket);
			await kv.expireat(payment_id, dayjs(party.date).add(1, 'day').unix());
		} catch (e) {
			console.error(payment_id, e);
			throw error(500, 'Failed to add ticket');
		}

		const qr = await QRCode.toDataURL(payment_id, {
			errorCorrectionLevel: 'H',
			width: 2048
		});

		const qr_url = url.origin + '/pass/' + payment_id;

		try {
			await sendMail(
				email,
				'¡Ya tenés tu entrada!',
				`¡Gracias por tu compra!<br><br>Acá tenés tu QR Pass para ${party.name} el ${party.date}:<br><br><a href="${qr_url}"><img src="cid:qr" width="256px" /><br>Haz click aquí si no puedes ver la imagen</a>`,
				{ qr },
				fetch
			);
		} catch (e) {
			console.error(payment_id, e);
			throw error(500, 'Failed to send email');
		}
	}

	return {
		email,
		party: party_id,
		ticket: payment_id,
		status: params.status
	};
}) satisfies PageServerLoad;
