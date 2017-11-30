define(['exports', './helpers', './is-type-checks'], function (exports, _helpers, _isTypeChecks) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isDomChecks = undefined;
	var isDomChecks = exports.isDomChecks = function () {
		var is = {
			not: {},
			any: {}
		};

		is.domElement = function (obj) {
			if ('HTMLElement' in window) {
				return obj instanceof HTMLElement;
			}
			return Boolean(obj && _isTypeChecks.isTypeChecks.object(obj) && obj.nodeType === 1 && obj.nodeName);
		};

		is.domElementTypeOf = function (obj, type) {
			return is.domElement(obj) && obj.nodeName.toLowerCase() === type.toLowerCase();
		};

		return (0, _helpers.setApi)(is);
	}();
});