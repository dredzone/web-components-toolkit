/* @flow */
import classBuilder from '../class-builder.js';
import customElement, {type ICustomElement} from './custom-element-mixin.js';
import properties, {type IProperties} from './properties-mixin.js';
import events, {type IEvents} from './events-mixin.js';

export default (baseClass: Class<ICustomElement> = customElement()): Class<ICustomElement & IEvents & IProperties> => {
	return class Component extends classBuilder(baseClass).with(events, properties) {
		propertiesChanged(currentProps: Object, changedProps: Object, oldProps: Object): void { // eslint-disable-line no-unused-vars
			if (this.initialized) {
				this.render();
			}
		}
	};
};
