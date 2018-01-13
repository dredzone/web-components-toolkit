/* @flow */
export const siblings = (element: Node): Array<Node> => {
	let siblings: Array<Node> = [];
	if (element.parentNode && element.parentNode.firstChild) {
		let sibling: Node = element.parentNode.firstChild;
		do {
			if (sibling.nodeType === 1 && sibling !== element) {
				siblings.push(sibling);
			}
		} while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
	}

	return siblings;
};

export const isDescendant = (child: Node, parent: Node): boolean => {
	/* eslint-disable no-empty */
	while (child.parentNode && (child = child.parentNode) && child !== parent) {

	}
	/* eslint-disable no-empty */
	return Boolean(child);
};

export const createElement = (tagName: string, attributes: Object): Element => {
	let element: HTMLElement = document.createElement(tagName);
	for (let attr in attributes) {
		if (Object.hasOwnProperty.call(attributes, attr)) {
			element.setAttribute(attr, attributes[attr]);
		}
	}
	return element;
};

export const removeElement = (element: Element): void => {
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
};

export const removeChildren = (parent: Element): void => {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};
