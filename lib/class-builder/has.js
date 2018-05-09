/*  */
import isApplicationOf from './is-application-of.js';

const { getPrototypeOf } = Object;

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
export default (o, mixin) => {
  while (o !== null) {
    if (isApplicationOf(o, mixin)) {
      return true;
    }
    o = getPrototypeOf(o);
  }
  return false;
};
