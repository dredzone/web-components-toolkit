/*  */
import { browser } from '../environment.js';
import listenEvent, { } from './listen-event.js';

export default browser(
  (
    target,
    type,
    listener,
    capture = false
  ) => {
    let handle = listenEvent(
      target,
      type,
      (...args) => {
        handle.remove();
        listener(...args);
      },
      capture
    );
    return handle;
  }
);
