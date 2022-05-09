import * as api from '$lib/api.js';
import * as cookie from 'cookie';


export async function get() {
    await api.get('api/v2/auth/logout');
	return {
        headers: {
            'set-cookie': `jwt=deleted; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
        status: 302,
        redirect: "/",
    }
}
