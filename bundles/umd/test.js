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
  var all = (function (arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.every(fn);
  });

  /*  */
  var any = (function (arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.some(fn);
  });

  /*  */

  /*  */

  var doAllApi = function doAllApi(fn) {
  	return function () {
  		for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
  			params[_key] = arguments[_key];
  		}

  		return all(params, fn);
  	};
  };
  var doAnyApi = function doAnyApi(fn) {
  	return function () {
  		for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
  			params[_key2] = arguments[_key2];
  		}

  		return any(params, fn);
  	};
  };
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
  		checks[type].all = doAllApi(checks[type]);
  		checks[type].any = doAnyApi(checks[type]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvZG9tL3JlbW92ZS1lbGVtZW50LmpzIiwiLi4vLi4vdGVzdC93ZWItY29tcG9uZW50cy9ldmVudHMudGVzdC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMudGVzdC5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbGwuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL2lzLmpzIiwiLi4vLi4vdGVzdC9pcy50ZXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KVxuKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmxldCBtaWNyb1Rhc2tDdXJySGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tMYXN0SGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tDYWxsYmFja3MgPSBbXTtcbmxldCBtaWNyb1Rhc2tOb2RlQ29udGVudCA9IDA7XG5sZXQgbWljcm9UYXNrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKG1pY3JvVGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvVGFza05vZGUsIHtcbiAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxufSk7XG5cblxuLyoqXG4gKiBCYXNlZCBvbiBQb2x5bWVyLmFzeW5jXG4gKi9cbmNvbnN0IG1pY3JvVGFzayA9IHtcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvVGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGNhbGxiYWNrKSB7XG4gICAgbWljcm9UYXNrTm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhtaWNyb1Rhc2tOb2RlQ29udGVudCsrKTtcbiAgICBtaWNyb1Rhc2tDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIG1pY3JvVGFza0N1cnJIYW5kbGUrKztcbiAgfSxcblxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYG1pY3JvVGFza2AgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbWljcm9UYXNrTGFzdEhhbmRsZTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGlmICghbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgICB9XG4gICAgICBtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWNyb1Rhc2s7XG5cbmZ1bmN0aW9uIG1pY3JvVGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb1Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm9UYXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbWljcm9UYXNrQ2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBtaWNyb1Rhc2tMYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgYmFzZUNsYXNzXG4pID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZSA9IGZhbHNlXG4pID0+IHtcbiAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiLyogICovXG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnRXZlbnRzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgcmVtb3ZlRWxlbWVudChlbW1pdGVyKTtcbiAgICByZW1vdmVFbGVtZW50KGxpc3RlbmVyKTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID1cbiAgICAgIGNvbmZpZy5oYXNPYnNlcnZlciAmJiB0eXBlb2YgY29uZmlnLm9ic2VydmVyID09PSAnc3RyaW5nJztcbiAgICBjb25maWcuaXNTdHJpbmcgPSBjb25maWcudHlwZSA9PT0gU3RyaW5nO1xuICAgIGNvbmZpZy5pc051bWJlciA9IGNvbmZpZy50eXBlID09PSBOdW1iZXI7XG4gICAgY29uZmlnLmlzQm9vbGVhbiA9IGNvbmZpZy50eXBlID09PSBCb29sZWFuO1xuICAgIGNvbmZpZy5pc09iamVjdCA9IGNvbmZpZy50eXBlID09PSBPYmplY3Q7XG4gICAgY29uZmlnLmlzQXJyYXkgPSBjb25maWcudHlwZSA9PT0gQXJyYXk7XG4gICAgY29uZmlnLmlzRGF0ZSA9IGNvbmZpZy50eXBlID09PSBEYXRlO1xuICAgIGNvbmZpZy5ub3RpZnkgPSAnbm90aWZ5JyBpbiBjb25maWc7XG4gICAgY29uZmlnLnJlYWRPbmx5ID0gJ3JlYWRPbmx5JyBpbiBjb25maWcgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcbiAgICBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID1cbiAgICAgICdyZWZsZWN0VG9BdHRyaWJ1dGUnIGluIGNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGVcbiAgICAgICAgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG4gICAgICBvdXRwdXRbbmFtZV0gPVxuICAgICAgICB0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgPyB7IHR5cGU6IHByb3BlcnR5IH0gOiBwcm9wZXJ0eTtcbiAgICAgIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzc2lnbihjb250ZXh0LCBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyk7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICB9XG4gICAgICBjb250ZXh0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIGNvbnRleHQuX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzXG4gICAgKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKS5tYXAoKHByb3BlcnR5KSA9PlxuICAgICAgICAgIHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpXG4gICAgICAgICkgfHwgW11cbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBiZWZvcmUoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSwgJ2F0dHJpYnV0ZUNoYW5nZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpLCAncHJvcGVydGllc0NoYW5nZWQnKSh0aGlzKTtcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpIHtcbiAgICAgIGxldCBwcm9wZXJ0eSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdO1xuICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCBoeXBlblJlZ0V4ID0gLy0oW2Etel0pL2c7XG4gICAgICAgIHByb3BlcnR5ID0gYXR0cmlidXRlLnJlcGxhY2UoaHlwZW5SZWdFeCwgbWF0Y2ggPT5cbiAgICAgICAgICBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSB7XG4gICAgICBsZXQgYXR0cmlidXRlID0gcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCB1cHBlcmNhc2VSZWdFeCA9IC8oW0EtWl0pL2c7XG4gICAgICAgIGF0dHJpYnV0ZSA9IHByb3BlcnR5LnJlcGxhY2UodXBwZXJjYXNlUmVnRXgsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjbGFzc1Byb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByb3BlcnRpZXNDb25maWcpIHtcbiAgICAgICAgY29uc3QgZ2V0UHJvcGVydGllc0NvbmZpZyA9ICgpID0+IHByb3BlcnRpZXNDb25maWcgfHwge307XG4gICAgICAgIGxldCBjaGVja09iaiA9IG51bGw7XG4gICAgICAgIGxldCBsb29wID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZSAobG9vcCkge1xuICAgICAgICAgIGNoZWNrT2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrT2JqID09PSBudWxsID8gdGhpcyA6IGNoZWNrT2JqKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY2hlY2tPYmogfHxcbiAgICAgICAgICAgICFjaGVja09iai5jb25zdHJ1Y3RvciB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEhUTUxFbGVtZW50IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gRnVuY3Rpb24gfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBjaGVja09iai5jb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbG9vcCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoY2hlY2tPYmosICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKGNoZWNrT2JqLnByb3BlcnRpZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcbiAgICAgIGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShcbiAgICAgICAgICBhdHRyaWJ1dGVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldXG4gICAgICAgIC50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzTnVtYmVyLFxuICAgICAgICBpc0FycmF5LFxuICAgICAgICBpc0Jvb2xlYW4sXG4gICAgICAgIGlzRGF0ZSxcbiAgICAgICAgaXNTdHJpbmcsXG4gICAgICAgIGlzT2JqZWN0XG4gICAgICB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPVxuICAgICAgICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gaXNBcnJheVxuICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgOiB7fVxuICAgICAgICAgICAgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbXG4gICAgICAgIHByb3BlcnR5XG4gICAgICBdO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdQcm9wZXJ0aWVzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzTWl4aW5UZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5yZW1vdmUocHJvcGVydGllc01peGluVGVzdCk7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQge2RlZmF1bHQgYXMgYWxsfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG5leHBvcnQge2RlZmF1bHQgYXMgYW55fSBmcm9tICcuL2FycmF5L2FueS5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7YWxsLCBhbnl9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoJyAnKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcblx0bGV0IGNoZWNrcyA9IHt9O1xuXHRmb3IgKGxldCBpID0gbGVuOyBpLS07KSB7XG5cdFx0Y29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG5cdFx0Y2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcblx0XHRjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcblx0XHRjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcblx0fVxuXHRyZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuXHRsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcblx0aWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcblx0XHRsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHR0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL2lzLmpzJztcblxuZGVzY3JpYmUoJ1R5cGUgQ2hlY2tzJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXSwibmFtZXMiOlsiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImxlbmd0aCIsImRlZmluZVByb3BlcnR5IiwiaSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImRvY3VtZW50IiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwibWljcm9UYXNrRmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsIm1pY3JvVGFzayIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiRXJyb3IiLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwicmV0dXJuVmFsdWUiLCJ0YXJnZXQiLCJ0eXBlIiwibGlzdGVuZXIiLCJjYXB0dXJlIiwicGFyc2UiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsIm1hcCIsInBvcCIsImFzc2lnbiIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJhZnRlciIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImxpc3RlbkV2ZW50IiwiZGlzcGF0Y2giLCJkYXRhIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwib2ZmIiwiaGFuZGxlciIsImV2dCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsIkV2ZW50c0VtaXR0ZXIiLCJjdXN0b21FbGVtZW50IiwiRXZlbnRzTGlzdGVuZXIiLCJkZXNjcmliZSIsImNvbnRhaW5lciIsImVtbWl0ZXIiLCJjcmVhdGVFbGVtZW50IiwiYmVmb3JlIiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlckVhY2giLCJyZW1vdmVFbGVtZW50IiwiaW5uZXJIVE1MIiwiaXQiLCJzdG9wRXZlbnQiLCJjaGFpIiwiZXhwZWN0IiwidG8iLCJlcXVhbCIsImEiLCJkZWVwIiwiYm9keSIsImtleXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwibmFtZSIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwicHJvcGVydGllc01peGluVGVzdCIsImFzc2VydCIsImlzT2siLCJhcnIiLCJmbiIsImV2ZXJ5Iiwic29tZSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJpcyIsInNldHVwIiwiY2hlY2tzIiwiZ2V0VHlwZSIsIm1hdGNoZXMiLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJiZSIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJhcnJheSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsImZ1bmN0aW9uIiwibm90RnVuY3Rpb24iLCJudWxsIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm9iamVjdCIsIm5vdE9iamVjdCIsInJlZ2V4cCIsIlJlZ0V4cCIsIm5vdFJlZ2V4cCIsInN0cmlu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
