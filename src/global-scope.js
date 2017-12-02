import {global} from './constants';
import {config} from './config';

export const globalScope = Object.freeze({
	get(key: string): any {
		return config.get(global, key);
	},
	set(key: string, value: any): void {
		config.set(global, key, value);
	}
});