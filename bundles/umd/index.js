(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('babel-runtime/core-js/object/set-prototype-of'), require('babel-runtime/core-js/object/get-prototype-of'), require('babel-runtime/core-js/map'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/core-js/object/freeze'), require('babel-runtime/core-js/weak-map'), require('babel-runtime/core-js/object/create'), require('babel-runtime/core-js/object/define-property'), require('babel-runtime/core-js/promise'), require('babel-runtime/helpers/createClass'), require('babel-runtime/helpers/possibleConstructorReturn'), require('babel-runtime/helpers/inherits'), require('babel-runtime/helpers/get'), require('babel-runtime/core-js/object/assign'), require('babel-runtime/core-js/json/stringify'), require('babel-runtime/helpers/typeof'), require('babel-runtime/core-js/object/keys')) :
	typeof define === 'function' && define.amd ? define(['exports', 'babel-runtime/core-js/object/set-prototype-of', 'babel-runtime/core-js/object/get-prototype-of', 'babel-runtime/core-js/map', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/core-js/object/freeze', 'babel-runtime/core-js/weak-map', 'babel-runtime/core-js/object/create', 'babel-runtime/core-js/object/define-property', 'babel-runtime/core-js/promise', 'babel-runtime/helpers/createClass', 'babel-runtime/helpers/possibleConstructorReturn', 'babel-runtime/helpers/inherits', 'babel-runtime/helpers/get', 'babel-runtime/core-js/object/assign', 'babel-runtime/core-js/json/stringify', 'babel-runtime/helpers/typeof', 'babel-runtime/core-js/object/keys'], factory) :
	(factory((global.Voya = {}),global._Object$setPrototypeOf,global._Object$getPrototypeOf,global._Map,global._classCallCheck,global._Object$freeze,global._WeakMap,global._Object$create,global._Object$defineProperty,global._Promise,global._createClass,global._possibleConstructorReturn,global._inherits,global._get,global._Object$assign,global._JSON$stringify,global._typeof,global._Object$keys));
}(this, (function (exports,_Object$setPrototypeOf,_Object$getPrototypeOf,_Map,_classCallCheck,_Object$freeze,_WeakMap,_Object$create,_Object$defineProperty,_Promise,_createClass,_possibleConstructorReturn,_inherits,_get,_Object$assign,_JSON$stringify,_typeof,_Object$keys) { 'use strict';

	_Object$setPrototypeOf = _Object$setPrototypeOf && _Object$setPrototypeOf.hasOwnProperty('default') ? _Object$setPrototypeOf['default'] : _Object$setPrototypeOf;
	_Object$getPrototypeOf = _Object$getPrototypeOf && _Object$getPrototypeOf.hasOwnProperty('default') ? _Object$getPrototypeOf['default'] : _Object$getPrototypeOf;
	_Map = _Map && _Map.hasOwnProperty('default') ? _Map['default'] : _Map;
	_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
	_Object$freeze = _Object$freeze && _Object$freeze.hasOwnProperty('default') ? _Object$freeze['default'] : _Object$freeze;
	_WeakMap = _WeakMap && _WeakMap.hasOwnProperty('default') ? _WeakMap['default'] : _WeakMap;
	_Object$create = _Object$create && _Object$create.hasOwnProperty('default') ? _Object$create['default'] : _Object$create;
	_Object$defineProperty = _Object$defineProperty && _Object$defineProperty.hasOwnProperty('default') ? _Object$defineProperty['default'] : _Object$defineProperty;
	_Promise = _Promise && _Promise.hasOwnProperty('default') ? _Promise['default'] : _Promise;
	_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
	_possibleConstructorReturn = _possibleConstructorReturn && _possibleConstructorReturn.hasOwnProperty('default') ? _possibleConstructorReturn['default'] : _possibleConstructorReturn;
	_inherits = _inherits && _inherits.hasOwnProperty('default') ? _inherits['default'] : _inherits;
	_get = _get && _get.hasOwnProperty('default') ? _get['default'] : _get;
	_Object$assign = _Object$assign && _Object$assign.hasOwnProperty('default') ? _Object$assign['default'] : _Object$assign;
	_JSON$stringify = _JSON$stringify && _JSON$stringify.hasOwnProperty('default') ? _JSON$stringify['default'] : _JSON$stringify;
	_typeof = _typeof && _typeof.hasOwnProperty('default') ? _typeof['default'] : _typeof;
	_Object$keys = _Object$keys && _Object$keys.hasOwnProperty('default') ? _Object$keys['default'] : _Object$keys;

	/*  */

	var prevTimeId = 0;
	var prevUniqueId = 0;

	var uniqueId = (function (prefix) {
		var newUniqueId = Date.now();
		if (newUniqueId === prevTimeId) {
			++prevUniqueId;
		} else {
			prevTimeId = newUniqueId;
			prevUniqueId = 0;
		}

		var uniqueId = "" + String(newUniqueId) + String(prevUniqueId);
		if (prefix) {
			uniqueId = prefix + "_" + uniqueId;
		}
		return uniqueId;
	});

	/*  */

	// used by wrap() and unwrap()
	var wrappedMixinKey = uniqueId('_wrappedMixin');

	// used by apply() and isApplicationOf()
	var appliedMixinKey = uniqueId('_appliedMixin');

	/*  */

	/**
	 * Unwraps the function `wrapper` to return the original function wrapped by
	 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
	 * function.
	 *
	 * @function
	 * @param {Function} wrapper A wrapped mixin produced by {@link wrap}
	 * @return {Function} The originally wrapped mixin
	 */
	var unwrap = (function (wrapper) {
	  return wrapper[wrappedMixinKey] || wrapper;
	});

	/*  */

	/**
	 * Applies `mixin` to `superclass`.
	 *
	 * `apply` stores a reference from the mixin application to the unwrapped mixin
	 * to make `isApplicationOf` and `hasMixin` work.
	 *
	 * This function is usefull for mixin wrappers that want to automatically enable
	 * {@link hasMixin} support.
	 *
	 * @function
	 * @param {Function} superClass A class or constructor function
	 * @param {Function} mixin The mixin to apply
	 * @return {Function} A subclass of `superclass` produced by `mixin`
	 */
	var apply = (function (superClass, mixin) {
	  var application = mixin(superClass);
	  var proto = application.prototype;
	  proto[appliedMixinKey] = unwrap(mixin);
	  return application;
	});

	var setPrototypeOf = _Object$setPrototypeOf;

	/**
	 * Sets up the function `mixin` to be wrapped by the function `wrapper`, while
	 * allowing properties on `mixin` to be available via `wrapper`, and allowing
	 * `wrapper` to be unwrapped to get to the original function.
	 *
	 * `wrap` does two things:
	 *   1. Sets the prototype of `mixin` to `wrapper` so that properties set on
	 *      `mixin` inherited by `wrapper`.
	 *   2. Sets a special property on `mixin` that points back to `mixin` so that
	 *      it can be retreived from `wrapper`
	 *
	 * @function
	 * @param {Function} mixin A mixin function
	 * @param {Function} wrapper A function that wraps {@link mixin}
	 * @return {Function} `wrapper`
	 */

	var wrap = (function (mixin, wrapper) {
	  setPrototypeOf(wrapper, mixin);
	  if (!mixin[wrappedMixinKey]) {
	    mixin[wrappedMixinKey] = mixin;
	  }
	  return wrapper;
	});

	/*  */

	/**
	 * A basic mixin decorator that applies the mixin with {@link applyMixin} so that it
	 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
	 * mixin decorator functions.
	 *
	 * @function
	 * @param {Function} mixin The mixin to wrap
	 * @return {Function} a new mixin function
	 */
	var declare = (function (mixin) {
	  return wrap(mixin, function (superClass) {
	    return apply(superClass, mixin);
	  });
	});

	/*  */

	var hasOwnProperty = Object.hasOwnProperty;

	/**
	 * Returns `true` iff `proto` is a prototype created by the application of
	 * `mixin` to a superclass.
	 *
	 * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
	 * as created by `apply`.
	 *
	 * @function
	 * @param {Object} proto A prototype object created by {@link apply}.
	 * @param {Function} mixin A mixin function used with {@link apply}.
	 * @return {boolean} whether `proto` is a prototype created by the application of
	 * `mixin` to a superclass
	 */

	var isApplicationOf = (function (proto, mixin) {
	  return hasOwnProperty.call(proto, appliedMixinKey) && proto[appliedMixinKey] === unwrap(mixin);
	});

	var getPrototypeOf = _Object$getPrototypeOf;

	/**
	 * Returns `true` iff `o` has an application of `mixin` on its prototype
	 * chain.
	 *
	 * @function
	 * @param {Object} o An object
	 * @param {Function} mixin A mixin applied with {@link apply}
	 * @return {boolean} whether `o` has an application of `mixin` on its prototype
	 * chain
	 */

	var has = (function (o, mixin) {
	  while (o !== null) {
	    if (isApplicationOf(o, mixin)) {
	      return true;
	    }
	    o = getPrototypeOf(o);
	  }
	  return false;
	});

	/*  */

	/**
	 * Decorates `mixin` so that it only applies if it's not already on the
	 * prototype chain.
	 *
	 * @function
	 * @param {Function} mixin The mixin to wrap with deduplication behavior
	 * @return {Function} a new mixin function
	 */
	var dedupe = (function (mixin) {
	  return wrap(mixin, function (superClass) {
	    return has(superClass.prototype, mixin) ? superClass : mixin(superClass);
	  });
	});

	var cachedApplicationKey = uniqueId('_cachedApplication');

	/**
	 * Decorate the given mixin class with a "cached decorator".
	 *
	 * Method will ensure that if the given mixin has already been applied,
	 * then it will be returned / applied a single time, rather than multiple
	 * times.
	 *
	 * @param {Function} mixin
	 *
	 * @return {Function}
	 */
	var cache = (function (mixin) {
		return wrap(mixin, function (superClass) {
			var cachedApplication = superClass[cachedApplicationKey];
			if (!cachedApplication) {
				cachedApplication = superClass[cachedApplicationKey] = new _Map();
			}

			// $FlowFixMe
			var application = cachedApplication.get(mixin);
			if (!application) {
				application = mixin(superClass);
				cachedApplication.set(mixin, application);
			}
			return application;
		});
	});

	/*  */

	var createMixin = (function (mixin) {
	  return dedupe(cache(declare(mixin)));
	});

	var freeze = _Object$freeze;


	var classBuilder = (function () {
		var klass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
			function _class() {
				_classCallCheck(this, _class);
			}

			return _class;
		}();
		return freeze({
			with: function _with() {
				for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
					mixins[_key] = arguments[_key];
				}

				return mixins.map(function (mixin) {
					return createMixin(mixin);
				}).reduce(function (k, m) {
					return m(k);
				}, klass);
			}
		});
	});

	/*  */
	var createStorage = (function () {
		var creator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Object$create.bind(null, null, {});

		var store = new _WeakMap();
		return function (obj) {
			var value = store.get(obj);
			if (!value) {
				store.set(obj, value = creator(obj));
			}
			return value;
		};
	});

	/*  */
	var before = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = _Object$defineProperty;

			var _loop = function _loop(i) {
				var methodName = methodNames[i];
				var method = proto[methodName];
				defineProperty(proto, methodName, {
					value: function value() {
						for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
							args[_key2] = arguments[_key2];
						}

						behaviour.apply(this, args);
						return method.apply(this, args);
					},
					writable: true
				});
			};

			for (var i = 0; i < len; i++) {
				_loop(i);
			}
			return klass;
		};
	});

	/*  */
	var around = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = _Object$defineProperty;

			var _loop = function _loop(i) {
				var methodName = methodNames[i];
				var method = proto[methodName];
				defineProperty(proto, methodName, {
					value: function value() {
						for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
							args[_key2] = arguments[_key2];
						}

						args.unshift(method);
						behaviour.apply(this, args);
					},
					writable: true
				});
			};

			for (var i = 0; i < len; i++) {
				_loop(i);
			}
			return klass;
		};
	});

	/*  */
	var after = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = _Object$defineProperty;

			var _loop = function _loop(i) {
				var methodName = methodNames[i];
				var method = proto[methodName];
				defineProperty(proto, methodName, {
					value: function value() {
						for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
							args[_key2] = arguments[_key2];
						}

						var returnValue = method.apply(this, args);
						behaviour.apply(this, args);
						return returnValue;
					},
					writable: true
				});
			};

			for (var i = 0; i < len; i++) {
				_loop(i);
			}
			return klass;
		};
	});

	/*  */
	var afterThrow = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = _Object$defineProperty;

			var _loop = function _loop(i) {
				var methodName = methodNames[i];
				var method = proto[methodName];
				defineProperty(proto, methodName, {
					value: function value() {
						try {
							for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
								args[_key2] = arguments[_key2];
							}

							return method.apply(this, args);
						} catch (err) {
							behaviour.call(this, err);
						}
					},
					writable: true
				});
			};

			for (var i = 0; i < len; i++) {
				_loop(i);
			}
			return klass;
		};
	});

	/*  */

	/*  */
	var documentReady = (function (passThrough) {
		if (document.readyState === 'loading') {
			return new _Promise(function (resolve) {
				document.addEventListener('DOMContentLoaded', function () {
					return resolve(passThrough);
				});
			});
		}

		return _Promise.resolve(passThrough);
	});

	/*  */
	var createElement = (function (tagName, attributes) {
		var element = document.createElement(tagName);
		for (var attr in attributes) {
			if (Object.hasOwnProperty.call(attributes, attr)) {
				element.setAttribute(attr, attributes[attr]);
			}
		}
		return element;
	});

	/*  */
	var elementSiblings = (function (element) {
		var siblings = [];
		if (element.parentNode && element.parentNode.firstChild) {
			var sibling = element.parentNode.firstChild;
			do {
				if (sibling.nodeType === 1 && sibling !== element) {
					siblings.push(sibling);
				}
			} while (sibling.nextSibling && sibling.nextSibling !== null && (sibling = sibling.nextSibling));
		}

		return siblings;
	});

	/*  */
	var removeElement = (function (element) {
		if (element.parentElement) {
			element.parentElement.removeChild(element);
		}
	});

	/*  */
	var isDescendantElement = (function (child, parent) {
		/* eslint-disable no-empty */
		while (child.parentNode && (child = child.parentNode) && child !== parent) {}
		/* eslint-disable no-empty */
		return Boolean(child);
	});

	/*  */
	var elementChildren = (function (element) {
		var nodeType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

		var childNodes = element.childNodes;
		var children = [];
		if (childNodes && childNodes.length > 0) {
			var i = childNodes.length;
			while (i--) {
				if (childNodes[i].nodeType === nodeType) {
					children.unshift(childNodes[i]);
				}
			}
		}
		return children;
	});

	/*  */
	var templateContent = (function (template) {
		if ('content' in document.createElement('template')) {
			return document.importNode(template.content, true);
		}

		var fragment = document.createDocumentFragment();
		var children = template.childNodes;
		for (var i = 0; i < children.length; i++) {
			fragment.appendChild(children[i].cloneNode(true));
		}
		return fragment;
	});

	/*  */

	var microTaskCurrHandle = 0;
	var microTaskLastHandle = 0;
	var microTaskCallbacks = [];
	var microTaskNodeContent = 0;
	var microTaskNode = document.createTextNode('');
	new MutationObserver(microTaskFlush).observe(microTaskNode, { characterData: true });

	/**
	 * Based on Polymer.async
	 */
	var microTask = {
		/**
	  * Enqueues a function called at microTask timing.
	  *
	  * @param {Function} callback Callback to run
	  * @return {number} Handle used for canceling task
	  */
		run: function run(callback) {
			microTaskNode.textContent = String(microTaskNodeContent++);
			microTaskCallbacks.push(callback);
			return microTaskCurrHandle++;
		},


		/**
	  * Cancels a previously enqueued `microTask` callback.
	  *
	  * @param {number} handle Handle returned from `run` of callback to cancel
	  */
		cancel: function cancel(handle) {
			var idx = handle - microTaskLastHandle;
			if (idx >= 0) {
				if (!microTaskCallbacks[idx]) {
					throw new Error('invalid async handle: ' + handle);
				}
				microTaskCallbacks[idx] = null;
			}
		}
	};

	function microTaskFlush() {
		var len = microTaskCallbacks.length;
		for (var i = 0; i < len; i++) {
			var cb = microTaskCallbacks[i];
			if (cb && typeof cb === 'function') {
				try {
					cb();
				} catch (err) {
					setTimeout(function () {
						throw err;
					});
				}
			}
		}
		microTaskCallbacks.splice(0, len);
		microTaskLastHandle += len;
	}

	/*  */

	var listenEvent = (function (target, type, listener) {
		var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		return parse(target, type, listener, capture);
	});

	function addListener(target, type, listener, capture) {
		if (target.addEventListener) {
			target.addEventListener(type, listener, capture);
			return {
				remove: function remove() {
					this.remove = function () {};
					target.removeEventListener(type, listener, capture);
				}
			};
		}
		throw new Error('target must be an event emitter');
	}

	function parse(target, type, listener, capture) {
		if (type.indexOf(',') > -1) {
			var events = type.split(/\s*,\s*/);
			var handles = events.map(function (type) {
				return addListener(target, type, listener, capture);
			});
			return {
				remove: function remove() {
					this.remove = function () {};
					var handle = void 0;
					while (handle = handles.pop()) {
						handle.remove();
					}
				}
			};
		}
		return addListener(target, type, listener, capture);
	}

	/*  */

	var listenEventOnce = (function (target, type, listener) {
		var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var handle = listenEvent(target, type, function () {
			handle.remove();
			listener.apply(undefined, arguments);
		}, capture);
		return handle;
	});

	/*  */

	var pausableEvent = (function (target, type, listener) {
		var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var paused = false;
		var handle = listenEvent(target, type, function () {
			if (!paused) {
				listener.apply(undefined, arguments);
			}
		}, capture);

		return {
			remove: function remove() {
				handle.remove();
			},
			pause: function pause() {
				paused = true;
			},
			resume: function resume() {
				paused = false;
			}
		};
	});

	/*  */
	var stopEvent = (function (evt) {
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
		evt.preventDefault();
	});

	/*  */

	var global = document.defaultView;

	// https://github.com/google/traceur-compiler/issues/1709
	if (typeof global.HTMLElement !== 'function') {
		var _HTMLElement = function HTMLElement() {// eslint-disable-line func-names

		};
		_HTMLElement.prototype = global.HTMLElement.prototype;
		global.HTMLElement = _HTMLElement;
	}

	var customElement = (function (baseClass) {
		var customElementsV1Callbacks = ['connectedCallback', 'disconnectedCallback', 'adoptedCallback', 'attributeChangedCallback'];
		var defineProperty = _Object$defineProperty,
		    hasOwnProperty = Object.hasOwnProperty;

		var privates = createStorage();

		if (!baseClass) {
			baseClass = function (_global$HTMLElement) {
				_inherits(baseClass, _global$HTMLElement);

				function baseClass() {
					_classCallCheck(this, baseClass);

					return _possibleConstructorReturn(this, (baseClass.__proto__ || _Object$getPrototypeOf(baseClass)).apply(this, arguments));
				}

				return baseClass;
			}(global.HTMLElement);
		}

		return function (_baseClass) {
			_inherits(CustomElement, _baseClass);

			_createClass(CustomElement, null, [{
				key: 'finalizeClass',
				value: function finalizeClass() {}
			}, {
				key: 'define',
				value: function define(tagName) {
					var registry = customElements;
					if (!registry.get(tagName)) {
						var proto = this.prototype;
						customElementsV1Callbacks.forEach(function (callbackMethodName) {
							if (!hasOwnProperty.call(proto, callbackMethodName)) {
								defineProperty(proto, callbackMethodName, {
									value: function value() {},

									configurable: true
								});
							}
							var newCallbackName = callbackMethodName.substring(0, callbackMethodName.length - 'callback'.length);
							var originalMethod = proto[callbackMethodName];
							defineProperty(proto, callbackMethodName, {
								value: function value() {
									for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
										args[_key] = arguments[_key];
									}

									this[newCallbackName].apply(this, args);
									originalMethod.apply(this, args);
								},
								configurable: true
							});
						});

						this.finalizeClass();
						around(createConnectedAdvice(), 'connected')(this);
						around(createDisconnectedAdvice(), 'disconnected')(this);
						around(createRenderAdvice(), 'render')(this);
						registry.define(tagName, this);
					}
				}
			}, {
				key: 'observedAttributes',
				get: function get() {
					return [];
				}
			}]);

			function CustomElement() {
				var _ref;

				_classCallCheck(this, CustomElement);

				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				var _this2 = _possibleConstructorReturn(this, (_ref = CustomElement.__proto__ || _Object$getPrototypeOf(CustomElement)).call.apply(_ref, [this].concat(args)));

				_this2.construct();
				return _this2;
			}

			_createClass(CustomElement, [{
				key: 'construct',
				value: function construct() {}
			}, {
				key: 'isConnected',
				value: function isConnected() {
					return privates(this).initialized === true;
				}

				/* eslint-disable no-unused-vars */

			}, {
				key: 'attributeChanged',
				value: function attributeChanged(attributeName, oldValue, newValue) {}
				/* eslint-enable no-unused-vars */

			}, {
				key: 'connected',
				value: function connected() {}
			}, {
				key: 'disconnected',
				value: function disconnected() {}
			}, {
				key: 'adopted',
				value: function adopted() {}
			}, {
				key: 'render',
				value: function render() {}
			}, {
				key: '_onRender',
				value: function _onRender() {}
			}, {
				key: '_postRender',
				value: function _postRender() {}
			}]);

			return CustomElement;
		}(baseClass);

		function createConnectedAdvice() {
			return function (connectedCallback) {
				var context = this;
				privates(context).connected = true;
				if (!privates(context).initialized) {
					privates(context).initialized = true;
					connectedCallback.call(context);
					context.render();
				}
			};
		}

		function createRenderAdvice() {
			return function (renderCallback) {
				var context = this;
				if (!privates(context).rendering) {
					var firstRender = privates(context).rendering === undefined;
					privates(context).rendering = true;
					microTask.run(function () {
						if (privates(context).rendering) {
							privates(context).rendering = false;
							context._onRender(firstRender);
							renderCallback.call(context);
							context._postRender(firstRender);
						}
					});
				}
			};
		}

		function createDisconnectedAdvice() {
			return function (disconnectedCallback) {
				var context = this;
				privates(context).connected = false;
				microTask.run(function () {
					if (!privates(context).connected && privates(context).initialized) {
						privates(context).initialized = false;
						disconnectedCallback.call(context);
					}
				});
			};
		}
	});

	var stateMixin = (function (baseClass) {
		var assign = _Object$assign;

		var privates = createStorage();

		return function (_baseClass) {
			_inherits(State, _baseClass);

			function State() {
				_classCallCheck(this, State);

				return _possibleConstructorReturn(this, (State.__proto__ || _Object$getPrototypeOf(State)).apply(this, arguments));
			}

			_createClass(State, [{
				key: 'construct',
				value: function construct() {
					_get(State.prototype.__proto__ || _Object$getPrototypeOf(State.prototype), 'construct', this).call(this);
					this.setState(this.defaultState);
				}
			}, {
				key: 'shouldComponentUpdate',
				value: function shouldComponentUpdate(nextState) {
					for (var key in nextState) {
						if (nextState[key] !== privates(this).state[key]) {
							return true;
						}
					}
					return false;
				}
			}, {
				key: 'setState',
				value: function setState(changes) {
					var nextState = assign({}, privates(this).state, changes);
					var previousState = privates(this).state;
					var changed = previousState === undefined || this.shouldComponentUpdate(nextState);

					if (changed) {
						privates(this).state = nextState;
						if (this.isConnected()) {
							this.render();
						}
					}
				}
			}, {
				key: 'componentWillRender',
				value: function componentWillRender(newState) {// eslint-disable-line no-unused-vars

				}
			}, {
				key: 'componentDidRender',
				value: function componentDidRender(previousState) {// eslint-disable-line no-unused-vars

				}
			}, {
				key: 'componentWillUpdate',
				value: function componentWillUpdate(newState, previousState) {// eslint-disable-line no-unused-vars

				}
			}, {
				key: 'componentDidUpdate',
				value: function componentDidUpdate(previousState) {// eslint-disable-line no-unused-vars

				}
			}, {
				key: 'defaultState',
				get: function get() {
					return {};
				}
			}, {
				key: 'state',
				get: function get() {
					return assign({}, privates(this).state);
				}
			}], [{
				key: 'finalizeClass',
				value: function finalizeClass() {
					_get(State.__proto__ || _Object$getPrototypeOf(State), 'finalizeClass', this).call(this);
					after(createBeforeRenderAdvice(), '_onRender')(this);
					after(createAfterRenderAdvice(), '_postRender')(this);
				}
			}]);

			return State;
		}(baseClass);

		function createBeforeRenderAdvice() {
			return function (firstRender) {
				var context = this;
				if (firstRender) {
					context.componentWillRender(this.state);
				} else {
					context.componentWillUpdate(this.state, assign({}, privates(context).renderedState));
				}
			};
		}

		function createAfterRenderAdvice() {
			return function (firstRender) {
				var context = this;
				var previousState = privates(context).renderedState;
				privates(context).renderedState = privates(context).state;
				if (firstRender) {
					context.componentDidRender(previousState);
				} else {
					context.componentDidUpdate(previousState);
				}
			};
		}
	});

	var slotsMixin = (function (baseClass) {
		return function (_baseClass) {
			_inherits(Slots, _baseClass);

			function Slots() {
				_classCallCheck(this, Slots);

				return _possibleConstructorReturn(this, (Slots.__proto__ || _Object$getPrototypeOf(Slots)).apply(this, arguments));
			}

			_createClass(Slots, [{
				key: 'construct',
				value: function construct() {
					_get(Slots.prototype.__proto__ || _Object$getPrototypeOf(Slots.prototype), 'construct', this).call(this);
					this.slots = { default: [] };
				}
			}, {
				key: 'slotsAssigned',
				value: function slotsAssigned() {}
			}], [{
				key: 'finalizeClass',
				value: function finalizeClass() {
					_get(Slots.__proto__ || _Object$getPrototypeOf(Slots), 'finalizeClass', this).call(this);
					before(createBeforeRenderAdvice(), '_onRender')(this);
				}
			}]);

			return Slots;
		}(baseClass);

		function createBeforeRenderAdvice() {
			var hypenRegEx = /-([a-z])/g;

			return function (firstRender) {
				var context = this;
				if (firstRender) {
					var children = elementChildren(context);
					children.forEach(function (child) {
						var attribute = child.getAttribute ? child.getAttribute('slot') : null;
						if (typeof attribute === 'string' && attribute.length > 0) {
							var slot = attribute.replace(hypenRegEx, function (match) {
								return match[1].toUpperCase();
							});
							context.slots[slot] = child;
						} else {
							context.slots.default.push(child);
						}
					});
					context.slotsAssigned();
				}
			};
		}
	});

	/**
	 * Mixin adds CustomEvent handling to an element
	 */
	var events = (function (baseClass) {
		var assign = _Object$assign;

		var privates = createStorage(function () {
			return {
				handlers: []
			};
		});
		var eventDefaultParams = {
			bubbles: false,
			cancelable: false
		};

		return function (_baseClass) {
			_inherits(Events, _baseClass);

			function Events() {
				_classCallCheck(this, Events);

				return _possibleConstructorReturn(this, (Events.__proto__ || _Object$getPrototypeOf(Events)).apply(this, arguments));
			}

			_createClass(Events, [{
				key: 'handleEvent',
				value: function handleEvent(event) {
					var handle = 'on' + event.type;
					if (typeof this[handle] === 'function') {
						// $FlowFixMe
						this[handle](event);
					}
				}
			}, {
				key: 'on',
				value: function on(type, listener, capture) {
					this.own(listenEvent(this, type, listener, capture));
				}
			}, {
				key: 'dispatch',
				value: function dispatch(type) {
					var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

					this.dispatchEvent(new CustomEvent(type, assign(eventDefaultParams, { detail: data })));
				}
			}, {
				key: 'off',
				value: function off() {
					privates(this).handlers.forEach(function (handler) {
						handler.remove();
					});
				}
			}, {
				key: 'own',
				value: function own() {
					var _this2 = this;

					for (var _len = arguments.length, handlers = Array(_len), _key = 0; _key < _len; _key++) {
						handlers[_key] = arguments[_key];
					}

					handlers.forEach(function (handler) {
						privates(_this2).handlers.push(handler);
					});
				}
			}], [{
				key: 'finalizeClass',
				value: function finalizeClass() {
					_get(Events.__proto__ || _Object$getPrototypeOf(Events), 'finalizeClass', this).call(this);
					after(createDisconnectedAdvice(), 'disconnected')(this);
				}
			}]);

			return Events;
		}(baseClass);

		function createDisconnectedAdvice() {
			return function () {
				var context = this;
				context.off();
			};
		}
	});

	var properties = (function (baseClass) {
		var defineProperty = _Object$defineProperty,
		    keys = _Object$keys,
		    assign = _Object$assign;

		var attributeToPropertyNames = {};
		var propertyNamesToAttributes = {};
		var privates = createStorage();

		var propertiesConfig = void 0;
		var dataHasAccessor = {};
		var dataProtoValues = {};

		function enhancePropertyConfig(config) {
			config.hasObserver = 'observer' in config;
			config.isObserverString = config.hasObserver && typeof config.observer === 'string';
			config.isString = config.type === String;
			config.isNumber = config.type === Number;
			config.isBoolean = config.type === Boolean;
			config.isObject = config.type === Object;
			config.isArray = config.type === Array;
			config.isDate = config.type === Date;
			config.notify = 'notify' in config;
			config.readOnly = 'readOnly' in config ? config.readOnly : false;
			config.reflectToAttribute = 'reflectToAttribute' in config ? config.reflectToAttribute : config.isString || config.isNumber || config.isBoolean;
		}

		function normalizeProperties(properties) {
			var output = {};
			for (var name in properties) {
				if (!Object.hasOwnProperty.call(properties, name)) {
					continue;
				}
				var property = properties[name];
				output[name] = typeof property === 'function' ? { type: property } : property;
				enhancePropertyConfig(output[name]);
			}
			return output;
		}

		function createConnectedAdvice() {
			return function () {
				var context = this;
				if (_Object$keys(privates(context).initializeProperties).length > 0) {
					assign(context, privates(context).initializeProperties);
					privates(context).initializeProperties = {};
				}
				context._flushProperties();
			};
		}

		function createAttributeChangeAdvice() {
			return function (attribute, oldValue, newValue) {
				var context = this;
				if (oldValue !== newValue) {
					context._attributeToProperty(attribute, newValue);
				}
			};
		}

		function createPropertiesChangedAdvice() {
			return function (currentProps, changedProps, oldProps) {
				var _this = this;

				var context = this;
				_Object$keys(changedProps).forEach(function (property) {
					var _context$constructor$ = context.constructor.classProperties[property],
					    notify = _context$constructor$.notify,
					    hasObserver = _context$constructor$.hasObserver,
					    reflectToAttribute = _context$constructor$.reflectToAttribute,
					    isObserverString = _context$constructor$.isObserverString,
					    observer = _context$constructor$.observer;

					if (reflectToAttribute) {
						context._propertyToAttribute(property, changedProps[property]);
					}
					if (hasObserver && isObserverString) {
						_this[observer](changedProps[property], oldProps[property]);
					} else if (hasObserver && typeof observer === 'function') {
						observer.apply(context, [changedProps[property], oldProps[property]]);
					}
					if (notify) {
						context.dispatchEvent(new CustomEvent(property + '-changed', {
							detail: {
								newValue: changedProps[property],
								oldValue: oldProps[property]
							}
						}));
					}
				});
			};
		}

		return function (_baseClass) {
			_inherits(Properties, _baseClass);

			function Properties() {
				_classCallCheck(this, Properties);

				return _possibleConstructorReturn(this, (Properties.__proto__ || _Object$getPrototypeOf(Properties)).apply(this, arguments));
			}

			_createClass(Properties, [{
				key: 'construct',
				value: function construct() {
					_get(Properties.prototype.__proto__ || _Object$getPrototypeOf(Properties.prototype), 'construct', this).call(this);
					privates(this).data = {};
					privates(this).serializing = false;
					privates(this).initializeProperties = {};
					privates(this).dataPending = null;
					privates(this).dataOld = null;
					privates(this).dataInvalid = false;
					this._initializeProtoProperties();
					this._initializeProperties();
				}
			}, {
				key: 'propertiesChanged',
				value: function propertiesChanged(currentProps, changedProps, oldProps) {// eslint-disable-line no-unused-vars

				}
			}, {
				key: '_createPropertyAccessor',
				value: function _createPropertyAccessor(property, readOnly) {
					if (!dataHasAccessor[property]) {
						dataHasAccessor[property] = true;
						defineProperty(this, property, {
							enumerable: true,
							configurable: true,
							get: function get() {
								return this._getProperty(property);
							},

							set: readOnly ? function () {} : function (newValue) {
								this._setProperty(property, newValue);
							}
						});
					}
				}
			}, {
				key: '_getProperty',
				value: function _getProperty(property) {
					return privates(this).data[property];
				}
			}, {
				key: '_setProperty',
				value: function _setProperty(property, newValue) {
					if (this._isValidPropertyValue(property, newValue)) {
						if (this._setPendingProperty(property, newValue)) {
							this._invalidateProperties();
						}
					} else {
						console.log('invalid value ' + newValue + ' for property ' + property + ' of \n\t\t\t\t\ttype ' + this.constructor.classProperties[property].type.name);
					}
				}
			}, {
				key: '_initializeProtoProperties',
				value: function _initializeProtoProperties() {
					var _this3 = this;

					_Object$keys(dataProtoValues).forEach(function (property) {
						var value = typeof dataProtoValues[property] === 'function' ? dataProtoValues[property].call(_this3) : dataProtoValues[property];
						_this3._setProperty(property, value);
					});
				}
			}, {
				key: '_initializeProperties',
				value: function _initializeProperties() {
					var _this4 = this;

					_Object$keys(dataHasAccessor).forEach(function (property) {
						if (Object.hasOwnProperty.call(_this4, property)) {
							privates(_this4).initializeProperties[property] = _this4[property];
							delete _this4[property];
						}
					});
				}
			}, {
				key: '_attributeToProperty',
				value: function _attributeToProperty(attribute, value) {
					if (!privates(this).serializing) {
						var property = this.constructor.attributeToPropertyName(attribute);
						this[property] = this._deserializeValue(property, value);
					}
				}
			}, {
				key: '_isValidPropertyValue',
				value: function _isValidPropertyValue(property, value) {
					var propertyType = this.constructor.classProperties[property].type;
					var isValid = false;
					if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
						isValid = value instanceof propertyType;
					} else {
						isValid = '' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === propertyType.name.toLowerCase();
					}
					return isValid;
				}
			}, {
				key: '_propertyToAttribute',
				value: function _propertyToAttribute(property, value) {
					privates(this).serializing = true;
					var attribute = this.constructor.propertyNameToAttribute(property);
					value = this._serializeValue(property, value);
					if (value === undefined) {
						this.removeAttribute(attribute);
					} else if (this.getAttribute(attribute) !== value) {
						this.setAttribute(attribute, value);
					}
					privates(this).serializing = false;
				}
			}, {
				key: '_deserializeValue',
				value: function _deserializeValue(property, value) {
					var _constructor$classPro = this.constructor.classProperties[property],
					    isNumber = _constructor$classPro.isNumber,
					    isArray = _constructor$classPro.isArray,
					    isBoolean = _constructor$classPro.isBoolean,
					    isDate = _constructor$classPro.isDate,
					    isString = _constructor$classPro.isString,
					    isObject = _constructor$classPro.isObject;

					if (isBoolean) {
						value = value !== null && value !== undefined;
					} else if (isNumber) {
						value = value === null || value === undefined ? 0 : Number(value);
					} else if (isString) {
						value = value === null || value === undefined ? '' : String(value);
					} else if (isObject || isArray) {
						value = value === null || value === undefined ? isArray ? null : {} : JSON.parse(value);
					} else if (isDate) {
						value = value === null || value === undefined ? '' : new Date(value);
					}
					return value;
				}
			}, {
				key: '_serializeValue',
				value: function _serializeValue(property, value) {
					var propertyConfig = this.constructor.classProperties[property];
					var isBoolean = propertyConfig.isBoolean,
					    isObject = propertyConfig.isObject,
					    isArray = propertyConfig.isArray;


					if (isBoolean) {
						return value ? '' : undefined;
					}
					if (isObject || isArray) {
						return _JSON$stringify(value);
					}

					value = value ? value.toString() : undefined;
					return value;
				}
			}, {
				key: '_setPendingProperty',
				value: function _setPendingProperty(property, value) {
					var old = privates(this).data[property];
					var changed = this._shouldPropertyChange(property, value, old);
					if (changed) {
						if (!privates(this).dataPending) {
							privates(this).dataPending = {};
							privates(this).dataOld = {};
						}
						// Ensure old is captured from the last turn
						if (privates(this).dataOld && !(property in privates(this).dataOld)) {
							privates(this).dataOld[property] = old;
						}
						privates(this).data[property] = value;
						privates(this).dataPending[property] = value;
					}
					return changed;
				}
			}, {
				key: '_invalidateProperties',
				value: function _invalidateProperties() {
					var _this5 = this;

					if (!privates(this).dataInvalid) {
						privates(this).dataInvalid = true;
						microTask.run(function () {
							if (privates(_this5).dataInvalid) {
								privates(_this5).dataInvalid = false;
								_this5._flushProperties();
							}
						});
					}
				}
			}, {
				key: '_flushProperties',
				value: function _flushProperties() {
					var props = privates(this).data;
					var changedProps = privates(this).dataPending;
					var old = privates(this).dataOld;

					if (this._shouldPropertiesChange(props, changedProps, old)) {
						privates(this).dataPending = null;
						privates(this).dataOld = null;
						this.propertiesChanged(props, changedProps, old);
					}
				}
			}, {
				key: '_shouldPropertiesChange',
				value: function _shouldPropertiesChange(currentProps, changedProps, oldProps) {
					// eslint-disable-line no-unused-vars
					return Boolean(changedProps);
				}
			}, {
				key: '_shouldPropertyChange',
				value: function _shouldPropertyChange(property, value, old) {
					return (
						// Strict equality check
						old !== value && (
						// This ensures (old==NaN, value==NaN) always returns false
						old === old || value === value)
					);
				}
			}], [{
				key: 'finalizeClass',
				value: function finalizeClass() {
					_get(Properties.__proto__ || _Object$getPrototypeOf(Properties), 'finalizeClass', this).call(this);
					before(createConnectedAdvice(), 'connected')(this);
					before(createAttributeChangeAdvice(), 'attributeChanged')(this);
					before(createPropertiesChangedAdvice(), 'propertiesChanged')(this);
					this.createProperties();
				}
			}, {
				key: 'attributeToPropertyName',
				value: function attributeToPropertyName(attribute) {
					var property = attributeToPropertyNames[attribute];
					if (!property) {
						// Convert and memoize.
						var hypenRegEx = /-([a-z])/g;
						property = attribute.replace(hypenRegEx, function (match) {
							return match[1].toUpperCase();
						});
						attributeToPropertyNames[attribute] = property;
					}
					return property;
				}
			}, {
				key: 'propertyNameToAttribute',
				value: function propertyNameToAttribute(property) {
					var attribute = propertyNamesToAttributes[property];
					if (!attribute) {
						// Convert and memoize.
						var uppercaseRegEx = /([A-Z])/g;
						attribute = property.replace(uppercaseRegEx, '-$1').toLowerCase();
						propertyNamesToAttributes[property] = attribute;
					}
					return attribute;
				}
			}, {
				key: 'createProperties',
				value: function createProperties() {
					var proto = this.prototype;
					var properties = this.classProperties;
					keys(properties).forEach(function (property) {
						if (Object.hasOwnProperty.call(proto, property)) {
							throw new Error('Unable to setup property \'' + property + '\', property already exists');
						}
						var propertyValue = properties[property].value;
						if (propertyValue !== undefined) {
							dataProtoValues[property] = propertyValue;
						}
						proto._createPropertyAccessor(property, properties[property].readOnly);
					});
				}
			}, {
				key: 'observedAttributes',
				get: function get() {
					var _this6 = this;

					return _Object$keys(this.classProperties).map(function (property) {
						return _this6.propertyNameToAttribute(property);
					}) || [];
				}
			}, {
				key: 'classProperties',
				get: function get() {
					if (!propertiesConfig) {
						var getPropertiesConfig = function getPropertiesConfig() {
							return propertiesConfig || {};
						};
						var checkObj = null;
						var loop = true;

						while (loop) {
							checkObj = _Object$getPrototypeOf(checkObj === null ? this : checkObj);
							if (!checkObj || !checkObj.constructor || checkObj.constructor === HTMLElement || checkObj.constructor === Function || checkObj.constructor === Object || checkObj.constructor === checkObj.constructor.constructor) {
								loop = false;
							}
							if (Object.hasOwnProperty.call(checkObj, 'properties')) {
								// $FlowFixMe
								propertiesConfig = assign(getPropertiesConfig(), normalizeProperties(checkObj.properties));
							}
						}
						if (this.properties) {
							// $FlowFixMe
							propertiesConfig = assign(getPropertiesConfig(), normalizeProperties(this.properties));
						}
					}
					return propertiesConfig;
				}
			}]);

			return Properties;
		}(baseClass);
	});

	var componentMixin = (function () {
		var baseClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : customElement();

		return function (_classBuilder$with) {
			_inherits(Component, _classBuilder$with);

			function Component() {
				_classCallCheck(this, Component);

				return _possibleConstructorReturn(this, (Component.__proto__ || _Object$getPrototypeOf(Component)).apply(this, arguments));
			}

			_createClass(Component, [{
				key: 'propertiesChanged',
				value: function propertiesChanged(currentProps, changedProps, oldProps) {
					// eslint-disable-line no-unused-vars
					if (this.isConnected()) {
						this.render();
					}
				}
			}]);

			return Component;
		}(classBuilder(baseClass).with(events, properties));
	});

	/*  */

	/*  */
	var dget = (function (obj, key) {
		var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

		if (key.indexOf('.') === -1) {
			return obj[key] ? obj[key] : defaultValue;
		}
		var parts = key.split('.');
		var length = parts.length;
		var object = obj;

		for (var i = 0; i < length; i++) {
			object = object[parts[i]];
			if (typeof object === 'undefined') {
				object = defaultValue;
				return;
			}
		}
		return object;
	});

	/*  */
	var dset = (function (obj, key, value) {
		if (key.indexOf('.') === -1) {
			obj[key] = value;
			return;
		}
		var parts = key.split('.');
		var depth = parts.length - 1;
		var object = obj;

		for (var i = 0; i < depth; i++) {
			if (typeof object[parts[i]] === 'undefined') {
				object[parts[i]] = {};
			}
			object = object[parts[i]];
		}
		object[parts[depth]] = value;
	});

	/*  */
	var keys = _Object$keys;


	var toMap = (function (o) {
		return keys(o).reduce(function (m, k) {
			return m.set(k, o[k]);
		}, new _Map());
	});

	/*  */

	/*  */

	exports.classBuilder = classBuilder;
	exports.createStorage = createStorage;
	exports.before = before;
	exports.around = around;
	exports.after = after;
	exports.afterThrow = afterThrow;
	exports.documentReady = documentReady;
	exports.createElement = createElement;
	exports.elementSiblings = elementSiblings;
	exports.removeElement = removeElement;
	exports.isDescendantElement = isDescendantElement;
	exports.elementChildren = elementChildren;
	exports.templateContent = templateContent;
	exports.microTask = microTask;
	exports.listenEvent = listenEvent;
	exports.listenEventOnce = listenEventOnce;
	exports.pausableEvent = pausableEvent;
	exports.stopEvent = stopEvent;
	exports.customElement = customElement;
	exports.state = stateMixin;
	exports.slots = slotsMixin;
	exports.events = events;
	exports.properties = properties;
	exports.component = componentMixin;
	exports.dget = dget;
	exports.dset = dset;
	exports.toMap = toMap;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9jb21tb25zLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvdW53cmFwLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvYXBwbHkuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci93cmFwLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvZGVjbGFyZS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL2lzLWFwcGxpY2F0aW9uLW9mLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvaGFzLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvZGVkdXBlLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvY2FjaGUuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9taXhpbi5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyLmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9iZWZvcmUuanMiLCIuLi8uLi9saWIvYWR2aWNlL2Fyb3VuZC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLXRocm93LmpzIiwiLi4vLi4vbGliL2FkdmljZS5qcyIsIi4uLy4uL2xpYi9kb20vZG9jdW1lbnQtcmVhZHkuanMiLCIuLi8uLi9saWIvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2RvbS9lbGVtZW50LXNpYmxpbmdzLmpzIiwiLi4vLi4vbGliL2RvbS9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9kb20vaXMtZGVzY2VuZGFudC1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2RvbS9lbGVtZW50LWNoaWxkcmVuLmpzIiwiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi9kb20vbGlzdGVuLWV2ZW50LW9uY2UuanMiLCIuLi8uLi9saWIvZG9tL3BhdXNhYmxlLWV2ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9zdG9wLWV2ZW50LmpzIiwiLi4vLi4vbGliL2RvbS5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9zdGF0ZS1taXhpbi5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9zbG90cy1taXhpbi5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jb21wb25lbnQtbWl4aW4uanMiLCIuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMuanMiLCIuLi8uLi9saWIvb2JqZWN0L2RnZXQuanMiLCIuLi8uLi9saWIvb2JqZWN0L2RzZXQuanMiLCIuLi8uLi9saWIvb2JqZWN0L3RvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5cbmxldCBwcmV2VGltZUlkID0gMDtcbmxldCBwcmV2VW5pcXVlSWQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCAocHJlZml4KSA9PiB7XG5cdGxldCBuZXdVbmlxdWVJZCA9IERhdGUubm93KCk7XG5cdGlmIChuZXdVbmlxdWVJZCA9PT0gcHJldlRpbWVJZCkge1xuXHRcdCsrcHJldlVuaXF1ZUlkO1xuXHR9IGVsc2Uge1xuXHRcdHByZXZUaW1lSWQgPSBuZXdVbmlxdWVJZDtcblx0XHRwcmV2VW5pcXVlSWQgPSAwO1xuXHR9XG5cblx0bGV0IHVuaXF1ZUlkID0gYCR7U3RyaW5nKG5ld1VuaXF1ZUlkKX0ke1N0cmluZyhwcmV2VW5pcXVlSWQpfWA7XG5cdGlmIChwcmVmaXgpIHtcblx0XHR1bmlxdWVJZCA9IGAke3ByZWZpeH1fJHt1bmlxdWVJZH1gO1xuXHR9XG5cdHJldHVybiB1bmlxdWVJZDtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuLi91bmlxdWUtaWQuanMnO1xuXG4vLyB1c2VkIGJ5IHdyYXAoKSBhbmQgdW53cmFwKClcbmV4cG9ydCBjb25zdCB3cmFwcGVkTWl4aW5LZXkgPSB1bmlxdWVJZCgnX3dyYXBwZWRNaXhpbicpO1xuXG4vLyB1c2VkIGJ5IGFwcGx5KCkgYW5kIGlzQXBwbGljYXRpb25PZigpXG5leHBvcnQgY29uc3QgYXBwbGllZE1peGluS2V5ID0gdW5pcXVlSWQoJ19hcHBsaWVkTWl4aW4nKTtcbiIsIi8qICAqL1xuaW1wb3J0IHt3cmFwcGVkTWl4aW5LZXl9IGZyb20gJy4vY29tbW9ucy5qcyc7XG5cbi8qKlxuICogVW53cmFwcyB0aGUgZnVuY3Rpb24gYHdyYXBwZXJgIHRvIHJldHVybiB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd3JhcHBlZCBieVxuICogb25lIG9yIG1vcmUgY2FsbHMgdG8gYHdyYXBgLiBSZXR1cm5zIGB3cmFwcGVyYCBpZiBpdCdzIG5vdCBhIHdyYXBwZWRcbiAqIGZ1bmN0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBBIHdyYXBwZWQgbWl4aW4gcHJvZHVjZWQgYnkge0BsaW5rIHdyYXB9XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIG9yaWdpbmFsbHkgd3JhcHBlZCBtaXhpblxuICovXG5leHBvcnQgZGVmYXVsdCAod3JhcHBlcikgPT4gd3JhcHBlclt3cmFwcGVkTWl4aW5LZXldIHx8IHdyYXBwZXI7XG4iLCIvKiAgKi9cbmltcG9ydCB7YXBwbGllZE1peGluS2V5fSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbi8qKlxuICogQXBwbGllcyBgbWl4aW5gIHRvIGBzdXBlcmNsYXNzYC5cbiAqXG4gKiBgYXBwbHlgIHN0b3JlcyBhIHJlZmVyZW5jZSBmcm9tIHRoZSBtaXhpbiBhcHBsaWNhdGlvbiB0byB0aGUgdW53cmFwcGVkIG1peGluXG4gKiB0byBtYWtlIGBpc0FwcGxpY2F0aW9uT2ZgIGFuZCBgaGFzTWl4aW5gIHdvcmsuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VmdWxsIGZvciBtaXhpbiB3cmFwcGVycyB0aGF0IHdhbnQgdG8gYXV0b21hdGljYWxseSBlbmFibGVcbiAqIHtAbGluayBoYXNNaXhpbn0gc3VwcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN1cGVyQ2xhc3MgQSBjbGFzcyBvciBjb25zdHJ1Y3RvciBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIGFwcGx5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBzdWJjbGFzcyBvZiBgc3VwZXJjbGFzc2AgcHJvZHVjZWQgYnkgYG1peGluYFxuICovXG5leHBvcnQgZGVmYXVsdCAoc3VwZXJDbGFzcywgbWl4aW4pID0+IHtcblx0bGV0IGFwcGxpY2F0aW9uID0gbWl4aW4oc3VwZXJDbGFzcyk7XG5cdGNvbnN0IHByb3RvID0gYXBwbGljYXRpb24ucHJvdG90eXBlO1xuXHRwcm90b1thcHBsaWVkTWl4aW5LZXldID0gdW53cmFwKG1peGluKTtcblx0cmV0dXJuIGFwcGxpY2F0aW9uO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHt3cmFwcGVkTWl4aW5LZXl9IGZyb20gJy4vY29tbW9ucy5qcyc7XG5cbmNvbnN0IHtzZXRQcm90b3R5cGVPZn0gPSBPYmplY3Q7XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgZnVuY3Rpb24gYG1peGluYCB0byBiZSB3cmFwcGVkIGJ5IHRoZSBmdW5jdGlvbiBgd3JhcHBlcmAsIHdoaWxlXG4gKiBhbGxvd2luZyBwcm9wZXJ0aWVzIG9uIGBtaXhpbmAgdG8gYmUgYXZhaWxhYmxlIHZpYSBgd3JhcHBlcmAsIGFuZCBhbGxvd2luZ1xuICogYHdyYXBwZXJgIHRvIGJlIHVud3JhcHBlZCB0byBnZXQgdG8gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICpcbiAqIGB3cmFwYCBkb2VzIHR3byB0aGluZ3M6XG4gKiAgIDEuIFNldHMgdGhlIHByb3RvdHlwZSBvZiBgbWl4aW5gIHRvIGB3cmFwcGVyYCBzbyB0aGF0IHByb3BlcnRpZXMgc2V0IG9uXG4gKiAgICAgIGBtaXhpbmAgaW5oZXJpdGVkIGJ5IGB3cmFwcGVyYC5cbiAqICAgMi4gU2V0cyBhIHNwZWNpYWwgcHJvcGVydHkgb24gYG1peGluYCB0aGF0IHBvaW50cyBiYWNrIHRvIGBtaXhpbmAgc28gdGhhdFxuICogICAgICBpdCBjYW4gYmUgcmV0cmVpdmVkIGZyb20gYHdyYXBwZXJgXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBBIG1peGluIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB3cmFwcGVyIEEgZnVuY3Rpb24gdGhhdCB3cmFwcyB7QGxpbmsgbWl4aW59XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYHdyYXBwZXJgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChtaXhpbiwgd3JhcHBlcikgPT4ge1xuXHRzZXRQcm90b3R5cGVPZih3cmFwcGVyLCBtaXhpbik7XG5cdGlmICghbWl4aW5bd3JhcHBlZE1peGluS2V5XSkge1xuXHRcdG1peGluW3dyYXBwZWRNaXhpbktleV0gPSBtaXhpbjtcblx0fVxuXHRyZXR1cm4gd3JhcHBlcjtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBhcHBseSBmcm9tICcuL2FwcGx5LmpzJztcbmltcG9ydCB3cmFwIGZyb20gJy4vd3JhcC5qcyc7XG5cbi8qKlxuICogQSBiYXNpYyBtaXhpbiBkZWNvcmF0b3IgdGhhdCBhcHBsaWVzIHRoZSBtaXhpbiB3aXRoIHtAbGluayBhcHBseU1peGlufSBzbyB0aGF0IGl0XG4gKiBjYW4gYmUgdXNlZCB3aXRoIHtAbGluayBpc0FwcGxpY2F0aW9uT2Z9LCB7QGxpbmsgaGFzTWl4aW59IGFuZCB0aGUgb3RoZXJcbiAqIG1peGluIGRlY29yYXRvciBmdW5jdGlvbnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBUaGUgbWl4aW4gdG8gd3JhcFxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IG1peGluIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChtaXhpbikgPT5cblx0d3JhcChtaXhpbiwgKHN1cGVyQ2xhc3MpID0+IGFwcGx5KHN1cGVyQ2xhc3MsIG1peGluKSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7YXBwbGllZE1peGluS2V5fSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbmNvbnN0IHtoYXNPd25Qcm9wZXJ0eX0gPSBPYmplY3Q7XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWZmIGBwcm90b2AgaXMgYSBwcm90b3R5cGUgY3JlYXRlZCBieSB0aGUgYXBwbGljYXRpb24gb2ZcbiAqIGBtaXhpbmAgdG8gYSBzdXBlcmNsYXNzLlxuICpcbiAqIGBpc0FwcGxpY2F0aW9uT2ZgIHdvcmtzIGJ5IGNoZWNraW5nIHRoYXQgYHByb3RvYCBoYXMgYSByZWZlcmVuY2UgdG8gYG1peGluYFxuICogYXMgY3JlYXRlZCBieSBgYXBwbHlgLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvIEEgcHJvdG90eXBlIG9iamVjdCBjcmVhdGVkIGJ5IHtAbGluayBhcHBseX0uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBBIG1peGluIGZ1bmN0aW9uIHVzZWQgd2l0aCB7QGxpbmsgYXBwbHl9LlxuICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciBgcHJvdG9gIGlzIGEgcHJvdG90eXBlIGNyZWF0ZWQgYnkgdGhlIGFwcGxpY2F0aW9uIG9mXG4gKiBgbWl4aW5gIHRvIGEgc3VwZXJjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCAocHJvdG8sIG1peGluKSA9PiB7XG5cdHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBhcHBsaWVkTWl4aW5LZXkpICYmIHByb3RvW2FwcGxpZWRNaXhpbktleV0gPT09IHVud3JhcChtaXhpbik7XG59O1xuIiwiLyogICovXG5pbXBvcnQgaXNBcHBsaWNhdGlvbk9mIGZyb20gJy4vaXMtYXBwbGljYXRpb24tb2YuanMnO1xuXG5jb25zdCB7Z2V0UHJvdG90eXBlT2Z9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmZiBgb2AgaGFzIGFuIGFwcGxpY2F0aW9uIG9mIGBtaXhpbmAgb24gaXRzIHByb3RvdHlwZVxuICogY2hhaW4uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gbyBBbiBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1peGluIEEgbWl4aW4gYXBwbGllZCB3aXRoIHtAbGluayBhcHBseX1cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgYG9gIGhhcyBhbiBhcHBsaWNhdGlvbiBvZiBgbWl4aW5gIG9uIGl0cyBwcm90b3R5cGVcbiAqIGNoYWluXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChvLCBtaXhpbikgPT4ge1xuXHR3aGlsZSAobyAhPT0gbnVsbCkge1xuXHRcdGlmIChpc0FwcGxpY2F0aW9uT2YobywgbWl4aW4pKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0byA9IGdldFByb3RvdHlwZU9mKG8pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBoYXMgZnJvbSAnLi9oYXMuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYG1peGluYCBzbyB0aGF0IGl0IG9ubHkgYXBwbGllcyBpZiBpdCdzIG5vdCBhbHJlYWR5IG9uIHRoZVxuICogcHJvdG90eXBlIGNoYWluLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIHdyYXAgd2l0aCBkZWR1cGxpY2F0aW9uIGJlaGF2aW9yXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBuZXcgbWl4aW4gZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG5cdHJldHVybiB3cmFwKG1peGluLCAoc3VwZXJDbGFzcykgPT5cblx0XHQoaGFzKHN1cGVyQ2xhc3MucHJvdG90eXBlLCBtaXhpbikpID8gc3VwZXJDbGFzcyA6IG1peGluKHN1cGVyQ2xhc3MpKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuLi91bmlxdWUtaWQuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuY29uc3QgY2FjaGVkQXBwbGljYXRpb25LZXkgPSB1bmlxdWVJZCgnX2NhY2hlZEFwcGxpY2F0aW9uJyk7XG5cbi8qKlxuICogRGVjb3JhdGUgdGhlIGdpdmVuIG1peGluIGNsYXNzIHdpdGggYSBcImNhY2hlZCBkZWNvcmF0b3JcIi5cbiAqXG4gKiBNZXRob2Qgd2lsbCBlbnN1cmUgdGhhdCBpZiB0aGUgZ2l2ZW4gbWl4aW4gaGFzIGFscmVhZHkgYmVlbiBhcHBsaWVkLFxuICogdGhlbiBpdCB3aWxsIGJlIHJldHVybmVkIC8gYXBwbGllZCBhIHNpbmdsZSB0aW1lLCByYXRoZXIgdGhhbiBtdWx0aXBsZVxuICogdGltZXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG5cdHJldHVybiB3cmFwKG1peGluLCAoc3VwZXJDbGFzcykgPT4ge1xuXHRcdGxldCBjYWNoZWRBcHBsaWNhdGlvbiA9IHN1cGVyQ2xhc3NbY2FjaGVkQXBwbGljYXRpb25LZXldO1xuXHRcdGlmICghY2FjaGVkQXBwbGljYXRpb24pIHtcblx0XHRcdGNhY2hlZEFwcGxpY2F0aW9uID0gc3VwZXJDbGFzc1tjYWNoZWRBcHBsaWNhdGlvbktleV0gPSBuZXcgTWFwKCk7XG5cdFx0fVxuXG5cdFx0Ly8gJEZsb3dGaXhNZVxuXHRcdGxldCBhcHBsaWNhdGlvbiA9IGNhY2hlZEFwcGxpY2F0aW9uLmdldChtaXhpbik7XG5cdFx0aWYgKCFhcHBsaWNhdGlvbikge1xuXHRcdFx0YXBwbGljYXRpb24gPSBtaXhpbihzdXBlckNsYXNzKTtcblx0XHRcdGNhY2hlZEFwcGxpY2F0aW9uLnNldChtaXhpbiwgYXBwbGljYXRpb24pO1xuXHRcdH1cblx0XHRyZXR1cm4gYXBwbGljYXRpb247XG5cdH0pO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGRlY2xhcmUgZnJvbSAnLi9kZWNsYXJlLmpzJztcbmltcG9ydCBkZWR1cGUgZnJvbSAnLi9kZWR1cGUuanMnO1xuaW1wb3J0IGNhY2hlIGZyb20gJy4vY2FjaGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+IGRlZHVwZShjYWNoZShkZWNsYXJlKG1peGluKSkpO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlTWl4aW4gZnJvbSAnLi9jbGFzcy1idWlsZGVyL21peGluLmpzJztcblxuY29uc3Qge2ZyZWV6ZX0gPSBPYmplY3Q7XG5cblxuZXhwb3J0IGRlZmF1bHQgKGtsYXNzID0gY2xhc3Mge30pID0+IGZyZWV6ZSh7XG5cdHdpdGgoLi4ubWl4aW5zKSB7XG5cdFx0cmV0dXJuIG1peGluc1xuXHRcdFx0Lm1hcCgobWl4aW4pID0+IGNyZWF0ZU1peGluKG1peGluKSlcblx0XHRcdC5yZWR1Y2UoKGssIG0pID0+IG0oayksIGtsYXNzKTtcblx0fVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KSkgPT4ge1xuXHRsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuXHRyZXR1cm4gKG9iaikgPT4ge1xuXHRcdGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuXHRcdGlmICghdmFsdWUpIHtcblx0XHRcdHN0b3JlLnNldChvYmosIHZhbHVlID0gY3JlYXRvcihvYmopKTtcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGtsYXNzO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YXJncy51bnNoaWZ0KG1ldGhvZCk7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBrbGFzcztcblx0fTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG5cdHJldHVybiBmdW5jdGlvbiAoa2xhc3MpIHtcblx0XHRjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcblx0XHRjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG5cdFx0Y29uc3Qge2RlZmluZVByb3BlcnR5fSA9IE9iamVjdDtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG5cdFx0XHRjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcblx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoLi4uYXJncykge1xuXHRcdFx0XHRcdGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdFx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGtsYXNzO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRiZWhhdmlvdXIuY2FsbCh0aGlzLCBlcnIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0d3JpdGFibGU6IHRydWVcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4ga2xhc3M7XG5cdH07XG59O1xuIiwiLyogICovXG5leHBvcnQge2RlZmF1bHQgYXMgYmVmb3JlfSBmcm9tICcuL2FkdmljZS9iZWZvcmUuanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGFyb3VuZH0gZnJvbSAnLi9hZHZpY2UvYXJvdW5kLmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBhZnRlcn0gZnJvbSAnLi9hZHZpY2UvYWZ0ZXIuanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGFmdGVyVGhyb3d9IGZyb20gJy4vYWR2aWNlL2FmdGVyLXRocm93LmpzJztcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHBhc3NUaHJvdWdoKSA9PiB7XG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiByZXNvbHZlKHBhc3NUaHJvdWdoKSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBhc3NUaHJvdWdoKTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0ICh0YWdOYW1lLCBhdHRyaWJ1dGVzKSA9PiB7XG5cdGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcblx0Zm9yIChsZXQgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGF0dHJpYnV0ZXMsIGF0dHIpKSB7XG5cdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyLCBhdHRyaWJ1dGVzW2F0dHJdKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGVsZW1lbnQ7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCkgPT4ge1xuXHRsZXQgc2libGluZ3MgPSBbXTtcblx0aWYgKGVsZW1lbnQucGFyZW50Tm9kZSAmJiBlbGVtZW50LnBhcmVudE5vZGUuZmlyc3RDaGlsZCkge1xuXHRcdGxldCBzaWJsaW5nID0gZWxlbWVudC5wYXJlbnROb2RlLmZpcnN0Q2hpbGQ7XG5cdFx0ZG8ge1xuXHRcdFx0aWYgKHNpYmxpbmcubm9kZVR5cGUgPT09IDEgJiYgc2libGluZyAhPT0gZWxlbWVudCkge1xuXHRcdFx0XHRzaWJsaW5ncy5wdXNoKHNpYmxpbmcpO1xuXHRcdFx0fVxuXHRcdH0gd2hpbGUgKHNpYmxpbmcubmV4dFNpYmxpbmcgJiYgc2libGluZy5uZXh0U2libGluZyAhPT0gbnVsbCAmJiAoc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmcpKTtcblx0fVxuXG5cdHJldHVybiBzaWJsaW5ncztcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50KSA9PiB7XG5cdGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcblx0XHRlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cdH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjaGlsZCwgcGFyZW50KSA9PiB7XG5cdC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG5cdHdoaWxlIChjaGlsZC5wYXJlbnROb2RlICYmIChjaGlsZCA9IGNoaWxkLnBhcmVudE5vZGUpICYmIGNoaWxkICE9PSBwYXJlbnQpIHtcblxuXHR9XG5cdC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG5cdHJldHVybiBCb29sZWFuKGNoaWxkKTtcbn07XG5cbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIG5vZGVUeXBlID0gMSkgPT4ge1xuXHRsZXQgY2hpbGROb2RlcyA9IGVsZW1lbnQuY2hpbGROb2Rlcztcblx0bGV0IGNoaWxkcmVuID0gW107XG5cdGlmIChjaGlsZE5vZGVzICYmIGNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuXHRcdGxldCBpID0gY2hpbGROb2Rlcy5sZW5ndGg7XG5cdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0aWYgKGNoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT09IG5vZGVUeXBlKSB7XG5cdFx0XHRcdGNoaWxkcmVuLnVuc2hpZnQoY2hpbGROb2Rlc1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjaGlsZHJlbjtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0ICh0ZW1wbGF0ZSkgPT4ge1xuXHRpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblx0fVxuXG5cdGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblx0bGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2Rlcztcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG5cdH1cblx0cmV0dXJuIGZyYWdtZW50O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG5cdC8qKlxuXHQgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cblx0ICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcblx0ICovXG5cdHJ1bihjYWxsYmFjaykge1xuXHRcdG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG5cdFx0bWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuXHRcdHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuXHQgKi9cblx0Y2FuY2VsKGhhbmRsZSkge1xuXHRcdGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG5cdFx0aWYgKGlkeCA+PSAwKSB7XG5cdFx0XHRpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuXHRcdFx0fVxuXHRcdFx0bWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcblx0Y29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcblx0XHRpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjYigpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHRocm93IGVycjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcblx0bWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cblxuZXhwb3J0IGRlZmF1bHQgKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUgPSBmYWxzZSkgPT4ge1xuXHRyZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59O1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG5cdFx0bGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuXHRcdGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRyZW1vdmUoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdGxldCBoYW5kbGU7XG5cdFx0XHRcdHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcblx0XHRcdFx0XHRoYW5kbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7fSBmcm9tICcuL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0ICh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlID0gZmFsc2UpID0+IHtcblx0bGV0IGhhbmRsZSA9IGxpc3RlbkV2ZW50KHRhcmdldCwgdHlwZSwgKC4uLmFyZ3MpID0+IHtcblx0XHRoYW5kbGUucmVtb3ZlKCk7XG5cdFx0bGlzdGVuZXIoLi4uYXJncyk7XG5cdH0sIGNhcHR1cmUpO1xuXHRyZXR1cm4gaGFuZGxlO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7fSBmcm9tICcuL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUgPSBmYWxzZSkgPT4ge1xuXHRsZXQgcGF1c2VkID0gZmFsc2U7XG5cdGxldCBoYW5kbGUgPSBsaXN0ZW5FdmVudCh0YXJnZXQsIHR5cGUsICguLi5hcmdzKSA9PiB7XG5cdFx0aWYgKCFwYXVzZWQpIHtcblx0XHRcdGxpc3RlbmVyKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSwgY2FwdHVyZSk7XG5cblx0cmV0dXJuIHtcblx0XHRyZW1vdmUoKSB7XG5cdFx0XHRoYW5kbGUucmVtb3ZlKCk7XG5cdFx0fSxcblx0XHRwYXVzZSgpIHtcblx0XHRcdHBhdXNlZCA9IHRydWU7XG5cdFx0fSxcblx0XHRyZXN1bWUoKSB7XG5cdFx0XHRwYXVzZWQgPSBmYWxzZTtcblx0XHR9XG5cdH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG5cdGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG5cdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHR9XG5cdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IHtkZWZhdWx0IGFzIGRvY3VtZW50UmVhZHl9IGZyb20gJy4vZG9tL2RvY3VtZW50LXJlYWR5LmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjcmVhdGVFbGVtZW50fSBmcm9tICcuL2RvbS9jcmVhdGUtZWxlbWVudC5qcyc7XG5leHBvcnQge2RlZmF1bHQgYXMgZWxlbWVudFNpYmxpbmdzfSBmcm9tICcuL2RvbS9lbGVtZW50LXNpYmxpbmdzLmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyByZW1vdmVFbGVtZW50fSBmcm9tICcuL2RvbS9yZW1vdmUtZWxlbWVudC5qcyc7XG5leHBvcnQge2RlZmF1bHQgYXMgaXNEZXNjZW5kYW50RWxlbWVudH0gZnJvbSAnLi9kb20vaXMtZGVzY2VuZGFudC1lbGVtZW50LmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBlbGVtZW50Q2hpbGRyZW59IGZyb20gJy4vZG9tL2VsZW1lbnQtY2hpbGRyZW4uanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHRlbXBsYXRlQ29udGVudH0gZnJvbSAnLi9kb20vdGVtcGxhdGUtY29udGVudC5qcyc7XG5leHBvcnQge2RlZmF1bHQgYXMgbWljcm9UYXNrfSBmcm9tICcuL2RvbS9taWNyb3Rhc2suanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGxpc3RlbkV2ZW50fSBmcm9tICcuL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGxpc3RlbkV2ZW50T25jZX0gZnJvbSAnLi9kb20vbGlzdGVuLWV2ZW50LW9uY2UuanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHBhdXNhYmxlRXZlbnR9IGZyb20gJy4vZG9tL3BhdXNhYmxlLWV2ZW50LmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBzdG9wRXZlbnR9IGZyb20gJy4vZG9tL3N0b3AtZXZlbnQuanMnO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcblx0Y29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuXG5cdH07XG5cdF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuXHRnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuXHRcdCdjb25uZWN0ZWRDYWxsYmFjaycsXG5cdFx0J2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcblx0XHQnYWRvcHRlZENhbGxiYWNrJyxcblx0XHQnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuXHRdO1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5fSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cblx0aWYgKCFiYXNlQ2xhc3MpIHtcblx0XHRiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXG5cdFx0fVxuXG5cdFx0c3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG5cdFx0XHRjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuXHRcdFx0aWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcblx0XHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdFx0Y3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcblx0XHRcdFx0XHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcblx0XHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdFx0dmFsdWUoKSB7fSxcblx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZygwLCAoY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoKSk7XG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuXHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoLi4uYXJncykge1xuXHRcdFx0XHRcdFx0XHR0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmZpbmFsaXplQ2xhc3MoKTtcblx0XHRcdFx0YXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRcdGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdFx0XHRhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcblx0XHRcdFx0cmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcblx0XHRcdHN1cGVyKC4uLmFyZ3MpO1xuXHRcdFx0dGhpcy5jb25zdHJ1Y3QoKTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3QoKSB7XG5cblx0XHR9XG5cblx0XHRpc0Nvbm5lY3RlZCgpIHtcblx0XHRcdHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXHRcdGF0dHJpYnV0ZUNoYW5nZWQoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG5cblx0XHR9XG5cdFx0LyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG5cdFx0Y29ubmVjdGVkKCkge1xuXG5cdFx0fVxuXG5cdFx0ZGlzY29ubmVjdGVkKCkge1xuXG5cdFx0fVxuXG5cdFx0YWRvcHRlZCgpIHtcblxuXHRcdH1cblxuXHRcdHJlbmRlcigpIHtcblxuXHRcdH1cblxuXHRcdF9vblJlbmRlcigpIHtcblxuXHRcdH1cblxuXHRcdF9wb3N0UmVuZGVyKCkge1xuXG5cdFx0fVxuXHR9O1xuXG5cdGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGNvbm5lY3RlZENhbGxiYWNrKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG5cdFx0XHRpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG5cdFx0XHRcdHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdFx0Y29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcblx0XHRcdFx0Y29udGV4dC5yZW5kZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAocmVuZGVyQ2FsbGJhY2spIHtcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuXHRcdFx0aWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcblx0XHRcdFx0Y29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcblx0XHRcdFx0cHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcblx0XHRcdFx0bWljcm9UYXNrLnJ1bigoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuXHRcdFx0XHRcdFx0cHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG5cdFx0XHRcdFx0XHRyZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuXHRcdFx0cHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG5cdFx0XHRtaWNyb1Rhc2sucnVuKCgpID0+IHtcblx0XHRcdFx0aWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcblx0XHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0XHRcdGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cbn07XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi9hZHZpY2UvYWZ0ZXIuanMnO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7YXNzaWdufSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cblx0cmV0dXJuIGNsYXNzIFN0YXRlIGV4dGVuZHMgYmFzZUNsYXNzIHtcblx0XHRzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcblx0XHRcdHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcblx0XHRcdGFmdGVyKGNyZWF0ZUJlZm9yZVJlbmRlckFkdmljZSgpLCAnX29uUmVuZGVyJykodGhpcyk7XG5cdFx0XHRhZnRlcihjcmVhdGVBZnRlclJlbmRlckFkdmljZSgpLCAnX3Bvc3RSZW5kZXInKSh0aGlzKTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3QoKSB7XG5cdFx0XHRzdXBlci5jb25zdHJ1Y3QoKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUodGhpcy5kZWZhdWx0U3RhdGUpO1xuXHRcdH1cblxuXHRcdGdldCBkZWZhdWx0U3RhdGUoKSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXG5cdFx0Z2V0IHN0YXRlKCkge1xuXHRcdFx0cmV0dXJuIGFzc2lnbih7fSwgcHJpdmF0ZXModGhpcykuc3RhdGUpO1xuXHRcdH1cblxuXHRcdHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0U3RhdGUpIHtcblx0XHRcdGZvciAobGV0IGtleSBpbiBuZXh0U3RhdGUpIHtcblx0XHRcdFx0aWYgKG5leHRTdGF0ZVtrZXldICE9PSBwcml2YXRlcyh0aGlzKS5zdGF0ZVtrZXldKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRzZXRTdGF0ZShjaGFuZ2VzKSB7XG5cdFx0XHRjb25zdCBuZXh0U3RhdGUgPSBhc3NpZ24oe30sIHByaXZhdGVzKHRoaXMpLnN0YXRlLCBjaGFuZ2VzKTtcblx0XHRcdGNvbnN0IHByZXZpb3VzU3RhdGUgPSBwcml2YXRlcyh0aGlzKS5zdGF0ZTtcblx0XHRcdGNvbnN0IGNoYW5nZWQgPSBwcmV2aW91c1N0YXRlID09PSB1bmRlZmluZWQgfHwgdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFN0YXRlKTtcblxuXHRcdFx0aWYgKGNoYW5nZWQpIHtcblx0XHRcdFx0cHJpdmF0ZXModGhpcykuc3RhdGUgPSBuZXh0U3RhdGU7XG5cdFx0XHRcdGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHtcblx0XHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29tcG9uZW50V2lsbFJlbmRlcihuZXdTdGF0ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cblx0XHR9XG5cblx0XHRjb21wb25lbnREaWRSZW5kZXIocHJldmlvdXNTdGF0ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG5cblx0XHR9XG5cblx0XHRjb21wb25lbnRXaWxsVXBkYXRlKG5ld1N0YXRlLCBwcmV2aW91c1N0YXRlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblxuXHRcdH1cblxuXHRcdGNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1N0YXRlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVCZWZvcmVSZW5kZXJBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChmaXJzdFJlbmRlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dCA9IHRoaXM7XG5cdFx0XHRpZiAoZmlyc3RSZW5kZXIpIHtcblx0XHRcdFx0Y29udGV4dC5jb21wb25lbnRXaWxsUmVuZGVyKHRoaXMuc3RhdGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGV4dC5jb21wb25lbnRXaWxsVXBkYXRlKHRoaXMuc3RhdGUsIGFzc2lnbih7fSwgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyZWRTdGF0ZSkpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVBZnRlclJlbmRlckFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGZpcnN0UmVuZGVyKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGNvbnN0IHByZXZpb3VzU3RhdGUgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJlZFN0YXRlO1xuXHRcdFx0cHJpdmF0ZXMoY29udGV4dCkucmVuZGVyZWRTdGF0ZSA9IHByaXZhdGVzKGNvbnRleHQpLnN0YXRlO1xuXHRcdFx0aWYgKGZpcnN0UmVuZGVyKSB7XG5cdFx0XHRcdGNvbnRleHQuY29tcG9uZW50RGlkUmVuZGVyKHByZXZpb3VzU3RhdGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGV4dC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBlbGVtZW50Q2hpbGRyZW4gZnJvbSAnLi4vZG9tL2VsZW1lbnQtY2hpbGRyZW4uanMnO1xuXG5cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG5cdHJldHVybiBjbGFzcyBTbG90cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cblx0XHRzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcblx0XHRcdHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcblx0XHRcdGJlZm9yZShjcmVhdGVCZWZvcmVSZW5kZXJBZHZpY2UoKSwgJ19vblJlbmRlcicpKHRoaXMpO1xuXHRcdH1cblxuXHRcdGNvbnN0cnVjdCgpIHtcblx0XHRcdHN1cGVyLmNvbnN0cnVjdCgpO1xuXHRcdFx0dGhpcy5zbG90cyA9IHtkZWZhdWx0OiBbXX07XG5cdFx0fVxuXG5cdFx0c2xvdHNBc3NpZ25lZCgpIHtcblxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVCZWZvcmVSZW5kZXJBZHZpY2UoKSB7XG5cdFx0Y29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChmaXJzdFJlbmRlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dCA9IHRoaXM7XG5cdFx0XHRpZiAoZmlyc3RSZW5kZXIpIHtcblx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBlbGVtZW50Q2hpbGRyZW4oY29udGV4dCk7XG5cdFx0XHRcdGNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYXR0cmlidXRlID0gY2hpbGQuZ2V0QXR0cmlidXRlID8gY2hpbGQuZ2V0QXR0cmlidXRlKCdzbG90JykgOiBudWxsO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlID09PSAnc3RyaW5nJyAmJiBhdHRyaWJ1dGUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2xvdCA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5zbG90c1tzbG90XSA9IGNoaWxkO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LnNsb3RzLmRlZmF1bHQucHVzaChjaGlsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29udGV4dC5zbG90c0Fzc2lnbmVkKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxufTtcbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHt9IGZyb20gJy4uL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7YXNzaWdufSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGFuZGxlcnM6IFtdXG5cdFx0fTtcblx0fSk7XG5cdGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcblx0XHRidWJibGVzOiBmYWxzZSxcblx0XHRjYW5jZWxhYmxlOiBmYWxzZVxuXHR9O1xuXG5cdHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG5cdFx0c3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG5cdFx0XHRzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG5cdFx0XHRhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdH1cblxuXHRcdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0XHRjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcblx0XHRcdGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vICRGbG93Rml4TWVcblx0XHRcdFx0dGhpc1toYW5kbGVdKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuXHRcdFx0dGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcblx0XHR9XG5cblx0XHRkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywge2RldGFpbDogZGF0YX0pKSk7XG5cdFx0fVxuXG5cdFx0b2ZmKCkge1xuXHRcdFx0cHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuXHRcdFx0XHRoYW5kbGVyLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0b3duKC4uLmhhbmRsZXJzKSB7XG5cdFx0XHRoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGNvbnRleHQub2ZmKCk7XG5cdFx0fTtcblx0fVxufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbn0gPSBPYmplY3Q7XG5cdGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuXHRjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG5cdGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5cdGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG5cdGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuXHRmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG5cdFx0Y29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG5cdFx0Y29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcblx0XHRjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuXHRcdGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcblx0XHRjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuXHRcdGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuXHRcdGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcblx0XHRjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuXHRcdGNvbmZpZy5yZWFkT25seSA9ICgncmVhZE9ubHknIGluIGNvbmZpZykgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcblx0XHRjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID0gJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnID9cblx0XHRcdGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG5cdH1cblxuXHRmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcblx0XHRjb25zdCBvdXRwdXQgPSB7fTtcblx0XHRmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG5cdFx0XHRvdXRwdXRbbmFtZV0gPSAodHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nKSA/IHt0eXBlOiBwcm9wZXJ0eX0gOiBwcm9wZXJ0eTtcblx0XHRcdGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuXHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcblx0XHRcdFx0Y29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHtcblx0XHRcdGxldCBjb250ZXh0ID0gdGhpcztcblx0XHRcdE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3Qge25vdGlmeSwgaGFzT2JzZXJ2ZXIsIHJlZmxlY3RUb0F0dHJpYnV0ZSwgaXNPYnNlcnZlclN0cmluZywgb2JzZXJ2ZXJ9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0XHRpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcblx0XHRcdFx0XHR0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobm90aWZ5KSB7XG5cdFx0XHRcdFx0Y29udGV4dC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcblx0XHRcdFx0XHRcdGRldGFpbDoge1xuXHRcdFx0XHRcdFx0XHRuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0b2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKVxuXHRcdFx0XHQubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXHRcdFx0c3VwZXIuZmluYWxpemVDbGFzcygpO1xuXHRcdFx0YmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHR0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG5cdFx0XHRsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcblx0XHRcdGlmICghcHJvcGVydHkpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuXHRcdFx0XHRwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuXHRcdFx0XHRhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3BlcnR5O1xuXHRcdH1cblxuXHRcdHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuXHRcdFx0bGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuXHRcdFx0aWYgKCFhdHRyaWJ1dGUpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuXHRcdFx0XHRhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0cHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXR0cmlidXRlO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG5cdFx0XHRcdGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuXHRcdFx0XHRsZXQgY2hlY2tPYmogPSBudWxsO1xuXHRcdFx0XHRsZXQgbG9vcCA9IHRydWU7XG5cblx0XHRcdFx0d2hpbGUgKGxvb3ApIHtcblx0XHRcdFx0XHRjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG5cdFx0XHRcdFx0aWYgKCFjaGVja09iaiB8fCAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcblx0XHRcdFx0XHRcdGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuXHRcdFx0XHRcdFx0Y2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0XHRcdGxvb3AgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG5cdFx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKGdldFByb3BlcnRpZXNDb25maWcoKSwgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLnByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0cHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcblx0XHRcdGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2ApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcblx0XHRcdFx0aWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3QoKSB7XG5cdFx0XHRzdXBlci5jb25zdHJ1Y3QoKTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRwcm9wZXJ0aWVzQ2hhbmdlZChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuXG5cdFx0fVxuXG5cdFx0X2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG5cdFx0XHRpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcblx0XHRcdFx0ZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG5cdFx0XHRcdGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG5cdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNldDogcmVhZE9ubHkgPyAoKSA9PiB7fSA6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdH1cblxuXHRcdF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcblx0XHRcdGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuXHRcdFx0XHRcdHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZiBcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJyA/XG5cdFx0XHRcdFx0ZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcblx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0X2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKTtcblx0XHRcdFx0dGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGU7XG5cdFx0XHRsZXQgaXNWYWxpZCA9IGZhbHNlO1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0aXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlzVmFsaWQ7XG5cdFx0fVxuXG5cdFx0X3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcblx0XHRcdHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG5cdFx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHtpc051bWJlciwgaXNBcnJheSwgaXNCb29sZWFuLCBpc0RhdGUsIGlzU3RyaW5nLCBpc09iamVjdH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG5cdFx0XHRpZiAoaXNCb29sZWFuKSB7XG5cdFx0XHRcdHZhbHVlID0gKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpO1xuXHRcdFx0fSBlbHNlIGlmIChpc051bWJlcikge1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuXHRcdFx0fSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGlzQXJyYXkgPyBudWxsIDoge30gOiBKU09OLnBhcnNlKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNEYXRlKSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblxuXHRcdF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0Y29uc3Qge2lzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXl9ID0gcHJvcGVydHlDb25maWc7XG5cblx0XHRcdGlmIChpc0Jvb2xlYW4pIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cblx0XHRfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0bGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdFx0bGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG5cdFx0XHRpZiAoY2hhbmdlZCkge1xuXHRcdFx0XHRpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG5cdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcblx0XHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cblx0XHRcdFx0aWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNoYW5nZWQ7XG5cdFx0fVxuXG5cdFx0X2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG5cdFx0XHRcdG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZsdXNoUHJvcGVydGllcygpIHtcblx0XHRcdGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcblx0XHRcdGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuXHRcdFx0Y29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuXHRcdFx0aWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblx0XHRcdHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcblx0XHRcdFx0KG9sZCAhPT0gdmFsdWUgJiZcblx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuXHRcdFx0XHRcdChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgY2xhc3NCdWlsZGVyIGZyb20gJy4uL2NsYXNzLWJ1aWxkZXIuanMnO1xuaW1wb3J0IGN1c3RvbUVsZW1lbnQsIHt9IGZyb20gJy4vY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IHByb3BlcnRpZXMsIHt9IGZyb20gJy4vcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzLCB7fSBmcm9tICcuL2V2ZW50cy1taXhpbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MgPSBjdXN0b21FbGVtZW50KCkpID0+IHtcblx0cmV0dXJuIGNsYXNzIENvbXBvbmVudCBleHRlbmRzIGNsYXNzQnVpbGRlcihiYXNlQ2xhc3MpLndpdGgoZXZlbnRzLCBwcm9wZXJ0aWVzKSB7XG5cdFx0cHJvcGVydGllc0NoYW5nZWQoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblx0XHRcdGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59O1xuIiwiLyogICovXG5leHBvcnQge2RlZmF1bHQgYXMgY3VzdG9tRWxlbWVudH0gZnJvbSAnLi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5leHBvcnQge2RlZmF1bHQgYXMgc3RhdGV9IGZyb20gJy4vd2ViLWNvbXBvbmVudHMvc3RhdGUtbWl4aW4uanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIHNsb3RzfSBmcm9tICcuL3dlYi1jb21wb25lbnRzL3Nsb3RzLW1peGluLmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBldmVudHN9IGZyb20gJy4vd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBwcm9wZXJ0aWVzfSBmcm9tICcuL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGNvbXBvbmVudH0gZnJvbSAnLi93ZWItY29tcG9uZW50cy9jb21wb25lbnQtbWl4aW4uanMnO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkgPT4ge1xuXHRpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcblx0XHRyZXR1cm4gb2JqW2tleV0gPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcblx0fVxuXHRjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuXHRjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG5cdGxldCBvYmplY3QgPSBvYmo7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG5cdFx0aWYgKHR5cGVvZiBvYmplY3QgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvYmplY3Q7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG5cdGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuXHRcdG9ialtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG5cdGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcblx0bGV0IG9iamVjdCA9IG9iajtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcblx0XHRpZiAodHlwZW9mIG9iamVjdFtwYXJ0c1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRvYmplY3RbcGFydHNbaV1dID0ge307XG5cdFx0fVxuXHRcdG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG5cdH1cblx0b2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG4iLCIvKiAgKi9cbmNvbnN0IHtrZXlzfSA9IE9iamVjdDtcblxuZXhwb3J0IGRlZmF1bHQgKG8pID0+IGtleXMobykucmVkdWNlKFxuXHQobSwgaykgPT4gbS5zZXQoaywgb1trXSksIG5ldyBNYXAoKSk7XG4iLCIvKiAgKi9cbmV4cG9ydCB7ZGVmYXVsdCBhcyBkZ2V0fSBmcm9tICcuL29iamVjdC9kZ2V0LmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBkc2V0fSBmcm9tICcuL29iamVjdC9kc2V0LmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyB0b01hcH0gZnJvbSAnLi9vYmplY3QvdG8tbWFwLmpzJztcbiIsIi8qICAqL1xuZXhwb3J0IHtkZWZhdWx0IGFzIGNsYXNzQnVpbGRlcn0gZnJvbSAnLi9jbGFzcy1idWlsZGVyLmpzJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBjcmVhdGVTdG9yYWdlfSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vYWR2aWNlLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vZG9tLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vd2ViLWNvbXBvbmVudHMuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9vYmplY3QuanMnO1xuIl0sIm5hbWVzIjpbInByZXZUaW1lSWQiLCJwcmV2VW5pcXVlSWQiLCJwcmVmaXgiLCJuZXdVbmlxdWVJZCIsIkRhdGUiLCJub3ciLCJ1bmlxdWVJZCIsIlN0cmluZyIsIndyYXBwZWRNaXhpbktleSIsImFwcGxpZWRNaXhpbktleSIsIndyYXBwZXIiLCJzdXBlckNsYXNzIiwibWl4aW4iLCJhcHBsaWNhdGlvbiIsInByb3RvIiwicHJvdG90eXBlIiwidW53cmFwIiwic2V0UHJvdG90eXBlT2YiLCJ3cmFwIiwiYXBwbHkiLCJoYXNPd25Qcm9wZXJ0eSIsIk9iamVjdCIsImNhbGwiLCJnZXRQcm90b3R5cGVPZiIsIm8iLCJpc0FwcGxpY2F0aW9uT2YiLCJoYXMiLCJjYWNoZWRBcHBsaWNhdGlvbktleSIsImNhY2hlZEFwcGxpY2F0aW9uIiwiZ2V0Iiwic2V0IiwiZGVkdXBlIiwiY2FjaGUiLCJkZWNsYXJlIiwiZnJlZXplIiwia2xhc3MiLCJ3aXRoIiwibWl4aW5zIiwibWFwIiwiY3JlYXRlTWl4aW4iLCJyZWR1Y2UiLCJrIiwibSIsImNyZWF0b3IiLCJiaW5kIiwic3RvcmUiLCJvYmoiLCJ2YWx1ZSIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ3cml0YWJsZSIsInVuc2hpZnQiLCJyZXR1cm5WYWx1ZSIsImVyciIsInBhc3NUaHJvdWdoIiwiZG9jdW1lbnQiLCJyZWFkeVN0YXRlIiwicmVzb2x2ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0YWdOYW1lIiwiYXR0cmlidXRlcyIsImVsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYXR0ciIsInNldEF0dHJpYnV0ZSIsInNpYmxpbmdzIiwicGFyZW50Tm9kZSIsImZpcnN0Q2hpbGQiLCJzaWJsaW5nIiwibm9kZVR5cGUiLCJwdXNoIiwibmV4dFNpYmxpbmciLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJjaGlsZCIsInBhcmVudCIsIkJvb2xlYW4iLCJjaGlsZE5vZGVzIiwiY2hpbGRyZW4iLCJ0ZW1wbGF0ZSIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiRXJyb3IiLCJjYiIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJ0YXJnZXQiLCJ0eXBlIiwibGlzdGVuZXIiLCJjYXB0dXJlIiwicGFyc2UiLCJhZGRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwibGlzdGVuRXZlbnQiLCJwYXVzZWQiLCJwYXVzZSIsInJlc3VtZSIsImV2dCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiZmluYWxpemVDbGFzcyIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImRlZmluZSIsImNvbnN0cnVjdCIsImluaXRpYWxpemVkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJjb25uZWN0ZWQiLCJyZW5kZXIiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImFzc2lnbiIsInNldFN0YXRlIiwiZGVmYXVsdFN0YXRlIiwibmV4dFN0YXRlIiwia2V5Iiwic3RhdGUiLCJjaGFuZ2VzIiwicHJldmlvdXNTdGF0ZSIsImNoYW5nZWQiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJpc0Nvbm5lY3RlZCIsIm5ld1N0YXRlIiwiYWZ0ZXIiLCJjcmVhdGVCZWZvcmVSZW5kZXJBZHZpY2UiLCJjcmVhdGVBZnRlclJlbmRlckFkdmljZSIsImNvbXBvbmVudFdpbGxSZW5kZXIiLCJjb21wb25lbnRXaWxsVXBkYXRlIiwicmVuZGVyZWRTdGF0ZSIsImNvbXBvbmVudERpZFJlbmRlciIsImNvbXBvbmVudERpZFVwZGF0ZSIsInNsb3RzIiwiZGVmYXVsdCIsImJlZm9yZSIsImh5cGVuUmVnRXgiLCJlbGVtZW50Q2hpbGRyZW4iLCJhdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzbG90IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJzbG90c0Fzc2lnbmVkIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImV2ZW50Iiwib3duIiwiZGF0YSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImhhbmRsZXIiLCJvZmYiLCJrZXlzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJuYW1lIiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiSlNPTiIsInByb3BlcnR5Q29uZmlnIiwidG9TdHJpbmciLCJvbGQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwicHJvcGVydGllc0NoYW5nZWQiLCJjcmVhdGVQcm9wZXJ0aWVzIiwidXBwZXJjYXNlUmVnRXgiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiRnVuY3Rpb24iLCJjdXN0b21FbGVtZW50IiwiY2xhc3NCdWlsZGVyIiwiZGVmYXVsdFZhbHVlIiwicGFydHMiLCJvYmplY3QiLCJkZXB0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQUE7O0NBRUEsSUFBSUEsYUFBYSxDQUFqQjtDQUNBLElBQUlDLGVBQWUsQ0FBbkI7O0FBRUEsaUJBQWUsVUFBQ0MsTUFBRCxFQUFZO0NBQzFCLEtBQUlDLGNBQWNDLEtBQUtDLEdBQUwsRUFBbEI7Q0FDQSxLQUFJRixnQkFBZ0JILFVBQXBCLEVBQWdDO0NBQy9CLElBQUVDLFlBQUY7Q0FDQSxFQUZELE1BRU87Q0FDTkQsZUFBYUcsV0FBYjtDQUNBRixpQkFB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
