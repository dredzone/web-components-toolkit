define(['exports', './checks.helper'], function (exports, _checks) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.typeChecks = undefined;
	var typeChecks = exports.typeChecks = function () {
		var checks = {};

		var toString = Object.prototype.toString;
		var types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
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
			checks[type] = function (obj) {
				return getType(obj) === type;
			};
		};

		for (var i = types.length; i--;) {
			_loop(i);
		}

		checks.domNode = function (obj) {
			return Boolean(checks.object(obj) && obj.nodeType > 0);
		};

		(0, _checks.setApi)(checks);
		return checks;
	}();
});