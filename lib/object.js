/*  */
import getNestedValue from './object/get-nested-value';
import setNestedValue from './object/set-nested-value';
import toMap from './object/to-map';


const object = Object.freeze({
	get: getNestedValue,
	set: setNestedValue,
	toMap
});

export default object;
