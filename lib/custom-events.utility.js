/*  */
import {objectAssign} from './object-assign.utility';
import {global} from './global-scope.utility';

export const createCustomEvent = (evtName, params = {}) => {
	let evt;

	params = objectAssign({
		bubbles: false,
		cancelable: false,
		detail: undefined
	}, params);

	if (typeof global.CustomEvent === 'function') {
		evt = new global.CustomEvent(evtName, params);
	} else {
		evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(evtName, params.bubbles, params.cancelable, params.detail);
	}
	return evt;
};
