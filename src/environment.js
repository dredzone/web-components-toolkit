/* @flow */
export const isBrowser: boolean = ![typeof window, typeof document].includes('undefined');

export const browser: Function = (fn: Function, raise: boolean = true) => (...args: Array<any>): any => {
  if (isBrowser) {
    return fn(...args);
  }
  if (raise) {
    throw new Error(`${fn.name} for browser use only`);
  }
};
