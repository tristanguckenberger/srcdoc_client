import * as api from '$lib/api.js';
import { respond } from './_respond';

export async function post({ request, locals }) {
    const formBody = await request.json();
    const token = locals.jwt;
    const { email } = formBody;
    const body = await api.post(`api/v1/auth/forgotpassword`, {
        email
	}, token);

	return respond(body);
}
