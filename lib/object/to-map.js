/*  */
const { keys } = Object;

export default (o) =>
  keys(o).reduce((m, k) => m.set(k, o[k]), new Map());
