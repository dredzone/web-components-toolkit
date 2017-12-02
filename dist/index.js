define(['exports', './checks', './freeze', './merge', './config', './create-storage', './global-scope', './html-template-content', './mix', './unique-id', './symbols'], function (exports, _checks, _freeze, _merge, _config, _createStorage, _globalScope, _htmlTemplateContent, _mix, _uniqueId, _symbols) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_checks).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _checks[key];
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
  Object.keys(_config).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _config[key];
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
  Object.keys(_htmlTemplateContent).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _htmlTemplateContent[key];
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