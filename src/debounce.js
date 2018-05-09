/* @flow */
export default (callback: Function, delay: number): Function => {
  let timer: ?number;
  return function(...args: Array<any>) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      callback(...args);
    }, delay);
  };
};
