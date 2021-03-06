/* @flow */
export default (element: Element, nodeType: number = Node.ELEMENT_NODE): Array<Element> => {
  let childNodes: NodeList<any> = element.childNodes;
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
