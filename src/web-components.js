/* @flow */
import customElement from './web-components/custom-element-mixin';
import state from './web-components/state-mixin';
import slots from './web-components/slots-mixin';
import events from './web-components/events-mixin';
import properties from './web-components/properties-mixin';

export type WebComponents = {
	customElement: Function;
	state: Function;
	slots: Function;
	events: Function;
	properties: Function;
}

const webComponents: WebComponents = Object.freeze({
	customElement,
	state,
	slots,
	events,
	properties
});

export default webComponents;
