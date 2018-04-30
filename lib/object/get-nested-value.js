/*  */
import type from '../is/type';

export default (obj, key, defaultValue = undefined) => {
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
