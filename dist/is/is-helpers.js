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
		var params = Array.prototype.slice.call(_arguments);
		var len = params.length;
		for (var i = 0; i < len; i++) {
			if (fn(params[i])) {
				return false;
			}
		}
		return true;
	};

	var any = exports.any = function any(fn) {
		var params = Array.prototype.slice.call(_arguments);
		var len = params.length;
		for (var i = 0; i < len; i++) {
			if (fn(params[i])) {
				return true;
			}
		}
		return false;
	};

	var setApi = exports.setApi = function setApi(is) {
		Object.keys(is).forEach(function (key) {
			var interfaces = is[key].api || ['not', 'all', 'any'];
			for (var i = 0; i < interfaces.length; i++) {
				if (interfaces[i] === 'not') {
					is.not[key] = not(is[key]);
				}
				if (interfaces[i] === 'all') {
					is.all[key] = all(is[key]);
				}
				if (interfaces[i] === 'any') {
					is.any[key] = any(is[key]);
				}
			}
		});
		return is;
	};
});