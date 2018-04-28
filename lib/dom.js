/*  */
import documentReady from './dom/document-ready';
import createElement from './dom/create-element';
import elementSiblings from './dom/element-siblings';
import removeElement from './dom/remove-element';
import isDescendantElement from './dom/is-descendant-element';
import elementChildren from './dom/element-children';
import templateContent from './dom/template-content';

const dom = Object.freeze({
	documentReady,
	createElement,
	elementSiblings,
	removeElement,
	isDescendantElement,
	elementChildren,
	templateContent
});

export default dom;
