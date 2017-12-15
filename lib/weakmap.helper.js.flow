/* @flow */
import {symbols} from './symbols.utility';
import {window} from './constants';

export const WeakMap = window.WeakMap || function (): Object {
	const objectWeakMapId = symbols.get('_WeakMap');
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
