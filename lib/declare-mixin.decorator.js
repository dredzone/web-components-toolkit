/*  */
import {wrapMixin, applyMixin} from './mixin.helper';

/**
 * A basic mixin decorator that applies the mixin with {@link applyMixin} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
export const declareMixin = (mixin) =>
	wrapMixin(mixin, (superClass) => applyMixin(superClass, mixin));
