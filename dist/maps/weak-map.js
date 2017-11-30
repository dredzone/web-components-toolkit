define(['exports', '../constants', '../symbols'], function (exports, _constants, _symbols) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.WeakMap = undefined;
	var WeakMap = exports.WeakMap = _constants.global.WeakMap || function () {
		var objectWeakMapId = _symbols.symbols.get('_objectWeakMap');
		return {
			delete: function _delete(obj) {
				delete obj[objectWeakMapId];
			},
			get: function get(obj) {
				return obj[objectWeakMapId];
			},
			has: function has(obj) {
				return Object.hasOwnProperty.call(obj, objectWeakMapId);
			},
			set: function set(obj, value) {
				Object.defineProperty(obj, objectWeakMapId, {
					configurable: true,
					value: value
				});
			}
		};
	};
});