export async function respond(body) {
	if (body.errors) {
		return { status: 401, body };
	}

	const json = JSON.stringify(body.token);
	const gCred = JSON.stringify(body.gCred);
	const value = Buffer.from(json).toString('base64');
	const gVal = Buffer.from(gCred).toString('base64');
    const data = json ? json.split('.')[1] : null;
    const user = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))

	if (user && user.active) {
		return {
			headers: {
				'set-cookie': `jwt=${value}; Path=/; HttpOnly`
			},
			body: user
		};
	} else {
		return {
			status: 401,
			headers: {
                'set-cookie': `jwt=deleted; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            },
			body: user
		};
	}

	
}