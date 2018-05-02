/*  */
import type from '../type';

export default (n) => type.is.number(n) && n % 2 === 0;
