/*  */
import createStorage from '../create-storage.js';
import {buildRequest, processRequest, processResponse} from './request.js';


const privates = createStorage();

export class FetchClient {
	constructor(config) {
		privates(this).config = config;
	}

	addInterceptor(interceptor) {
		privates(this).config.withInterceptor(interceptor);
	}

	fetch(input, init = {}) {
		let request = buildRequest(input, init, privates(this).config);

		return processRequest(request, privates(this).config.interceptors)
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
				return processResponse(response, privates(this).config.interceptors);
			})
			.then((result) => {
				if (result instanceof Request) {
					return this.fetch(result);
				}
				return result;
			});
	}
}
