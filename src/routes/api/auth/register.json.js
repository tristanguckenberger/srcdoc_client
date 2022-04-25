import * as api from '$lib/api.js';
import { respond } from './_respond';

export async function post({ request }) {
    const formBody = await request.json();
    const { username, email, password } = formBody;
    const role = 'user';
    const body = await api.post('api/v1/auth/register', {
        username,
        email,
        password,
        role
	});

	return respond(body);
}
