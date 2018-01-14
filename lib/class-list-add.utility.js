/*  */
import {classListContains} from './class-list-contains.utility';

export const classListAdd = (element, className) => {
	if (element.classList) {
		element.classList.add(className);
	} else if (!classListContains(element, className)) {
		element.className += ' ' + className;
	}
};
