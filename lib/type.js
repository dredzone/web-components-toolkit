/*  */
import { all, any } from './array.js';



const doAllApi = (fn) => (
  ...params
) => all(params, fn);
const doAnyApi = (fn) => (
  ...params
) => any(params, fn);
const toString = Object.prototype.toString;
const types = 'Map Set Symbol Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(
  ' '
);
const len = types.length;
const typeCache = {};
const typeRegexp = /\s([a-zA-Z]+)/;
const is = setup();

export default is;

function setup() {
  let checks = {};
  for (let i = len; i--; ) {
    const type = types[i].toLowerCase();
    checks[type] = obj => getType(obj) === type;
    checks[type].all = doAllApi(checks[type]);
    checks[type].any = doAnyApi(checks[type]);
  }
  return checks;
}

function getType(obj) {
  let type = toString.call(obj);
  if (!typeCache[type]) {
    let matches = type.match(typeRegexp);
    if (Array.isArray(matches) && matches.length > 1) {
      typeCache[type] = matches[1].toLowerCase();
    }
  }
  return typeCache[type];
}
