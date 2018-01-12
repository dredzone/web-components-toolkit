/*  */
import {uniqueString} from './unique-string.utility';

export const WeakMap = function () {
	const objectWeakMapId = uniqueString.get('_WeakMap');
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
