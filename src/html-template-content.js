import {typeChecks} from './checks/type.checks';

export const htmlTemplateContent = (template: string | Object): DocumentFragment => {
	if (typeChecks.string(template)) {
		template = document.querySelector(template);
	}

	if (typeChecks.domNode(template)) {
		if ('content' in document.createElement('template')) {
			return document.importNode(template.content, true);
		}

		let fragment = document.createDocumentFragment();
		let children = template.childNodes;
		for (let i = 0; i < children.length; i++) {
			fragment.appendChild(children[i].cloneNode(true));
		}
		return fragment;
	}

	throw new Error('template must be a valid querySelector or domNode');
};