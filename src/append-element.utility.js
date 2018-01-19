/* @flow */
import {textNodeIfString} from './dom.helper';

export const appendElement: Function = (container: Node, ...nodes: Array<string | Node>): void => {
	if (typeof container.append === 'function') {
		container.append(...nodes);
		return;
	}
	let node: Node | Text | DocumentFragment;
	if (nodes.length === 1) {
		node = textNodeIfString(nodes[0]);
	} else {
		let fragment: DocumentFragment = document.createDocumentFragment();
		let list: Array<Node> = Array.prototype.slice.call(nodes);
		for (let i = 0; i < nodes.length; i++) {
			fragment.appendChild(textNodeIfString(list[i]));
		}
		node = fragment;
	}
	container.appendChild(node);
};
