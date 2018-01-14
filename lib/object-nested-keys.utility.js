/*  */
import {isType} from './is-type.utility';


export const objectNestedKeys = {
	get(obj, key, defaultValue) {
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
	},

	set(obj, key, value) {
		if (key.indexOf('.') === -1) {
			obj[key] = value;
		} else {
			const parts = key.split('.');
			const length = parts.length;
			let object = obj;

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
