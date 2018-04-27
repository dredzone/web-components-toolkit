import wrapMixin from './wrap-mixin';

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
		if (!cachedApplication) {
			cachedApplication = superClass[cachedApplicationSymbol] = new Map();
		}

		// $FlowFixMe
		let application: Function = cachedApplication.get(mixin);
		if (!application) {
			application = mixin(superClass);
			cachedApplication.set(mixin, application);
		}
		return application;
	});
};
