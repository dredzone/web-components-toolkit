define(['exports', './checks.helper', './type.checks'], function (exports, _checks, _type) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.numberChecks = undefined;
	var numberChecks = exports.numberChecks = function () {
		var checks = {};

		checks.nan = isNaN || function (n) {
			return Number(n) !== n;
		};

		// is a given number above minimum parameter?
		checks.above = function (n, min) {
			return _type.typeChecks.all.number(n, min) && n > min;
		};

		// above method does not support 'all' and 'any' interfaces
		checks.above.api = ['not'];

		// is a given number decimal?
		checks.decimal = function (n) {
			return _type.typeChecks.number(n) && n % 1 !== 0;
		};

		// is a given number even?
		checks.even = function (n) {
			return _type.typeChecks.number(n) && n % 2 === 0;
		};

		// is a given number finite?
		checks.finite = isFinite || function (n) {
			return checks.not.infinite(n) && checks.not.nan(n);
		};

		// is a given number infinite?
		checks.infinite = function (n) {
			return n === Infinity || n === -Infinity;
		};

		// is a given number integer?
		checks.integer = function (n) {
			return _type.typeChecks.number(n) && n % 1 === 0;
		};

		// is a given number negative?
		checks.negative = function (n) {
			return _type.typeChecks.number(n) && n < 0;
		};

		// is a given number odd?
		checks.odd = function (n) {
			return _type.typeChecks.number(n) && (n % 2 === 1 || n % 2 === -1);
		};

		// is a given number positive?
		checks.positive = function (n) {
			return _type.typeChecks.number(n) && n > 0;
		};

		// is a given number above maximum parameter?
		checks.under = function (n, max) {
			return _type.typeChecks.all.number(n, max) && n < max;
		};

		// least method does not support 'all' and 'any' interfaces
		checks.under.api = ['not'];

		// is a given number within minimum and maximum parameters?
		checks.within = function (n, min, max) {
			return _type.typeChecks.all.number(n, min, max) && n > min && n < max;
		};

		// within method does not support 'all' and 'any' interfaces
		checks.within.api = ['not'];

		(0, _checks.setApi)(checks);
		return checks;
	}();
});