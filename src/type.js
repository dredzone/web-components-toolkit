/* @flow */
import { all, any } from './array.js';

export type TypeApi = {
  all(...params: Array<any>): boolean,
  any(...params: Array<any>): boolean
};

export type Type = {
  array: Function & TypeApi,
  object: Function & TypeApi,
  string: Function & TypeApi,
  date: Function & TypeApi,
  regexp: Function & TypeApi,
  function: Function & TypeApi,
  boolean: Function & TypeApi,
  number: Function & TypeApi,
  null: Function & TypeApi,
  undefined: Function & TypeApi,
  arguments: Function & TypeApi,
  error: Function & TypeApi,
  map: Function & TypeApi,
  set: Function & TypeApi,
  symbol: Function & TypeApi
};

const doAllApi: Function = (fn: Function): Function => (
  ...params: Array<any>
) => all(params, fn);
const doAnyApi: Function = (fn: Function): Function => (
  ...params: Array<any>
) => any(params, fn);
const toString: Function = Object.prototype.toString;
const types: string[] = 'Map Set Symbol Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(
  ' '
);
const len: number = types.length;
const typeCache: Object = {};
const typeRegexp: RegExp = /\s([a-zA-Z]+)/;
const is: Type = setup();

export default is;

function setup(): Type {
  let checks: Object = {};
  for (let i: number = len; i--; ) {
    const type: string = types[i].toLowerCase();
    checks[type] = obj => getType(obj) === type;
    checks[type].all = doAllApi(checks[type]);
    checks[type].any = doAnyApi(checks[type]);
  }
  return checks;
}

function getType(obj: any): string {
  let type: string = toString.call(obj);
  if (!typeCache[type]) {
    let matches: any = type.match(typeRegexp);
    if (Array.isArray(matches) && matches.length > 1) {
      typeCache[type] = matches[1].toLowerCase();
    }
  }
  return typeCache[type];
}