import {global} from '../constants';

export const Map = global.Map || function Map() {
	const keys = [], values = [];
	return {
		get(obj: Object) {
			return values[keys.indexOf(obj)];
		},
		set(obj: Object, value: any) {
			values[keys.push(obj) - 1] = value;
		}
	};
};