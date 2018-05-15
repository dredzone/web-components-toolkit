/* @flow */
export const all: Function = (arr: Array<any>, fn: Function = Boolean) => arr.every(fn);

export const any: Function = (arr: Array<any>, fn: Function = Boolean) => arr.some(fn);
