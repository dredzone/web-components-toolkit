define(['exports', './mixin/mixin-builder', './mixin/mix', './mixin/decorators'], function (exports, _mixinBuilder, _mix, _decorators) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_mixinBuilder).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mixinBuilder[key];
      }
    });
  });
  Object.keys(_mix).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mix[key];
      }
    });
  });
  Object.keys(_decorators).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _decorators[key];
      }
    });
  });
});