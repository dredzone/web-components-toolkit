/*  */

export const adviceAfterThrow = (behaviour, ...methodNames) => {
	return function (clazz) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName = methodNames[i];
			const method = clazz.prototype[methodName];
			Object.defineProperty(clazz.prototype, methodName, {
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
	};
};
