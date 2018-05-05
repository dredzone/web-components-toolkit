/*  */
import {appliedMixinKey} from './commons';
import unwrap from './unwrap';

/**
 * Applies `mixin` to `superclass`.
 *
 * `apply` stores a reference from the mixin application to the unwrapped mixin
 * to make `isApplicationOf` and `hasMixin` work.
 *
 * This function is usefull for mixin wrappers that want to automatically enable
 * {@link hasMixin} support.
 *
 * @function
 * @param {Function} superClass A class or constructor function
 * @param {Function} mixin The mixin to apply
 * @return {Function} A subclass of `superclass` produced by `mixin`
 */
export default (superClass, mixin) => {
	let application = mixin(superClass);
	const proto = application.prototype;
	proto[appliedMixinKey] = unwrap(mixin);
	return application;
};
