/*  */
export default (fn) => {
	return (...params) => {
		const len = params.length;
		for (let i = 0; i < len; i++) {
			if (!fn(params[i])) {
				return false;
			}
		}
		return true;
	};
};
