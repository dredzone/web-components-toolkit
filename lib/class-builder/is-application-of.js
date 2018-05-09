/*  */
import { appliedMixinKey } from './commons.js';
import unwrap from './unwrap.js';

const { hasOwnProperty } = Object;

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
export default (proto, mixin) => {
  return (
    hasOwnProperty.call(proto, appliedMixinKey) &&
    proto[appliedMixinKey] === unwrap(mixin)
  );
};
