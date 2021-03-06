import * as api from '$lib/api.js';
export async function get({ params }) {
    const res = await api.get(`api/v2/posts/${params.slug}/projects`);
  
    return {
        status: 200,
        body: res
    }
}
