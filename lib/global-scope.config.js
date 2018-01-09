/*  */
import {getPropertyValue, setPropertyValue} from './object-nested-keys.utility';
import {window} from './constants';
import {} from './types';

export const globalScope = Object.freeze({
	get(key) {
		return getPropertyValue(window, key);
	},
	set(key, value) {
		setPropertyValue(window, key, value);
	}
});
