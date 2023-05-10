import type { PageServerLoad } from './$types';

import { SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';

export const load = (async ({ params, url }) => {
	if (params._) {
		throw redirect(303, url.pathname.replace(new RegExp(`${params._}$`), ''));
	}

	if (!SANITY_STUDIO_PROJECT_ID) {
		throw error(500, 'Missing env variable: SANITY_STUDIO_PROJECT_ID');
	}

	if (!SANITY_STUDIO_DATASET) {
		throw error(500, 'Missing env variable: SANITY_STUDIO_DATASET');
	}

	return {
		sanity: {
			projectId: SANITY_STUDIO_PROJECT_ID,
			dataset: SANITY_STUDIO_DATASET
		}
	};
}) satisfies PageServerLoad;
