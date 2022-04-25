import * as api from '$lib/api.js';
export async function get({ params }) {
    let id = params.slug;
    const res = await api.get(`api/vote-service/v1/votes/${id}/getCount`);
  
    return {
        status: 200,
        body: res
    }
}
