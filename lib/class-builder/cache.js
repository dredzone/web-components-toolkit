/*  */
import uniqueId from '../unique-id.js';
import wrap from './wrap.js';

const cachedApplicationKey = uniqueId('_cachedApplication');

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
};
