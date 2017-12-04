define(['exports', './symbols', './mix.helpers'], function (exports, _symbols, _mix) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.apply = exports.dedupe = exports.cached = undefined;
	var hasOwnProperty = Object.hasOwnProperty;


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
	var cached = exports.cached = function cached(mixin) {
		return (0, _mix.wrap)(mixin, function (superClass) {
			// Create a symbol used to reference a cached application from a superclass
			var applicationRef = mixin[_mix.cachedApplicationRef];
			if (!applicationRef) {
				applicationRef = mixin[_mix.cachedApplicationRef] = _symbols.symbols.get(mixin.name);
			}

			var hasRef = hasOwnProperty.call(superClass, applicationRef);
			// Look up an cached application of `mixin` to `superclass`
			if (hasRef) {
				return superClass[applicationRef];
			}

			// Apply the mixin
			var application = mixin(superClass);

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
	var dedupe = exports.dedupe = function dedupe(mixin) {
		return (0, _mix.wrap)(mixin, function (superClass) {
			return (0, _mix.hasMixin)(superClass.prototype, mixin) ? superClass : mixin(superClass);
		});
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
	var apply = exports.apply = function apply(mixin) {
		return (0, _mix.wrap)(mixin, function (superClass) {
			var application = mixin(superClass);
			application.prototype[_mix.appliedMixinRef] = (0, _mix.unwrap)(mixin);
			return application;
		});
	};
});