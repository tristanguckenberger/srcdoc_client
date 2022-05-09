import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const token = locals.jwt;
    const res = await api.post('api/v2/collectives', await request.json(), token);
    return {
        status: 200,
        body: res
    }
}
