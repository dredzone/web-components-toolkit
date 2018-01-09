/* @flow */
import {type AdviceType} from './types';

const {defineProperty, freeze} = Object;

export const advice: AdviceType = freeze({
	before: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let i = 0; i < methodNames.length; i++) {
				const methodName: string = methodNames[i];
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
			for (let i = 0; i < methodNames.length; i++) {
				const methodName: string = methodNames[i];
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
			for (let i = 0; i < methodNames.length; i++) {
				const methodName: string = methodNames[i];
				const method: Function = clazz.prototype[methodName];
				defineProperty(clazz.prototype, methodName, {
					value: function (...args) {
						args.unshift(method);
						behaviour.apply(this, args);
					},
					writable: true
				});
			}
			return clazz;
		},

	afterThrow: (behaviour: Function, ...methodNames: string[]): Function =>
		(clazz: Class<any>) => {
			for (let i = 0; i < methodNames.length; i++) {
				const methodName: string = methodNames[i];
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
