/*  */
import type from './type';
import all from './helpers/all';
import not from './helpers/not';

export const nan = isNaN || ((n) => Number(n) !== n);

export const above = (n, min) => all(type.number)(n, min) && n > min;

export const decimal = (n) => type.number(n) && n % 1 !== 0;

export const even = (n) => type.number(n) && n % 2 === 0;

export const infinite = (n) => n === Infinity || n === -Infinity;

export const finite = isFinite || ((n) => not(infinite(n) || nan(n)));

export const integer = (n) => type.number(n) && n % 1 === 0;

export const negative = (n) => type.number(n) && n < 0;

export const odd = (n) => type.number(n) && (n % 2 === 1 || n % 2 === -1);

export const positive = (n) => type.number(n) && n > 0;

export const under = (n, max) => all(type.number)(n, max) && n < max;

export const within = (n, min, max) => all(type.number)(n, min, max) && n > min && n < max;
