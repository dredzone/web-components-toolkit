/* @flow */
export default (tagName: string, attributes: Object): Element => {
	let element: HTMLElement = document.createElement(tagName);
	for (let attr in attributes) {
		if (Object.hasOwnProperty.call(attributes, attr)) {
			element.setAttribute(attr, attributes[attr]);
		}
	}
	return element;
};
