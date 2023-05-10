// src/routes/+page.js

import { createClient } from '@sanity/client';

import {
	SANITY_API_PROJECT_ID,
	SANITY_API_READ_TOKEN,
	SANITY_API_DATASET
} from '$env/static/private';

const client = createClient({
	projectId: SANITY_API_PROJECT_ID,
	token: SANITY_API_READ_TOKEN,
	dataset: SANITY_API_DATASET,
	apiVersion: '2021-10-21',
	useCdn: true
});

type PartyQuery = { name: string; date: string; image?: string };
export async function getParty(slug: string): Promise<PartyQuery> {
	const query = `*[_type == "party" && slug.current == "${slug}"][0] { name, date, "image": image.asset->url }`;
	const data = await client.fetch<PartyQuery>(query);
	if (!data) {
		throw new Error(`No party found with slug "${slug}"`);
	}
	return data;
}
