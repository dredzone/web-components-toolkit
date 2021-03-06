/*  */
import uniqueId from './unique-id.js';

const { freeze, setPrototypeOf, getPrototypeOf, hasOwnProperty } = Object;

// used by wrap() and unwrap()
const wrappedMixinKey = uniqueId('_wrappedMixin');

// used by applyMixin() and isApplicationOf()
const appliedMixinKey = uniqueId('_appliedMixin');

// used by cache mixin decorator
const cachedApplicationKey = uniqueId('_cachedApplication');


export const createMixin = (mixin) => dedupeMixin(cacheMixin(declareMixin(mixin)));

export default (Ctor = class {}) =>
  freeze({
    with(...mixins) {
      return mixins.map((mixin) => createMixin(mixin)).reduce((k, m) => m(k), Ctor);
    }
  });

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
function wrap(mixin, wrapper) {
  setPrototypeOf(wrapper, mixin);
  if (!mixin[wrappedMixinKey]) {
    mixin[wrappedMixinKey] = mixin;
  }
  return wrapper;
}

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 *
 * @function
 * @param {Function} wrapper A wrapped mixin produced by {@link wrap}
 * @return {Function} The originally wrapped mixin
 */
function unwrap(wrapper) {
  return wrapper[wrappedMixinKey] || wrapper;
}

/**
 * Applies `mixin` to `superclass`.
 *
 * `apply` stores a reference from the mixin application to the unwrapped mixin
 * to make `isApplicationOf` and `hasMixin` work.
 *
 * This function is usefull for mixin wrappers that want to automatically enable
 * {@link hasMixin} support.
 *
 * @function
 * @param {Function} superClass A class or constructor function
 * @param {Function} mixin The mixin to apply
 * @return {Function} A subclass of `superclass` produced by `mixin`
 */
function applyMixin(superClass, mixin) {
  let application = mixin(superClass);
  const proto = application.prototype;
  proto[appliedMixinKey] = unwrap(mixin);
  return application;
}

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
function isApplicationOf(proto, mixin) {
  return hasOwnProperty.call(proto, appliedMixinKey) && proto[appliedMixinKey] === unwrap(mixin);
}

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
function hasMixin(o, mixin) {
  while (o !== null) {
    if (isApplicationOf(o, mixin)) {
      return true;
    }
    o = getPrototypeOf(o);
  }
  return false;
}

/**
 * A basic mixin decorator that applies the mixin with {@link applyMixin} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 *
 * @function
 * @param {Function} mixin The mixin to wrap
 * @return {Function} a new mixin function
 */
function declareMixin(mixin) {
  return wrap(mixin, (superClass) => applyMixin(superClass, mixin));
}

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {Function} mixin The mixin to wrap with deduplication behavior
 * @return {Function} a new mixin function
 */
function dedupeMixin(mixin) {
  return wrap(
    mixin,
    (superClass) => (hasMixin(superClass.prototype, mixin) ? superClass : mixin(superClass))
  );
}

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
function cacheMixin(mixin) {
  return wrap(mixin, (superClass) => {
    let cachedApplication = superClass[cachedApplicationKey];
    if (!cachedApplication) {
      cachedApplication = superClass[cachedApplicationKey] = new Map();
    }

    // $FlowFixMe
    let application = cachedApplication.get(mixin);
    if (!application) {
      application = mixin(superClass);
      cachedApplication.set(mixin, application);
    }
    return application;
  });
}
