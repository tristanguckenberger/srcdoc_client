import * as api from '$lib/api.js';
export async function get({ params }) {
    const res = await api.get(`api/v2/projects/${params.slug}/commentProject`);
    // console.log(res);
  
    return {
        status: 200,
        body: res
    }
}
