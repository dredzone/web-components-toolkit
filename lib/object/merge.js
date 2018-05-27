/*  */
import is, { getType } from '../type.js';
import clone from './clone.js';


export const arrayReplaceStrategy = (source, target) => clone(target);

export const factory = (opts = { arrayMerge: arrayReplaceStrategy }) => (
  ...args
) => {
  let result;

  for (let i = args.length; i > 0; --i) {
    result = merge(args.pop(), result, opts);
  }

  return result;
};

export default factory();

function merge(source, target, opts) {
  if (is.undefined(target)) {
    return clone(source);
  }

  let type = getType(source);
  if (type === getType(target)) {
    return merger(type, source, target, opts);
  }
  return clone(target);
}

function merger(type, source, target, opts) {
  const handlers = {
    object() {
      const result = {};

      const keys = {
        source: Object.keys(source),
        target: Object.keys(target)
      };

      keys.source.concat(keys.target).forEach((key) => {
        result[key] = merge(source[key], target[key], opts);
      });

      return result;
    },

    array() {
      return opts.arrayMerge.apply(null, [source, target]);
    }
  };

  if (type in handlers) {
    return handlers[type]();
  }
  return clone(target);
}
