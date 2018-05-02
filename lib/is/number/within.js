/*  */
import type from '../type';

export default (n, min, max) => type.all.number(n, min, max) && n > min && n < max;
