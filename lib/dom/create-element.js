/*  */
export default (tagName, attributes) => {
	let element = document.createElement(tagName);
	for (let attr in attributes) {
		if (Object.hasOwnProperty.call(attributes, attr)) {
			element.setAttribute(attr, attributes[attr]);
		}
	}
	return element;
};
