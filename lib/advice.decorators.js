/*  */

const {defineProperty, freeze} = Object;

export const advice = freeze({
	before: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let i = 0; i < methodNames.length; i++) {
				const methodName = methodNames[i];
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
			for (let i = 0; i < methodNames.length; i++) {
				const methodName = methodNames[i];
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
			for (let i = 0; i < methodNames.length; i++) {
				const methodName = methodNames[i];
				const method = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						args.unshift(method);
						behaviour.apply(this, args);
					},
					writable: true
				});
			}
			return clazz;
		},

	afterThrow: (behaviour, ...methodNames) =>
		(clazz) => {
			for (let i = 0; i < methodNames.length; i++) {
				const methodName = methodNames[i];
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
