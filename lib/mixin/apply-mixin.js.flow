/* @flow */
import {appliedMixinSymbol} from './symbols';
import unwrapMixin from './unwrap-mixin';

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
export default (superClass: Function, mixin: Function) => {
	let application = mixin(superClass);
	const proto: any = application.prototype;
	proto[appliedMixinSymbol] = unwrapMixin(mixin);
	return application;
};
