/* @flow */
import { browser } from '../environment.js';

export default browser((passThrough: any): Promise<any> => {
  if (document.readyState === 'loading') {
    return new Promise((resolve: Function) => {
      document.addEventListener('DOMContentLoaded', () => resolve(passThrough));
    });
  }

  return Promise.resolve(passThrough);
});
