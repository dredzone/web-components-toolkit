define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var _arguments = arguments;
	var not = exports.not = function not(fn) {
		return !fn.apply(null, Array.prototype.slice.call(_arguments));
	};

	var all = exports.all = function all(fn) {
		return function () {
			var params = Array.prototype.slice.call(_arguments);
			var len = params.length;
			for (var i = 0; i < len; i++) {
				if (fn(params[i])) {
					return false;
				}
			}
			return true;
		};
	};

	var any = exports.any = function any(fn) {
		return function () {
			var params = Array.prototype.slice.call(_arguments);
			var len = params.length;
			for (var i = 0; i < len; i++) {
				if (fn(params[i])) {
					return true;
				}
			}
			return false;
		};
	};

	var setApi = exports.setApi = function setApi(checker) {
		Object.assign(checker, { not: {}, all: {}, any: {} });
		Object.keys(checker).forEach(function (key) {
			if (typeof checker[key] === 'function') {
				var interfaces = checker[key].api || ['not', 'all', 'any'];
				for (var i = 0; i < interfaces.length; i++) {
					if (interfaces[i] === 'not') {
						checker.not[key] = not(checker[key]);
					}
					if (interfaces[i] === 'all') {
						checker.all[key] = all(checker[key]);
					}
					if (interfaces[i] === 'any') {
						checker.any[key] = any(checker[key]);
					}
				}
			}
		});
	};
});