/* @flow */
import classBuilder from '../../class-builder.js';
import { browser } from '../../environment.js';
import customElement, { type ICustomElement } from './custom-element-mixin.js';
import properties, { type IProperties } from './properties-mixin.js';
import events, { type IEvents } from './events-mixin.js';

export default browser(
  (
    baseClass: Class<ICustomElement> = customElement()
  ): Class<ICustomElement & IEvents & IProperties> => {
    return class Component extends classBuilder(baseClass).with(
      events,
      properties
    ) {
      propertiesChanged(
        currentProps: Object,
        changedProps: Object,
        oldProps: Object // eslint-disable-line no-unused-vars
      ): void {
        if (this.initialized) {
          this.render();
        }
      }
    };
  }
);
