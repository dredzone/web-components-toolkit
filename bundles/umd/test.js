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
  new MutationObserver(microTaskFlush).observe(microTaskNode, {
    characterData: true
  });

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
    var _HTMLElement = function HTMLElement() {
      // eslint-disable-line func-names
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

  describe('Events Mixin', function () {
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
    it('expect emitter to fireEvent and listener to handle an event', function () {
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

      Properties.prototype.propertiesChanged = function propertiesChanged(currentProps, changedProps, oldProps // eslint-disable-line no-unused-vars
      ) {};

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
          // eslint-disable-next-line no-console
          console.log('invalid value ' + newValue + ' for property ' + property + ' of\n\t\t\t\t\ttype ' + this.constructor.classProperties[property].type.name);
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

      Properties.prototype._shouldPropertiesChange = function _shouldPropertiesChange(currentProps, changedProps, oldProps // eslint-disable-line no-unused-vars
      ) {
        return Boolean(changedProps);
      };

      Properties.prototype._shouldPropertyChange = function _shouldPropertyChange(property, value, old) {
        return (
          // Strict equality check
          old !== value && (
          // This ensures (old==NaN, value==NaN) always returns false
          old === old || value === value) // eslint-disable-line no-self-compare

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
                propertiesConfig = assign(getPropertiesConfig(), // $FlowFixMe
                normalizeProperties(checkObj.properties));
              }
            }
            if (this.properties) {
              // $FlowFixMe
              propertiesConfig = assign(getPropertiesConfig(), // $FlowFixMe
              normalizeProperties(this.properties));
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
            value: 'prop',
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

  describe('Properties Mixin', function () {
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

    it('properties', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvZG9tL3JlbW92ZS1lbGVtZW50LmpzIiwiLi4vLi4vdGVzdC93ZWItY29tcG9uZW50cy9ldmVudHMudGVzdC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMudGVzdC5qcyIsIi4uLy4uL2xpYi9pcy5qcyIsIi4uLy4uL3Rlc3QvaXMudGVzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCAoXG4gIGJhc2VDbGFzc1xuKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKFxuICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgIG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWVcbiAgICApIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmUgPSBmYWxzZVxuKSA9PiB7XG4gIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9kb20vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyczogW11cbiAgICB9O1xuICB9KTtcbiAgY29uc3QgZXZlbnREZWZhdWx0UGFyYW1zID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEV2ZW50cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGFmdGVyKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IGBvbiR7ZXZlbnQudHlwZX1gO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW2hhbmRsZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICB0aGlzW2hhbmRsZV0oZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB0aGlzLm93bihsaXN0ZW5FdmVudCh0aGlzLCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIG9mZigpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgaGFuZGxlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG93biguLi5oYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGNvbnRleHQub2ZmKCk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50KSA9PiB7XG4gIGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn07XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9kb20vcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ0V2ZW50cyBNaXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIHJlbW92ZUVsZW1lbnQoZW1taXRlcik7XG4gICAgcmVtb3ZlRWxlbWVudChsaXN0ZW5lcik7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzTWl4aW5UZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc01peGluVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5kZXNjcmliZSgnUHJvcGVydGllcyBNaXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIucmVtb3ZlKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzTWl4aW5UZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc01peGluVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuXG5cblxuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuICAnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuY29uc3QgaXMgPSBzZXR1cCgpO1xuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gYWxsKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGFueShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUob2JqKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChvYmopO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cblxuZnVuY3Rpb24gYWxsKGZuKSB7XG4gIHJldHVybiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgY29uc3QgbGVuID0gcGFyYW1zLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoIWZuKHBhcmFtc1tpXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYW55KGZuKSB7XG4gIHJldHVybiAoLi4ucGFyYW1zKSA9PiB7XG4gICAgY29uc3QgbGVuID0gcGFyYW1zLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoZm4ocGFyYW1zW2ldKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi9pcy5qcyc7XG5cbmRlc2NyaWJlKCdUeXBlIENoZWNrcycsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl0sIm5hbWVzIjpbImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsIkVycm9yIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsInJldHVyblZhbHVlIiwidGFyZ2V0IiwidHlwZSIsImxpc3RlbmVyIiwiY2FwdHVyZSIsInBhcnNlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJtYXAiLCJwb3AiLCJhc3NpZ24iLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiYWZ0ZXIiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJsaXN0ZW5FdmVudCIsImRpc3BhdGNoIiwiZGF0YSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsIm9mZiIsImhhbmRsZXIiLCJldnQiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImVsZW1lbnQiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJFdmVudHNFbWl0dGVyIiwiY3VzdG9tRWxlbWVudCIsIkV2ZW50c0xpc3RlbmVyIiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJlbW1pdGVyIiwiY3JlYXRlRWxlbWVudCIsImJlZm9yZSIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXJFYWNoIiwicmVtb3ZlRWxlbWVudCIsImlubmVySFRNTCIsIml0Iiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiZXF1YWwiLCJhIiwiZGVlcCIsImJvZHkiLCJrZXlzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsIlByb3BlcnRpZXNNaXhpblRlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsInByb3BlcnRpZXNNaXhpblRlc3QiLCJhc3NlcnQiLCJpc09rIiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwiaXMiLCJzZXR1cCIsImNoZWNrcyIsImdldFR5cGUiLCJhbGwiLCJhbnkiLCJtYXRjaGVzIiwiZm4iLCJwYXJhbXMiLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJiZSIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJhcnJheSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsImZ1bmN0aW9uIiwibm90RnVuY3Rpb24iLCJudWxsIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm9iamVjdCIsIm5vdE9iamVjdCIsInJlZ2V4cCIsIlJlZ0V4cCIsIm5vdFJlZ2V4cCIsInN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0VBQUE7QUFDQSx1QkFBZSxZQUVWO0VBQUEsTUFESEEsT0FDRyx1RUFET0MsT0FBT0MsTUFBUCxDQUFjQyxJ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
