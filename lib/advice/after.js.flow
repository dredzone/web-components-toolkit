/* @flow */
export default (behaviour: Function, ...methodNames: string[]): Function => {
	return function (klass: Class<any>) {
		const proto: any = klass.prototype;
		const len: number = methodNames.length;
		const {defineProperty} = Object;
		for (let i = 0; i < len; i++) {
			const methodName: string = methodNames[i];
			const method: Function = proto[methodName];
			defineProperty(proto, methodName, {
				value: function (...args) {
					const returnValue: any = method.apply(this, args);
					behaviour.apply(this, args);
					return returnValue;
				},
				writable: true
			});
		}
		return klass;
	};
};
