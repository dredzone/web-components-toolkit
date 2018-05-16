/* @flow */
import { browser } from './environment.js';

export const templateContent: Function = browser((template: HTMLTemplateElement): DocumentFragment => {
  if ('content' in document.createElement('template')) {
    return document.importNode(template.content, true);
  }

  let fragment = document.createDocumentFragment();
  let children = template.childNodes;
  for (let i = 0; i < children.length; i++) {
    fragment.appendChild(children[i].cloneNode(true));
  }
  return fragment;
});

export const createElement: Function = browser((html: string): Node => {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = html.trim();
  const frag: DocumentFragment = templateContent(template);
  if (frag && frag.firstChild) {
    return frag.firstChild;
  }
  throw new Error(`Unable to createElement for ${html}`);
});

export const documentReady: Function = browser((passThrough: any): Promise<any> => {
  if (document.readyState === 'loading') {
    return new Promise((resolve: Function) => {
      document.addEventListener('DOMContentLoaded', () => resolve(passThrough));
    });
  }
  return Promise.resolve(passThrough);
});

export const elementChildren: Function = browser((element: Element, nodeType: number = Node.ELEMENT_NODE): Array<
  Element
> => {
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
});

export const elementSiblings: Function = browser((node: Node): Array<Node> => {
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
});

export const removeElement: Function = browser((element: Node): void => {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
});

export const isDescendantElement: Function = browser((child: Node, parent: Node): boolean => {
  /* eslint-disable no-empty */
  while (child.parentNode && (child = child.parentNode) && child !== parent) {}
  /* eslint-disable no-empty */
  return Boolean(child);
});
