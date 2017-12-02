define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	/**
  * Allows you to extend a class with one or more mixin classes.
  *
  * This builder is heavily inspired by Justin Fagnani's Mixwith.js
  *
  * @see http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
  * @see https://github.com/justinfagnani/mixwith.js
  *
  */
	var mix = exports.mix = function mix() {
		var baseClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
			function _class() {
				_classCallCheck(this, _class);
			}

			return _class;
		}();

		return Object.freeze({
			/**
    * Applies `mixins` in order to the baseClass given to `mix()`.
    *
    * @param {Array.<Function>} mixins
    * @return {Class} a subclass of `baseClass` with `mixins` applied
    */
			with: function _with() {
				for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
					mixins[_key] = arguments[_key];
				}

				return mixins.reduce(function (c, m) {
					if (typeof m !== 'function') {
						return c;
					}
					return m(c);
				}, baseClass);
			}
		});
	};
});