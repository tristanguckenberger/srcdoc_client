// let url = "api/v2/comments/${CID}";

import * as api from '$lib/api.js';


export async function put({ request, params, locals }) {
    
    let { text } = await request.json();
    const token = locals.jwt;

    let data = { text };

    const res = await api.put(`api/v2/comments/${params.slug}`, data, token);
    
    return {
        status: 200,
        body: res
    }
}
