import type { RequestHandler } from './$types';

import { getTicket, useTicket } from '$lib/server/prisma';
import { getParty } from '$lib/server/sanity';
import bcrypt from 'bcryptjs';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.formData();
	const private_key = body.get('private_key');

	if (!private_key) {
		return new Response(null, {
			status: 401
		});
	}

	const ticket = await getTicket(params.ticket);

	if (!ticket) {
		return new Response(null, {
			status: 404
		});
	}

	if (ticket.used) {
		return new Response(null, {
			status: 410
		});
	}

	type Party_ID_Optional = Exclude<Awaited<ReturnType<typeof getParty>>, null> | { _id?: string };
	const party: Party_ID_Optional | null = await getParty(ticket.party);

	if (!party) {
		return new Response(null, {
			status: 404
		});
	}

	if (party._id !== private_key) {
		return new Response(null, {
			status: 403
		});
	}

	// HACK: As _id IS the private key, we don't want accidental comparissons with it
	delete party._id;

	const valid = await bcrypt.compare(ticket.id.concat(private_key), ticket.hash);

	if (!valid) {
		return new Response(null, {
			status: 403
		});
	}

	try {
		useTicket(ticket.id);
	} catch (error) {
		return new Response(null, {
			status: 500
		});
	}

	return new Response('USED', {
		status: 202
	});
};
