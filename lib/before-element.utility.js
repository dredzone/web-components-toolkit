/*  */
import {textNodeIfString} from './dom.helper';

export const beforeElement = (container, ...nodes) => {
	if (typeof container.before === 'function') {
		container.before(...nodes);
		return;
	}
	if (container.parentNode) {
		let parent = container.parentNode;
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
		parent.insertBefore(node, container);
	}
};
