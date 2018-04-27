/* @flow */
import isApplicationOf from './is-application-of';

const {getPrototypeOf} = Object;

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
export default (o: Object, mixin: Function): boolean => {
	while (o !== null) {
		if (isApplicationOf(o, mixin)) {
			return true;
		}
		o = getPrototypeOf(o);
	}
	return false;
};
