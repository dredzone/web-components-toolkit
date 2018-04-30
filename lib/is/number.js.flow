/* @flow */
import type from './type';
import all from './helpers/all';
import not from './helpers/not';

export const nan: Function = isNaN || ((n: any) => Number(n) !== n);

export const above: Function = (n: any, min: any) => all(type.number)(n, min) && n > min;

export const decimal: Function = (n: any) => type.number(n) && n % 1 !== 0;

export const even: Function = (n: any) => type.number(n) && n % 2 === 0;

export const infinite: Function = (n: any) => n === Infinity || n === -Infinity;

export const finite: Function = isFinite || ((n: any) => not(infinite(n) || nan(n)));

export const integer: Function = (n: any) => type.number(n) && n % 1 === 0;

export const negative: Function = (n: any) => type.number(n) && n < 0;

export const odd: Function = (n: any) => type.number(n) && (n % 2 === 1 || n % 2 === -1);

export const positive: Function = (n: any) => type.number(n) && n > 0;

export const under: Function = (n: any, max: any) => all(type.number)(n, max) && n < max;

export const within: Function = (n: any, min, max: any) => all(type.number)(n, min, max) && n > min && n < max;
