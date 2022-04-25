import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const formBody = await request.json();;
    const token = locals.jwt;
    const { 
        CID,
        title,
        text,
        selectedTag,
        photo,
    } = formBody;
    const res = await api.post(`api/v1/collectives/${CID}/posts`, {
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
