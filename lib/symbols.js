define(['exports', './unique-id'], function (exports, _uniqueId) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.symbols = undefined;


	/**
  * A helper function for simulating instances of the `Symbol`
  */

	var domain = 'abcdefghijklmnopqrstuvwxyz';
	var idLength = 8;

	var symbols = exports.symbols = Object.freeze({
		setDomain: function setDomain(newDomain) {
			domain = newDomain;
		},
		setLength: function setLength(newLength) {
			idLength = newLength;
		},

		get: function get(description) {
			if (!description) {
				var builder = [];
				var len = domain.length;
				while (builder.length < idLength) {
					builder.push(domain.charAt(Math.floor(Math.random() * len)));
				}
				description = builder.join('');
			}

			return description + '_' + (0, _uniqueId.uniqueId)();
		}
	});
});