/* @flow */
import type from './is/type';
import decorator from './mixin';

const {freeze} = Object;

export type ClassBuilder = {
	with(...mixins: Array<Function>): Class<any>;
}

export default (klass: Class<any> = class {}): ClassBuilder => {
	const superClass: Class<any> = klass;
	return freeze({
		with(...mixins: Array<Function>): Class<any> {
			return mixins
				.map((mixin: Function) => decorator(mixin))
				.reduce((c, m) => {
					if (type.function(m)) {
						return m(c);
					}
					return c;
				}, superClass);
		}
	});
};
