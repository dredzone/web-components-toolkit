/* @flow */
import {objectAssign} from './object-assign.utility';

export type IsType = {[key: string]: (val: any) => boolean};

export type ApiIsType = IsType & {
	not: {[key: string]: (val: Function) => Function};
	all: {[key: string]: (val: Function) => Function};
	any: {[key: string]: (val: Function) => Function};
};

export const not = (fn: Function): Function => !(fn.apply(null, Array.prototype.slice.call(arguments)));

export const all = (fn: Function): Function => {
	return () => {
		const params = Array.prototype.slice.call(arguments);
		const len = params.length;
		for (let i = 0; i < len; i++) {
			if (fn(params[i])) {
				return false;
			}
		}
		return true;
	};
};

export const any = (fn: Function): Function => {
	return () => {
		const params = Array.prototype.slice.call(arguments);
		const len = params.length;
		for (let i = 0; i < len; i++) {
			if (fn(params[i])) {
				return true;
			}
		}
		return false;
	};
};

export const setApi = (is: IsType): ApiIsType => {
	let api: ApiIsType = objectAssign({not: {}, all: {}, any: {}}, is);
	Object.keys(api).forEach(key => {
		if (typeof api[key] === 'function') {
			let interfaces = api[key].api || ['not', 'all', 'any'];
			for (let i = 0; i < interfaces.length; i++) {
				if (interfaces[i] === 'not') {
					api.not[key] = not(api[key]);
				}
				if (interfaces[i] === 'all') {
					api.all[key] = all(api[key]);
				}
				if (interfaces[i] === 'any') {
					api.any[key] = any(api[key]);
				}
			}
		}
	});
	return api;
};
