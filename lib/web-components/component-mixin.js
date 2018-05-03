/*  */
import classBuilder from '../class-builder';
import customElement, {} from './custom-element-mixin';
import properties, {} from './properties-mixin';
import events, {} from './events-mixin';

export default () => {
	return class Component extends classBuilder(customElement()).with(events, properties) {
		propertiesChanged(currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
			if (this.isConnected()) {
				this.render();
			}
		}
	};
};
