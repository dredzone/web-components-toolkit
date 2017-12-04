import {global} from './constants';
import {getPropertyValue, setPropertyValue} from './objects.helper';

export const globalScope = Object.freeze({
	get(key: string): any {
		return getPropertyValue(global, key);
	},
	set(key: string, value: any): void {
		setPropertyValue(global, key, value);
	}
});
