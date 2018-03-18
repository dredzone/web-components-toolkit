/*  */
import {composeMixin} from './compose-mixin.decorator';

class ClassBuilder {

	constructor(klass) {
		this.superClass = klass;
	}

	with(...mixins) {
		return mixins
			.map((mixin) => composeMixin(mixin))
			.reduce((c, m) => {
				if (typeof m !== 'function') {
					return c;
				}
				return m(c);
			}, this.superClass);
	}
}

export const classBuilder = (klass) => {
	return new ClassBuilder(klass);
};
