export async function respond(body) {

	console.log(body)
	if (body.errors) {
		return { status: 401, body };
	}

	let json;
	let value;
	let data;
	let user;

	if (body?.token) {
		json = JSON.stringify(body.token);
		value = Buffer.from(json).toString('base64');
		data = json ? json.split('.')[1] : null;
		user = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
	}


	// const gCred = JSON.stringify(body.gCred);
	// const gVal = Buffer.from(gCred).toString('base64');



	if (user && user?.active) {
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