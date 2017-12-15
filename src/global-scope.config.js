/* @flow */
import {getPropertyValue, setPropertyValue} from './object.helpers';
import {window} from './constants';
import type {ConfigObject} from './typefile';

export const globalScope: ConfigObject = Object.freeze({
	get(key: string): any {
		return getPropertyValue(window, key);
	},
	set(key: string, value: any): void {
		setPropertyValue(window, key, value);
	}
});
