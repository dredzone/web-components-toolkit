import wrapMixin from './wrap-mixin';

const cachedApplicationSymbol = Symbol('cachedApplication');

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
export default (mixin) => {
	return wrapMixin(mixin, (superClass) => {
		// Create a symbol used to reference a cached application from a superclass
		let cachedApplication = superClass[cachedApplicationSymbol];
		if (!cachedApplication) {
			cachedApplication = superClass[cachedApplicationSymbol] = new Map();
		}

		// $FlowFixMe
		let application = cachedApplication.get(mixin);
		if (!application) {
			application = mixin(superClass);
			cachedApplication.set(mixin, application);
		}
		return application;
	});
};
