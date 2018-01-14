/*  */

export const isDescendantElement = (child, parent) => {
	/* eslint-disable no-empty */
	while (child.parentNode && (child = child.parentNode) && child !== parent) {

	}
	/* eslint-disable no-empty */
	return Boolean(child);
};

