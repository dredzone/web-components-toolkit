import {merge} from './merge';
import {typeChecks} from './checks/type.checks';
import {numberChecks} from './checks/number.checks';

export const checks = merge.all([
	{type: typeChecks},
	{number: numberChecks}
]);
