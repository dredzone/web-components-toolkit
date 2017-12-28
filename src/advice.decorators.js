/* @flow */
import type {AdviceType} from './advice.typefile';

const {defineProperty} = Object;

export const advice: AdviceType = Object.freeze({
	before: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let methodName: string of methodNames) {
				const method: Function = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						behaviour.apply(this, args);
						return method.apply(this, args);
					},
					writable: true
				});
			}
			return clazz;
		},

	after: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let methodName: string of methodNames) {
				const method: Function = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						const returnValue: any = method.apply(this, args);
						behaviour.apply(this, args);
						return returnValue;
					},
					writable: true
				});
			}
			return clazz;
		},

	around: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let methodName: string of methodNames) {
				const method: Function = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						let bound: Function = behaviour.bind(this);
						bound(method, ...args);
					},
					writable: true
				});
			}
			return clazz;
		},

	afterThrow: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let methodName: string of methodNames) {
				const method: Function = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
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
		}
});
