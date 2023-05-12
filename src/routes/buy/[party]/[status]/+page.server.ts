import type { PageServerLoad } from './$types';
import type { Pass } from '@prisma/client';

import { addTicket } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, url }) => {
	const payment_id = url.searchParams.get('id');

	let ticket: Pass | undefined;
	if (payment_id && payment_id !== 'null') {
		try {
			ticket = await addTicket(params.party, payment_id);
		} catch (e) {
			console.error(e);
			throw error(500, 'Failed to add ticket');
		}
	}

	console.log('ticket', ticket);

	return {
		status: params.status,
		ticket,
		party: params.party
	};
}) satisfies PageServerLoad;
