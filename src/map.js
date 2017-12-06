/* @flow */
import {global} from './constants';

export const Map = global.Map || function () {
	const keys = [];
	const values = [];

	return {
		get(obj: Object) {
			return values[keys.indexOf(obj)];
		},
		set(obj: Object, value: any) {
			values[keys.push(obj) - 1] = value;
		}
	};
};
