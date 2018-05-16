/* @flow */
export default (o: Object): Map<any, any> =>
  Object.keys(o).reduce((m: Map<any, any>, k: any) => m.set(k, o[k]), new Map());
