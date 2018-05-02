/*  */
import type from '../type';

export default (n, max) => type.all.number(n, max) && n < max;
