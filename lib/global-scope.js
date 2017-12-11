/*  */
import {getPropertyValue, setPropertyValue} from './objects.helper';

const window = document.defaultView;

export const globalScope = Object.freeze({
	get(key) {
		return getPropertyValue(window, key);
	},
	set(key, value) {
		setPropertyValue(window, key, value);
	},
	scope: window
});
