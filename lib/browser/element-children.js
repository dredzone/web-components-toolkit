/*  */
export default (element, nodeType = 1) => {
  let childNodes = element.childNodes;
  let children = [];
  if (childNodes && childNodes.length > 0) {
    let i = childNodes.length;
    while (i--) {
      if (childNodes[i].nodeType === nodeType) {
        children.unshift(childNodes[i]);
      }
    }
  }
  return children;
};
