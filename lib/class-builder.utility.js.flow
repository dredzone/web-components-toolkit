/* @flow */
import {composeMixin} from './compose-mixin.decorator';

class ClassBuilder {
	superClass: Class<any>;

	constructor(klass: Class<any>) {
		this.superClass = klass;
	}

	with(...mixins: Array<Function>): Class<any> {
		return mixins
			.map((mixin: Function) => composeMixin(mixin))
			.reduce((c, m) => {
				if (typeof m !== 'function') {
					return c;
				}
				return m(c);
			}, this.superClass);
	}
}

export const classBuilder = (klass: Class<any>): ClassBuilder => {
	return new ClassBuilder(klass);
};
