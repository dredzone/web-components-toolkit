/*  */
import { browser } from '../environment.js';

export default browser((evt) => {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  }
  evt.preventDefault();
});
