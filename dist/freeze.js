define(['exports', './checks/type.checks'], function (exports, _type) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.freeze = undefined;
	var getOwnPropertyNames = Object.getOwnPropertyNames,
	    hasOwnProperty = Object.hasOwnProperty,
	    isFrozen = Object.isFrozen;
	var freeze = exports.freeze = function freeze(o) {
		Object.freeze(o);
		getOwnPropertyNames(o).forEach(function (prop) {
			if (hasOwnProperty.call(o, prop) && o[prop] !== null && (_type.typeChecks.object(o[prop]) || _type.typeChecks.function(o[prop])) && !isFrozen(o[prop])) {
				freeze(o[prop]);
			}
		});
		return o;
	};
});