/* @flow */
import {global} from './global-scope.utility';

export const delay: Function = (fn: Function): void => {
	if (global.Promise) {
		global.Promise.resolve().then(fn);
	} else {
		global.setTimeout(fn);
	}
};
