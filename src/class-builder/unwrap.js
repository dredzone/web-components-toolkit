/* @flow */
import { wrappedMixinKey } from './commons.js';

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 *
 * @function
 * @param {Function} wrapper A wrapped mixin produced by {@link wrap}
 * @return {Function} The originally wrapped mixin
 */
export default (wrapper: Function): Function =>
  wrapper[wrappedMixinKey] || wrapper;