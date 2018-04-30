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
					try {
						return method.apply(this, args);
					} catch (err) {
						behaviour.call(this, err);
					}
				},
				writable: true
			});
		}
		return klass;
	};
};
