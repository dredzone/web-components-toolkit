/*  */
export default (node) => {
  let siblings = [];
  if (node.parentNode && node.parentNode.firstChild) {
    let sibling = node.parentNode.firstChild;
    do {
      if (sibling.nodeType === 1 && sibling !== node) {
        siblings.push(sibling);
      }
    } while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
  }

  return siblings;
};
