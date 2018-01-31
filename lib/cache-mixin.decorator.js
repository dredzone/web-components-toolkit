/*  */
import {Map} from './map.ponyfill';
import {uniqueString} from './unique-string.utility';
import {wrapMixin} from './mixin.helper';

// used by cached
const cachedApplicationRef = uniqueString.get('_cachedApplicationRef');

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
export const cacheMixin = (mixin) => {
	return wrapMixin(mixin, (superClass) => {
		// Create a symbol used to reference a cached application from a superclass
		let cachedApplication = superClass[cachedApplicationRef];
		if (!cachedApplication) {
			cachedApplication = superClass[cachedApplicationRef] = new Map();
		}

		let application = cachedApplication.get(mixin);
		if (!application) {
			application = mixin(superClass);
			cachedApplication.set(mixin, application);
		}
		return application;
	});
};
