/*  */
import {wrap, unwrap, appliedMixinRef} from './mixin-decorators.helper';

/**
 * A basic mixin decorator that applies the mixin with {@link apply} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
export const mixinApply = (mixin) => {
	return wrap(mixin, (superClass) => {
		let application = mixin(superClass);
		application.prototype[appliedMixinRef] = unwrap(mixin);
		return application;
	});
};
