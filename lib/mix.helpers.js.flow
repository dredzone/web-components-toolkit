/* @flow */
import {uniqueString} from './unique-string.utility';

const {hasOwnProperty, setPrototypeOf} = Object;

// used by wrap() and unwrap()
export const wrappedMixinRef = uniqueString.get('_wrappedMixin');

// used by apply() and isApplicationOf()
export const appliedMixinRef = uniqueString.get('_appliedMixin');

// used by cached
export const cachedApplicationRef = uniqueString.get('_cachedApplicationRef');

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
export const wrap = (mixin: Function, wrapper: Function): Function => {
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
export const unwrap = (wrapper: Function): Function => wrapper[wrappedMixinRef] || wrapper;

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
export const isApplicationOf = (proto: Object, mixin: Function): boolean => {
	return 	hasOwnProperty.call(proto, appliedMixinRef) && proto[appliedMixinRef] === unwrap(mixin);
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
export const hasMixin = (o: Object, mixin: Function): boolean => {
	while (o !== null) {
		if (isApplicationOf(o, mixin)) {
			return true;
		}
		o = Object.getPrototypeOf(o);
	}
	return false;
};
