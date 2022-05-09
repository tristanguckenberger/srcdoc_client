import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const body = await request.json();
    const res = await api.post(`api/v2/votes`, body, locals.jwt);
	return {
        status: 200,
        body: res
    }
}