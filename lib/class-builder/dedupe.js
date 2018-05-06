/*  */
import has from './has.js';
import wrap from './wrap.js';

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
export default (mixin) => {
	return wrap(mixin, (superClass) =>
		(has(superClass.prototype, mixin)) ? superClass : mixin(superClass));
};
