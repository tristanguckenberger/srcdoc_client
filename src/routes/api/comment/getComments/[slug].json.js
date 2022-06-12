import * as api from '$lib/api.js';

export async function get({ params }) {
    // const res = await api.get(params.slug === "/all" ? `api/v2/comments` : `api/v2/comments?${params.slug}`);
    const response = await api.get(`api/v2/posts/${params.slug}/comments`);
    const postComments = response.data;
    let nested;



    return {
        status: 200,
        body: postComments
    }
}
