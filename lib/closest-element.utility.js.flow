/* @flow */
import {selectorMatches} from './selector-matches.utility';
import {isType} from './is-type.utility';

export const closestElement: Function = (selector: string, element: Element | Node): Element | Node | null => {
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
