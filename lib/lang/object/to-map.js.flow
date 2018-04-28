/* @flow */
const {keys} = Object;

export default (o: Object): Map<any, any> => keys(o).reduce(
	(m: Map<any, any>, k: any) => m.set(k, o[k]), new Map());
