export const not = (fn: Function) => !fn.apply(null, Array.prototype.slice.call(arguments));

export const all = (fn: Function) => {
	const params = Array.prototype.slice.call(arguments);
	const len = params.length;
	for (let i = 0; i < len; i++) {
		if (fn(params[i])) {
			return false;
		}
	}
	return true;
};

export const any = (fn: Function) => {
	const params = Array.prototype.slice.call(arguments);
	const len = params.length;
	for (let i = 0; i < len; i++) {
		if (fn(params[i])) {
			return true;
		}
	}
	return false;
};

export const setApi = (is: Object): void => {
	Object.keys(is).forEach(key => {
		let interfaces = is[key].api || ['not', 'all', 'any'];
		for (let i = 0; i < interfaces.length; i++) {
			if (interfaces[i] === 'not') {
				is.not[key] = not(is[key]);
			}
			if (interfaces[i] === 'all') {
				is.all[key] = all(is[key]);
			}
			if (interfaces[i] === 'any') {
				is.any[key] = any(is[key]);
			}
		}
	});
	return is;
};
