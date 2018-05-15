/*  */
import type from './type.js';

export const dset = (obj, key, value) => {
	if (key.indexOf('.') === -1) {
		obj[key] = value;
		return;
	}
	const parts = key.split('.');
	const depth = parts.length - 1;
	let object = obj;

	for (let i = 0; i < depth; i++) {
		if (type.undefined(object[parts[i]])) {
			object[parts[i]] = {};
		}
		object = object[parts[i]];
	}
	object[parts[depth]] = value;
};

export const dget = (obj, key, defaultValue = undefined) => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts = key.split('.');
	const length = parts.length;
	let object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (type.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};

const {keys} = Object;

export const toMap = (o) => keys(o).reduce(
	(m, k) => m.set(k, o[k]),
	new Map()
);
