/* @flow */
import isUndefined from 'lodash/isUndefined';

export default (obj: Object, key: string, value: any): void => {
	if (key.indexOf('.') === -1) {
		obj[key] = value;
	} else {
		const parts: string[] = key.split('.');
		const length: number = parts.length;
		let object: Object = obj;

		for (let i = 0; i < length - 1; i++) {
			if (isUndefined(object[parts[i]])) {
				object[parts[i]] = {};
			}
			object = object[parts[i]];
		}
		object[parts[length - 1]] = value;
	}
};
