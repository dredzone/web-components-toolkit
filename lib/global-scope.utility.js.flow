/* @flow */
import {objectNestedKeys} from './object-nested-keys.utility';

export type GlobalScopeType = {
	get(key: string, defaultValue: any): any,
	set(key: string, value: any): void
};

export const global: Object = document.defaultView;

export const globalScope: GlobalScopeType = Object.freeze({
	get(key: string): any {
		return objectNestedKeys.get(global, key);
	},
	set(key: string, value: any): void {
		objectNestedKeys.set(global, key, value);
	}
});
