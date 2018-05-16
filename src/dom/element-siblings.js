/* @flow */
export default (node: Node): Array<Node> => {
  let siblings: Array<Node> = [];
  if (node.parentNode && node.parentNode.firstChild) {
    let sibling: Node = node.parentNode.firstChild;
    do {
      if (sibling.nodeType === 1 && sibling !== node) {
        siblings.push(sibling);
      }
    } while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
  }

  return siblings;
};
