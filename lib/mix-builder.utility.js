/*  */
import {mixinCached} from './mixin-cached.decorator';
import {mixinDedupe} from './mixin-dedupe.decorator';
import {mixinApply} from './mixin-apply.decorator';


/**
 * Allows you to extend a class with one or more mixin classes.
 *
 * This builder is heavily inspired by Justin Fagnani's Mixwith.js
 *
 * @see http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 * @see https://github.com/justinfagnani/mixwith.js
 *
 */
export const MixBuilder = (baseClass = class {}) => {
	return Object.freeze({
		/**
		 * Applies `mixins` in order to the baseClass given to `mix()`.
		 *
		 * @param {Array.<Function>} mixins
		 * @return {Class} a subclass of `baseClass` with `mixins` applied
		 */
		with(...mixins) {
			const decoratedMixins = mixins.map((mixin) => mixinCached(
				mixinDedupe(
					mixinApply(mixin)
				)
			));
			return decoratedMixins.reduce((c, m) => {
				if (typeof m !== 'function') {
					return c;
				}
				return m(c);
			}, baseClass);
		}
	});
};
