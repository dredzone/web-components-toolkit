/* @flow */
import { browser } from '../environment.js';
import listenEvent, { type EventHandler } from './listen-event.js';

export type PausableEventHandler = EventHandler & {
  pause(): void,
  resume(): void
};

export default browser(
  (
    target: EventTarget,
    type: string,
    listener: Function,
    capture: boolean = false
  ): PausableEventHandler => {
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
