/*  */
import isUndefined from 'lodash/isUndefined';

export default (obj, key, defaultValue) => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts = key.split('.');
	const length = parts.length;
	let object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isUndefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};
