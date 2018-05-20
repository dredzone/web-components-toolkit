/* @flow */
import is, { getType } from '../type.js';
import clone from './clone.js';

export type MergeOptions = {
  arrayMerge: (source: Array<any>, target: Array<any>) => Array<any>
};

export const arrayReplaceStrategy: Function = (source: Array<any>, target: Array<any>) => clone(target);

export default (opts: MergeOptions = { arrayMerge: arrayReplaceStrategy }): Function => (...args: Array<any>): any => {
  let result: any;

  for (let i: number = args.length; i > 0; --i) {
    result = merge(args.pop(), result, opts);
  }

  return result;
};

function merge(source: any, target: any, opts: MergeOptions): any {
  if (is.undefined(target)) {
    return clone(source);
  }

  let type: string = getType(source);
  if (type === getType(target)) {
    return merger(type, source, target, opts);
  }
  return clone(target);
}

function merger(type, source: any, target: any, opts: MergeOptions): any {
  const handlers: Object = {
    object(): Object {
      const result: Object = {};

      const keys: Object = {
        source: Object.keys(source),
        target: Object.keys(target)
      };

      keys.source.concat(keys.target).forEach((key: string) => {
        result[key] = merge(source[key], target[key], opts);
      });

      return result;
    },

    array(): Array<any> {
      return opts.arrayMerge.apply(null, [source, target]);
    }
  };

  if (type in handlers) {
    return handlers[type]();
  }
  return clone(target);
}
