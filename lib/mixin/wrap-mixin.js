/*  */
import {wrappedMixinSymbol} from './symbols';

const {setPrototypeOf} = Object;

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
export default (mixin, wrapper) => {
	setPrototypeOf(wrapper, mixin);
	if (!mixin[wrappedMixinSymbol]) {
		mixin[wrappedMixinSymbol] = mixin;
	}
	return wrapper;
};
