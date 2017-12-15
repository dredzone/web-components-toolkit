/* @flow */
import {isType} from './is-type.utility';

const {freeze, getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

/**
 * A helper function for deep freezing of objects
 *
 */
export const objectDeepFreeze = (o: Object): Object => {
	freeze(o);
	getOwnPropertyNames(o).forEach((prop: string) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (isType.object(o[prop]) || isType.function(o[prop])) && !isFrozen(o[prop])) {
			objectDeepFreeze(o[prop]);
		}
	});
	return o;
};
