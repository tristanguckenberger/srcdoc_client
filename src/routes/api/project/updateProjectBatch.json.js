import * as api from '$lib/api.js';


export async function put({ request, locals }) {
    
    let { pageData, pid } = await request.json();
    const token = locals.jwt;

    let data = { pageData, pid };

    const res = await api.put(`api/v2/projects`, data, token);
    
    return {
        status: 200,
        body: res
    }
}
