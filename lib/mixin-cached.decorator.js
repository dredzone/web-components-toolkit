/*  */
import {uniqueString} from './unique-string.utility';
import {wrap, cachedApplicationRef} from './mixin-decorators.helper';

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
export const mixinCached = (mixin) => {
	return wrap(mixin, (superClass) => {
		// Create a symbol used to reference a cached application from a superclass
		let applicationRef = mixin[cachedApplicationRef];
		if (!applicationRef) {
			applicationRef = mixin[cachedApplicationRef] = uniqueString.get(mixin.name);
		}

		let hasRef = Object.hasOwnProperty.call(superClass, applicationRef);
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
