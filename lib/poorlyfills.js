/*  */
import {global} from './constants';
import {symbols} from './symbols';

export const Map = global.Map || function () {
	let i;
	let k = [];
	let v = [];
	const has = (obj) => {
		i = k.indexOf(obj);
		return i > -1;
	};
	return {
		has,
		get size() {
			return k.length;
		},
		clear: () => {
			k = [];
			v = [];
		},
		get: (obj) => v[k.indexOf(obj)],
		keys: () => k.slice(),
		values: () => v.slice(),
		entries: () => k.map((key, i) => [key, v[i]]),
		delete: obj => has(obj) && k.splice(i, 1) && Boolean(v.splice(i, 1)),
		forEach(fn, self) {
			v.forEach((value, i) => fn.call(self, value, k[i], this));
		},
		set(obj, value) {
			if (has(obj)) {
				v[i] = value;
			} else {
				v[k.push(obj) - 1] = value;
			}
			return this;
		}
	};
};

export const Set = global.Set || function () {
	const m = new Map();
	const set = m.set;
	delete m.get;
	delete m.set;
	m.add = obj => set.call(m, obj, obj);
	return m;
};

export const WeakMap = global.WeakMap || function () {
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
