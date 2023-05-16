import type { PageServerLoad } from './$types';
import type { Ticket } from '$lib/types/ticket';

import { kv } from '@vercel/kv';
import { error } from '@sveltejs/kit';
import { getParty } from '$lib/server/sanity';
import QRCode from 'qrcode';

export const load = (async ({ params }) => {
	let ticket: Ticket | null = null;
	try {
		ticket = await kv.hgetall<Ticket>(`ticket:${params.ticket}`);
	} catch (e) {
		throw error(500, {
			message: 'Error fetching ticket'
		});
	}

	if (!ticket) {
		throw error(404, {
			message: 'Ticket not found'
		});
	}

	if (ticket.used) {
		throw error(410, {
			message: 'Ticket used'
		});
	}

	let party;
	try {
		party = await getParty(ticket.party);
	} catch (e) {
		throw error(500, {
			message: 'Error fetching party'
		});
	}

	if (!party) {
		throw error(409, {
			message: 'Party not found'
		});
	}

	const qr = await QRCode.toDataURL(params.ticket, {
		errorCorrectionLevel: 'H',
		width: 2048
	});

	return {
		ticket: {
			id: params.ticket,
			qr
		},
		party
	};
}) satisfies PageServerLoad;
