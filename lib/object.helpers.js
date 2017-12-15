/*  */
import {isType} from './is-type.utility';

const {freeze, getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

/**
 * A helper function for deep freezing of objects
 *
 */
export const deepFreeze = (o) => {
	freeze(o);
	getOwnPropertyNames(o).forEach((prop) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (isType.object(o[prop]) || isType.function(o[prop])) && !isFrozen(o[prop])) {
			deepFreeze(o[prop]);
		}
	});
	return o;
};

export const getPropertyValue = (obj, key, defaultValue) => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts = key.split('.');
	const length = parts.length;
	let object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isType.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};

export const setPropertyValue = (obj, key, defaultValue) => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts = key.split('.');
	const length = parts.length;
	let object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isType.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};
