import { fail } from '@sveltejs/kit';
import { LinkApi, type Link } from '$lib/server/link-api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const api = new LinkApi(locals.token);

	const result = await api.getLinks();

	if ('error' in result && result.error) {
		return {
			links: [],
			error: result.message
		};
	}

	return {
		links: result.links || []
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const api = new LinkApi(locals.token);

		const data = await request.formData();
		const shortCode = data.get('shortCode')?.toString() || '';
		const destination = data.get('destination')?.toString() || '';

		// Validation
		let shortCodeError = '';
		let destinationError = '';

		if (!shortCode || shortCode.length < 4) {
			shortCodeError = 'Short code must be at least 4 characters';
		}

		if (!destination) {
			destinationError = 'Destination is required';
		}

		if (shortCodeError || destinationError) {
			return fail(400, {
				error: 'Validation failed',
				shortCodeError,
				destinationError,
				shortCode,
				destination
			});
		}

		// Check if link exists
		const existsResult = await api.linkExists(shortCode);
		if ('error' in existsResult && existsResult.error) {
			return fail(500, {
				error: existsResult.message,
				shortCodeError: '',
				destinationError: ''
			});
		}

		if (existsResult.exists) {
			return fail(400, {
				error: 'Short code already exists',
				shortCodeError: 'This short code is already taken',
				destinationError: '',
				shortCode,
				destination
			});
		}

		// Create link
		const result = await api.createLink({
			shortCode,
			url: destination
		});

		if ('error' in result && result.error) {
			return fail(500, {
				error: result.message,
				shortCodeError: '',
				destinationError: ''
			});
		}

		return {
			success: true,
			shortCode: '',
			destination: ''
		};
	},

	delete: async ({ request, locals }) => {
		const api = new LinkApi(locals.token);

		const data = await request.formData();
		const shortCode = data.get('shortCode')?.toString() || '';

		if (!shortCode) {
			return fail(400, { error: 'No short code provided' });
		}

		const result = await api.deleteLink(shortCode);

		if ('error' in result && result.error) {
			return fail(500, { error: result.message });
		}

		return { success: true };
	}
};
