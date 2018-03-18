/* @flow */
import {composeMixin} from './compose-mixin.decorator';

interface IBuilder {
	with(...mixins: Array<Function>): Class<any>;
}

class ClassBuilder implements IBuilder {
	superClass: Class<any>;

	constructor(elementClass: Class<any>) {
		this.superClass = elementClass;
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

export const classBuilder = (klass: Class<any>): IBuilder => {
	return new ClassBuilder(klass);
};
