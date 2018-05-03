/* @flow */
import classBuilder from '../class-builder';
import customElement, {type ICustomElement} from './custom-element-mixin';
import properties, {type IProperties} from './properties-mixin';
import events, {type IEvents} from './events-mixin';

export default (): Class<ICustomElement & IEvents & IProperties> => {
	return class Component extends classBuilder(customElement()).with(events, properties) {
		propertiesChanged(currentProps: Object, changedProps: Object, oldProps: Object): void { // eslint-disable-line no-unused-vars
			if (this.isConnected()) {
				this.render();
			}
		}
	};
};
