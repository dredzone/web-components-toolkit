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
					args.unshift(method);
					behaviour.apply(this, args);
				},
				writable: true
			});
		}
		return klass;
	};
};
