import http from '../lib/http.js';

describe('http', () => {
	it('create http', () => {
		const delayMiddleware = delay => next => (url, opts) => {
			return new Promise(res => setTimeout(() => res(next(url, opts)), delay));
		};

		/* Logs all requests passing through. */
		const logMiddleware = () => next => (url, opts) => {
			console.log(opts.method + "@" + url);
			return next(url, opts)
		};

		let jsonApi = http()
			.json()
			.mode('cors')
			.middleware([delayMiddleware(3000), logMiddleware()])
			.credentials('same-origin')
			.headers({'X-Requested-By': 'DEEP-UI'});

		jsonApi
			.url('/http-client-get-test')
			.get()
			.json(data => console.log(data));
		// assert.instanceOf(http(), 'http is instance of Http');
	});
});
