/* @flow */
import type from './type.js';

export const dSet: Function = (obj: Object, key: string, value: any): void => {
  if (key.indexOf('.') === -1) {
    obj[key] = value;
    return;
  }
  const parts: string[] = key.split('.');
  const depth: number = parts.length - 1;
  let object: Object = obj;

  for (let i = 0; i < depth; i++) {
    if (type.undefined(object[parts[i]])) {
      object[parts[i]] = {};
    }
    object = object[parts[i]];
  }
  object[parts[depth]] = value;
};

export const dGet: Function = (obj: Object, key: string, defaultValue: any = undefined): any => {
  if (key.indexOf('.') === -1) {
    return obj[key] ? obj[key] : defaultValue;
  }
  const parts: string[] = key.split('.');
  const length: number = parts.length;
  let object: any = obj;

  for (let i = 0; i < length; i++) {
    object = object[parts[i]];
    if (type.undefined(object)) {
      object = defaultValue;
      return;
    }
  }
  return object;
};

const { keys } = Object;

export const objectToMap: Function = (o: Object): Map<any, any> =>
  keys(o).reduce((m: Map<any, any>, k: any) => m.set(k, o[k]), new Map());
