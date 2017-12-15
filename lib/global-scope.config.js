/*  */
import {getPropertyValue, setPropertyValue} from './object.helpers';
import {window} from './constants';

export const globalScope = Object.freeze({
	get(key) {
		return getPropertyValue(window, key);
	},
	set(key, value) {
		setPropertyValue(window, key, value);
	}
});
