/*  */
import {objectAssign} from './object-assign.ponyfill';
import {window} from './constants';

export const CustomEvent = (eventName, params = {}) => {
	params = objectAssign({
		bubbles: false,
		cancelable: false,
		detail: undefined
	}, params);

	const evt = document.createEvent('CustomEvent');
	evt.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);
};

CustomEvent.prototype = window.Event.prototype;
