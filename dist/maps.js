define(['exports', './maps/map', './maps/weak-map'], function (exports, _map, _weakMap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_map).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _map[key];
      }
    });
  });
  Object.keys(_weakMap).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _weakMap[key];
      }
    });
  });
});