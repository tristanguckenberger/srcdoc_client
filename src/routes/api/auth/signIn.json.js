import * as api from '$lib/api.js';
import { respond } from './_respond';

export async function post({ request }) {
    let nb = await request?.json() ?? null;
    if (!nb) return;
    const body = await api.post('api/v2/auth/login', nb);
    // console.log(body); // success: boolean, token: string
	return respond(body);
}
