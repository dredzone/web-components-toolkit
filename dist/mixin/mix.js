define(['exports', './mixin-builder'], function (exports, _mixinBuilder) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.mix = undefined;
  var mix = exports.mix = function mix(superClass) {
    return new _mixinBuilder.MixinBuilder(superClass);
  };
});