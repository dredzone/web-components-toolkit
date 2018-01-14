/*  */

export const selectorMatches = (element, selector) => {
	const proto = Element.prototype;
	const fn = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s) {
		return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
	};
	return fn.call(element, selector);
};
