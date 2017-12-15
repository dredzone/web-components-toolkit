/*  */

export const not = (fn) => !(fn.apply(null, Array.prototype.slice.call(arguments)));

export const all = (fn) => {
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

export const any = (fn) => {
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

const {assign, keys} = Object;
export const setApi = (is) => {
	let api = assign({not: {}, all: {}, any: {}}, is);
	keys(api).forEach(key => {
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