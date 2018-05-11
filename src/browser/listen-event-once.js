/* @flow */
import { browser } from '../environment.js';
import listenEvent, { type EventHandler } from './listen-event.js';

export default browser(
  (
    target: EventTarget,
    type: string,
    listener: Function,
    capture: boolean = false
  ): EventHandler => {
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
