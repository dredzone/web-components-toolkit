define(['exports', './number.checks', './type.checks', './freeze', './merge', './create-storage', './global-scope', './template-content', './mix', './unique-id', './symbols'], function (exports, _number, _type, _freeze, _merge, _createStorage, _globalScope, _templateContent, _mix, _uniqueId, _symbols) {
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
});