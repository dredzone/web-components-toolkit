/*  */
export const isBrowser = () =>
  ![typeof window, typeof document].includes('undefined');

export const forBrowser = (fn, raise = true) => (
  ...args
) => {
  if (isBrowser()) {
    fn(...args);
    return;
  }
  if (raise) {
    throw new Error(`${fn.name} is not running in browser`);
  }
};
