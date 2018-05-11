/* @flow */
import { browser } from '../environment.js';

export default browser((element: Node): void => {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
});
