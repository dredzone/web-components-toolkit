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

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvZG9tL3JlbW92ZS1lbGVtZW50LmpzIiwiLi4vLi4vdGVzdC93ZWItY29tcG9uZW50cy9ldmVudHMudGVzdC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMudGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KSkgPT4ge1xuXHRsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuXHRyZXR1cm4gKG9iaikgPT4ge1xuXHRcdGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuXHRcdGlmICghdmFsdWUpIHtcblx0XHRcdHN0b3JlLnNldChvYmosIHZhbHVlID0gY3JlYXRvcihvYmopKTtcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YXJncy51bnNoaWZ0KG1ldGhvZCk7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBrbGFzcztcblx0fTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge2NoYXJhY3RlckRhdGE6IHRydWV9KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuXHQvKipcblx0ICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cblx0ICpcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG5cdCAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG5cdCAqL1xuXHRydW4oY2FsbGJhY2spIHtcblx0XHRtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuXHRcdG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XHRyZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcblx0ICovXG5cdGNhbmNlbChoYW5kbGUpIHtcblx0XHRjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuXHRcdGlmIChpZHggPj0gMCkge1xuXHRcdFx0aWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcblx0XHRcdH1cblx0XHRcdG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG5cdGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG5cdFx0aWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y2IoKTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG5cdG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcblx0Y29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuXG5cdH07XG5cdF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuXHRnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuXHRcdCdjb25uZWN0ZWRDYWxsYmFjaycsXG5cdFx0J2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcblx0XHQnYWRvcHRlZENhbGxiYWNrJyxcblx0XHQnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuXHRdO1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5fSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cblx0aWYgKCFiYXNlQ2xhc3MpIHtcblx0XHRiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXG5cdFx0fVxuXG5cdFx0c3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG5cdFx0XHRjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuXHRcdFx0aWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcblx0XHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdFx0Y3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcblx0XHRcdFx0XHRpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcblx0XHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdFx0dmFsdWUoKSB7fSxcblx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZygwLCAoY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoKSk7XG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuXHRcdFx0XHRcdGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcblx0XHRcdFx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoLi4uYXJncykge1xuXHRcdFx0XHRcdFx0XHR0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmZpbmFsaXplQ2xhc3MoKTtcblx0XHRcdFx0YXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRcdGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdFx0XHRhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcblx0XHRcdFx0cmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGdldCBpbml0aWFsaXplZCgpIHtcblx0XHRcdHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG5cdFx0XHRzdXBlciguLi5hcmdzKTtcblx0XHRcdHRoaXMuY29uc3RydWN0KCk7XG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0KCkge1xuXG5cdFx0fVxuXG5cdFx0LyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cblx0XHRhdHRyaWJ1dGVDaGFuZ2VkKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuXG5cdFx0fVxuXHRcdC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuXHRcdGNvbm5lY3RlZCgpIHtcblxuXHRcdH1cblxuXHRcdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHRcdH1cblxuXHRcdGFkb3B0ZWQoKSB7XG5cblx0XHR9XG5cblx0XHRyZW5kZXIoKSB7XG5cblx0XHR9XG5cblx0XHRfb25SZW5kZXIoKSB7XG5cblx0XHR9XG5cblx0XHRfcG9zdFJlbmRlcigpIHtcblxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjb25uZWN0ZWRDYWxsYmFjaykge1xuXHRcdFx0Y29uc3QgY29udGV4dCA9IHRoaXM7XG5cdFx0XHRwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuXHRcdFx0aWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuXHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHRcdGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG5cdFx0XHRcdGNvbnRleHQucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHJlbmRlckNhbGxiYWNrKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG5cdFx0XHRcdHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG5cdFx0XHRcdG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcblx0XHRcdFx0XHRcdHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuXHRcdFx0XHRcdFx0cmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcblx0XHRcdFx0XHRcdGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdFx0bWljcm9UYXNrLnJ1bigoKSA9PiB7XG5cdFx0XHRcdGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG5cdFx0XHRcdFx0cHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdFx0XHRkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGtsYXNzKSB7XG5cdFx0Y29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG5cdFx0Y29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuXHRcdGNvbnN0IHtkZWZpbmVQcm9wZXJ0eX0gPSBPYmplY3Q7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0Y29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuXHRcdFx0Y29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG5cdFx0XHRkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuXHRcdFx0XHR2YWx1ZTogZnVuY3Rpb24gKC4uLmFyZ3MpIHtcblx0XHRcdFx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRcdFx0XHRiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBrbGFzcztcblx0fTtcbn07XG4iLCIvKiAgKi9cblxuZXhwb3J0IGRlZmF1bHQgKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUgPSBmYWxzZSkgPT4ge1xuXHRyZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59O1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG5cdGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG5cdFx0bGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuXHRcdGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRyZW1vdmUoKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG5cdFx0XHRcdGxldCBoYW5kbGU7XG5cdFx0XHRcdHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcblx0XHRcdFx0XHRoYW5kbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHt9IGZyb20gJy4uL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7YXNzaWdufSA9IE9iamVjdDtcblx0Y29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGFuZGxlcnM6IFtdXG5cdFx0fTtcblx0fSk7XG5cdGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcblx0XHRidWJibGVzOiBmYWxzZSxcblx0XHRjYW5jZWxhYmxlOiBmYWxzZVxuXHR9O1xuXG5cdHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG5cdFx0c3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG5cdFx0XHRzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG5cdFx0XHRhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuXHRcdH1cblxuXHRcdGhhbmRsZUV2ZW50KGV2ZW50KSB7XG5cdFx0XHRjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcblx0XHRcdGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vICRGbG93Rml4TWVcblx0XHRcdFx0dGhpc1toYW5kbGVdKGV2ZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuXHRcdFx0dGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcblx0XHR9XG5cblx0XHRkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywge2RldGFpbDogZGF0YX0pKSk7XG5cdFx0fVxuXG5cdFx0b2ZmKCkge1xuXHRcdFx0cHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuXHRcdFx0XHRoYW5kbGVyLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0b3duKC4uLmhhbmRsZXJzKSB7XG5cdFx0XHRoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGNvbnRleHQub2ZmKCk7XG5cdFx0fTtcblx0fVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGV2dCkgPT4ge1xuXHRpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuXHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fVxuXHRldnQucHJldmVudERlZmF1bHQoKTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50KSA9PiB7XG5cdGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcblx0XHRlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9kb20vcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRjb25uZWN0ZWQoKSB7XG5cblx0fVxuXG5cdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHR9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRjb25uZWN0ZWQoKSB7XG5cblx0fVxuXG5cdGRpc2Nvbm5lY3RlZCgpIHtcblxuXHR9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoXCJFdmVudHMgTWl4aW5cIiwgKCkgPT4ge1xuXHRsZXQgY29udGFpbmVyO1xuXHRjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcblx0Y29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuXHRiZWZvcmUoKCkgPT4ge1xuXHRcdGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcblx0XHRsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG5cdFx0Y29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG5cdH0pO1xuXG5cdGFmdGVyRWFjaCgoKSA9PiB7XG5cdFx0cmVtb3ZlRWxlbWVudChlbW1pdGVyKTtcblx0XHRyZW1vdmVFbGVtZW50KGxpc3RlbmVyKTtcblx0XHRjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cdH0pO1xuXHRpdChcImV4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50XCIsICgpID0+IHtcblx0XHRsaXN0ZW5lci5vbignaGknLCAoZXZ0KSA9PiB7XG5cdFx0XHRzdG9wRXZlbnQoZXZ0KTtcblx0XHRcdGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuXHRcdFx0Y2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG5cdFx0XHRjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHtib2R5OiAnZ3JlZXRpbmcnfSk7XG5cdFx0fSk7XG5cdFx0ZW1taXRlci5kaXNwYXRjaCgnaGknLCB7Ym9keTogJ2dyZWV0aW5nJ30pO1xuXHR9KTtcbn0pOyIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcblx0cmV0dXJuIGZ1bmN0aW9uIChrbGFzcykge1xuXHRcdGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuXHRcdGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcblx0XHRjb25zdCB7ZGVmaW5lUHJvcGVydHl9ID0gT2JqZWN0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcblx0XHRcdGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuXHRcdFx0ZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcblx0XHRcdFx0dmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG5cdFx0XHRcdFx0YmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXHRcdFx0XHRcdHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGtsYXNzO1xuXHR9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuXHRjb25zdCB7ZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbn0gPSBPYmplY3Q7XG5cdGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuXHRjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG5cdGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5cdGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG5cdGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuXHRmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG5cdFx0Y29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG5cdFx0Y29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcblx0XHRjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuXHRcdGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcblx0XHRjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuXHRcdGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuXHRcdGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcblx0XHRjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuXHRcdGNvbmZpZy5yZWFkT25seSA9ICgncmVhZE9ubHknIGluIGNvbmZpZykgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcblx0XHRjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID0gJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnID9cblx0XHRcdGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG5cdH1cblxuXHRmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcblx0XHRjb25zdCBvdXRwdXQgPSB7fTtcblx0XHRmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG5cdFx0XHRvdXRwdXRbbmFtZV0gPSAodHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nKSA/IHt0eXBlOiBwcm9wZXJ0eX0gOiBwcm9wZXJ0eTtcblx0XHRcdGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuXHRcdFx0XHRwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gdGhpcztcblx0XHRcdGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcblx0XHRcdFx0Y29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHtcblx0XHRcdGxldCBjb250ZXh0ID0gdGhpcztcblx0XHRcdE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3Qge25vdGlmeSwgaGFzT2JzZXJ2ZXIsIHJlZmxlY3RUb0F0dHJpYnV0ZSwgaXNPYnNlcnZlclN0cmluZywgb2JzZXJ2ZXJ9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0XHRpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcblx0XHRcdFx0XHR0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobm90aWZ5KSB7XG5cdFx0XHRcdFx0Y29udGV4dC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcblx0XHRcdFx0XHRcdGRldGFpbDoge1xuXHRcdFx0XHRcdFx0XHRuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0b2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKVxuXHRcdFx0XHQubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuXHRcdFx0c3VwZXIuZmluYWxpemVDbGFzcygpO1xuXHRcdFx0YmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHRiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG5cdFx0XHR0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG5cdFx0XHRsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcblx0XHRcdGlmICghcHJvcGVydHkpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuXHRcdFx0XHRwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuXHRcdFx0XHRhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3BlcnR5O1xuXHRcdH1cblxuXHRcdHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuXHRcdFx0bGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuXHRcdFx0aWYgKCFhdHRyaWJ1dGUpIHtcblx0XHRcdFx0Ly8gQ29udmVydCBhbmQgbWVtb2l6ZS5cblx0XHRcdFx0Y29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuXHRcdFx0XHRhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0cHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXR0cmlidXRlO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG5cdFx0XHRcdGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuXHRcdFx0XHRsZXQgY2hlY2tPYmogPSBudWxsO1xuXHRcdFx0XHRsZXQgbG9vcCA9IHRydWU7XG5cblx0XHRcdFx0d2hpbGUgKGxvb3ApIHtcblx0XHRcdFx0XHRjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG5cdFx0XHRcdFx0aWYgKCFjaGVja09iaiB8fCAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcblx0XHRcdFx0XHRcdGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuXHRcdFx0XHRcdFx0Y2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG5cdFx0XHRcdFx0XHRjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0XHRcdGxvb3AgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG5cdFx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKGdldFByb3BlcnRpZXNDb25maWcoKSwgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLnByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0XHRcdFx0cHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuXHRcdH1cblxuXHRcdHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0Y29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcblx0XHRcdGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2ApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcblx0XHRcdFx0aWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3QoKSB7XG5cdFx0XHRzdXBlci5jb25zdHJ1Y3QoKTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcblx0XHRcdHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuXHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcblx0XHR9XG5cblx0XHRwcm9wZXJ0aWVzQ2hhbmdlZChjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuXG5cdFx0fVxuXG5cdFx0X2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG5cdFx0XHRpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcblx0XHRcdFx0ZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG5cdFx0XHRcdGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG5cdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNldDogcmVhZE9ubHkgPyAoKSA9PiB7fSA6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdH1cblxuXHRcdF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcblx0XHRcdGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuXHRcdFx0XHRcdHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZiBcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJyA/XG5cdFx0XHRcdFx0ZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcblx0XHRcdFx0dGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcblx0XHRcdE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdFx0aWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0X2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKTtcblx0XHRcdFx0dGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGU7XG5cdFx0XHRsZXQgaXNWYWxpZCA9IGZhbHNlO1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0aXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlzVmFsaWQ7XG5cdFx0fVxuXG5cdFx0X3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG5cdFx0XHRwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG5cdFx0XHRjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcblx0XHRcdHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG5cdFx0XHRcdHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHtpc051bWJlciwgaXNBcnJheSwgaXNCb29sZWFuLCBpc0RhdGUsIGlzU3RyaW5nLCBpc09iamVjdH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG5cdFx0XHRpZiAoaXNCb29sZWFuKSB7XG5cdFx0XHRcdHZhbHVlID0gKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpO1xuXHRcdFx0fSBlbHNlIGlmIChpc051bWJlcikge1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuXHRcdFx0fSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGlzQXJyYXkgPyBudWxsIDoge30gOiBKU09OLnBhcnNlKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAoaXNEYXRlKSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblxuXHRcdF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0Y29uc3Qge2lzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXl9ID0gcHJvcGVydHlDb25maWc7XG5cblx0XHRcdGlmIChpc0Jvb2xlYW4pIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cblx0XHRfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuXHRcdFx0bGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuXHRcdFx0bGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG5cdFx0XHRpZiAoY2hhbmdlZCkge1xuXHRcdFx0XHRpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG5cdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcblx0XHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cblx0XHRcdFx0aWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuXHRcdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNoYW5nZWQ7XG5cdFx0fVxuXG5cdFx0X2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuXHRcdFx0aWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG5cdFx0XHRcdG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuXHRcdFx0XHRcdFx0cHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZsdXNoUHJvcGVydGllcygpIHtcblx0XHRcdGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcblx0XHRcdGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuXHRcdFx0Y29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuXHRcdFx0aWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuXHRcdFx0XHRwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG5cdFx0XHRcdHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuXHRcdFx0XHR0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcblx0XHRcdHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG5cdFx0fVxuXG5cdFx0X3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcblx0XHRcdFx0KG9sZCAhPT0gdmFsdWUgJiZcblx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuXHRcdFx0XHRcdChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuXHRzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHByb3A6IHtcblx0XHRcdFx0dHlwZTogU3RyaW5nLFxuXHRcdFx0XHR2YWx1ZTogXCJwcm9wXCIsXG5cdFx0XHRcdHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcblx0XHRcdFx0cmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG5cdFx0XHRcdG9ic2VydmVyOiAoKSA9PiB7fSxcblx0XHRcdFx0bm90aWZ5OiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Zm5WYWx1ZVByb3A6IHtcblx0XHRcdFx0dHlwZTogQXJyYXksXG5cdFx0XHRcdHZhbHVlOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9XG59XG5cblByb3BlcnRpZXNNaXhpblRlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuZGVzY3JpYmUoXCJQcm9wZXJ0aWVzIE1peGluXCIsICgpID0+IHtcblx0bGV0IGNvbnRhaW5lcjtcblx0Y29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5cdGJlZm9yZSgoKSA9PiB7XG5cdFx0Y29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuXHRcdGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG5cdH0pO1xuXG5cdGFmdGVyKCgpID0+IHtcblx0XHRjb250YWluZXIucmVtb3ZlKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuXHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzXCIsICgpID0+IHtcblx0XHRhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuXHR9KTtcblxuXHRpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuXHRcdHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuXHRcdHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuXHRcdGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG5cdH0pO1xuXG5cdGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuXHRcdGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCAoZXZ0KSA9PiB7XG5cdFx0XHRhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG5cdFx0fSk7XG5cblx0XHRwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcblx0fSk7XG5cblx0aXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0YXNzZXJ0LmlzT2soQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSwgJ2Z1bmN0aW9uIGV4ZWN1dGVkJyk7XG5cdH0pO1xufSk7Il0sIm5hbWVzIjpbImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsIkVycm9yIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsInJldHVyblZhbHVlIiwidGFyZ2V0IiwidHlwZSIsImxpc3RlbmVyIiwiY2FwdHVyZSIsInBhcnNlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJtYXAiLCJwb3AiLCJhc3NpZ24iLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiYWZ0ZXIiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJsaXN0ZW5FdmVudCIsImRpc3BhdGNoIiwiZGF0YSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsIm9mZiIsImhhbmRsZXIiLCJldnQiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJFdmVudHNFbWl0dGVyIiwiY3VzdG9tRWxlbWVudCIsIkV2ZW50c0xpc3RlbmVyIiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJlbW1pdGVyIiwiY3JlYXRlRWxlbWVudCIsImJlZm9yZSIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXJFYWNoIiwicmVtb3ZlRWxlbWVudCIsImlubmVySFRNTCIsIml0Iiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiZXF1YWwiLCJhIiwiZGVlcCIsImJvZHkiLCJrZXlzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsIlByb3BlcnRpZXNNaXhpblRlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsInByb3BlcnRpZXNNaXhpblRlc3QiLCJhc3NlcnQiLCJpc09rIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Q0FBQTtBQUNBLHNCQUFlLFlBQWtEO0NBQUEsS0FBakRBLE9BQWlELHVFQUF2Q0MsT0FBT0MsTUFBUCxDQUFjQyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEVBQS9CLENB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
