import {symbols} from './symbols';
import {
	wrap,
	unwrap,
	cachedApplicationRef,
	appliedMixinRef,
	hasMixin} from './mix.helpers';

const {hasOwnProperty} = Object;

/**
 * Decorate the given mixin class with a "cached decorator".
 *
 * Method will ensure that if the given mixin has already been applied,
 * then it will be returned / applied a single time, rather than multiple
 * times.
 *
 * @param {Function} mixin
 *
 * @return {Function}
 */
export const cached = (mixin: Function) => {
	return wrap(mixin, (superClass: Function): Function => {
		// Create a symbol used to reference a cached application from a superclass
		let applicationRef = mixin[cachedApplicationRef];
		if (!applicationRef) {
			applicationRef = mixin[cachedApplicationRef] = symbols.get(mixin.name);
		}

		let hasRef = hasOwnProperty.call(superClass, applicationRef);
		// Look up an cached application of `mixin` to `superclass`
		if (hasRef) {
			return superClass[applicationRef];
		}

		// Apply the mixin
		let application = mixin(superClass);

		// Cache the mixin application on the superclass
		superClass[applicationRef] = application;

		return application;
	});
};

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
export const dedupe = (mixin: Function) => {
	return wrap(mixin, (superClass: Function): Function =>
		(hasMixin(superClass.prototype, mixin)) ? superClass : mixin(superClass));
};

/**
 * A basic mixin decorator that applies the mixin with {@link apply} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
export const apply = (mixin: Function): Function => {
	return wrap(mixin, (superClass: Function): Function => {
		let application = mixin(superClass);
		application.prototype[appliedMixinRef] = unwrap(mixin);
		return application;
	});
};
