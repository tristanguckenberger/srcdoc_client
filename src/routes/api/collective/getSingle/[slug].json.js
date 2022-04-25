import * as api from '$lib/api.js';
import marked from "marked";
const page = 1;
const limit = 100;
export async function get({ params }) {

    const res = await api.get(`api/v1/collectives/${params.slug}`);
  
    return {
        status: 200,
        body: res
    }
}
