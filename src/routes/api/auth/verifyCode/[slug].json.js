import * as api from '$lib/api.js';
import { respond } from '../_respond';

export async function get({ params }) {
    const res = await api.get(`api/v1/auth/verify/${params.slug}`);
    // console.log(res);
    if (res.success) {
		return respond(res);
	} else {
        return {
            headers: {
                'set-cookie': `jwt=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            },
            body: {
                ok: true
            }
        }
    }
    
}
