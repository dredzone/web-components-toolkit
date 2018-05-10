/* @flow */
export const isBrowser: Function = () =>
  ![typeof window, typeof document].includes('undefined');

export const forBrowser: Function = (fn: Function, raise: boolean = true) => (
  ...args: Array<any>
) => {
  if (isBrowser()) {
    fn(...args);
    return;
  }
  if (raise) {
    throw new Error(`${fn.name} is not running in browser`);
  }
};
