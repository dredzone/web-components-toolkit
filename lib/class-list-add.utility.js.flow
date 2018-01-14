/* @flow */
import {classListContains} from './class-list-contains.utility';

export const classListAdd: Function = (element: Element, className: string): void => {
	if (element.classList) {
		element.classList.add(className);
	} else if (!classListContains(element, className)) {
		element.className += ' ' + className;
	}
};
