/* @flow */
import {global} from './global-scope.utility';
import {uniqueString} from './unique-string.utility';

export const WeakMap = global.WeakMap || function (): Object {
	const objectWeakMapId = uniqueString.get('_WeakMap');
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
