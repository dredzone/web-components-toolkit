/* @flow */
import isUndefined from 'lodash/isUndefined';
import {wrapMixin} from './mixin-helpers';

// used by cached
const cachedApplicationSymbol: Symbol = Symbol('cachedApplication');

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
export default (mixin: Function): Function => {
	return wrapMixin(mixin, (superClass: Function): Function => {
		// Create a symbol used to reference a cached application from a superclass
		let cachedApplication = superClass[cachedApplicationSymbol];
		if (isUndefined(cachedApplication)) {
			cachedApplication = superClass[cachedApplicationSymbol] = new Map();
		}

		// $FlowFixMe
		let application: Function = cachedApplication.get(mixin);
		if (isUndefined(application)) {
			application = mixin(superClass);
			cachedApplication.set(mixin, application);
		}
		return application;
	});
};
