const base = 'http://localhost:5001';

async function send({ method, path, data, token }) {
	const opts = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		try {
			opts.body = JSON.stringify(data);
		} catch (error) {
			console.log(error);
		}
		
	}

	if (token) {
		opts.headers['Authorization'] = `Bearer ${token}`;
		opts.headers['credentials'] = "include";
	}

	return fetch(`${base}/${path}`, opts)
		.then((r) => r.text())
		.then((json) => {
			try {
				return JSON.parse(json);
			} catch (err) {
				return json;
			}
		});
}

export function get(path, token, data) {
	return send({ method: 'GET', path, data, token });
}

export function del(path, token, data) {
	return send({ method: 'DELETE', path, data, token });
}

export function post(path, data, token) {
	return send({ method: 'POST', path, data, token });
}

export function put(path, data, token) {
	return send({ method: 'PUT', path, data, token });
}