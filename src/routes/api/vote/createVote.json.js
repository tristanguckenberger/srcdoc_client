import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const body = await request.json();
    const res = await api.post(`api/vote-service/v1/votes`, body, locals.jwt);
	return {
        status: 200,
        body: res
    }
}