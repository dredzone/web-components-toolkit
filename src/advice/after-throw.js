/* @flow */
export default (behaviour: Function, ...methodNames: string[]): Function => {
	return function (clazz: Class<any>) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName: string = methodNames[i];
			const method: Function = clazz.prototype[methodName];
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
