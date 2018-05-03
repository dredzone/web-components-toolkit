/* @flow */
import documentReady from './dom/document-ready';
import createElement from './dom/create-element';
import elementSiblings from './dom/element-siblings';
import removeElement from './dom/remove-element';
import isDescendantElement from './dom/is-descendant-element';
import elementChildren from './dom/element-children';
import templateContent from './dom/template-content';
import microTask, {type MicroTask} from './dom/microtask';
import listenEvent, {type EventHandler} from './dom/listen-event';
import listenEventOnce from './dom/listen-event-once';
import pausableEvent, {type PausableEventHandler} from './dom/pausable-event';
import stopEvent from './dom/stop-event';

export type Dom = {
	createElement(tagName: string, attributes: Object): Element;

	documentReady(passThrough: any): Promise<any>;

	elementChildren(element: Element, nodeType: number): Array<Element>;

	elementSiblings(element: Node): Array<Node>;

	isDescendantElement(child: Node, parent: Node): boolean;

	removeElement(element: Node): void;

	templateContent(template: HTMLTemplateElement): DocumentFragment;

	listenEvent(target: EventTarget, type: string, listener: Function, capture: boolean): EventHandler;

	listenEventOnce(target: EventTarget, type: string, listener: Function, capture: boolean): EventHandler;

	pausableEvent(target: EventTarget, type: string, listener: Function, capture: boolean): PausableEventHandler;

	stopEvent(evt: Event): void;

	microTask: MicroTask;
}

const dom: Dom = Object.freeze({
	documentReady,
	createElement,
	elementSiblings,
	removeElement,
	isDescendantElement,
	elementChildren,
	templateContent,
	microTask,
	listenEvent,
	listenEventOnce,
	pausableEvent,
	stopEvent
});

export default dom;
