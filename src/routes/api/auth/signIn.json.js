import * as api from '$lib/api.js';
import { respond } from './_respond';

export async function post({ request }) {
    let nb = await request.json();
    const body = await api.post('api/v1/auth/login', nb);
    // console.log(body); // success: boolean, token: string
	return respond(body);
}
