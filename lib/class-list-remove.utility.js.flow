/* @flow */
import {classListContains} from './class-list-contains.utility';

export const classListRemove: Function = (element: Element, className: string): void => {
	if (element.classList) {
		element.classList.remove(className);
	} else if (classListContains(element, className)) {
		let regExp = new RegExp('(\\s|^)' + className + '(\\s|$)');
		element.className = element.className.replace(regExp, ' ');
	}
};
