/* @flow */
import isFunction from 'lodash/isFunction';
import decorator from './mixin';
import type {ClassBuilder} from './types';

const {freeze} = Object;

export default (klass: Class<any> = class {}): ClassBuilder => {
	const superClass: Class<any> = klass;
	return freeze({
		with(...mixins: Array<Function>): Class<any> {
			return mixins
				.map((mixin: Function) => decorator(mixin))
				.reduce((c, m) => {
					if (!isFunction(m)) {
						return c;
					}
					return m(c);
				}, superClass);
		}
	});
};
