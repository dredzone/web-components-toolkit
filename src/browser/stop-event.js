/* @flow */
import { browser } from '../environment.js';

export default browser((evt: Event): void => {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  }
  evt.preventDefault();
});
