import * as api from '$lib/api.js';
const page = 1;
const limit = 100;
export async function get(uid) {
    // byUser
    // const res = await api.get(`api/v1/posts?page=${page}&limit=${limit}`);
    const res = await api.get(`api/v1/posts`);

    return {
        status: 200,
        body: res
    }
}
