import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const formBody = await request.json();;
    const token = locals.jwt;
    const { 
        title,
        text,
        selectedTag,
        photo,
    } = formBody;
    const res = await api.post(`api/v2/posts`, {
        title,
        text,
        selectedTag,
        photo,
	},
    token);


    return {
        status: 200,
        body: res
    }
}
