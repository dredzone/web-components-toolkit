define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var getOwnPropertyNames = Object.getOwnPropertyNames,
	    hasOwnProperty = Object.hasOwnProperty,
	    isFrozen = Object.isFrozen;
	var freeze = exports.freeze = function freeze(o) {
		Object.freeze(o);
		getOwnPropertyNames(o).forEach(function (prop) {
			if (hasOwnProperty.call(o, prop) && o[prop] !== null && (_typeof(o[prop]) === 'object' || typeof o[prop] === 'function') && !isFrozen(o[prop])) {
				freeze(o[prop]);
			}
		});
		return o;
	};
});