import {global} from './constants';
import {symbols} from './symbols';

export const WeakMap = global.WeakMap || function () {
	const objectWeakMapId = symbols.get('_objectWeakMap');
	return {
		delete(obj: any) {
			delete obj[objectWeakMapId];
		},
		get(obj: any) {
			return obj[objectWeakMapId];
		},
		has(obj: any) {
			return Object.hasOwnProperty.call(obj, objectWeakMapId);
		},
		set(obj: any, value: any) {
			Object.defineProperty(obj, objectWeakMapId, {
				configurable: true,
				value: value
			});
		}
	};
};
