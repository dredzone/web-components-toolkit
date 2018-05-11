/*  */
import { browser } from '../environment.js';

export default browser((passThrough) => {
  if (document.readyState === 'loading') {
    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => resolve(passThrough));
    });
  }

  return Promise.resolve(passThrough);
});
