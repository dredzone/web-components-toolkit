/* @flow */
import dget from './object/dget';
import dset from './object/dset';
import toMap from './object/to-map';

export type ObjectUtil = {
	dget(obj: Object, key: string, defaultValue: any): any;

	dset(obj: Object, key: string, value: any): void;

	toMap(o: Object): Map<any, any>;
}

const object: ObjectUtil = Object.freeze({
	dget,
	dset,
	toMap
});

export default object;
