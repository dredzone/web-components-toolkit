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

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var MixinBuilder = exports.MixinBuilder = function () {
		function MixinBuilder(superClass) {
			_classCallCheck(this, MixinBuilder);

			this.superClass = superClass || function () {
				function _class() {
					_classCallCheck(this, _class);
				}

				return _class;
			}();
		}

		/**
   * Applies `mixins` in order to the superclass given to `mix()`.
   *
   * @param {Array.<Function>} mixins
   * @return {Function} a subclass of `superclass` with `mixins` applied
   */


		_createClass(MixinBuilder, [{
			key: 'with',
			value: function _with() {
				for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
					mixins[_key] = arguments[_key];
				}

				return mixins.reduce(function (c, m) {
					if (typeof m !== 'function') {
						return c;
					}
					return m(c);
				}, this.superClass);
			}
		}]);

		return MixinBuilder;
	}();
});