/*  */
import {symbols} from './symbols.utility';
import {window} from './constants';

export const WeakMap = window.WeakMap || function () {
	const objectWeakMapId = symbols.get('_WeakMap');
	return {
		delete(obj) {
			delete obj[objectWeakMapId];
		},
		get(obj) {
			return obj[objectWeakMapId];
		},
		has(obj) {
			return Object.hasOwnProperty.call(obj, objectWeakMapId);
		},
		set(obj, value) {
			Object.defineProperty(obj, objectWeakMapId, {
				configurable: true,
				value: value
			});
		}
	};
};
