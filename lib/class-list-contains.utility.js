/*  */

export const classListContains = (element, className) => {
	if (element.classList) {
		return element.classList.contains(className);
	}
	return Boolean(element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)')));
};
