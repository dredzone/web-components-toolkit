define(['exports', './constants', './objects.helper'], function (exports, _constants, _objects) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.globalScope = undefined;
	var globalScope = exports.globalScope = Object.freeze({
		get: function get(key) {
			return (0, _objects.getPropertyValue)(_constants.global, key);
		},
		set: function set(key, value) {
			(0, _objects.setPropertyValue)(_constants.global, key, value);
		}
	});
});