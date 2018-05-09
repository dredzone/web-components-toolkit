(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	/*  */
	var createStorage = (function () {
		var creator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Object.create.bind(null, null, {});

		var store = new WeakMap();
		return function (obj) {
			var value = store.get(obj);
			if (!value) {
				store.set(obj, value = creator(obj));
			}
			return value;
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
			var defineProperty = Object.defineProperty;

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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
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

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	/*  */

	var global$1 = document.defaultView;

	// https://github.com/google/traceur-compiler/issues/1709
	if (typeof global$1.HTMLElement !== 'function') {
		var _HTMLElement = function HTMLElement() {// eslint-disable-line func-names

		};
		_HTMLElement.prototype = global$1.HTMLElement.prototype;
		global$1.HTMLElement = _HTMLElement;
	}

	var customElement = (function (baseClass) {
		var customElementsV1Callbacks = ['connectedCallback', 'disconnectedCallback', 'adoptedCallback', 'attributeChangedCallback'];
		var defineProperty$$1 = Object.defineProperty,
		    hasOwnProperty = Object.hasOwnProperty;

		var privates = createStorage();

		if (!baseClass) {
			baseClass = function (_global$HTMLElement) {
				inherits(baseClass, _global$HTMLElement);

				function baseClass() {
					classCallCheck(this, baseClass);
					return possibleConstructorReturn(this, _global$HTMLElement.apply(this, arguments));
				}

				return baseClass;
			}(global$1.HTMLElement);
		}

		return function (_baseClass) {
			inherits(CustomElement, _baseClass);

			CustomElement.finalizeClass = function finalizeClass() {};

			CustomElement.define = function define(tagName) {
				var registry = customElements;
				if (!registry.get(tagName)) {
					var proto = this.prototype;
					customElementsV1Callbacks.forEach(function (callbackMethodName) {
						if (!hasOwnProperty.call(proto, callbackMethodName)) {
							defineProperty$$1(proto, callbackMethodName, {
								value: function value() {},

								configurable: true
							});
						}
						var newCallbackName = callbackMethodName.substring(0, callbackMethodName.length - 'callback'.length);
						var originalMethod = proto[callbackMethodName];
						defineProperty$$1(proto, callbackMethodName, {
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
			};

			createClass(CustomElement, [{
				key: 'initialized',
				get: function get$$1() {
					return privates(this).initialized === true;
				}
			}], [{
				key: 'observedAttributes',
				get: function get$$1() {
					return [];
				}
			}]);

			function CustomElement() {
				classCallCheck(this, CustomElement);

				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				var _this2 = possibleConstructorReturn(this, _baseClass.call.apply(_baseClass, [this].concat(args)));

				_this2.construct();
				return _this2;
			}

			CustomElement.prototype.construct = function construct() {};

			/* eslint-disable no-unused-vars */


			CustomElement.prototype.attributeChanged = function attributeChanged(attributeName, oldValue, newValue) {};
			/* eslint-enable no-unused-vars */

			CustomElement.prototype.connected = function connected() {};

			CustomElement.prototype.disconnected = function disconnected() {};

			CustomElement.prototype.adopted = function adopted() {};

			CustomElement.prototype.render = function render() {};

			CustomElement.prototype._onRender = function _onRender() {};

			CustomElement.prototype._postRender = function _postRender() {};

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

	/*  */
	var after$1 = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = Object.defineProperty;

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

	/**
	 * Mixin adds CustomEvent handling to an element
	 */
	var events = (function (baseClass) {
		var assign = Object.assign;

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
			inherits(Events, _baseClass);

			function Events() {
				classCallCheck(this, Events);
				return possibleConstructorReturn(this, _baseClass.apply(this, arguments));
			}

			Events.finalizeClass = function finalizeClass() {
				_baseClass.finalizeClass.call(this);
				after$1(createDisconnectedAdvice(), 'disconnected')(this);
			};

			Events.prototype.handleEvent = function handleEvent(event) {
				var handle = 'on' + event.type;
				if (typeof this[handle] === 'function') {
					// $FlowFixMe
					this[handle](event);
				}
			};

			Events.prototype.on = function on(type, listener, capture) {
				this.own(listenEvent(this, type, listener, capture));
			};

			Events.prototype.dispatch = function dispatch(type) {
				var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				this.dispatchEvent(new CustomEvent(type, assign(eventDefaultParams, { detail: data })));
			};

			Events.prototype.off = function off() {
				privates(this).handlers.forEach(function (handler) {
					handler.remove();
				});
			};

			Events.prototype.own = function own() {
				var _this2 = this;

				for (var _len = arguments.length, handlers = Array(_len), _key = 0; _key < _len; _key++) {
					handlers[_key] = arguments[_key];
				}

				handlers.forEach(function (handler) {
					privates(_this2).handlers.push(handler);
				});
			};

			return Events;
		}(baseClass);

		function createDisconnectedAdvice() {
			return function () {
				var context = this;
				context.off();
			};
		}
	});

	/*  */
	var stopEvent = (function (evt) {
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}
		evt.preventDefault();
	});

	/*  */
	var removeElement = (function (element) {
		if (element.parentElement) {
			element.parentElement.removeChild(element);
		}
	});

	var EventsEmitter = function (_events) {
		inherits(EventsEmitter, _events);

		function EventsEmitter() {
			classCallCheck(this, EventsEmitter);
			return possibleConstructorReturn(this, _events.apply(this, arguments));
		}

		EventsEmitter.prototype.connected = function connected() {};

		EventsEmitter.prototype.disconnected = function disconnected() {};

		return EventsEmitter;
	}(events(customElement()));

	var EventsListener = function (_events2) {
		inherits(EventsListener, _events2);

		function EventsListener() {
			classCallCheck(this, EventsListener);
			return possibleConstructorReturn(this, _events2.apply(this, arguments));
		}

		EventsListener.prototype.connected = function connected() {};

		EventsListener.prototype.disconnected = function disconnected() {};

		return EventsListener;
	}(events(customElement()));

	EventsEmitter.define('events-emitter');
	EventsListener.define('events-listener');

	describe("Events Mixin", function () {
		var container = void 0;
		var emmiter = document.createElement('events-emitter');
		var listener = document.createElement('events-listener');

		before(function () {
			container = document.getElementById('container');
			listener.append(emmiter);
			container.append(listener);
		});

		afterEach(function () {
			removeElement(emmiter);
			removeElement(listener);
			container.innerHTML = '';
		});
		it("expect emitter to fireEvent and listener to handle an event", function () {
			listener.on('hi', function (evt) {
				stopEvent(evt);
				chai.expect(evt.target).to.equal(emmiter);
				chai.expect(evt.detail).a('object');
				chai.expect(evt.detail).to.deep.equal({ body: 'greeting' });
			});
			emmiter.dispatch('hi', { body: 'greeting' });
		});
	});

	/*  */
	var before$1 = (function (behaviour) {
		for (var _len = arguments.length, methodNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			methodNames[_key - 1] = arguments[_key];
		}

		return function (klass) {
			var proto = klass.prototype;
			var len = methodNames.length;
			var defineProperty = Object.defineProperty;

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

	var properties = (function (baseClass) {
		var defineProperty$$1 = Object.defineProperty,
		    keys = Object.keys,
		    assign = Object.assign;

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
				if (Object.keys(privates(context).initializeProperties).length > 0) {
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
				Object.keys(changedProps).forEach(function (property) {
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
			inherits(Properties, _baseClass);

			function Properties() {
				classCallCheck(this, Properties);
				return possibleConstructorReturn(this, _baseClass.apply(this, arguments));
			}

			Properties.finalizeClass = function finalizeClass() {
				_baseClass.finalizeClass.call(this);
				before$1(createConnectedAdvice(), 'connected')(this);
				before$1(createAttributeChangeAdvice(), 'attributeChanged')(this);
				before$1(createPropertiesChangedAdvice(), 'propertiesChanged')(this);
				this.createProperties();
			};

			Properties.attributeToPropertyName = function attributeToPropertyName(attribute) {
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
			};

			Properties.propertyNameToAttribute = function propertyNameToAttribute(property) {
				var attribute = propertyNamesToAttributes[property];
				if (!attribute) {
					// Convert and memoize.
					var uppercaseRegEx = /([A-Z])/g;
					attribute = property.replace(uppercaseRegEx, '-$1').toLowerCase();
					propertyNamesToAttributes[property] = attribute;
				}
				return attribute;
			};

			Properties.createProperties = function createProperties() {
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
			};

			Properties.prototype.construct = function construct() {
				_baseClass.prototype.construct.call(this);
				privates(this).data = {};
				privates(this).serializing = false;
				privates(this).initializeProperties = {};
				privates(this).dataPending = null;
				privates(this).dataOld = null;
				privates(this).dataInvalid = false;
				this._initializeProtoProperties();
				this._initializeProperties();
			};

			Properties.prototype.propertiesChanged = function propertiesChanged(currentProps, changedProps, oldProps) {// eslint-disable-line no-unused-vars

			};

			Properties.prototype._createPropertyAccessor = function _createPropertyAccessor(property, readOnly) {
				if (!dataHasAccessor[property]) {
					dataHasAccessor[property] = true;
					defineProperty$$1(this, property, {
						enumerable: true,
						configurable: true,
						get: function get$$1() {
							return this._getProperty(property);
						},

						set: readOnly ? function () {} : function (newValue) {
							this._setProperty(property, newValue);
						}
					});
				}
			};

			Properties.prototype._getProperty = function _getProperty(property) {
				return privates(this).data[property];
			};

			Properties.prototype._setProperty = function _setProperty(property, newValue) {
				if (this._isValidPropertyValue(property, newValue)) {
					if (this._setPendingProperty(property, newValue)) {
						this._invalidateProperties();
					}
				} else {
					console.log('invalid value ' + newValue + ' for property ' + property + ' of \n\t\t\t\t\ttype ' + this.constructor.classProperties[property].type.name);
				}
			};

			Properties.prototype._initializeProtoProperties = function _initializeProtoProperties() {
				var _this3 = this;

				Object.keys(dataProtoValues).forEach(function (property) {
					var value = typeof dataProtoValues[property] === 'function' ? dataProtoValues[property].call(_this3) : dataProtoValues[property];
					_this3._setProperty(property, value);
				});
			};

			Properties.prototype._initializeProperties = function _initializeProperties() {
				var _this4 = this;

				Object.keys(dataHasAccessor).forEach(function (property) {
					if (Object.hasOwnProperty.call(_this4, property)) {
						privates(_this4).initializeProperties[property] = _this4[property];
						delete _this4[property];
					}
				});
			};

			Properties.prototype._attributeToProperty = function _attributeToProperty(attribute, value) {
				if (!privates(this).serializing) {
					var property = this.constructor.attributeToPropertyName(attribute);
					this[property] = this._deserializeValue(property, value);
				}
			};

			Properties.prototype._isValidPropertyValue = function _isValidPropertyValue(property, value) {
				var propertyType = this.constructor.classProperties[property].type;
				var isValid = false;
				if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
					isValid = value instanceof propertyType;
				} else {
					isValid = '' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === propertyType.name.toLowerCase();
				}
				return isValid;
			};

			Properties.prototype._propertyToAttribute = function _propertyToAttribute(property, value) {
				privates(this).serializing = true;
				var attribute = this.constructor.propertyNameToAttribute(property);
				value = this._serializeValue(property, value);
				if (value === undefined) {
					this.removeAttribute(attribute);
				} else if (this.getAttribute(attribute) !== value) {
					this.setAttribute(attribute, value);
				}
				privates(this).serializing = false;
			};

			Properties.prototype._deserializeValue = function _deserializeValue(property, value) {
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
			};

			Properties.prototype._serializeValue = function _serializeValue(property, value) {
				var propertyConfig = this.constructor.classProperties[property];
				var isBoolean = propertyConfig.isBoolean,
				    isObject = propertyConfig.isObject,
				    isArray = propertyConfig.isArray;


				if (isBoolean) {
					return value ? '' : undefined;
				}
				if (isObject || isArray) {
					return JSON.stringify(value);
				}

				value = value ? value.toString() : undefined;
				return value;
			};

			Properties.prototype._setPendingProperty = function _setPendingProperty(property, value) {
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
			};

			Properties.prototype._invalidateProperties = function _invalidateProperties() {
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
			};

			Properties.prototype._flushProperties = function _flushProperties() {
				var props = privates(this).data;
				var changedProps = privates(this).dataPending;
				var old = privates(this).dataOld;

				if (this._shouldPropertiesChange(props, changedProps, old)) {
					privates(this).dataPending = null;
					privates(this).dataOld = null;
					this.propertiesChanged(props, changedProps, old);
				}
			};

			Properties.prototype._shouldPropertiesChange = function _shouldPropertiesChange(currentProps, changedProps, oldProps) {
				// eslint-disable-line no-unused-vars
				return Boolean(changedProps);
			};

			Properties.prototype._shouldPropertyChange = function _shouldPropertyChange(property, value, old) {
				return (
					// Strict equality check
					old !== value && (
					// This ensures (old==NaN, value==NaN) always returns false
					old === old || value === value)
				);
			};

			createClass(Properties, null, [{
				key: 'observedAttributes',
				get: function get$$1() {
					var _this6 = this;

					return Object.keys(this.classProperties).map(function (property) {
						return _this6.propertyNameToAttribute(property);
					}) || [];
				}
			}, {
				key: 'classProperties',
				get: function get$$1() {
					if (!propertiesConfig) {
						var getPropertiesConfig = function getPropertiesConfig() {
							return propertiesConfig || {};
						};
						var checkObj = null;
						var loop = true;

						while (loop) {
							checkObj = Object.getPrototypeOf(checkObj === null ? this : checkObj);
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

	var PropertiesMixinTest = function (_properties) {
		inherits(PropertiesMixinTest, _properties);

		function PropertiesMixinTest() {
			classCallCheck(this, PropertiesMixinTest);
			return possibleConstructorReturn(this, _properties.apply(this, arguments));
		}

		createClass(PropertiesMixinTest, null, [{
			key: 'properties',
			get: function get$$1() {
				return {
					prop: {
						type: String,
						value: "prop",
						reflectToAttribute: true,
						reflectFromAttribute: true,
						observer: function observer() {},
						notify: true
					},
					fnValueProp: {
						type: Array,
						value: function value() {
							return [];
						}
					}
				};
			}
		}]);
		return PropertiesMixinTest;
	}(properties(customElement()));

	PropertiesMixinTest.define('properties-mixin-test');

	describe("Properties Mixin", function () {
		var container = void 0;
		var propertiesMixinTest = document.createElement('properties-mixin-test');

		before(function () {
			container = document.getElementById('container');
			container.append(propertiesMixinTest);
		});

		after(function () {
			container.remove(propertiesMixinTest);
			container.innerHTML = '';
		});

		it("properties", function () {
			assert.equal(propertiesMixinTest.prop, 'prop');
		});

		it('reflecting properties', function () {
			propertiesMixinTest.prop = 'propValue';
			propertiesMixinTest._flushProperties();
			assert.equal(propertiesMixinTest.getAttribute('prop'), 'propValue');
		});

		it('notify property change', function () {
			listenEvent(propertiesMixinTest, 'prop-changed', function (evt) {
				assert.isOk(evt.type === 'prop-changed', 'event dispatched');
			});

			propertiesMixinTest.prop = 'propValue';
		});

		it('value as a function', function () {
			assert.isOk(Array.isArray(propertiesMixinTest.fnValueProp), 'function executed');
		});
	});

	/*  */

	var toString = Object.prototype.toString;
	var types = 'Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
	var len = types.length;
	var typeCache = {};
	var typeRegexp = /\s([a-zA-Z]+)/;
	var is = setup();

	function setup() {
		var checks = {};

		var _loop = function _loop(i) {
			var type = types[i].toLowerCase();
			checks[type] = function (obj) {
				return getType(obj) === type;
			};
			checks[type].all = all(checks[type]);
			checks[type].any = any(checks[type]);
		};

		for (var i = len; i--;) {
			_loop(i);
		}
		return checks;
	}

	function getType(obj) {
		var type = toString.call(obj);
		if (!typeCache[type]) {
			var matches = type.match(typeRegexp);
			if (Array.isArray(matches) && matches.length > 1) {
				typeCache[type] = matches[1].toLowerCase();
			}
		}
		return typeCache[type];
	}

	function all(fn) {
		return function () {
			for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
				params[_key] = arguments[_key];
			}

			var len = params.length;
			for (var i = 0; i < len; i++) {
				if (!fn(params[i])) {
					return false;
				}
			}
			return true;
		};
	}

	function any(fn) {
		return function () {
			for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				params[_key2] = arguments[_key2];
			}

			var len = params.length;
			for (var i = 0; i < len; i++) {
				if (fn(params[i])) {
					return true;
				}
			}
			return false;
		};
	}

	describe('Type Checks', function () {
		describe('arguments', function () {
			it('should return true if passed parameter type is arguments', function () {
				var getArguments = function getArguments() {
					return arguments;
				};
				var args = getArguments('test');
				expect(is.arguments(args)).to.be.true;
			});
			it('should return false if passed parameter type is not arguments', function () {
				var notArgs = ['test'];
				expect(is.arguments(notArgs)).to.be.false;
			});
			it('should return true if passed all parameters arguments', function () {
				var getArguments = function getArguments() {
					return arguments;
				};
				var args = getArguments('test');
				expect(is.arguments.all(args, args, args)).to.be.true;
			});
			it('should return true if passed any parameters arguments', function () {
				var getArguments = function getArguments() {
					return arguments;
				};
				var args = getArguments('test');
				expect(is.arguments.any(args, 'test', 'test2')).to.be.true;
			});
		});

		describe('array', function () {
			it('should return true if passed parameter type is array', function () {
				var array = ['test'];
				expect(is.array(array)).to.be.true;
			});
			it('should return false if passed parameter type is not array', function () {
				var notArray = 'test';
				expect(is.array(notArray)).to.be.false;
			});
			it('should return true if passed parameters all array', function () {
				expect(is.array.all(['test1'], ['test2'], ['test3'])).to.be.true;
			});
			it('should return true if passed parameters any array', function () {
				expect(is.array.any(['test1'], 'test2', 'test3')).to.be.true;
			});
		});

		describe('boolean', function () {
			it('should return true if passed parameter type is boolean', function () {
				var bool = true;
				expect(is.boolean(bool)).to.be.true;
			});
			it('should return false if passed parameter type is not boolean', function () {
				var notBool = 'test';
				expect(is.boolean(notBool)).to.be.false;
			});
		});

		describe('error', function () {
			it('should return true if passed parameter type is error', function () {
				var error = new Error();
				expect(is.error(error)).to.be.true;
			});
			it('should return false if passed parameter type is not error', function () {
				var notError = 'test';
				expect(is.error(notError)).to.be.false;
			});
		});

		describe('function', function () {
			it('should return true if passed parameter type is function', function () {
				expect(is.function(is.function)).to.be.true;
			});
			it('should return false if passed parameter type is not function', function () {
				var notFunction = 'test';
				expect(is.function(notFunction)).to.be.false;
			});
		});

		describe('null', function () {
			it('should return true if passed parameter type is null', function () {
				expect(is.null(null)).to.be.true;
			});
			it('should return false if passed parameter type is not null', function () {
				var notNull = 'test';
				expect(is.null(notNull)).to.be.false;
			});
		});

		describe('number', function () {
			it('should return true if passed parameter type is number', function () {
				expect(is.number(1)).to.be.true;
			});
			it('should return false if passed parameter type is not number', function () {
				var notNumber = 'test';
				expect(is.number(notNumber)).to.be.false;
			});
		});

		describe('object', function () {
			it('should return true if passed parameter type is object', function () {
				expect(is.object({})).to.be.true;
			});
			it('should return false if passed parameter type is not object', function () {
				var notObject = 'test';
				expect(is.object(notObject)).to.be.false;
			});
		});

		describe('regexp', function () {
			it('should return true if passed parameter type is regexp', function () {
				var regexp = new RegExp();
				expect(is.regexp(regexp)).to.be.true;
			});
			it('should return false if passed parameter type is not regexp', function () {
				var notRegexp = 'test';
				expect(is.regexp(notRegexp)).to.be.false;
			});
		});

		describe('string', function () {
			it('should return true if passed parameter type is string', function () {
				expect(is.string('test')).to.be.true;
			});
			it('should return false if passed parameter type is not string', function () {
				expect(is.string(1)).to.be.false;
			});
		});

		describe('undefined', function () {
			it('should return true if passed parameter type is undefined', function () {
				expect(is.undefined(undefined)).to.be.true;
			});
			it('should return false if passed parameter type is not undefined', function () {
				expect(is.undefined(null)).to.be.false;
				expect(is.undefined('test')).to.be.false;
			});
		});
	});

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvZG9tL3JlbW92ZS1lbGVtZW50LmpzIiwiLi4vLi4vdGVzdC93ZWItY29tcG9uZW50cy9ldmVudHMudGVzdC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMudGVzdC5qcyIsIi4uLy4uL2xpYi9pcy5qcyIsIi4uLy4uL3Rlc3QvaXMudGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KSkgPT4ge1xuXHRsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuXHRyZXR1cm4gKG9iaikgPT4ge1xuXHRcdGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuXHRcdGlmICghdmFsdWUpIHtcblx0XHRcdHN0b3JlLnNldChvYmosIHZhbHVlID0gY3JlYXRvcihvYmopKTtcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YXJncy51bnNoaWZ0KG1ldGhvZCk7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBrbGFzcztcblx0fTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge2NoYXJhY3RlckRhdGE6IHRydWV9KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuXHQvKipcblx0ICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cblx0ICpcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG5cdCAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG5cdCAqL1xuXHRydW4oY2FsbGJhY2spIHtcblx0XHRtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuXHRcdG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XHRyZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcblx0ICovXG5cdGNhbmNlbChoYW5kbGUpIHtcblx0XHRjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuXHRcdGlmIChpZHggPj0gMCkge1xuXHRcdFx0aWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcblx0XHRcdH1cblx0XHRcdG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG5cdGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG5cdFx0aWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y2IoKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG5cdG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcblx0Y29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuXG5cdH07XG5cdF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuXHRnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuXHRcdCdjb25uZWN0ZWRDYWxsYmFjaycsXG5cdFx0J2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcblx0XHQnYWRvcHRlZENhbGxiYWNrJyxcblx0XHQnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuXHRdO1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5fSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cblx0aWYgKCFiYXNlQ2xhc3MpIHtcblx0XHRiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXG5cdFx0fVxuXG5cdFx0c3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG5cdFx0XHRjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuXHRcdFx0aWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcblx0XHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdFx0Y3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcblx0XHRcdFx0XHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcblx0XHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdFx0dmFsdWUoKSB7fSxcblx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZygwLCAoY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoKSk7XG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuXHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoLi4uYXJncykge1xuXHRcdFx0XHRcdFx0XHR0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmZpbmFsaXplQ2xhc3MoKTtcblx0XHRcdFx0YXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRcdGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdFx0XHRhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcblx0XHRcdFx0cmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdldCBpbml0aWFsaXplZCgpIHtcblx0XHRcdHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG5cdFx0XHRzdXBlciguLi5hcmdzKTtcblx0XHRcdHRoaXMuY29uc3RydWN0KCk7XG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0KCkge1xuXG5cdFx0fVxuXG5cdFx0LyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cblx0XHRhdHRyaWJ1dGVDaGFuZ2VkKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuXG5cdFx0fVxuXHRcdC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuXHRcdGNvbm5lY3RlZCgpIHtcblxuXHRcdH1cblxuXHRcdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHRcdH1cblxuXHRcdGFkb3B0ZWQoKSB7XG5cblx0XHR9XG5cblx0XHRyZW5kZXIoKSB7XG5cblx0XHR9XG5cblx0XHRfb25SZW5kZXIoKSB7XG5cblx0XHR9XG5cblx0XHRfcG9zdFJlbmRlcigpIHtcblxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjb25uZWN0ZWRDYWxsYmFjaykge1xuXHRcdFx0Y29uc3QgY29udGV4dCA9IHRoaXM7XG5cdFx0XHRwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdFx0aWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuXHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHRcdGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG5cdFx0XHRcdGNvbnRleHQucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHJlbmRlckNhbGxiYWNrKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG5cdFx0XHRcdHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG5cdFx0XHRcdG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcblx0XHRcdFx0XHRcdHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuXHRcdFx0XHRcdFx0cmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcblx0XHRcdFx0XHRcdGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdFx0bWljcm9UYXNrLnJ1bigoKSA9PiB7XG5cdFx0XHRcdGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG5cdFx0XHRcdFx0cHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdFx0XHRkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGtsYXNzKSB7XG5cdFx0Y29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG5cdFx0Y29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuXHRcdGNvbnN0IHtkZWZpbmVQcm9wZXJ0eX0gPSBPYmplY3Q7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0Y29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuXHRcdFx0Y29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG5cdFx0XHRkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gKC4uLmFyZ3MpIHtcblx0XHRcdFx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdFx0XHRiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBrbGFzcztcblx0fTtcbn07XG4iLCIvKiAgKi9cblxuZXhwb3J0IGRlZmF1bHQgKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUgPSBmYWxzZSkgPT4ge1xuXHRyZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59O1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG5cdFx0bGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuXHRcdGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRyZW1vdmUoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdGxldCBoYW5kbGU7XG5cdFx0XHRcdHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcblx0XHRcdFx0XHRoYW5kbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHt9IGZyb20gJy4uL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7YXNzaWdufSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGFuZGxlcnM6IFtdXG5cdFx0fTtcblx0fSk7XG5cdGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcblx0XHRidWJibGVzOiBmYWxzZSxcblx0XHRjYW5jZWxhYmxlOiBmYWxzZVxuXHR9O1xuXG5cdHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG5cdFx0c3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG5cdFx0XHRzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG5cdFx0XHRhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdH1cblxuXHRcdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0XHRjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcblx0XHRcdGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vICRGbG93Rml4TWVcblx0XHRcdFx0dGhpc1toYW5kbGVdKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuXHRcdFx0dGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcblx0XHR9XG5cblx0XHRkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywge2RldGFpbDogZGF0YX0pKSk7XG5cdFx0fVxuXG5cdFx0b2ZmKCkge1xuXHRcdFx0cHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuXHRcdFx0XHRoYW5kbGVyLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0b3duKC4uLmhhbmRsZXJzKSB7XG5cdFx0XHRoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGNvbnRleHQub2ZmKCk7XG5cdFx0fTtcblx0fVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGV2dCkgPT4ge1xuXHRpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuXHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fVxuXHRldnQucHJldmVudERlZmF1bHQoKTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50KSA9PiB7XG5cdGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcblx0XHRlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9kb20vcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRjb25uZWN0ZWQoKSB7XG5cblx0fVxuXG5cdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHR9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRjb25uZWN0ZWQoKSB7XG5cblx0fVxuXG5cdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHR9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoXCJFdmVudHMgTWl4aW5cIiwgKCkgPT4ge1xuXHRsZXQgY29udGFpbmVyO1xuXHRjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcblx0Y29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuXHRiZWZvcmUoKCkgPT4ge1xuXHRcdGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcblx0XHRsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG5cdFx0Y29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG5cdH0pO1xuXG5cdGFmdGVyRWFjaCgoKSA9PiB7XG5cdFx0cmVtb3ZlRWxlbWVudChlbW1pdGVyKTtcblx0XHRyZW1vdmVFbGVtZW50KGxpc3RlbmVyKTtcblx0XHRjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdH0pO1xuXHRpdChcImV4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50XCIsICgpID0+IHtcblx0XHRsaXN0ZW5lci5vbignaGknLCAoZXZ0KSA9PiB7XG5cdFx0XHRzdG9wRXZlbnQoZXZ0KTtcblx0XHRcdGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuXHRcdFx0Y2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG5cdFx0XHRjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHtib2R5OiAnZ3JlZXRpbmcnfSk7XG5cdFx0fSk7XG5cdFx0ZW1taXRlci5kaXNwYXRjaCgnaGknLCB7Ym9keTogJ2dyZWV0aW5nJ30pO1xuXHR9KTtcbn0pOyIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGtsYXNzO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbn0gPSBPYmplY3Q7XG5cdGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuXHRjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG5cdGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5cdGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG5cdGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuXHRmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG5cdFx0Y29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG5cdFx0Y29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcblx0XHRjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuXHRcdGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcblx0XHRjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuXHRcdGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuXHRcdGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcblx0XHRjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuXHRcdGNvbmZpZy5yZWFkT25seSA9ICgncmVhZE9ubHknIGluIGNvbmZpZykgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcblx0XHRjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID0gJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnID9cblx0XHRcdGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG5cdH1cblxuXHRmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcblx0XHRjb25zdCBvdXRwdXQgPSB7fTtcblx0XHRmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG5cdFx0XHRvdXRwdXRbbmFtZV0gPSAodHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nKSA/IHt0eXBlOiBwcm9wZXJ0eX0gOiBwcm9wZXJ0eTtcblx0XHRcdGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuXHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcblx0XHRcdFx0Y29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHtcblx0XHRcdGxldCBjb250ZXh0ID0gdGhpcztcblx0XHRcdE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3Qge25vdGlmeSwgaGFzT2JzZXJ2ZXIsIHJlZmxlY3RUb0F0dHJpYnV0ZSwgaXNPYnNlcnZlclN0cmluZywgb2JzZXJ2ZXJ9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0XHRpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcblx0XHRcdFx0XHR0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobm90aWZ5KSB7XG5cdFx0XHRcdFx0Y29udGV4dC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcblx0XHRcdFx0XHRcdGRldGFpbDoge1xuXHRcdFx0XHRcdFx0XHRuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0b2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKVxuXHRcdFx0XHQubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXHRcdFx0c3VwZXIuZmluYWxpemVDbGFzcygpO1xuXHRcdFx0YmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHR0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG5cdFx0XHRsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcblx0XHRcdGlmICghcHJvcGVydHkpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuXHRcdFx0XHRwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuXHRcdFx0XHRhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3BlcnR5O1xuXHRcdH1cblxuXHRcdHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuXHRcdFx0bGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuXHRcdFx0aWYgKCFhdHRyaWJ1dGUpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuXHRcdFx0XHRhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0cHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXR0cmlidXRlO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG5cdFx0XHRcdGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuXHRcdFx0XHRsZXQgY2hlY2tPYmogPSBudWxsO1xuXHRcdFx0XHRsZXQgbG9vcCA9IHRydWU7XG5cblx0XHRcdFx0d2hpbGUgKGxvb3ApIHtcblx0XHRcdFx0XHRjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG5cdFx0XHRcdFx0aWYgKCFjaGVja09iaiB8fCAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcblx0XHRcdFx0XHRcdGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuXHRcdFx0XHRcdFx0Y2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0XHRcdGxvb3AgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG5cdFx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKGdldFByb3BlcnRpZXNDb25maWcoKSwgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLnByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0cHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcblx0XHRcdGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2ApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcblx0XHRcdFx0aWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3QoKSB7XG5cdFx0XHRzdXBlci5jb25zdHJ1Y3QoKTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRwcm9wZXJ0aWVzQ2hhbmdlZChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuXG5cdFx0fVxuXG5cdFx0X2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG5cdFx0XHRpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcblx0XHRcdFx0ZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG5cdFx0XHRcdGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG5cdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNldDogcmVhZE9ubHkgPyAoKSA9PiB7fSA6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdH1cblxuXHRcdF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcblx0XHRcdGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuXHRcdFx0XHRcdHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZiBcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJyA/XG5cdFx0XHRcdFx0ZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcblx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0X2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKTtcblx0XHRcdFx0dGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGU7XG5cdFx0XHRsZXQgaXNWYWxpZCA9IGZhbHNlO1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0aXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlzVmFsaWQ7XG5cdFx0fVxuXG5cdFx0X3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcblx0XHRcdHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG5cdFx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHtpc051bWJlciwgaXNBcnJheSwgaXNCb29sZWFuLCBpc0RhdGUsIGlzU3RyaW5nLCBpc09iamVjdH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG5cdFx0XHRpZiAoaXNCb29sZWFuKSB7XG5cdFx0XHRcdHZhbHVlID0gKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpO1xuXHRcdFx0fSBlbHNlIGlmIChpc051bWJlcikge1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuXHRcdFx0fSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGlzQXJyYXkgPyBudWxsIDoge30gOiBKU09OLnBhcnNlKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNEYXRlKSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblxuXHRcdF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0Y29uc3Qge2lzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXl9ID0gcHJvcGVydHlDb25maWc7XG5cblx0XHRcdGlmIChpc0Jvb2xlYW4pIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cblx0XHRfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0bGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdFx0bGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG5cdFx0XHRpZiAoY2hhbmdlZCkge1xuXHRcdFx0XHRpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG5cdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcblx0XHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cblx0XHRcdFx0aWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNoYW5nZWQ7XG5cdFx0fVxuXG5cdFx0X2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG5cdFx0XHRcdG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZsdXNoUHJvcGVydGllcygpIHtcblx0XHRcdGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcblx0XHRcdGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuXHRcdFx0Y29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuXHRcdFx0aWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblx0XHRcdHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcblx0XHRcdFx0KG9sZCAhPT0gdmFsdWUgJiZcblx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuXHRcdFx0XHRcdChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHByb3A6IHtcblx0XHRcdFx0dHlwZTogU3RyaW5nLFxuXHRcdFx0XHR2YWx1ZTogXCJwcm9wXCIsXG5cdFx0XHRcdHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcblx0XHRcdFx0cmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG5cdFx0XHRcdG9ic2VydmVyOiAoKSA9PiB7fSxcblx0XHRcdFx0bm90aWZ5OiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Zm5WYWx1ZVByb3A6IHtcblx0XHRcdFx0dHlwZTogQXJyYXksXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG59XG5cblByb3BlcnRpZXNNaXhpblRlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuZGVzY3JpYmUoXCJQcm9wZXJ0aWVzIE1peGluXCIsICgpID0+IHtcblx0bGV0IGNvbnRhaW5lcjtcblx0Y29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5cdGJlZm9yZSgoKSA9PiB7XG5cdFx0Y29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuXHRcdGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG5cdH0pO1xuXG5cdGFmdGVyKCgpID0+IHtcblx0XHRjb250YWluZXIucmVtb3ZlKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuXHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzXCIsICgpID0+IHtcblx0XHRhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuXHR9KTtcblxuXHRpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuXHRcdHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuXHRcdHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuXHRcdGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG5cdH0pO1xuXG5cdGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuXHRcdGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCAoZXZ0KSA9PiB7XG5cdFx0XHRhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG5cdFx0fSk7XG5cblx0XHRwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcblx0fSk7XG5cblx0aXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0YXNzZXJ0LmlzT2soQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSwgJ2Z1bmN0aW9uIGV4ZWN1dGVkJyk7XG5cdH0pO1xufSk7IiwiLyogICovXG5cblxuXG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoJyAnKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5leHBvcnQgZGVmYXVsdCBpcztcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG5cdGxldCBjaGVja3MgPSB7fTtcblx0Zm9yIChsZXQgaSA9IGxlbjsgaS0tOykge1xuXHRcdGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuXHRcdGNoZWNrc1t0eXBlXSA9IG9iaiA9PiBnZXRUeXBlKG9iaikgPT09IHR5cGU7XG5cdFx0Y2hlY2tzW3R5cGVdLmFsbCA9IGFsbChjaGVja3NbdHlwZV0pO1xuXHRcdGNoZWNrc1t0eXBlXS5hbnkgPSBhbnkoY2hlY2tzW3R5cGVdKTtcblx0fVxuXHRyZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuXHRsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcblx0aWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcblx0XHRsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHR0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG5cbmZ1bmN0aW9uIGFsbChmbikge1xuXHRyZXR1cm4gKC4uLnBhcmFtcykgPT4ge1xuXHRcdGNvbnN0IGxlbiA9IHBhcmFtcy5sZW5ndGg7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aWYgKCFmbihwYXJhbXNbaV0pKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG59XG5cbmZ1bmN0aW9uIGFueShmbikge1xuXHRyZXR1cm4gKC4uLnBhcmFtcykgPT4ge1xuXHRcdGNvbnN0IGxlbiA9IHBhcmFtcy5sZW5ndGg7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aWYgKGZuKHBhcmFtc1tpXSkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcbn1cbiIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvaXMuanMnO1xuXG5kZXNjcmliZSgnVHlwZSBDaGVja3MnLCAoKSA9PiB7XG5cdGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuXHRcdFx0bGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge3JldHVybiBhcmd1bWVudHN9O1xuXHRcdFx0bGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcblx0XHRcdGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG5cdFx0XHRleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG5cdFx0XHRsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7cmV0dXJuIGFyZ3VtZW50c307XG5cdFx0XHRsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuXHRcdFx0ZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuXHRcdFx0bGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge3JldHVybiBhcmd1bWVudHN9O1xuXHRcdFx0bGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcblx0XHRcdGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcblx0XHRcdGxldCBhcnJheSA9IFsndGVzdCddO1xuXHRcdFx0ZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuXHRcdFx0bGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuXHRcdFx0ZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuXHRcdH0pO1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuXHRcdFx0bGV0IGJvb2wgPSB0cnVlO1xuXHRcdFx0ZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuXHRcdFx0bGV0IG5vdEJvb2wgPSAndGVzdCc7XG5cdFx0XHRleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuXHRcdFx0ZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuXHRcdFx0bGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuXHRcdFx0ZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcblx0XHRcdGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0Jztcblx0XHRcdGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuXHRcdFx0bGV0IG5vdE51bGwgPSAndGVzdCc7XG5cdFx0XHRleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcblx0XHRcdGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG5cdFx0XHRleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuXHRcdH0pO1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuXHRcdFx0bGV0IG5vdE9iamVjdCA9ICd0ZXN0Jztcblx0XHRcdGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuXHRcdFx0bGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcblx0XHRcdGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcblx0XHRcdGxldCBub3RSZWdleHAgPSAndGVzdCc7XG5cdFx0XHRleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcblx0XHR9KTtcblx0XHRpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuXHRcdFx0ZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiJdLCJuYW1lcyI6WyJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiZG9jdW1lbnQiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtaWNyb1Rhc2tGbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwibWljcm9UYXNrIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYW5jZWwiLCJoYW5kbGUiLCJpZHgiLCJFcnJvciIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJyZXR1cm5WYWx1ZSIsInRhcmdldCIsInR5cGUiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJwYXJzZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwibWFwIiwicG9wIiwiYXNzaWduIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImFmdGVyIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwibGlzdGVuRXZlbnQiLCJkaXNwYXRjaCIsImRhdGEiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJvZmYiLCJoYW5kbGVyIiwiZXZ0Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJlbGVtZW50IiwicGFyZW50RWxlbWVudCIsInJlbW92ZUNoaWxkIiwiRXZlbnRzRW1pdHRlciIsImN1c3RvbUVsZW1lbnQiLCJFdmVudHNMaXN0ZW5lciIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwiZW1taXRlciIsImNyZWF0ZUVsZW1lbnQiLCJiZWZvcmUiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyRWFjaCIsInJlbW92ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJpdCIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImVxdWFsIiwiYSIsImRlZXAiLCJib2R5Iiwia2V5cyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJuYW1lIiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiYXNzZXJ0IiwiaXNPayIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsImlzIiwic2V0dXAiLCJjaGVja3MiLCJnZXRUeXBlIiwiYWxsIiwiYW55IiwibWF0Y2hlcyIsImZuIiwicGFyYW1zIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwiYmUiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwiYXJyYXkiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJmdW5jdGlvbiIsIm5vdEZ1bmN0aW9uIiwibnVsbCIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJvYmplY3QiLCJub3RPYmplY3QiLCJyZWdleHAiLCJSZWdFeHAiLCJub3RSZWdleHAiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztDQUFBO0FBQ0Esc0JB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
