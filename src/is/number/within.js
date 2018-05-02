/* @flow */
import type from '../type';

export default (n: any, min: any, max: any): boolean => type.all.number(n, min, max) && n > min && n < max;
