define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var config = exports.config = Object.freeze({
		get: function get(obj, key) {
			var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			if (key.indexOf('.') === -1) {
				return obj[key] ? obj[key] : defaultValue;
			}
			var parts = key.split('.');
			var length = parts.length;
			var object = obj;

			for (var i = 0; i < length; i++) {
				object = object[parts[i]];
				if (object === undefined) {
					object = defaultValue;
					return;
				}
			}
			return object;
		},
		set: function set(obj, key, val) {
			if (key.indexOf('.') === -1) {
				obj[key] = val;
			}
			var parts = key.split('.');
			var length = parts.length;
			var object = obj;

			for (var i = 0; i < length - 1; i++) {
				if (!object[parts[i]]) {
					object[parts[i]] = {};
				}
				object = object[parts[i]];
			}
			object[parts[length - 1]] = val;
		}
	});
});