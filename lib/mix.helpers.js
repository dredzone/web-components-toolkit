define(['exports', './symbols'], function (exports, _symbols) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.hasMixin = exports.isApplicationOf = exports.unwrap = exports.wrap = exports.cachedApplicationRef = exports.appliedMixinRef = exports.wrappedMixinRef = undefined;
  var hasOwnProperty = Object.hasOwnProperty,
      setPrototypeOf = Object.setPrototypeOf;


  // used by wrap() and unwrap()
  var wrappedMixinRef = exports.wrappedMixinRef = _symbols.symbols.get('_wrappedMixin');

  // used by apply() and isApplicationOf()
  var appliedMixinRef = exports.appliedMixinRef = _symbols.symbols.get('_appliedMixin');

  // used by cached
  var cachedApplicationRef = exports.cachedApplicationRef = _symbols.symbols.get('_cachedApplicationRef');

  /**
   * Sets up the function `mixin` to be wrapped by the function `wrapper`, while
   * allowing properties on `mixin` to be available via `wrapper`, and allowing
   * `wrapper` to be unwrapped to get to the original function.
   *
   * `wrap` does two things:
   *   1. Sets the prototype of `mixin` to `wrapper` so that properties set on
   *      `mixin` inherited by `wrapper`.
   *   2. Sets a special property on `mixin` that points back to `mixin` so that
   *      it can be retreived from `wrapper`
   *
   * @function
   * @param {Function} mixin A mixin function
   * @param {Function} wrapper A function that wraps {@link mixin}
   * @return {Function} `wrapper`
   */
  var wrap = exports.wrap = function wrap(mixin, wrapper) {
    setPrototypeOf(wrapper, mixin);
    if (!mixin[wrappedMixinRef]) {
      mixin[wrappedMixinRef] = mixin;
    }
    return wrapper;
  };

  /**
   * Unwraps the function `wrapper` to return the original function wrapped by
   * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
   * function.
   *
   * @function
   * @param {Function} wrapper A wrapped mixin produced by {@link wrap}
   * @return {Function} The originally wrapped mixin
   */
  var unwrap = exports.unwrap = function unwrap(wrapper) {
    return wrapper[wrappedMixinRef] || wrapper;
  };

  /**
   * Returns `true` iff `proto` is a prototype created by the application of
   * `mixin` to a superclass.
   *
   * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
   * as created by `apply`.
   *
   * @function
   * @param {Object} proto A prototype object created by {@link apply}.
   * @param {Function} mixin A mixin function used with {@link apply}.
   * @return {boolean} whether `proto` is a prototype created by the application of
   * `mixin` to a superclass
   */
  var isApplicationOf = exports.isApplicationOf = function isApplicationOf(proto, mixin) {
    return hasOwnProperty.call(proto, appliedMixinRef) && proto[appliedMixinRef] === unwrap(mixin);
  };

  /**
   * Returns `true` iff `o` has an application of `mixin` on its prototype
   * chain.
   *
   * @function
   * @param {Object} o An object
   * @param {Function} mixin A mixin applied with {@link apply}
   * @return {boolean} whether `o` has an application of `mixin` on its prototype
   * chain
   */
  var hasMixin = exports.hasMixin = function hasMixin(o, mixin) {
    while (o !== null) {
      if (isApplicationOf(o, mixin)) {
        return true;
      }
      o = Object.getPrototypeOf(o);
    }
    return false;
  };
});