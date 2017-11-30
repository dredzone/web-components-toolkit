/**
 * Mixin Builder
 *
 * Allows you to extend a class with one or more mixin classes.
 *
 * This builder is heavily inspired by Justin Fagnani's Mixwith.js
 *
 * @see http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 * @see https://github.com/justinfagnani/mixwith.js
 *
 */
export class MixinBuilder {
	constructor(superClass: Class<any>) {
		this.superClass = superClass || class {};
	}

	/**
	 * Applies `mixins` in order to the superclass given to `mix()`.
	 *
	 * @param {Array.<Function>} mixins
	 * @return {Function} a subclass of `superclass` with `mixins` applied
	 */
	with(...mixins: Function) {
		return mixins.reduce((c, m) => {
			if (typeof m !== 'function') {
				return c;
			}
			return m(c);
		}, this.superClass);
	}
}
