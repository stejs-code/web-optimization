import { generateRandomCode } from '$lib/utils';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Check if token cookie exists
	let token = event.cookies.get('auth_token');

	// If no token exists, generate a new random one
	if (!token) {
		token = generateRandomCode(32); // 32 character random token
		event.cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365 // 1 year
		});
	}

	// Make token available to server routes via locals
	event.locals.token = token;

	return resolve(event);
};
