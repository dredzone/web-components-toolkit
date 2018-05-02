/* @flow */
import all from './api/all';
import any from './api/any';
import not from './api/not';

export type IsApi<T> = {
	is: T;
	not: T | Object;
	all: T | Object;
	any: T | Object;
};

const {keys} = Object;

export default <T>(checks: T): IsApi<T> => {
	const api: IsApi<T> = {not: {}, all: {}, any: {}, is: checks};
	keys(api).forEach(key => {
		if (typeof api[key] === 'function') {
			let interfaces: string[] = api[key].api || ['not', 'all', 'any'];
			for (let i = 0; i < interfaces.length; i++) {
				if (interfaces[i] === 'not') {
					// $FlowFixMe
					api.not[key] = not(api[key]);
				}
				if (interfaces[i] === 'all') {
					// $FlowFixMe
					api.all[key] = all(api[key]);
				}
				if (interfaces[i] === 'any') {
					// $FlowFixMe
					api.any[key] = any(api[key]);
				}
			}
		}
	});
	return api;
};
