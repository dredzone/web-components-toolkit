/* @flow */
import type from '../type';

export default (n: any, min: any): boolean => type.all.number(n, min) && n > min;
