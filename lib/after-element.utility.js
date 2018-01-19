/*  */
import {textNodeIfString} from './dom.helper';

export const afterElement = (container, ...nodes) => {
	if (typeof container.after === 'function') {
		container.after(...nodes);
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

	if (container.parentNode) {
		let parent = container.parentNode;
		if (container.nextSibling) {
			parent.insertBefore(node, container.nextSibling);
		} else {
			parent.appendChild(node);
		}
	}
};
