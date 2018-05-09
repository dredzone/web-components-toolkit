/* @flow */
import { all, any } from './array.js';

export type Api = {
  all(...params: Array<any>): boolean,
  any(...params: Array<any>): boolean
};

export type Is = {
  array: Function & Api,
  object: Function & Api,
  string: Function & Api,
  date: Function & Api,
  regexp: Function & Api,
  function: Function & Api,
  boolean: Function & Api,
  number: Function & Api,
  null: Function & Api,
  undefined: Function & Api,
  arguments: Function & Api,
  error: Function & Api
};

const doAllApi: Function = (fn: Function): Function => (
  ...params: Array<any>
) => all(params, fn);
const doAnyApi: Function = (fn: Function): Function => (
  ...params: Array<any>
) => any(params, fn);
const toString: Function = Object.prototype.toString;
const types: string[] = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(
  ' '
);
const len: number = types.length;
const typeCache: Object = {};
const typeRegexp: RegExp = /\s([a-zA-Z]+)/;
const is: Is = setup();

export default is;

function setup(): Is {
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
