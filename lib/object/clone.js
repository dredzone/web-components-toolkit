/*  */
import type, { getType } from '../type.js';

export default (src) => clone(src, [], []);

export const jsonClone = (value, reviver = (k, v) => v) =>
  JSON.parse(JSON.stringify(value), reviver);

function clone(src, circulars = [], clones = []) {
  // Null/undefined/functions/etc
  if (!src || !type.object(src) || type.function(src)) {
    return src;
  }
  const t = getType(src);
  if (t in cloneTypes) {
    return cloneTypes[t].apply(src, [circulars, clones]);
  }
  return src;
}

const cloneTypes = Object.freeze({
  date: function() {
    return new Date(this.getTime());
  },
  regexp: function() {
    return new RegExp(this);
  },
  array: function() {
    return this.map(clone);
  },
  map: function() {
    return new Map(Array.from(this.entries()));
  },
  set: function() {
    return new Set(Array.from(this.values()));
  },
  object: function(circulars = [], clones = []) {
    circulars.push(this);
    const obj = Object.create(this);
    clones.push(obj);
    for (let key in this) {
      let idx = circulars.findIndex((i) => i === this[key]);
      obj[key] = idx > -1 ? clones[idx] : clone(this[key], circulars, clones);
    }
    return obj;
  }
});
