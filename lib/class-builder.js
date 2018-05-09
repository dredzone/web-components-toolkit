/*  */
import createMixin from './class-builder/mixin.js';

const { freeze } = Object;


export default (klass = class {}) =>
  freeze({
    with(...mixins) {
      return mixins
        .map((mixin) => createMixin(mixin))
        .reduce((k, m) => m(k), klass);
    }
  });
