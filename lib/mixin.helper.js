/*  */
import {uniqueString} from './unique-string.utility';

const {hasOwnProperty, setPrototypeOf, getPrototypeOf} = Object;

// used by wrap() and unwrap()
const wrappedMixinRef = uniqueString.get('_wrappedMixin');

// used by apply() and isApplicationOf()
const appliedMixinRef = uniqueString.get('_appliedMixin');

/**
 * Sets up the function `mixin` to be wrapped by the function `wrapper`, while
 * allowing properties on `mixin` to be available via `wrapper`, and allowing
 * `wrapper` to be unwrapped to get to the original function.
 *
 * `wrap` does two things:
 *   1. Sets the prototype of `mixin` to `wrapper` so that properties set on
 *      `mixin` inherited by `wrapper`.
 *   2. Sets a special property on `mixin` that points back to `mixin` so that
 *      it can be retreived from `wrapper`
 *
 * @function
 * @param {Function} mixin A mixin function
 * @param {Function} wrapper A function that wraps {@link mixin}
 * @return {Function} `wrapper`
 */
export const wrapMixin = (mixin, wrapper) => {
	setPrototypeOf(wrapper, mixin);
	if (!mixin[wrappedMixinRef]) {
		mixin[wrappedMixinRef] = mixin;
	}
	return wrapper;
};

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 *
 * @function
 * @param {Function} wrapper A wrapped mixin produced by {@link wrap}
 * @return {Function} The originally wrapped mixin
 */
export const unwrapMixin = (wrapper) => wrapper[wrappedMixinRef] || wrapper;

/**
 * Returns `true` iff `proto` is a prototype created by the application of
 * `mixin` to a superclass.
 *
 * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
 * as created by `apply`.
 *
 * @function
 * @param {Object} proto A prototype object created by {@link apply}.
 * @param {Function} mixin A mixin function used with {@link apply}.
 * @return {boolean} whether `proto` is a prototype created by the application of
 * `mixin` to a superclass
 */
export const isApplicationOf = (proto, mixin) => {
	return hasOwnProperty.call(proto, appliedMixinRef) && proto[appliedMixinRef] === unwrapMixin(mixin);
};

/**
 * Returns `true` iff `o` has an application of `mixin` on its prototype
 * chain.
 *
 * @function
 * @param {Object} o An object
 * @param {Function} mixin A mixin applied with {@link apply}
 * @return {boolean} whether `o` has an application of `mixin` on its prototype
 * chain
 */
export const hasMixin = (o, mixin) => {
	while (o !== null) {
		if (isApplicationOf(o, mixin)) {
			return true;
		}
		o = getPrototypeOf(o);
	}
	return false;
};

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
export const applyMixin = (superClass, mixin) => {
	let application = mixin(superClass);
	application.prototype[appliedMixinRef] = unwrapMixin(mixin);
	return application;
};
