/* @flow */
export default (evt: Event): void => {
	if (evt.stopPropagation) {
		evt.stopPropagation();
	}
	evt.preventDefault();
};
