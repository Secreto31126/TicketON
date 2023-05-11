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
	apiVersion: '2023-05-10',
	useCdn: true
});

type PartyQuery = { _id: string; name: string; date: string; image?: string; price: number };
export async function getParty(slug: string): Promise<PartyQuery | null> {
	const query = `*[_type == "party" && slug.current == "${slug}"][0] { _id, name, date, "image": image.asset->url, price }`;
	const data = await client.fetch<PartyQuery>(query);
	return data ?? null;
}
