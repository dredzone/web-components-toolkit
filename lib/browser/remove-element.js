/*  */
import { browser } from '../environment.js';

export default browser((element) => {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
});
