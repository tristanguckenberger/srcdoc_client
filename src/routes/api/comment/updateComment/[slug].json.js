// let url = "api/v1/comments/${CID}";

import * as api from '$lib/api.js';


export async function put({ request, params, locals }) {
    
    let { text } = await request.json();
    const token = locals.jwt;

    let data = { text };

    const res = await api.put(`api/v1/comments/${params.slug}`, data, token);
    
    return {
        status: 200,
        body: res
    }
}
