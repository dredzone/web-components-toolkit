export const elementChildren: Function = (element: Element, nodeType: number = 1): Array<Element> => {
	let childNodes: Array<Node> = element.childNodes;
	let children: Array<Element> = [];
	if (childNodes && childNodes.length > 0) {
		let i: number = childNodes.length;
		while (i--) {
			if (childNodes[i].nodeType === nodeType) {
				children.unshift(childNodes[i]);
			}
		}
	}
	return children;
};
