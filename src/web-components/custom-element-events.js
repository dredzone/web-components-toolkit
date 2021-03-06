/* @flow */
import after from '../advice/after.js';
import createStorage from '../create-storage.js';
import listenEvent, { type EventHandler } from '../dom-events/listen-event.js';
import type { ICustomElement } from './custom-element.js';

export interface IEvents {
  handleEvent(evt: Event): void;

  on(type: string, listener: Function, capture?: boolean): void;

  dispatch(type: string, data: Object): void;

  off(): void;

  own(...handlers: Array<EventHandler>): void;
}

type InType = HTMLElement & ICustomElement;
type OutType = InType & IEvents;

/**
 * Mixin adds CustomEvent handling to an element
 */
export default (baseClass: Class<InType>): Class<OutType> => {
  const { assign } = Object;
  const privates: Function = createStorage(function() {
    return {
      handlers: []
    };
  });
  const eventDefaultParams: Object = {
    bubbles: false,
    cancelable: false
  };

  return class Events extends baseClass implements IEvents {
    $key: any;
    $value: any;

    static finalizeClass(): void {
      super.finalizeClass();
      after(createDisconnectedAdvice(), 'disconnected')(this);
    }

    handleEvent(event): void {
      const handle: string = `on${event.type}`;
      if (typeof this[handle] === 'function') {
        // $FlowFixMe
        this[handle](event);
      }
    }

    on(type: string, listener: Function, capture?: boolean): void {
      this.own(listenEvent(this, type, listener, capture));
    }

    dispatch(type: string, data: Object = {}): void {
      this.dispatchEvent(new CustomEvent(type, assign(eventDefaultParams, { detail: data })));
    }

    off(): void {
      privates(this).handlers.forEach((handler: EventHandler) => {
        handler.remove();
      });
    }

    own(...handlers: Array<EventHandler>): void {
      handlers.forEach((handler: EventHandler) => {
        privates(this).handlers.push(handler);
      });
    }
  };

  function createDisconnectedAdvice(): Function {
    return function() {
      const context: IEvents = this;
      context.off();
    };
  }
};
