import {merge} from './objects/merge';
import {isTypeChecks} from './is/is-type-checks';
import {isArithmeticChecks} from './is/is-arithmetic-checks';
import {isDomChecks} from './is/is-dom-checks';

export const is = merge.all([
	{type: isTypeChecks},
	{number: isArithmeticChecks},
	{dom: isDomChecks}
]);
