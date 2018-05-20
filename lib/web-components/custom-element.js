/*  */
import createStorage from '../create-storage.js';
import around from '../advice/around.js';
import * as microTask from '../dom/microtask.js';

const global = document.defaultView;

// https://github.com/google/traceur-compiler/issues/1709
if (typeof global.HTMLElement !== 'function') {
  const _HTMLElement = function HTMLElement() {
    // eslint-disable-line func-names
  };
  _HTMLElement.prototype = global.HTMLElement.prototype;
  global.HTMLElement = _HTMLElement;
}


export default (baseClass) => {
  const customElementsV1Callbacks = [
    'connectedCallback',
    'disconnectedCallback',
    'adoptedCallback',
    'attributeChangedCallback'
  ];
  const { defineProperty, hasOwnProperty } = Object;
  const privates = createStorage();

  if (!baseClass) {
    baseClass = class extends global.HTMLElement {};
  }

  return class CustomElement extends baseClass {

    static get observedAttributes() {
      return [];
    }

    static finalizeClass() {}

    static define(tagName) {
      const registry = customElements;
      if (!registry.get(tagName)) {
        const proto = this.prototype;
        customElementsV1Callbacks.forEach((callbackMethodName) => {
          if (!hasOwnProperty.call(proto, callbackMethodName)) {
            defineProperty(proto, callbackMethodName, {
              value() {},
              configurable: true
            });
          }
          const newCallbackName = callbackMethodName.substring(
            0,
            callbackMethodName.length - 'callback'.length
          );
          const originalMethod = proto[callbackMethodName];
          defineProperty(proto, callbackMethodName, {
            value: function(...args) {
              this[newCallbackName].apply(this, args);
              originalMethod.apply(this, args);
            },
            configurable: true
          });
        });

        this.finalizeClass();
        around(createConnectedAdvice(), 'connected')(this);
        around(createDisconnectedAdvice(), 'disconnected')(this);
        around(createRenderAdvice(), 'render')(this);
        registry.define(tagName, this);
      }
    }

    get initialized() {
      return privates(this).initialized === true;
    }

    constructor(...args) {
      super(...args);
      this.construct();
    }

    construct() {}

    /* eslint-disable no-unused-vars */
    attributeChanged(attributeName, oldValue, newValue) {}
    /* eslint-enable no-unused-vars */

    connected() {}

    disconnected() {}

    adopted() {}

    render() {}

    _onRender() {}

    _postRender() {}
  };

  function createConnectedAdvice() {
    return function(connectedCallback) {
      const context = this;
      privates(context).connected = true;
      if (!privates(context).initialized) {
        privates(context).initialized = true;
        connectedCallback.call(context);
        context.render();
      }
    };
  }

  function createRenderAdvice() {
    return function(renderCallback) {
      const context = this;
      if (!privates(context).rendering) {
        const firstRender = privates(context).rendering === undefined;
        privates(context).rendering = true;
        microTask.run(() => {
          if (privates(context).rendering) {
            privates(context).rendering = false;
            context._onRender(firstRender);
            renderCallback.call(context);
            context._postRender(firstRender);
          }
        });
      }
    };
  }

  function createDisconnectedAdvice() {
    return function(disconnectedCallback) {
      const context = this;
      privates(context).connected = false;
      microTask.run(() => {
        if (!privates(context).connected && privates(context).initialized) {
          privates(context).initialized = false;
          disconnectedCallback.call(context);
        }
      });
    };
  }
};
