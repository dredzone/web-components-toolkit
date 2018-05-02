/*  */
import type from '../is/type';

export default (obj, key, value) => {
	if (key.indexOf('.') === -1) {
		obj[key] = value;
		return;
	}
	const parts = key.split('.');
	const depth = parts.length - 1;
	let object = obj;

	for (let i = 0; i < depth; i++) {
		if (type.is.undefined(object[parts[i]])) {
			object[parts[i]] = {};
		}
		object = object[parts[i]];
	}
	object[parts[depth]] = value;
};
