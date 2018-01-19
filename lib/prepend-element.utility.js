/*  */
import {textNodeIfString} from './dom.helper';

export const prependElement = (container, ...nodes) => {
	if (typeof container.prepend === 'function') {
		container.prepend(...nodes);
		return;
	}
	let node;
	if (nodes.length === 1) {
		node = textNodeIfString(nodes[0]);
	} else {
		let fragment = document.createDocumentFragment();
		let list = Array.prototype.slice.call(nodes);
		for (let i = 0; i < nodes.length; i++) {
			fragment.appendChild(textNodeIfString(list[i]));
		}
		node = fragment;
	}
	if (container.firstChild) {
		container.insertBefore(node, container.firstChild);
	} else {
		container.appendChild(node);
	}
};
