/*  */
import classBuilder from '../../class-builder.js';
import { browser } from '../../environment.js';
import customElement, { } from './custom-element-mixin.js';
import properties, { } from './properties-mixin.js';
import events, { } from './events-mixin.js';

export default browser(
  (
    baseClass = customElement()
  ) => {
    return class Component extends classBuilder(baseClass).with(
      events,
      properties
    ) {
      propertiesChanged(
        currentProps,
        changedProps,
        oldProps // eslint-disable-line no-unused-vars
      ) {
        if (this.initialized) {
          this.render();
        }
      }
    };
  }
);
