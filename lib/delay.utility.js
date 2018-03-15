/*  */
import {global} from './global-scope.utility';

export const delay = (fn) => {
	if (global.Promise) {
		global.Promise.resolve().then(fn);
	} else {
		global.setTimeout(fn);
	}
};
