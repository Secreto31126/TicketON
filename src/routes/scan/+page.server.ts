import type { PageServerLoad, Actions } from './$types';
import type { Ticket } from '$lib/types/ticket';

import { getPartiesList, getParty } from '$lib/server/sanity';
import { kv } from '@vercel/kv';
import { error, fail } from '@sveltejs/kit';

export const load = (async () => {
	let parties;
	try {
		parties = await getPartiesList();
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to load parties');
	}

	if (!parties) {
		throw error(404, 'No parties available');
	}

	return {
		parties
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const party = data.get('party') as string | null;
		const id = data.get('ticket') as string | null;

		if (!party) {
			return fail(400, {
				message: 'Missing party slug',
				success: false
			});
		}

		if (!id) {
			return fail(400, {
				party,
				message: 'Missing ticket id',
				success: false
			});
		}

		const ticket = await kv.hgetall<Ticket>(id);

		if (!ticket) {
			return fail(404, {
				id,
				party,
				message: 'Ticket not found',
				success: false
			});
		}

		if (ticket.used) {
			return fail(410, {
				id,
				party,
				message: 'Ticket already used',
				success: false
			});
		}

		const auth_list = await getParty(ticket.party);

		if (!auth_list) {
			return fail(404, {
				id,
				party,
				message: 'Party not found',
				success: false
			});
		}

		// TODO: Verify if valid
		const valid = true;

		if (!valid) {
			return fail(403, {
				id,
				party,
				message: 'Invalid ticket',
				success: false
			});
		}

		try {
			await kv.hset(id, {
				...ticket,
				used: true
			});
		} catch (error) {
			console.error(id, error);
			return fail(500, {
				id,
				party,
				message: 'Failed to update ticket',
				success: false
			});
		}

		return {
			party,
			success: true
		};
	}
} satisfies Actions;
