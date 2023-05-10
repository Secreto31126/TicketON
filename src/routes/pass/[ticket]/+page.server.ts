import type { PageServerLoad } from './$types';

import { getTicket } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { getParty } from '$lib/server/sanity';
import QRCode from 'qrcode';

export const load = (async ({ params }) => {
	let ticket;
	if (import.meta.env.PROD) {
		try {
			ticket = await getTicket(params.ticket);
		} catch (e) {
			throw error(500, {
				message: 'Error fetching ticket'
			});
		}
	} else {
		ticket = {
			id: params.ticket,
			party: 'test',
			hash: 'test',
			used: false
		};
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
		throw error(404, {
			message: 'Party not found'
		});
	}

	const qr = await QRCode.toDataURL(ticket.id, {
		errorCorrectionLevel: 'H',
		width: 2048
	});

	return {
		ticket: {
			id: ticket.id,
			qr
		},
		party
	};
}) satisfies PageServerLoad;
