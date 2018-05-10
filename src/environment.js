/* @flow */
export const isBrowser: Function = () =>
  ![typeof window, typeof document].includes('undefined');
