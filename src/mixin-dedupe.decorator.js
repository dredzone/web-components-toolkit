/* @flow */
import {wrap, hasMixin} from './mixin-decorators.helper';

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
export const mixinDedupe: Function = (mixin: Function) => {
	return wrap(mixin, (superClass: Function): Function =>
		(hasMixin(superClass.prototype, mixin)) ? superClass : mixin(superClass));
};

