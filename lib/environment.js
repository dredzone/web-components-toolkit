/*  */
export const isBrowser = ![typeof window, typeof document].includes('undefined');

export const browser = (fn, raise = true) => (...args) => {
  if (isBrowser) {
    return fn(...args);
  }
  if (raise) {
    throw new Error(`${fn.name} for browser use only`);
  }
};
