/*  */

const {defineProperty} = Object;

export const advice = Object.freeze({
	before: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let methodName of methodNames) {
				const method = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						behaviour.apply(this, args);
						return method.apply(this, args);
					},
					writable: true
				});
			}
			return clazz;
		},

	after: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let methodName of methodNames) {
				const method = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						const returnValue = method.apply(this, args);
						behaviour.apply(this, args);
						return returnValue;
					},
					writable: true
				});
			}
			return clazz;
		},

	around: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let methodName of methodNames) {
				const method = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						let bound = behaviour.bind(this);
						bound(method, ...args);
					},
					writable: true
				});
			}
			return clazz;
		},

	afterThrow: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let methodName of methodNames) {
				const method = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						try {
							return method.apply(this, args);
						} catch (err) {
							behaviour.call(this, err);
						}
					},
					writable: true
				});
			}
			return clazz;
		}
});
