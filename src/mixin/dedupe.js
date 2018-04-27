/* @flow */
import hasMixin from './has-mixin';
import wrapMixin from './wrap-mixin';

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
export default (mixin: Function) => {
	return wrapMixin(mixin, (superClass: Function): Function =>
		(hasMixin(superClass.prototype, mixin)) ? superClass : mixin(superClass));
};
