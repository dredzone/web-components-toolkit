/* @flow */
import classBuilder from '../class-builder.js';
import customElement, { type ICustomElement } from './custom-element.js';
import properties, { type IProperties } from './custom-element-properties.js';
import events, { type IEvents } from './custom-element-events.js';

type InType = HTMLElement & ICustomElement;
type OutType = InType & IEvents & IProperties;

export default (baseClass: Class<InType> = customElement()): Class<OutType> => {
  return class Component extends classBuilder(baseClass).with(events, properties) {
    propertiesChanged(
      currentProps: Object, // eslint-disable-line no-unused-vars
      changedProps: Object, // eslint-disable-line no-unused-vars
      oldProps: Object // eslint-disable-line no-unused-vars
    ): void {
      if (this.initialized) {
        this.render();
      }
    }
  };
};
