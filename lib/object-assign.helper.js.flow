/* @flow */
import {isType} from './is-type.utility';

export const objectAssign = Object.assign || function (target: Object, ...sources: Array<Object>): Object {
	if (isType.undefined(target) || isType.null(target)) {
		throw new TypeError('Cannot convert first argument to object');
	}

	let to = Object(target);
	for (let i = 0; i < sources.length; i++) {
		let nextSource = sources[i];
		if (isType.undefined(nextSource) || isType.null(nextSource)) {
			continue;
		}
		let keys = Object.keys(Object(nextSource));
		keys.forEach((key: string) => {
			let desc = Object.getOwnPropertyDescriptor(nextSource, key);
			if (!isType.undefined(desc) && desc.enumerable) {
				to[key] = nextSource[key];
			}
		});
	}
	return to;
};
