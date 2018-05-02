/* @flow */
export default (fn: Function): Function => {
	return (...params: Array<any>) => {
		const len: number = params.length;
		for (let i = 0; i < len; i++) {
			if (fn(params[i])) {
				return true;
			}
		}
		return false;
	};
};
