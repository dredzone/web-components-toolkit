/* @flow */
export const isBrowser: Function = () =>
  ![typeof window, typeof document].includes('undefined');

export const browser: Function = (fn: Function, raise: boolean = true) => (
  ...args: Array<any>
): any => {
  if (isBrowser()) {
    return fn(...args);
  }
  if (raise) {
    throw new Error(`${fn.name} is not running in browser`);
  }
};
