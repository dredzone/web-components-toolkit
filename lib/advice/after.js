/*  */
export default (behaviour, ...methodNames) => {
	return function (klass) {
		const proto = klass.prototype;
		const len = methodNames.length;
		const {defineProperty} = Object;
		for (let i = 0; i < len; i++) {
			const methodName = methodNames[i];
			const method = proto[methodName];
			defineProperty(proto, methodName, {
				value: function (...args) {
					const returnValue = method.apply(this, args);
					behaviour.apply(this, args);
					return returnValue;
				},
				writable: true
			});
		}
		return klass;
	};
};
