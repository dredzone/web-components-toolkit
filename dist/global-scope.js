define(['exports', './config'], function (exports, _config) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.globalScope = undefined;
	var globalScope = exports.globalScope = function () {
		var global = document.defaultView;
		return {
			get: function get(key) {
				return _config.config.get(global, key);
			},
			set: function set(key, value) {
				_config.config.set(global, key, value);
			}
		};
	}();
});