/* @flow */
import getNestedValue from './object/get-nested-value';
import setNestedValue from './object/set-nested-value';
import toMap from './object/to-map';

export type ObjectUtil = {
	get(obj: Object, key: string, defaultValue: any): any;

	set(obj: Object, key: string, value: any): void;

	toMap(o: Object): Map<any, any>;
}

const object: ObjectUtil = Object.freeze({
	get: getNestedValue,
	set: setNestedValue,
	toMap
});

export default object;
