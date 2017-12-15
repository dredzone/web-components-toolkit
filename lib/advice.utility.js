/*  */
export const before = (instance, method, advice) => {
	let orig = instance[method];
	instance[method] = function () {
		advice.apply(this, arguments);
		return orig.apply(this, arguments);
	}.bind(instance);
};

export const after = (instance, method, advice) => {
	let orig = instance[method];
	instance[method] = function () {
		let value;
		let args = Array.prototype.slice.call(arguments, 0);
		try {
			value = orig.apply(this, arguments);
			if (value) {
				args.unshift(value);
			}
			advice.apply(this, args);
			return value;
		} catch (err) {
			value = err;
			args.unshift(value);
			advice.apply(this, args);
			throw err;
		}
	}.bind(instance);
};

export const around = (instance, method, advice) => {
	let orig = instance[method];
	instance[method] = function () {
		let args = Array.prototype.slice.call(arguments, 0);
		args.unshift(orig);
		return advice.apply(this, args);
	}.bind(instance);
};

export const afterReturn = (instance, method, advice) => {
	let orig = instance[method];
	instance[method] = function () {
		let value = orig.apply(this, arguments);
		let args = Array.prototype.slice.call(arguments, 0);
		if (value) {
			args.unshift(value);
		}
		advice.apply(this, args);
		return value;
	}.bind(instance);
};

export const afterThrow = (instance, method, advice) => {
	let orig = instance[method];
	instance[method] = function () {
		try {
			return orig.apply(this, arguments);
		} catch (err) {
			let args = Array.prototype.slice.call(arguments, 0);
			args.unshift(err);
			advice.apply(this, args);
			throw err;
		}
	}.bind(instance);
};
