/* @flow */
import {window} from './constants';

const doc: Document = window.document;

export const importNode = (template: HTMLTemplateElement): DocumentFragment => {
	if ('content' in doc.createElement('template')) {
		return doc.importNode(template.content, true);
	}

	let fragment = doc.createDocumentFragment();
	let children = template.childNodes;
	for (let i = 0; i < children.length; i++) {
		fragment.appendChild(children[i].cloneNode(true));
	}
	return fragment;
};

export const selectorMatches = (el: Element | Node, selector: string): boolean => {
	const proto: Element = Element.prototype;
	const fn: Function = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s: string) {
		return [].indexOf.call(doc.querySelectorAll(s), this) !== -1;
	};
	return fn.call(el, selector);
};

export const closest = (selector: string, element: Element | Node, stopAt?: Element | Node): Element | Node | null => {
	let el: Element | Node = element;

	if (!stopAt && doc.body instanceof Element) {
		stopAt = doc.body;
	}

	while (el && el !== stopAt) {
		if (selectorMatches(el, selector)) {
			return el;
		}

		if (!el.parentNode || el.parentNode === null) {
			return null;
		}

		// go up the tree
		el = el.parentNode;
	}
	return null;
};

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
	let element: HTMLElement = doc.createElement(tagName);
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
