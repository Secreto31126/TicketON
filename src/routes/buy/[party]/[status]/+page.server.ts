import type { PageServerLoad } from './$types';

import { addTicket } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, url }) => {
	const payment_id = url.searchParams.get('payment_id');
	let ticket;
	if (payment_id && payment_id !== 'null') {
		try {
			ticket = await addTicket(params.party, payment_id);
		} catch (e) {
			return error(500, 'Failed to add ticket');
		}
	}

	return {
		status: params.status,
		ticket,
		party: params.party
	};
}) satisfies PageServerLoad;
