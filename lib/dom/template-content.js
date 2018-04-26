/*  */
export default (template) => {
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
