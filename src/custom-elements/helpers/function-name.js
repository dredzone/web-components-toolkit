/* @flow */
import isUndefined from 'lodash/isUndefined';

export default (fn: Function): string => {
	let name = fn.name;
	if (isUndefined(name)) {
		let matches: any = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
		if (Array.isArray(matches) && matches.length > 0) {
			name = matches[1];
		}
	}
	return name;
};
