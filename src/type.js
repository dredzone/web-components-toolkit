/* @flow */
import { all, any } from './array.js';

export type IsType = {
  (src: any): boolean
};

export type IsTypeApi = {
  all(...params: Array<any>): boolean,
  any(...params: Array<any>): boolean
};

export type Is = {
  array: IsType & IsTypeApi,
  object: IsType & IsTypeApi,
  string: IsType & IsTypeApi,
  date: IsType & IsTypeApi,
  regexp: IsType & IsTypeApi,
  function: IsType & IsTypeApi,
  boolean: IsType & IsTypeApi,
  number: IsType & IsTypeApi,
  null: IsType & IsTypeApi,
  undefined: IsType & IsTypeApi,
  arguments: IsType & IsTypeApi,
  error: IsType & IsTypeApi,
  map: IsType & IsTypeApi,
  set: IsType & IsTypeApi,
  symbol: IsType & IsTypeApi
};

const doAllApi: Function = (fn: Function): Function => (...params: Array<any>) => all(params, fn);
const doAnyApi: Function = (fn: Function): Function => (...params: Array<any>) => any(params, fn);
const toString: Function = Object.prototype.toString;
const types: string[] = [
  'Map',
  'Set',
  'Symbol',
  'Array',
  'Object',
  'String',
  'Date',
  'RegExp',
  'Function',
  'Boolean',
  'Number',
  'Null',
  'Undefined',
  'Arguments',
  'Error'
];
const len: number = types.length;
const typeCache: Object = {};
const typeRegexp: RegExp = /\s([a-zA-Z]+)/;

export default (setup(): Is);

export const getType: Function = (src: any): string => getSrcType(src);

function getSrcType(src: any): string {
  let type: string = toString.call(src);
  if (!typeCache[type]) {
    let matches: any = type.match(typeRegexp);
    if (Array.isArray(matches) && matches.length > 1) {
      typeCache[type] = matches[1].toLowerCase();
    }
  }
  return typeCache[type];
}

function setup(): Is {
  let checks: Object = {};
  for (let i: number = len; i--; ) {
    const type: string = types[i].toLowerCase();
    checks[type] = src => getSrcType(src) === type;
    checks[type].all = doAllApi(checks[type]);
    checks[type].any = doAnyApi(checks[type]);
  }
  return checks;
}
