import type { PageServerLoad } from './$types';
import type { Ticket } from '$lib/types/ticket';

import { kv } from '@vercel/kv';
import { error } from '@sveltejs/kit';
import { getParty } from '$lib/server/sanity';
import dayjs from 'dayjs';

export const load = (async ({ params, url }) => {
	const payment_id = url.searchParams.get('id');

	if (payment_id && payment_id !== 'null') {
		let party;
		try {
			party = await getParty(params.party);
		} catch (e) {
			throw error(500, 'Error fetching party');
		}

		if (!party) {
			throw error(409, 'Party not found');
		}

		try {
			await kv.hset(payment_id, {
				party: params.party,
				used: false
			} satisfies Ticket);
			await kv.expireat(payment_id, dayjs(party.date).add(1, 'day').unix());
		} catch (e) {
			console.error(payment_id, e);
			throw error(500, 'Failed to add ticket');
		}
	}

	return {
		status: params.status,
		ticket: payment_id,
		party: params.party
	};
}) satisfies PageServerLoad;
