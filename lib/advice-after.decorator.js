/*  */

export const adviceAfter = (behaviour, ...methodNames) => {
	return function (clazz) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName = methodNames[i];
			const method = clazz.prototype[methodName];
			Object.defineProperty(clazz.prototype, methodName, {
				value: function (...args) {
					const returnValue = method.apply(this, args);
					behaviour.apply(this, args);
					return returnValue;
				},
				writable: true
			});
		}
		return clazz;
	};
};
