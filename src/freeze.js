import {typeChecks} from './checks/type.checks';
/**
 * A helper function for deep freezing of objects
 *
 */
const {getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

export const freeze = (o: Object): Object => {
	Object.freeze(o);
	getOwnPropertyNames(o).forEach((prop: string) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (typeChecks.object(o[prop]) || typeChecks.function(o[prop])) && !isFrozen(o[prop])) {
			freeze(o[prop]);
		}
	});
	return o;
};
