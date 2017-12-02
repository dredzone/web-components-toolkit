import {checksHelper} from './checks.helper';
import {typeChecks} from './type.checks';

export const numberChecks = (function () {
	const checks = {
		not: {},
		all: {},
		any: {}
	};

	checks.nan = isNaN || (n => Number(n) !== n);

	// is a given number above minimum parameter?
	checks.above = (n, min) => typeChecks.all.number(n, min) && n > min;

	// above method does not support 'all' and 'any' interfaces
	checks.above.api = ['not'];

	// is a given number decimal?
	checks.decimal = n => typeChecks.number(n) && n % 1 !== 0;

	// is a given number even?
	checks.even = n => typeChecks.number(n) && n % 2 === 0;

	// is a given number finite?
	checks.finite = isFinite || (n => checks.not.infinite(n) && checks.not.nan(n));

	// is a given number infinite?
	checks.infinite = n => n === Infinity || n === -Infinity;

	// is a given number integer?
	checks.integer = n => typeChecks.number(n) && n % 1 === 0;

	// is a given number negative?
	checks.negative = n => typeChecks.number(n) && n < 0;

	// is a given number odd?
	checks.odd = n => typeChecks.number(n) && (n % 2 === 1 || n % 2 === -1);

	// is a given number positive?
	checks.positive = n => typeChecks.number(n) && n > 0;

	// is a given number above maximum parameter?
	checks.under = (n, max) => typeChecks.all.number(n, max) && n < max;

	// least method does not support 'all' and 'any' interfaces
	checks.under.api = ['not'];

	// is a given number within minimum and maximum parameters?
	checks.within = (n, min, max) => typeChecks.all.number(n, min, max) && n > min && n < max;

	// within method does not support 'all' and 'any' interfaces
	checks.within.api = ['not'];

	checksHelper.setApi(checks);
	return checks;
})();

