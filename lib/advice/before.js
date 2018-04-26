/*  */
export default (behaviour, ...methodNames) => {
	return function (clazz) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName = methodNames[i];
			const method = clazz.prototype[methodName];
			Object.defineProperty(clazz.prototype, methodName, {
				value: function (...args) {
					behaviour.apply(this, args);
					return method.apply(this, args);
				},
				writable: true
			});
		}
		return clazz;
	};
};
