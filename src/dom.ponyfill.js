/* @flow */
import {window} from './constants';
import {isType} from './is-type.utility';
import {objectAssign} from './object-assign.ponyfill';

export const importNode = (template: HTMLTemplateElement): DocumentFragment => {
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

export const selectorMatches = (el: Element | Node, selector: string): boolean => {
	const proto: Element = Element.prototype;
	const fn: Function = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s: string) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	return fn.call(el, selector);
};

export const closest = (selector: string, element: Element | Node): Element | Node | null => {
	let el: Element | Node = element;
	let result: Element | Node | null = null;

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

export const customEvent = (evtName: string, params: Object = {}): CustomEvent => {
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
