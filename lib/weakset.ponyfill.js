/*  */
import {WeakMap} from './weakmap.ponyfill';
import {global} from './global-scope.utility';

export const WeakSet = global.WeakSet || function () {
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
