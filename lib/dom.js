/*  */
import { browser } from './environment.js';

export const templateContent = browser((template) => {
	if ('content' in document.createElement('template')) {
		return document.importNode(template.content, true);
	}

	let fragment = document.createDocumentFragment();
	let children = template.childNodes;
	for (let i = 0; i < children.length; i++) {
		fragment.appendChild(children[i].cloneNode(true));
	}
	return fragment;
});

export const createElement = browser((html) => {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	const frag = templateContent(template);
	if (frag && frag.firstChild) {
		return frag.firstChild;
	}
	throw new Error(`Unable to createElement for ${html}`);
});

export const documentReady = browser((passThrough) => {
	if (document.readyState === 'loading') {
		return new Promise((resolve) => {
			document.addEventListener('DOMContentLoaded', () => resolve(passThrough));
		});
	}
	return Promise.resolve(passThrough);
});

export const elementChildren = browser((
	element,
	nodeType = Node.ELEMENT_NODE
) => {
	let childNodes = element.childNodes;
	let children = [];
	if (childNodes && childNodes.length > 0) {
		let i = childNodes.length;
		while (i--) {
			if (childNodes[i].nodeType === nodeType) {
				children.unshift(childNodes[i]);
			}
		}
	}
	return children;
});

export const elementSiblings = browser((node) => {
	let siblings = [];
	if (node.parentNode && node.parentNode.firstChild) {
		let sibling = node.parentNode.firstChild;
		do {
			if (sibling.nodeType === 1 && sibling !== node) {
				siblings.push(sibling);
			}
		} while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
	}
	return siblings;
});

export const removeElement = browser((element) => {
	if (element.parentElement) {
		element.parentElement.removeChild(element);
	}
});

export const isDescendantElement = browser((child, parent) => {
	/* eslint-disable no-empty */
	while (child.parentNode && (child = child.parentNode) && child !== parent) {}
	/* eslint-disable no-empty */
	return Boolean(child);
});
