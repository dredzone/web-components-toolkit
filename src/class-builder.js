/* @flow */
import mixinDecorator from './class-builder/mixin-decorator';
import type {ClassBuilder} from './types';

export default (klass: Class<any>): ClassBuilder => {
	const superClass: Class<any> = klass;
	return {
		with(...mixins: Array<Function>): Class<any> {
			return mixins
				.map((mixin: Function) => mixinDecorator(mixin))
				.reduce((c, m) => {
					if (typeof m !== 'function') {
						return c;
					}
					return m(c);
				}, superClass);
		}
	};
};
