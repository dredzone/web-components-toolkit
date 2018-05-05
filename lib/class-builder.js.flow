/* @flow */
import createMixin from './class-builder/mixin';

const {freeze} = Object;

export type ClassBuilder = {
	with(...mixins: Array<Function>): Class<any>;
}

export default (klass: Class<any> = class {}): ClassBuilder => freeze({
	with(...mixins: Array<Function>): Class<any> {
		return mixins
			.map((mixin: Function) => createMixin(mixin))
			.reduce((k, m) => m(k), klass);
	}
});
