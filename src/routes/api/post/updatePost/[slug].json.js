import * as api from '$lib/api.js';


export async function put({ request, params, locals }) {
    
    let { title, text, tag, photo } = await request.json();
    const token = locals.jwt;

    let data = { title, text, tag, photo };

    const res = await api.put(`api/v2/posts/${params.slug}`, data, token);
    
    return {
        status: 200,
        body: res
    }
}
