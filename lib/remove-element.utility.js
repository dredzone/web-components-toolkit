/*  */
export const removeElement = (element) => {
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
};
