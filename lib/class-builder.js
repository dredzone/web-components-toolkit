/*  */
import type from './is/type';
import decorator from './mixin';

const {freeze} = Object;


export default (klass = class {}) => {
	const superClass = klass;
	return freeze({
		with(...mixins) {
			return mixins
				.map((mixin) => decorator(mixin))
				.reduce((c, m) => {
					if (type.function(m)) {
						return m(c);
					}
					return c;
				}, superClass);
		}
	});
};
