/*  */
export const elementSiblings = (element) => {
	let siblings = [];
	if (element.parentNode && element.parentNode.firstChild) {
		let sibling = element.parentNode.firstChild;
		do {
			if (sibling.nodeType === 1 && sibling !== element) {
				siblings.push(sibling);
			}
		} while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
	}

	return siblings;
};
