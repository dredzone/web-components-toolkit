/* @flow */
import {isType} from './is-type.utility';

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
