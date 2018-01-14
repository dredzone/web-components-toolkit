/*  */
import {objectNestedKeys} from './object-nested-keys.utility';


export const global = document.defaultView;

export const globalScope = Object.freeze({
	get(key) {
		return objectNestedKeys.get(global, key);
	},
	set(key, value) {
		objectNestedKeys.set(global, key, value);
	}
});
