import {typeChecks} from './type.checks';

const {freeze, getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

export {deepMerge} from './deep-merge';

/**
 * A helper function for deep freezing of objects
 *
 */
export const deepFreeze = (o: Object): Object => {
	freeze(o);
	getOwnPropertyNames(o).forEach((prop: string) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (typeChecks.object(o[prop]) || typeChecks.function(o[prop])) && !isFrozen(o[prop])) {
			deepFreeze(o[prop]);
		}
	});
	return o;
};

export const getPropertyValue = (obj: Object, key: string, defaultValue: Object = null): Object => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: Object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (object === undefined) {
			object = defaultValue;
			return;
		}
	}
	return object;
};

export const setPropertyValue = (obj: Object, key: string, defaultValue: Object = null): Object => {
	if (key.indexOf('.') === -1) {
		return obj[key] ? obj[key] : defaultValue;
	}
	const parts: string[] = key.split('.');
	const length: number = parts.length;
	let object: Object = obj;

	for (let i = 0; i < length; i++) {
		object = object[parts[i]];
		if (typeChecks.undefined(object)) {
			object = defaultValue;
			return;
		}
	}
	return object;
};
