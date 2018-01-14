/* @flow */

export const selectorMatches = (element: Element | Node, selector: string): boolean => {
	const proto: Element = Element.prototype;
	const fn: Function = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s: string) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	return fn.call(element, selector);
};
