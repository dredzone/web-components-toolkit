/* @flow */
import {getPropertyValue, setPropertyValue} from './object-nested-keys.utility';
import {window} from './constants';
import type {ConfigObjectType} from './typefile';

export const globalScope: ConfigObjectType = Object.freeze({
	get(key: string): any {
		return getPropertyValue(window, key);
	},
	set(key: string, value: any): void {
		setPropertyValue(window, key, value);
	}
});
