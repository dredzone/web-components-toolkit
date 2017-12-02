define(['exports', './merge', './checks/type.checks', './checks/number.checks'], function (exports, _merge, _type, _number) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.checks = undefined;
	var checks = exports.checks = _merge.merge.all([{ type: _type.typeChecks }, { number: _number.numberChecks }]);
});