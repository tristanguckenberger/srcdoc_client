import * as api from '$lib/api.js';

export async function put({ request, params, locals }) {
    const res = await api.put(`api/v1/users/${params.slug}`, await request.json(), locals.jwt);
    return {
        status: 200,
        body: res
    }
}
