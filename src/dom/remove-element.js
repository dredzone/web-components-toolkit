/* @flow */
export default (element: Node): void => {
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
};
