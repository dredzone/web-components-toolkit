/* @flow */
import documentReady from './dom/document-ready';
import createElement from './dom/create-element';
import elementSiblings from './dom/element-siblings';
import removeElement from './dom/remove-element';
import isDescendantElement from './dom/is-descendant-element';
import elementChildren from './dom/element-children';
import templateContent from './dom/template-content';

export type Dom = {
	createElement(tagName: string, attributes: Object): Element;

	documentReady(passThrough: any): Promise<any>;

	elementChildren(element: Element, nodeType: number): Array<Element>;

	elementSiblings(element: Node): Array<Node>;

	isDescendantElement(child: Node, parent: Node): boolean;

	removeElement(element: Node): void;

	templateContent(template: HTMLTemplateElement): DocumentFragment;
}

const dom: Dom = Object.freeze({
	documentReady,
	createElement,
	elementSiblings,
	removeElement,
	isDescendantElement,
	elementChildren,
	templateContent
});

export default dom;
