define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var checksHelper = exports.checksHelper = Object.freeze({
		not: function not(fn) {
			var _arguments = arguments;

			return function () {
				return !fn.apply(null, Array.prototype.slice.call(_arguments));
			};
		},
		all: function all(fn) {
			var _arguments2 = arguments;

			return function () {
				var params = Array.prototype.slice.call(_arguments2);
				var len = params.length;
				for (var i = 0; i < len; i++) {
					if (fn(params[i])) {
						return false;
					}
				}
				return true;
			};
		},
		any: function any(fn) {
			var _arguments3 = arguments;

			return function () {
				var params = Array.prototype.slice.call(_arguments3);
				var len = params.length;
				for (var i = 0; i < len; i++) {
					if (fn(params[i])) {
						return true;
					}
				}
				return false;
			};
		},
		setApi: function setApi(checker) {
			Object.keys(checker).forEach(function (key) {
				if (typeof checker[key] === 'function') {
					var interfaces = checker[key].api || ['not', 'all', 'any'];
					for (var i = 0; i < interfaces.length; i++) {
						if (interfaces[i] === 'not') {
							checker.not[key] = checksHelper.not(checker[key]);
						}
						if (interfaces[i] === 'all') {
							checker.all[key] = checksHelper.all(checker[key]);
						}
						if (interfaces[i] === 'any') {
							checker.any[key] = checksHelper.any(checker[key]);
						}
					}
				}
			});
		}
	});
});