/*  */
import {default as api,} from './api';
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


const {assign} = Object;
const notApiOnly = {above, under, within};

Object.keys(notApiOnly).forEach((key) => {
	notApiOnly[key].api = ['not'];
});

const isNumberApi = api(assign({
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
