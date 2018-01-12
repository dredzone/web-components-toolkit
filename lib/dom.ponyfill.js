/*  */
import {window} from './constants';

const doc = window.document;

export const importNode = (template) => {
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

export const selectorMatches = (el, selector) => {
	const proto = Element.prototype;
	const fn = proto.matches || proto.webkitMatchesSelector || proto.msMatchesSelector || function (s) {
		return [].indexOf.call(doc.querySelectorAll(s), this) !== -1;
	};
	return fn.call(el, selector);
};

export const closest = (selector, element, stopAt) => {
	let el = element;

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

export const siblings = (element) => {
	let siblings = [];
	if (element.parentNode && element.parentNode.firstChild) {
		let sibling = element.parentNode.firstChild;
		do {
			if (sibling.nodeType === 1 && sibling !== element) {
				siblings.push(sibling);
			}
		} while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
	}

	return siblings;
};

export const isDescendant = (child, parent) => {
	/* eslint-disable no-empty */
	while (child.parentNode && (child = child.parentNode) && child !== parent) {

	}
	/* eslint-disable no-empty */
	return Boolean(child);
};

export const createElement = (tagName, attributes) => {
	let element = doc.createElement(tagName);
	for (let attr in attributes) {
		if (Object.hasOwnProperty.call(attributes, attr)) {
			element.setAttribute(attr, attributes[attr]);
		}
	}
	return element;
};

export const removeElement = (element) => {
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
};

export const removeChildren = (parent) => {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};
