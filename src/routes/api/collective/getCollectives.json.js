import * as api from '$lib/api.js';
const page = 1;
const limit = 100;
export async function get() {
    const res = await api.get(`api/v2/collectives`);

    return {
        status: 200,
        body: res
    }
}
