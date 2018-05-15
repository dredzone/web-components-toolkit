/* @flow */
import type from './type.js';

const clone = function(src: any, circulars: Array<any> = [], clones: Array<any> = []): any {
  // Null/undefined/functions/etc
  if (!src || !type.object(src) || type.function(src)) {
    return src;
  }

  // Date
  if (type.date(src)) {
    return new Date(src.getTime());
  }

  // RegExp
  if (type.regexp(src)) {
    return new RegExp(src);
  }

  // Arrays
  if (type.array(src)) {
    return src.map(clone);
  }

  // ES6 Maps
  if (type.map(src)) {
    return new Map(Array.from(src.entries()));
  }

  // ES6 Sets
  if (type.set(src)) {
    return new Set(Array.from(src.values()));
  }

  // Object
  if (type.object(src)) {
    circulars.push(src);
    const obj: Object = Object.create(src);
    clones.push(obj);
    for (let key: string in src) {
      let idx: number = circulars.findIndex((i: number) => i === src[key]);
      obj[key] = idx > -1 ? clones[idx] : clone(src[key], circulars, clones);
    }
    return obj;
  }

  return src;
};

export default clone;

clone.json = (value: Object, reviver: Function = (k, v) => v) => JSON.parse(JSON.stringify(value), reviver);
