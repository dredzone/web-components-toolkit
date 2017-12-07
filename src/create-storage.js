/* @flow */
import {WeakMap} from './poorlyfills';

export const createStorage = (creator: Function): Function => {
	let store = new WeakMap();
	if (!creator) {
		creator = Object.create.bind(null, null, {});
	}
	return (obj: any): any => {
		let value = store.get(obj);
		if (!value) {
			store.set(obj, value = creator(obj));
		}
		return value;
	};
};
