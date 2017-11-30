import {setApi} from './helpers';
import {isTypeChecks} from './is-type-checks';

export const isArithmeticChecks = (function() {
	const is = {
		not: {},
		any: {}
	};

	is.nan = (value) => value !== value;

	// is a given number above minimum parameter?
	is.above = (n, min) => isTypeChecks.all.number(n, min) && n > min;

	// above method does not support 'all' and 'any' interfaces
	is.above.api = ['not'];

	// is a given number decimal?
	is.decimal = (n) => isTypeChecks.number(n) && n % 1 !== 0;

	// is a given number even?
	is.even = (n) => isTypeChecks.number(n) && n % 2 === 0;

	// is a given number finite?
	is.finite = isFinite || ((n) => is.not.infinite(n) && is.not.nan(n));

	// is a given number infinite?
	is.infinite = (n) => n === Infinity || n === -Infinity;

	// is a given number integer?
	is.integer = (n) => isTypeChecks.number(n) && n % 1 === 0;

	// is a given number negative?
	is.negative = (n) => isTypeChecks.number(n) && n < 0;

	// is a given number odd?
	is.odd = (n) => isTypeChecks.number(n) && (n % 2 === 1 || n % 2 === -1);

	// is a given number positive?
	is.positive = (n) => isTypeChecks.number(n) && n > 0;

	// is a given number above maximum parameter?
	is.under = (n, max) => isTypeChecks.all.number(n, max) && n < max;

	// least method does not support 'all' and 'any' interfaces
	is.under.api = ['not'];

	// is a given number within minimum and maximum parameters?
	is.within = (n, min, max) => isTypeChecks.all.number(n, min, max) && n > min && n < max;

	// within method does not support 'all' and 'any' interfaces
	is.within.api = ['not'];

	return setApi(is);
})();

