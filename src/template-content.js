/* @flow */
import {global} from './constants';

const document: Document = global.document;

export const templateContent = (template: HTMLTemplateElement): DocumentFragment => {
	if ('content' in document.createElement('template')) {
		return document.importNode(template.content, true);
	}

	let fragment = document.createDocumentFragment();
	let children = template.childNodes;
	for (let i = 0; i < children.length; i++) {
		fragment.appendChild(children[i].cloneNode(true));
	}
	return fragment;
};
