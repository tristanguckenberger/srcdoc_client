import * as api from '$lib/api.js';

export async function del({ params, locals }) {
    const token = locals.jwt;
    const res = await api.del(`api/v1/comments/${params.slug}`, token);

    return {
        status: 200,
        body: res
    }
}