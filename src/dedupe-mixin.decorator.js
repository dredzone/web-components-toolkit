/* @flow */
import {wrapMixin, hasMixin} from './mixin.helper';

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
export const dedupeMixin: Function = (mixin: Function) => {
	return wrapMixin(mixin, (superClass: Function): Function =>
		(hasMixin(superClass.prototype, mixin)) ? superClass : mixin(superClass));
};

