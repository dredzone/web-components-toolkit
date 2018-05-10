/* @flow */
export default (element: Node): Array<Node> => {
  let siblings: Array<Node> = [];
  if (element.parentNode && element.parentNode.firstChild) {
    let sibling: Node = element.parentNode.firstChild;
    do {
      if (sibling.nodeType === 1 && sibling !== element) {
        siblings.push(sibling);
      }
    } while (
      sibling.nextSibling &&
      sibling.nextSibling !== null &&
      (sibling = sibling.nextSibling)
    );
  }

  return siblings;
};
