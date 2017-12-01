define(['exports', './is-helpers', './is-type-checks'], function (exports, _isHelpers, _isTypeChecks) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isArithmeticChecks = undefined;
	var isArithmeticChecks = exports.isArithmeticChecks = function () {
		var is = {
			not: {},
			all: {},
			any: {}
		};

		/* eslint-disable no-self-compare */
		is.nan = function (value) {
			return value !== value;
		};
		/* eslint-enable no-self-compare */

		is.numeric = function (value) {
			return is.not.nan(value) && _isTypeChecks.isTypeChecks.number(value);
		};

		// is a given number above minimum parameter?
		is.above = function (n, min) {
			return _isTypeChecks.isTypeChecks.all.number(n, min) && n > min;
		};

		// above method does not support 'all' and 'any' interfaces
		is.above.api = ['not'];

		// is a given number decimal?
		is.decimal = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && n % 1 !== 0;
		};

		// is a given number even?
		is.even = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && n % 2 === 0;
		};

		// is a given number finite?
		is.finite = isFinite || function (n) {
			return is.not.infinite(n) && is.not.nan(n);
		};

		// is a given number infinite?
		is.infinite = function (n) {
			return n === Infinity || n === -Infinity;
		};

		// is a given number integer?
		is.integer = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && n % 1 === 0;
		};

		// is a given number negative?
		is.negative = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && n < 0;
		};

		// is a given number odd?
		is.odd = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && (n % 2 === 1 || n % 2 === -1);
		};

		// is a given number positive?
		is.positive = function (n) {
			return _isTypeChecks.isTypeChecks.number(n) && n > 0;
		};

		// is a given number above maximum parameter?
		is.under = function (n, max) {
			return _isTypeChecks.isTypeChecks.all.number(n, max) && n < max;
		};

		// least method does not support 'all' and 'any' interfaces
		is.under.api = ['not'];

		// is a given number within minimum and maximum parameters?
		is.within = function (n, min, max) {
			return _isTypeChecks.isTypeChecks.all.number(n, min, max) && n > min && n < max;
		};

		// within method does not support 'all' and 'any' interfaces
		is.within.api = ['not'];

		return (0, _isHelpers.setApi)(is);
	}();
});