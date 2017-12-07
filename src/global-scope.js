/* @flow */
import {getPropertyValue, setPropertyValue} from './objects.helper';

const window = document.defaultView;

export const globalScope = Object.freeze({
	get(key: string): any {
		return getPropertyValue(window, key);
	},
	set(key: string, value: any): void {
		setPropertyValue(window, key, value);
	}
});
