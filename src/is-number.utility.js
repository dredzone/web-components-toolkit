/* @flow */
import {setApi} from './is.helpers';
import {isType} from './is-type.utility';
import type {IsType, ApiIsType} from './typefile';

export const isNumber = (function (): ApiIsType {
	const is: IsType = {};

	is.nan = isNaN || (n => Number(n) !== n);

	// is a given number above minimum parameter?
	is.above = (n, min) => isType.all.number(n, min) && n > min;

	// above method does not support 'all' and 'any' interfaces
	is.above.api = ['not'];

	// is a given number decimal?
	is.decimal = n => isType.number(n) && n % 1 !== 0;

	// is a given number even?
	is.even = n => isType.number(n) && n % 2 === 0;

	// is a given number finite?
	is.finite = isFinite || (n => is.not.infinite(n) && is.not.nan(n));

	// is a given number infinite?
	is.infinite = n => n === Infinity || n === -Infinity;

	// is a given number integer?
	is.integer = n => isType.number(n) && n % 1 === 0;

	// is a given number negative?
	is.negative = n => isType.number(n) && n < 0;

	// is a given number odd?
	is.odd = n => isType.number(n) && (n % 2 === 1 || n % 2 === -1);

	// is a given number positive?
	is.positive = n => isType.number(n) && n > 0;

	// is a given number above maximum parameter?
	is.under = (n, max) => isType.all.number(n, max) && n < max;

	// least method does not support 'all' and 'any' interfaces
	is.under.api = ['not'];

	// is a given number within minimum and maximum parameters?
	is.within = (n, min, max) => isType.all.number(n, min, max) && n > min && n < max;

	// within method does not support 'all' and 'any' interfaces
	is.within.api = ['not'];

	return setApi(is);
})();

