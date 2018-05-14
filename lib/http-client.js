/*  */
import createStorage from './create-storage.js';
import type from './type.js';



/**
 * The init object used to initialize a fetch Request.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 */

const privates = createStorage();

/**
 * A class for configuring HttpClients.
 */
export class Configurator {
	get baseUrl() {
		return privates(this).baseUrl;
	}

	get defaults() {
		return Object.freeze(privates(this).defaults);
	}

	get interceptors() {
		return privates(this).interceptors;
	}

	constructor() {
		privates(this).baseUrl = '';
		privates(this).interceptors = [];
	}

	withBaseUrl(baseUrl) {
		privates(this).baseUrl = baseUrl;
		return this;
	}

	withDefaults(defaults) {
		privates(this).defaults = defaults;
		return this;
	}

	withInterceptor(interceptor) {
		privates(this).interceptors.push(interceptor);
		return this;
	}

	useStandardConfigurator() {
		let standardConfig = {
			mode: 'cors',
			credentials: 'same-origin',
			headers: {
				Accept: 'application/json',
				'X-Requested-By': 'DEEP-UI'
			}
		};
		privates(this).defaults = Object.assign({}, standardConfig);
		return this.rejectErrorResponses();
	}

	rejectErrorResponses() {
		return this.withInterceptor({ response: rejectOnError });
	}
}

export class HttpClient {
	constructor(config) {
		privates(this).config = config;
	}

	addInterceptor(interceptor) {
		privates(this).config.withInterceptor(interceptor);
	}

	fetch(input, init = {}) {
		let request = this._buildRequest(input, init);

		return this._processRequest(request)
			.then((result) => {
				let response;

				if (result instanceof Response) {
					response = Promise.resolve(result);
				} else if (result instanceof Request) {
					request = result;
					response = fetch(result);
				} else {
					throw new Error(
						`An invalid result was returned by the interceptor chain. Expected a Request or Response instance`
					);
				}
				return this._processResponse(response);
			})
			.then((result) => {
				if (result instanceof Request) {
					return this.fetch(result);
				}
				return result;
			});
	}

	get(input, init) {
		return this.fetch(input, init);
	}

	post(input, body, init) {
		return this._fetch(input, 'POST', body, init);
	}

	put(input, body, init) {
		return this._fetch(input, 'PUT', body, init);
	}

	patch(input, body, init) {
		return this._fetch(input, 'PATCH', body, init);
	}

	delete(input, body, init) {
		return this._fetch(input, 'DELETE', body, init);
	}

	_buildRequest(input, init = {}) {
		let defaults = privates(this).config.defaults || {};
		let request;
		let body = '';
		let requestContentType;
		let parsedDefaultHeaders = parseHeaderValues(defaults.headers);

		if (input instanceof Request) {
			request = input;
			requestContentType = new Headers(request.headers).get('Content-Type');
		} else {
			body = init.body;
			let bodyObj = body ? { body } : null;
			let requestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
			requestContentType = new Headers(requestInit.headers).get('Content-Type');
			request = new Request(getRequestUrl(privates(this).config.baseUrl, input), requestInit);
		}
		if (!requestContentType) {
			if (new Headers(parsedDefaultHeaders).has('content-type')) {
				request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
			} else if (body && isJSON(String(body))) {
				request.headers.set('Content-Type', 'application/json');
			}
		}
		setDefaultHeaders(request.headers, parsedDefaultHeaders);
		if (body && body instanceof Blob && body.type) {
			// work around bug in IE & Edge where the Blob type is ignored in the request
			// https://connect.microsoft.com/IE/feedback/details/2136163
			request.headers.set('Content-Type', body.type);
		}
		return request;
	}

	_processRequest(request) {
		return applyInterceptors(request, privates(this).config.interceptors, 'request', 'requestError');
	}

	_processResponse(response) {
		return applyInterceptors(response, privates(this).config.interceptors, 'response', 'responseError');
	}

	_fetch(input, method, body, init) {
		if (!init) {
			init = {};
		}
		init.method = method;
		if (body) {
			init.body = body;
		}
		return this.fetch(input, init);
	}
}

export default (configure = defaultConfig) => {
	if (type.undefined(fetch)) {
		throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
	}
	const config = new Configurator();
	configure(config);
	return new HttpClient(config);
};

function applyInterceptors(
	input,
	interceptors = [],
	successName,
	errorName
) {
	return interceptors.reduce((chain, interceptor) => {
		// $FlowFixMe
		const successHandler = interceptor[successName];
		// $FlowFixMe
		const errorHandler = interceptor[errorName];
		return chain.then(
			(successHandler && successHandler.bind(interceptor)) || identity,
			(errorHandler && errorHandler.bind(interceptor)) || thrower
		);
	}, Promise.resolve(input));
}

function rejectOnError(response) {
	if (!response.ok) {
		throw response;
	}
	return response;
}

function identity(x) {
	return x;
}

function thrower(x) {
	throw x;
}

function parseHeaderValues(headers) {
	let parsedHeaders = {};
	for (let name in headers || {}) {
		if (headers.hasOwnProperty(name)) {
			// $FlowFixMe
			parsedHeaders[name] = type.function(headers[name]) ? headers[name]() : headers[name];
		}
	}
	return parsedHeaders;
}

const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

function getRequestUrl(baseUrl, url) {
	if (absoluteUrlRegexp.test(url)) {
		return url;
	}

	return (baseUrl || '') + url;
}

function setDefaultHeaders(headers, defaultHeaders) {
	for (let name in defaultHeaders || {}) {
		if (defaultHeaders.hasOwnProperty(name) && !headers.has(name)) {
			headers.set(name, defaultHeaders[name]);
		}
	}
}

function isJSON(str) {
	try {
		JSON.parse(str);
	} catch (err) {
		return false;
	}

	return true;
}

function defaultConfig(config) {
	config.useStandardConfigurator();
}
