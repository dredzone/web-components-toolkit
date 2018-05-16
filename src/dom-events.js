/* @flow */
import { browser } from './environment.js';

export type EventHandler = {
  remove(): void
};

export type PausableEventHandler = EventHandler & {
  pause(): void,
  resume(): void
};

export const listenEvent: Function = browser(
  (target: EventTarget, type: string, listener: Function, capture: boolean = false): EventHandler => {
    return parse(target, type, listener, capture);
  }
);

export const listenEventOnce: Function = browser(
  (target: EventTarget, type: string, listener: Function, capture: boolean = false): EventHandler => {
    let handle: EventHandler = listenEvent(
      target,
      type,
      (...args: Array<any>) => {
        handle.remove();
        listener(...args);
      },
      capture
    );
    return handle;
  }
);

export const pausableEvent: Function = browser(
  (target: EventTarget, type: string, listener: Function, capture: boolean = false): PausableEventHandler => {
    let paused: boolean = false;
    let handle: EventHandler = listenEvent(
      target,
      type,
      (...args: Array<any>) => {
        if (!paused) {
          listener(...args);
        }
      },
      capture
    );

    return {
      remove(): void {
        handle.remove();
      },
      pause(): void {
        paused = true;
      },
      resume(): void {
        paused = false;
      }
    };
  }
);

export const stopEvent: Function = browser((evt: Event): void => {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  }
  evt.preventDefault();
});

function addListener(target: HTMLElement, type: string, listener: Function, capture: boolean): EventHandler {
  if (target.addEventListener) {
    target.addEventListener(type, listener, capture);
    return {
      remove: function(): void {
        this.remove = () => {};
        target.removeEventListener(type, listener, capture);
      }
    };
  }
  throw new Error('target must be an event emitter');
}

function parse(target: Object | HTMLElement, type: string, listener: Function, capture: boolean): EventHandler {
  if (type.indexOf(',') > -1) {
    let events = type.split(/\s*,\s*/);
    let handles = events.map(function(type) {
      return addListener(target, type, listener, capture);
    });
    return {
      remove(): void {
        this.remove = () => {};
        let handle;
        while ((handle = handles.pop())) {
          handle.remove();
        }
      }
    };
  }
  return addListener(target, type, listener, capture);
}
