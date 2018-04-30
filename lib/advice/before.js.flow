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
					behaviour.apply(this, args);
					return method.apply(this, args);
				},
				writable: true
			});
		}
		return klass;
	};
};
