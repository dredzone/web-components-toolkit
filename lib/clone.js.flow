/* @flow */
import type, { getType } from './type.js';

export default (src: any): any => clone(src, [], []);

export const jsonClone: Function = (value: Object, reviver: Function = (k, v) => v): Object =>
  JSON.parse(JSON.stringify(value), reviver);

function clone(src: any, circulars: Array<any> = [], clones: Array<any> = []): any {
  // Null/undefined/functions/etc
  if (!src || !type.object(src) || type.function(src)) {
    return src;
  }
  const t: string = getType(src);
  if (t in cloneTypes) {
    return cloneTypes[t].apply(src, [circulars, clones]);
  }
  return src;
}

const cloneTypes: Object = Object.freeze({
  date: function(): Date {
    return new Date(this.getTime());
  },
  regexp: function(): RegExp {
    return new RegExp(this);
  },
  array: function(): Array<any> {
    return this.map(clone);
  },
  map: function(): Map<any, any> {
    return new Map(Array.from(this.entries()));
  },
  set: function(): Set<any> {
    return new Set(Array.from(this.values()));
  },
  object: function(circulars: Array<any> = [], clones: Array<any> = []): Object {
    circulars.push(this);
    const obj: Object = Object.create(this);
    clones.push(obj);
    for (let key: string in this) {
      let idx: number = circulars.findIndex((i: number) => i === this[key]);
      obj[key] = idx > -1 ? clones[idx] : clone(this[key], circulars, clones);
    }
    return obj;
  }
});
