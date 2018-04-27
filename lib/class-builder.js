/*  */
import isFunction from 'lodash/isFunction';
import decorator from './mixin';

const {freeze} = Object;

export default (klass = class {}) => {
	const superClass = klass;
	return freeze({
		with(...mixins) {
			return mixins
				.map((mixin) => decorator(mixin))
				.reduce((c, m) => {
					if (!isFunction(m)) {
						return c;
					}
					return m(c);
				}, superClass);
		}
	});
};
