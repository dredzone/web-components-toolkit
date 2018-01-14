/* @flow */

export const adviceAfter: Function = (behaviour: Function, ...methodNames: string[]): Function => {
	return function (clazz: Class<any>) {
		for (let i = 0; i < methodNames.length; i++) {
			const methodName: string = methodNames[i];
			const method: Function = clazz.prototype[methodName];
			Object.defineProperty(clazz.prototype, methodName, {
				value: function (...args) {
					const returnValue: any = method.apply(this, args);
					behaviour.apply(this, args);
					return returnValue;
				},
				writable: true
			});
		}
		return clazz;
	};
};
