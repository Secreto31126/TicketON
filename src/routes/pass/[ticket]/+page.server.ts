import type { PageServerLoad } from './$types';
import type { Pass } from '@prisma/client';

import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import { getParty } from '$lib/server/sanity';
import QRCode from 'qrcode';

export const load = (async ({ params }) => {
	let ticket: Pass | null;
	if (import.meta.env.PROD) {
		try {
			ticket = await prisma.pass.findUnique({
				where: {
					id: params.ticket
				}
			});
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
			message: 'Ticket expired'
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

	const qr = await QRCode.toDataURL(ticket.id, {
		errorCorrectionLevel: 'H',
		width: 1024
	});

	return {
		ticket: {
			id: ticket.id,
			qr
		},
		party
	};
}) satisfies PageServerLoad;
