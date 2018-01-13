/* @flow */
import {window} from './constants';

export const Map = window.Map || function (): Object {
	let i;
	let k = [];
	let v = [];
	const has = (obj: Object): boolean => {
		i = k.indexOf(obj);
		return i > -1;
	};
	return {
		has,
		get size(): number {
			return k.length;
		},
		clear: (): void => {
			k = [];
			v = [];
		},
		get: (obj: Object): any => v[k.indexOf(obj)],
		keys: () => k.slice(),
		values: () => v.slice(),
		entries: () => k.map((key, i) => [key, v[i]]),
		delete: obj => has(obj) && k.splice(i, 1) && Boolean(v.splice(i, 1)),
		forEach(fn: Function, self: Object | null): void {
			v.forEach((value: any, i: number) => fn.call(self, value, k[i], this));
		},
		set(obj: Object, value: any): Object {
			if (has(obj)) {
				v[i] = value;
			} else {
				v[k.push(obj) - 1] = value;
			}
			return this;
		}
	};
};
