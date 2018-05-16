/*  */
import { all, any } from './array.js';



const doAllApi = (fn) => (...params) => all(params, fn);
const doAnyApi = (fn) => (...params) => any(params, fn);
const toString = Object.prototype.toString;
const types = 'Map Set Symbol Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(
  ' '
);
const len = types.length;
const typeCache = {};
const typeRegexp = /\s([a-zA-Z]+)/;

export default (setup());

export const getType = (src) => getSrcType(src);

function getSrcType(src) {
  let type = toString.call(src);
  if (!typeCache[type]) {
    let matches = type.match(typeRegexp);
    if (Array.isArray(matches) && matches.length > 1) {
      typeCache[type] = matches[1].toLowerCase();
    }
  }
  return typeCache[type];
}

function setup() {
  let checks = {};
  for (let i = len; i--; ) {
    const type = types[i].toLowerCase();
    checks[type] = src => getSrcType(src) === type;
    checks[type].all = doAllApi(checks[type]);
    checks[type].any = doAnyApi(checks[type]);
  }
  return checks;
}
