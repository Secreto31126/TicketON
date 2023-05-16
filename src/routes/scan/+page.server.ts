import type { PageServerLoad, Actions } from './$types';

import { getPartiesList } from '$lib/server/sanity';
import { fail } from '@sveltejs/kit';
import { kv } from '@vercel/kv';
import sendMail from '$lib/server/mail';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, url, fetch }) => {
		const data = await request.formData();
		const email = data.get('email') as string | null;

		if (!email) {
			throw fail(400, {
				success: false,
				message: 'Falta el email'
			});
		}

		let throtle;
		try {
			throtle = await kv.get<string>(`throtle:${email}`);
		} catch (e) {
			throw fail(500, {
				success: false,
				message: 'Error al buscar el limitador'
			});
		}

		if (throtle) {
			throw fail(429, {
				success: false,
				message: 'Solo podés reenviar el mail cada 2 minuto'
			});
		}

		let parties: Awaited<ReturnType<typeof getPartiesList>>;
		try {
			parties = await getPartiesList(email);
		} catch (e) {
			throw fail(500, {
				success: false,
				message: 'Error al buscar la lista de fiestas'
			});
		}

		if (!parties.length) {
			throw fail(403, {
				success: false,
				message: 'Este email no está autorizado a administrar ninguna fiesta'
			});
		}

		const array = new Uint32Array(4);
		crypto.getRandomValues(array);

		let id = '';
		for (const num of array) {
			id += num;
		}

		try {
			await kv.set(`throtle:${email}`, '1', { ex: 120 });
		} catch (e) {
			throw fail(500, {
				success: false,
				message: 'Error al guardar el limitador'
			});
		}

		try {
			await kv.set(`mail:${id}`, email, { ex: 300 });
		} catch (e) {
			throw fail(500, {
				success: false,
				message: 'Error al guardar el enlace mágico'
			});
		}

		try {
			await sendMail(
				fetch,
				email,
				'Iniciar Sesión en TicketON',
				`<a href="${url.href}/${id}">Hacé click acá para empezar a escanear QRs</a><br><br>Si no solicitaste este mail, lo podés ignorar tranquilo, tu cuenta está segura mientras no compartas el link.`
			);
		} catch (e) {
			throw fail(500, {
				success: false,
				message: 'Error al enviar el email'
			});
		}

		return {
			success: true,
			email
		};
	}
} satisfies Actions;
