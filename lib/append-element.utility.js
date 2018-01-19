/*  */
import {textNodeIfString} from './dom.helper';

export const appendElement = (container, ...nodes) => {
	if (typeof container.append === 'function') {
		container.append(...nodes);
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
	container.appendChild(node);
};
