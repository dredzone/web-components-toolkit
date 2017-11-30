define(['exports', '../constants'], function (exports, _constants) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Map = undefined;
	var Map = exports.Map = _constants.global.Map || function () {
		var keys = [];
		var values = [];

		return {
			get: function get(obj) {
				return values[keys.indexOf(obj)];
			},
			set: function set(obj, value) {
				values[keys.push(obj) - 1] = value;
			}
		};
	};
});