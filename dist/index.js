define(['exports', './number.checks', './type.checks', './objects.helper', './create-storage', './global-scope', './template-content', './mix', './unique-id', './symbols', './advice'], function (exports, _number, _type, _objects, _createStorage, _globalScope, _templateContent, _mix, _uniqueId, _symbols, _advice) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_number).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _number[key];
      }
    });
  });
  Object.keys(_type).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _type[key];
      }
    });
  });
  Object.keys(_objects).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _objects[key];
      }
    });
  });
  Object.keys(_createStorage).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _createStorage[key];
      }
    });
  });
  Object.keys(_globalScope).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _globalScope[key];
      }
    });
  });
  Object.keys(_templateContent).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _templateContent[key];
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
  Object.keys(_uniqueId).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _uniqueId[key];
      }
    });
  });
  Object.keys(_symbols).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _symbols[key];
      }
    });
  });
  Object.keys(_advice).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _advice[key];
      }
    });
  });
});