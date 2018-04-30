/* @flow */
import type from '../is/type';

export default (obj: Object, key: string, value: any): void => {
	if (key.indexOf('.') === -1) {
		obj[key] = value;
		return;
	}
	const parts: string[] = key.split('.');
	const depth: number = parts.length - 1;
	let object: Object = obj;

	for (let i = 0; i < depth; i++) {
		if (type.undefined(object[parts[i]])) {
			object[parts[i]] = {};
		}
		object = object[parts[i]];
	}
	object[parts[depth]] = value;
};
