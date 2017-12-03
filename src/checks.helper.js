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
	}
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
	}
};

export const setApi = (checker: Object): void => {
	Object.assign(checker, {not: {}, all: {}, any: {}});
	Object.keys(checker).forEach(key => {
		if (typeof checker[key] === 'function') {
			let interfaces = checker[key].api || ['not', 'all', 'any'];
			for (let i = 0; i < interfaces.length; i++) {
				if (interfaces[i] === 'not') {
					checker.not[key] = not(checker[key]);
				}
				if (interfaces[i] === 'all') {
					checker.all[key] = all(checker[key]);
				}
				if (interfaces[i] === 'any') {
					checker.any[key] = any(checker[key]);
				}
			}
		}
	});
};
