/*  */
import {objectAssign} from './object-assign.utility';

export const createCustomEvent = (evtName, params = {}) => {
	let evt;

	params = objectAssign({
		bubbles: false,
		cancelable: false,
		detail: undefined
	}, params);

	if ('CustomEvent' in window) {
		evt = new window.CustomEvent(evtName, params);
	} else {
		evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(evtName, params.bubbles, params.cancelable, params.detail);
	}
	return evt;
};
