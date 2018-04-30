/* @flow */
export default (fn: Function): Function => {
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
