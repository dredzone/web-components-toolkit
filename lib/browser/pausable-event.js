/*  */
import {browser} from '../environment.js';
import listenEvent, { } from './listen-event.js';


export default browser((
  target,
  type,
  listener,
  capture = false
) => {
  let paused = false;
  let handle = listenEvent(
    target,
    type,
    (...args) => {
      if (!paused) {
        listener(...args);
      }
    },
    capture
  );

  return {
    remove() {
      handle.remove();
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    }
  };
});
