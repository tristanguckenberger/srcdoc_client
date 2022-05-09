import * as api from '$lib/api.js';
export async function get({ params }) {
    let id = params.slug;
    const res = await api.get(`api/v2/users/${id}`);
  
    return {
        status: 200,
        body: res
    }
}
