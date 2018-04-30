/*  */
export default (fn) => !(fn.apply(null, Array.prototype.slice.call(arguments)));
