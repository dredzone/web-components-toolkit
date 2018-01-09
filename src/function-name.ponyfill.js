/* @flow */
import {isType} from './is-type.utility';

export const functionName = (fn: Function): string => {
	let name = fn.name;
	if (isType.undefined(name)) {
		let matches: any = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
		if (Array.isArray(matches) && matches.length > 0) {
			name = matches[1];
		}
	}
	return name;
};
