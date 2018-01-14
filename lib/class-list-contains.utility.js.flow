/* @flow */

export const classListContains: Function = (element: Element, className: string): boolean => {
	if (element.classList) {
		return element.classList.contains(className);
	}
	return Boolean(element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)')));
};
