import * as api from '$lib/api.js';

export async function put({ request, locals }) {
    
    let { password } = await request.json();
    const token = locals.jwt;

    let data = { password };

    const res = await api.put(`api/v1/auth/updatepassword`, data, token);
    
    return {
        status: 200,
        body: res
    }
}
