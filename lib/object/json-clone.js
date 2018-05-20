/*  */
export default (value, reviver = (k, v) => v) => JSON.parse(JSON.stringify(value), reviver);
