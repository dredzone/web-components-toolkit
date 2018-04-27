/*  */
import isUndefined from 'lodash/isUndefined';

export default (fn) => {
	let name = fn.name;
	if (isUndefined(name)) {
		let matches = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
		if (Array.isArray(matches) && matches.length > 0) {
			name = matches[1];
		}
	}
	return name;
};
