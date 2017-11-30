define(['exports', './helpers'], function (exports, _helpers) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isTypeChecks = undefined;
	var isTypeChecks = exports.isTypeChecks = function () {
		var is = {
			not: {},
			any: {}
		};
		var toString = Object.prototype.toString;
		var types = 'Array Object String Date RegExp Function Boolean Number Null Undefined'.split(' ');
		var typeCache = {};
		var typeRegexp = /\s([a-zA-Z]+)/;

		var getType = function getType(obj) {
			var type = toString.call(obj);
			if (!typeCache[type]) {
				typeCache[type] = type.match(typeRegexp)[1].toLowerCase();
			}
			return typeCache[type];
		};

		var _loop = function _loop(i) {
			var type = types[i].toLowerCase();
			is[types[i]] = function (obj) {
				return getType(obj) === type;
			};
		};

		for (var i = types.length; i--;) {
			_loop(i);
		}

		return (0, _helpers.setApi)(is);
	}();
});