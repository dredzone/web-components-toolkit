/* @flow */
import {default as api, type IsApi} from './api';
import nan from './number/nan';
import above from './number/above';
import under from './number/under';
import within from './number/within';
import decimal from './number/decimal';
import even from './number/even';
import infinite from './number/infinite';
import finite from './number/finite';
import integer from './number/integer';
import negative from './number/negative';
import odd from './number/odd';
import positive from './number/positive';

export type IsNumber = {
	nan(n: any): boolean;

	above(n: any, min: any): boolean;

	under(n: any, max: any): boolean;

	within(n: any, min: any, max: any): boolean;

	decimal(n: any): boolean;

	even(n: any): boolean;

	infinite(n: any): boolean;

	finite(n: any): boolean;

	integer(n: any): boolean;

	negative(n: any): boolean;

	odd(n: any): boolean;

	positive(n: any): boolean;
}

const {assign} = Object;
const notApiOnly: Object = {above, under, within};

Object.keys(notApiOnly).forEach((key: string) => {
	notApiOnly[key].api = ['not'];
});

const isNumberApi: IsApi<IsNumber> = api(assign({
	nan,
	above,
	decimal,
	even,
	infinite,
	finite,
	integer,
	negative,
	odd,
	positive,
	under,
	within
}, notApiOnly));

export default isNumberApi;
