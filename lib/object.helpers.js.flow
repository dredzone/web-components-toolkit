/* @flow */
import {isType} from './is-type.utility';

const {freeze, getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

/**
 * A helper function for deep freezing of objects
 *
 */
export const deepFreeze = (o: Object): Object => {
	freeze(o);
	getOwnPropertyNames(o).forEach((prop: string) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (isType.object(o[prop]) || isType.function(o[prop])) && !isFrozen(o[prop])) {
			deepFreeze(o[prop]);
		}
	});
	return o;
};

export const getPropertyValue = (obj: Object, key: string, defaultValue: any): any => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: Object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isType.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};

export const setPropertyValue = (obj: Object, key: string, defaultValue: any): any => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: Object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isType.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};
