/*  */
export const textNodeIfString = (node) => {
	return typeof node === 'string' ? document.createTextNode(node) : node;
};
