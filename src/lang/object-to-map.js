/* @flow */
const {keys} = Object;

export default (o: Object) => keys(o).reduce((m, k) => m.set(k, o[k]), new Map());
