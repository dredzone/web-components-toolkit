/*  */
import is, { getType } from '../type.js';

export default (src) => clone(src, [], []);

function clone(src, circulars = [], clones = []) {
  // Null/undefined/functions/etc
  if (is.undefined(src) || is.null(src) || isPrimitive(src) || is.function(src)) {
    return src;
  }
  return cloner(getType(src), src, circulars, clones);
}

function isPrimitive(src) {
  return is.boolean(src) || is.number(src) || is.string(src);
}

function cloner(type, context, ...args) {
  const handlers = {
    date() {
      return new Date(this.getTime());
    },
    regexp() {
      return new RegExp(this);
    },
    array() {
      return this.map(clone);
    },
    map() {
      return new Map(Array.from(this.entries()));
    },
    set() {
      return new Set(Array.from(this.values()));
    },
    request() {
      return this.clone();
    },
    response() {
      return this.clone();
    },
    headers() {
      let headers = new Headers();
      for (let [name, value] of this.entries) {
        headers.append(name, value);
      }
      return headers;
    },
    blob() {
      return new Blob([this], { type: this.type });
    },
    object(circulars = [], clones = []) {
      circulars.push(this);
      const obj = Object.create(this);
      clones.push(obj);
      for (let key in this) {
        let idx = circulars.findIndex((i) => i === this[key]);
        obj[key] = idx > -1 ? clones[idx] : clone(this[key], circulars, clones);
      }
      return obj;
    }
  };
  if (type in handlers) {
    const fn = handlers[type];
    return fn.apply(context, args);
  }
  return context;
}
