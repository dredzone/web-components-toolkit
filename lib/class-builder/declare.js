/*  */
import apply from './apply';
import wrap from './wrap';

/**
 * A basic mixin decorator that applies the mixin with {@link applyMixin} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
export default (mixin) =>
	wrap(mixin, (superClass) => apply(superClass, mixin));
