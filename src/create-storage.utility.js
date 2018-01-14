/* @flow */
import {WeakMap} from './weakmap.ponyfill';

export const createStorage: Function = (creator: Function = Object.create.bind(null, null, {})): Function => {
	let store = new WeakMap();
	return (obj: any): any => {
		let value = store.get(obj);
		if (!value) {
			store.set(obj, value = creator(obj));
		}
		return value;
	};
};
