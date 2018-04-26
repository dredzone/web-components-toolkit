/*  */
import mixinDecorator from './class-builder/mixin-decorator';

export default (klass) => {
	const superClass = klass;
	return {
		with(...mixins) {
			return mixins
				.map((mixin) => mixinDecorator(mixin))
				.reduce((c, m) => {
					if (typeof m !== 'function') {
						return c;
					}
					return m(c);
				}, superClass);
		}
	};
};
