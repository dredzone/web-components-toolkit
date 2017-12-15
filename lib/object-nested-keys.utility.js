/*  */
import {isType} from './is-type.utility';

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
