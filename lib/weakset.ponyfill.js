/*  */
import {WeakMap} from './weakmap.ponyfill';
import {window} from './constants';

export const WeakSet = window.WeakSet || function () {
	const wm = new WeakMap();
	return {
		has: obj => wm.get(obj) === true,
		delete: wm.delete,
		add(obj) {
			wm.set(obj, true);
			return this;
		}
	};
};
