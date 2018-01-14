/* @flow */
import {isType} from './is-type.utility';

export type ObjectNestedKeysType = {
	get(obj: Object, key: string, defaultValue: any): any,
	set(obj: Object, key: string, value: any): void
};

export const objectNestedKeys: ObjectNestedKeysType = {
	get(obj: Object, key: string, defaultValue: any) {
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
	},

	set(obj: Object, key: string, value: any) {
		if (key.indexOf('.') === -1) {
			obj[key] = value;
		} else {
			const parts: string[] = key.split('.');
			const length: number = parts.length;
			let object: Object = obj;

			for (let i = 0; i < length - 1; i++) {
				if (isType.undefined(object[parts[i]])) {
					object[parts[i]] = {};
				}
				object = object[parts[i]];
			}
			object[parts[length - 1]] = value;
		}
	}
};
