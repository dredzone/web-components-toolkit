/* @flow */
import is, { getType } from '../type.js';

export default (src: any): any => clone(src, [], []);

function clone(src: any, circulars: Array<any> = [], clones: Array<any> = []): any {
  // Null/undefined/functions/etc
  if (is.undefined(src) || is.null(src) || isPrimitive(src) || is.function(src)) {
    return src;
  }
  return cloner(getType(src), src, circulars, clones);
}

function isPrimitive(src: any): boolean {
  return is.boolean(src) || is.number(src) || is.string(src);
}

function cloner(type: string, context: any, ...args: Array<any>): any {
  const handlers: Object = {
    date(): Date {
      return new Date(this.getTime());
    },
    regexp(): RegExp {
      return new RegExp(this);
    },
    array(): Array<any> {
      return this.map(clone);
    },
    map(): Map<any, any> {
      return new Map(Array.from(this.entries()));
    },
    set(): Set<any> {
      return new Set(Array.from(this.values()));
    },
    request(): Request {
      return this.clone();
    },
    response(): Response {
      return this.clone();
    },
    headers(): Headers {
      let headers = new Headers();
      for (let [name, value] of this.entries) {
        headers.append(name, value);
      }
      return headers;
    },
    blob(): Blob {
      return new Blob([this], { type: this.type });
    },
    object(circulars: Array<any> = [], clones: Array<any> = []): Object {
      circulars.push(this);
      const obj: Object = Object.create(this);
      clones.push(obj);
      for (let key: string in this) {
        let idx: number = circulars.findIndex((i: number) => i === this[key]);
        obj[key] = idx > -1 ? clones[idx] : clone(this[key], circulars, clones);
      }
      return obj;
    }
  };
  if (type in handlers) {
    const fn: Function = handlers[type];
    return fn.apply(context, args);
  }
  return context;
}
