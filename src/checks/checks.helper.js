export const checksHelper = Object.freeze({
	not(fn: Function): Function {
		return () => !(fn.apply(null, Array.prototype.slice.call(arguments)));
	},

	all(fn: Function): Function {
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
	},

	any(fn: Function): Function {
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
	},

	setApi(checker: Object): void {
		Object.keys(checker).forEach(key => {
			if (typeof checker[key] === 'function') {
				let interfaces = checker[key].api || ['not', 'all', 'any'];
				for (let i = 0; i < interfaces.length; i++) {
					if (interfaces[i] === 'not') {
						checker.not[key] = checksHelper.not(checker[key]);
					}
					if (interfaces[i] === 'all') {
						checker.all[key] = checksHelper.all(checker[key]);
					}
					if (interfaces[i] === 'any') {
						checker.any[key] = checksHelper.any(checker[key]);
					}
				}
			}
		});
	}
});
