/*  */
export const Map = function () {
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
