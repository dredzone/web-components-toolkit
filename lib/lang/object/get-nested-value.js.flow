/* @flow */
import isUndefined from 'lodash/isUndefined';

export default (obj: Object, key: string, defaultValue: any): any => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: any = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (isUndefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};
