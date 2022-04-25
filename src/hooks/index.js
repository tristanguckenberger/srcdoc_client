import * as cookie from 'cookie';

export async function handle({ event, resolve }) {
	const cookies = cookie.parse(event.request.headers.get("cookie") || '');
	const jwt = cookies.jwt ? cookies.jwt && Buffer.from(cookies.jwt, 'base64').toString('utf-8'): null;
    const data = jwt ? jwt.split('.')[1] : null;
	event.locals.token = data ? JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) : null;
	event.locals.jwt = jwt ? JSON.parse(jwt) : null;
	return await resolve(event);
}

export function getSession({ locals }) {
	return locals.token ? {
		user: locals.token && {
            id: locals.token.id,
			username: locals.token.username,
            nickname: locals.token.nickname,
			email: locals.token.email,
            photo: locals.token.photo,
            bio: locals.token.bio,
            active: locals.token.active,
		}
	} : 
    null;
}
