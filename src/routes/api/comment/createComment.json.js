import * as api from '$lib/api.js';

export async function post({ request, locals }) {
    const formBody = await request.json();
    const token = locals.jwt;
    const {  
        postId, 
        text,
        withRepl,
        parentId,
        tag
    } = formBody;
    const res = await api.post(`api/v2/posts/${postId}/comments`, {
        postId, 
        text,
        withRepl,
        parentId,
        tag
	}, token);

    return {
        status: 200,
        body: res
    }
}
