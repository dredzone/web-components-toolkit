define(['exports', './maps/weak-map'], function (exports, _weakMap) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.createStorage = undefined;
	var createStorage = exports.createStorage = function createStorage(creator) {
		var store = new _weakMap.WeakMap();
		if (!creator) {
			creator = Object.create.bind(null, null, {});
		}
		return function (obj) {
			var value = store.get(obj);
			if (!value) {
				store.set(obj, value = creator(obj));
			}
			return value;
		};
	};
});