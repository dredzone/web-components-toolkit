/* @flow */
import apply from './apply.js';
import wrap from './wrap.js';

/**
 * A basic mixin decorator that applies the mixin with {@link applyMixin} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
export default (mixin: Function): Function =>
	wrap(mixin, (superClass: Function) => apply(superClass, mixin));
