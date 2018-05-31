/*  */
import classBuilder from '../class-builder.js';
import customElement, { } from './custom-element.js';
import properties, { } from './custom-element-properties.js';
import events, { } from './custom-element-events.js';


export default (baseClass = customElement()) => {
  return class Component extends classBuilder(baseClass).with(events, properties) {
    propertiesChanged(
      currentProps, // eslint-disable-line no-unused-vars
      changedProps, // eslint-disable-line no-unused-vars
      oldProps // eslint-disable-line no-unused-vars
    ) {
      if (this.initialized) {
        this.render();
      }
    }
  };
};
