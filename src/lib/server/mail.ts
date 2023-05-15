import { GOOGLE_APP_SCRIPT_URL, GOOGLE_APP_SCRIPT_TOKEN } from '$env/static/private';

type APIResponse = {
	status: number;
} & (
	| {
			success: true;
	  }
	| {
			success: false;
			message: string;
	  }
);

export default async function sendMail(
	to: string,
	subject: string,
	body: string,
	images: { [key: string]: string } | undefined,
	fetch: typeof window.fetch
): Promise<number> {
	const req = await fetch(GOOGLE_APP_SCRIPT_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			API_TOKEN: GOOGLE_APP_SCRIPT_TOKEN,
			to: 'tomyraiti@gmail.com',
			subject,
			body,
			images
		})
	});

	let data: APIResponse;
	try {
		data = (await req.json()) as APIResponse;
	} catch (e) {
		throw new Error(`Google App Script failed with ${req.status}: ${req.statusText}`);
	}

	if (data.success) {
		return 200;
	}

	throw new Error(`Google App Script failed with ${data.status}: ${data.message}`);
}
