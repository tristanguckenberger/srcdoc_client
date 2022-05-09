import * as api from '$lib/api.js';
import { respond } from '../_respond';

export async function post({ request, params, locals }) {
    const formBody = await request.json();
    const token = locals.jwt;
    const { password } = formBody;
    const body = await api.post(`api/v2/auth/resetpassword/${params.slug}`, {
        password
	}, token);

	return respond(body);
}
