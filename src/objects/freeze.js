/**
 * A helper function for deep freezing of objects
 *
 */
const {getOwnPropertyNames, hasOwnProperty, isFrozen} = Object;

export const freeze = (o: Object): Object => {
	Object.freeze(o);
	getOwnPropertyNames(o).forEach((prop: string) => {
		if (hasOwnProperty.call(o, prop) && o[prop] !== null && (typeof o[prop] === 'object' || typeof o[prop] === 'function') && !isFrozen(o[prop])) {
			freeze(o[prop]);
		}
	});
	return o;
};
