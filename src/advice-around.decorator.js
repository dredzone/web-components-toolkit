/* @flow */
export const adviceAround: Function = (behaviour: Function, ...methodNames: string[]): Function => {
	return function (clazz: Class<any>) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName: string = methodNames[i];
			const method: Function = clazz.prototype[methodName];
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
