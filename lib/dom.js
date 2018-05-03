/*  */
import documentReady from './dom/document-ready';
import createElement from './dom/create-element';
import elementSiblings from './dom/element-siblings';
import removeElement from './dom/remove-element';
import isDescendantElement from './dom/is-descendant-element';
import elementChildren from './dom/element-children';
import templateContent from './dom/template-content';
import microTask, {} from './dom/microtask';
import listenEvent, {} from './dom/listen-event';
import listenEventOnce from './dom/listen-event-once';
import pausableEvent, {} from './dom/pausable-event';
import stopEvent from './dom/stop-event';


const dom = Object.freeze({
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
