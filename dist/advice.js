define(["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var before = exports.before = function before(instance, method, advice) {
		var orig = instance[method];
		instance[method] = function () {
			advice.apply(this, arguments);
			return orig.apply(this, arguments);
		}.bind(instance);
	};

	var after = exports.after = function after(instance, method, advice) {
		var orig = instance[method];
		instance[method] = function () {
			var value = void 0;
			var args = Array.prototype.slice.call(arguments, 0);
			try {
				value = orig.apply(this, arguments);
				if (value) {
					args.unshift(value);
				}
				advice.apply(this, args);
				return value;
			} catch (err) {
				value = err;
				args.unshift(value);
				advice.apply(this, args);
				throw err;
			}
		}.bind(instance);
	};

	var around = exports.around = function around(instance, method, advice) {
		var orig = instance[method];
		instance[method] = function () {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(orig);
			return advice.apply(this, args);
		}.bind(instance);
	};

	var afterReturn = exports.afterReturn = function afterReturn(instance, method, advice) {
		var orig = instance[method];
		instance[method] = function () {
			var value = orig.apply(this, arguments);
			var args = Array.prototype.slice.call(arguments, 0);
			if (value) {
				args.unshift(value);
			}
			advice.apply(this, args);
			return value;
		}.bind(instance);
	};

	var afterThrow = exports.afterThrow = function afterThrow(instance, method, advice) {
		var orig = instance[method];
		instance[method] = function () {
			try {
				return orig.apply(this, arguments);
			} catch (err) {
				var args = Array.prototype.slice.call(arguments, 0);
				args.unshift(err);
				advice.apply(this, args);
				throw err;
			}
		}.bind(instance);
	};
});