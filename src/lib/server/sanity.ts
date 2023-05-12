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

type PartyQuery = { name: string; date: string; image?: string; price: number };
export async function getParty(slug: string): Promise<PartyQuery | null> {
	const query = `*[_type == "party" && slug.current == "${slug}"][0] { name, date, "image": image.asset->url, price }`;
	const data = await client.fetch<PartyQuery>(query);
	return data ?? null;
}

type PartiesQuery = { name: string; date: string; slug: string }[];
export async function getPartiesList(email?: string): Promise<PartiesQuery> {
	const query = `*[_type == "party"] { name, date, "slug": slug.current }`;
	const data = await client.fetch<PartiesQuery>(query);
	return data ?? [];
}
