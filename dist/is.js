define(['exports', './objects/merge', './is/is-type-checks', './is/is-arithmetic-checks', './is/is-dom-checks'], function (exports, _merge, _isTypeChecks, _isArithmeticChecks, _isDomChecks) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.is = undefined;
  var is = exports.is = _merge.merge.all([_isTypeChecks.isTypeChecks, _isArithmeticChecks.isArithmeticChecks, _isDomChecks.isDomChecks]);
});