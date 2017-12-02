import {config} from './config';

export const globalScope = (function() {
	const global = document.defaultView;
	return {
		get(key: string): any {
			return config.get(global, key);
		},
		set(key: string, value: any): void {
			config.set(global, key, value);
		}
	}
})();
