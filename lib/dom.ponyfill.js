/*  */
import {window} from './constants';
import {isType} from './is-type.utility';
import {objectAssign} from './object-assign.ponyfill';

export const importNode = (template) => {
	if ('content' in document.createElement('template')) {
		return document.importNode(template.content, true);
	}

	let fragment = document.createDocumentFragment();
	let children = template.childNodes;
	for (let i = 0; i < children.length; i++) {
		fragment.appendChild(children[i].cloneNode(true));
	}
	return fragment;
};

export const selectorMatches = (el, selector) => {
	const proto = Element.prototype;
	const fn = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	return fn.call(el, selector);
};

export const closest = (selector, element) => {
	let el = element;
	let result = null;

	if (el instanceof Element && isType.function(el.closest)) {
		result = el.closest(selector) || null;
	} else {
		do {
			if (selectorMatches(el, selector)) {
				result = el;
				el.parentNode = null;
			}
		} while (el.parentNode && el.parentNode !== null && (el = el.parentNode));
	}
	return result;
};

export const customEvent = (evtName, params = {}) => {
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
