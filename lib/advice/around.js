/*  */
export default (behaviour, ...methodNames) => {
	return function (clazz) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName = methodNames[i];
			const method = clazz.prototype[methodName];
			Object.defineProperty(clazz.prototype, methodName, {
				value: function (...args) {
					args.unshift(method);
					behaviour.apply(this, args);
				},
				writable: true
			});
		}
		return clazz;
	};
};
