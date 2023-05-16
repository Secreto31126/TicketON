import type { PageServerLoad, Actions } from './$types';
import type { Ticket } from '$lib/types/ticket';

import { getPartiesList, getParty } from '$lib/server/sanity';
import { kv } from '@vercel/kv';
import { error, fail, redirect } from '@sveltejs/kit';

export const load = (async ({ params, cookies }) => {
	if (!params.magic) {
		throw redirect(303, '/scan');
	}

	let email;
	try {
		// If the email is found, it means the user is allowed to control at least one party
		email = await kv.get<string>(`mail:${params.magic}`);
	} catch (e) {
		throw error(500, 'Failed to load email');
	}

	if (!email) {
		throw error(401, 'Invalid magic link, it might have expired, please log in again');
	}

	cookies.set('email', email, {
		maxAge: 60 * 60 * 2
	});

	let parties;
	try {
		parties = await getPartiesList(email);
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
		if (!party) {
			return fail(400, {
				message: 'Missing party selection',
				success: false
			});
		}

		const id = data.get('ticket') as string | null;
		if (!id) {
			return fail(400, {
				party,
				message: 'Missing ticket id',
				success: false
			});
		}

		const ticket = await kv.hgetall<Ticket>(`ticket:${id}`);

		if (!ticket) {
			return fail(404, {
				party,
				message: 'Ticket not found',
				success: false
			});
		}

		if (ticket.used) {
			return fail(410, {
				party,
				message: 'Ticket already used',
				success: false
			});
		}

		const party_object = await getParty(ticket.party);

		if (!party_object) {
			return fail(404, {
				party,
				message: 'Party not found',
				success: false
			});
		}

		try {
			await kv.hset(`ticket:${id}`, {
				...ticket,
				used: true
			});
		} catch (error) {
			console.error(id, error);
			return fail(500, {
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
