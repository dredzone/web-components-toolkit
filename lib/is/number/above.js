/*  */
import type from '../type';

export default (n, min) => type.all.number(n, min) && n > min;
