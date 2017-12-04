define(['exports', './deep-merge', './type.checks'], function (exports, _deepMerge, _type) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.setPropertyValue = exports.getPropertyValue = exports.deepFreeze = exports.deepMerge = undefined;
	Object.defineProperty(exports, 'deepMerge', {
		enumerable: true,
		get: function () {
			return _deepMerge.deepMerge;
		}
	});
	var freeze = Object.freeze,
	    getOwnPropertyNames = Object.getOwnPropertyNames,
	    hasOwnProperty = Object.hasOwnProperty,
	    isFrozen = Object.isFrozen;


	/**
  * A helper function for deep freezing of objects
  *
  */
	var deepFreeze = exports.deepFreeze = function deepFreeze(o) {
		freeze(o);
		getOwnPropertyNames(o).forEach(function (prop) {
			if (hasOwnProperty.call(o, prop) && o[prop] !== null && (_type.typeChecks.object(o[prop]) || _type.typeChecks.function(o[prop])) && !isFrozen(o[prop])) {
				deepFreeze(o[prop]);
			}
		});
		return o;
	};

	var getPropertyValue = exports.getPropertyValue = function getPropertyValue(obj, key) {
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
	};

	var setPropertyValue = exports.setPropertyValue = function setPropertyValue(obj, key) {
		var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

		if (key.indexOf('.') === -1) {
			return obj[key] ? obj[key] : defaultValue;
		}
		var parts = key.split('.');
		var length = parts.length;
		var object = obj;

		for (var i = 0; i < length; i++) {
			object = object[parts[i]];
			if (_type.typeChecks.undefined(object)) {
				object = defaultValue;
				return;
			}
		}
		return object;
	};
});