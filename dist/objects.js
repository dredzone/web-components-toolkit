define(['exports', './objects/freeze', './objects/merge', './objects/nested-values'], function (exports, _freeze, _merge, _nestedValues) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_freeze).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _freeze[key];
      }
    });
  });
  Object.keys(_merge).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _merge[key];
      }
    });
  });
  Object.keys(_nestedValues).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _nestedValues[key];
      }
    });
  });
});