import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const formBody = await request.json();
    const token = locals.jwt;

    const { 
        pageData,
        PID,
        comment
    } = formBody;

    const res = await api.post(`api/v1/projects`, {
        pageData,
        PID,
        comment
	},
    token);

	return {
        status: 200,
        body: res
    }
}