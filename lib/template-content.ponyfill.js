/*  */
import {window} from './constants';

const doc = window.document;

export const templateContent = (template) => {
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
