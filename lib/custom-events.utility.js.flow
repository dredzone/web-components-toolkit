/* @flow */
import {objectAssign} from './object-assign.utility';

export const createCustomEvent: Function = (evtName: string, params: Object = {}): CustomEvent => {
	let evt: CustomEvent;

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
