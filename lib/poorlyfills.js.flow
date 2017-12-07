/* @flow */
import {global} from './constants';
import {symbols} from './symbols';

export const Map = global.Map || function (): Object {
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

export const Set = global.Set || function (): Object {
	const m = new Map();
	const set = m.set;
	delete m.get;
	delete m.set;
	m.add = obj => set.call(m, obj, obj);
	return m;
};

export const WeakMap = global.WeakMap || function (): Object {
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

export const WeakSet = global.WeakSet || function (): Object {
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
