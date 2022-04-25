import * as api from '$lib/api.js';
const page = 1;
const limit = 100;
export async function get({ params }) {
    // console.log(params.slug);
    const { slug } = params;
    // console.log(slug);
    let userId;
    if (slug.includes(".json")) {
        userId = slug.split('.')[0];
    }

    const res = await api.get(`api/v1/posts/${userId}/posts`);
  
    return {
        status: 200,
        body: res
    }
}
