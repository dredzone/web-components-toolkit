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
  var any = (function (arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.some(fn);
  });

  /*  */
  var all = (function (arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.every(fn);
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
  var types = 'Map Set Symbol Array Object String Date RegExp Function Boolean Number Null Undefined Arguments Error'.split(' ');
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

  /*  */

  var clone = (function (src) {
    return clone$1(src, [], []);
  });

  function clone$1(src, circulars, clones) {
    // Null/undefined/functions/etc
    if (!src || !is.object(src) || is.function(src)) {
      return src;
    }

    // Date
    if (is.date(src)) {
      return new Date(src.getTime());
    }

    // RegExp
    if (is.regexp(src)) {
      return new RegExp(src);
    }

    // Arrays
    if (is.array(src)) {
      return src.map(clone$1);
    }

    // ES6 Maps
    if (is.map(src)) {
      return new Map(Array.from(src.entries()));
    }

    // ES6 Sets
    if (is.set(src)) {
      return new Set(Array.from(src.values()));
    }

    // Object
    if (is.object(src)) {
      circulars.push(src);
      var obj = Object.create(src);
      clones.push(obj);

      var _loop = function _loop(key) {
        var idx = circulars.findIndex(function (i) {
          return i === src[key];
        });
        obj[key] = idx > -1 ? clones[idx] : clone$1(src[key], circulars, clones);
      };

      for (var key in src) {
        _loop(key);
      }
      return obj;
    }

    return src;
  }

  describe('Clone', function () {
  	describe('primitives', function () {
  		it('Returns equal data for Null/undefined/functions/etc', function () {
  			// Null
  			expect(clone(null)).to.be.null;

  			// Undefined
  			expect(clone()).to.be.undefined;

  			// Function
  			var func = function func() {};
  			assert.isFunction(clone(func), 'is a function');

  			// Etc: numbers and string
  			assert.equal(clone(5), 5);
  			assert.equal(clone('string'), 'string');
  			assert.equal(clone(false), false);
  			assert.equal(clone(true), true);
  		});
  	});
  });

  describe('Type', function () {
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

    describe('map', function () {
      it('should return true if passed parameter type is Map', function () {
        expect(is.map(new Map())).to.be.true;
      });
      it('should return false if passed parameter type is not Map', function () {
        expect(is.map(null)).to.be.false;
        expect(is.map(Object.create(null))).to.be.false;
      });
    });

    describe('set', function () {
      it('should return true if passed parameter type is Set', function () {
        expect(is.set(new Set())).to.be.true;
      });
      it('should return false if passed parameter type is not Set', function () {
        expect(is.set(null)).to.be.false;
        expect(is.set(Object.create(null))).to.be.false;
      });
    });
  });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYWZ0ZXIuanMiLCIuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMiLCIuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvZG9tL3JlbW92ZS1lbGVtZW50LmpzIiwiLi4vLi4vdGVzdC93ZWItY29tcG9uZW50cy9ldmVudHMudGVzdC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMudGVzdC5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUudGVzdC5qcyIsIi4uLy4uL3Rlc3QvdHlwZS50ZXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KVxuKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmxldCBtaWNyb1Rhc2tDdXJySGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tMYXN0SGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tDYWxsYmFja3MgPSBbXTtcbmxldCBtaWNyb1Rhc2tOb2RlQ29udGVudCA9IDA7XG5sZXQgbWljcm9UYXNrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKG1pY3JvVGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvVGFza05vZGUsIHtcbiAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxufSk7XG5cblxuLyoqXG4gKiBCYXNlZCBvbiBQb2x5bWVyLmFzeW5jXG4gKi9cbmNvbnN0IG1pY3JvVGFzayA9IHtcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvVGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGNhbGxiYWNrKSB7XG4gICAgbWljcm9UYXNrTm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhtaWNyb1Rhc2tOb2RlQ29udGVudCsrKTtcbiAgICBtaWNyb1Rhc2tDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIG1pY3JvVGFza0N1cnJIYW5kbGUrKztcbiAgfSxcblxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYG1pY3JvVGFza2AgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbWljcm9UYXNrTGFzdEhhbmRsZTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGlmICghbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgICB9XG4gICAgICBtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWNyb1Rhc2s7XG5cbmZ1bmN0aW9uIG1pY3JvVGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb1Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm9UYXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbWljcm9UYXNrQ2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBtaWNyb1Rhc2tMYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgYmFzZUNsYXNzXG4pID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZSA9IGZhbHNlXG4pID0+IHtcbiAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiLyogICovXG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2RvbS9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnRXZlbnRzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgcmVtb3ZlRWxlbWVudChlbW1pdGVyKTtcbiAgICByZW1vdmVFbGVtZW50KGxpc3RlbmVyKTtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID1cbiAgICAgIGNvbmZpZy5oYXNPYnNlcnZlciAmJiB0eXBlb2YgY29uZmlnLm9ic2VydmVyID09PSAnc3RyaW5nJztcbiAgICBjb25maWcuaXNTdHJpbmcgPSBjb25maWcudHlwZSA9PT0gU3RyaW5nO1xuICAgIGNvbmZpZy5pc051bWJlciA9IGNvbmZpZy50eXBlID09PSBOdW1iZXI7XG4gICAgY29uZmlnLmlzQm9vbGVhbiA9IGNvbmZpZy50eXBlID09PSBCb29sZWFuO1xuICAgIGNvbmZpZy5pc09iamVjdCA9IGNvbmZpZy50eXBlID09PSBPYmplY3Q7XG4gICAgY29uZmlnLmlzQXJyYXkgPSBjb25maWcudHlwZSA9PT0gQXJyYXk7XG4gICAgY29uZmlnLmlzRGF0ZSA9IGNvbmZpZy50eXBlID09PSBEYXRlO1xuICAgIGNvbmZpZy5ub3RpZnkgPSAnbm90aWZ5JyBpbiBjb25maWc7XG4gICAgY29uZmlnLnJlYWRPbmx5ID0gJ3JlYWRPbmx5JyBpbiBjb25maWcgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcbiAgICBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID1cbiAgICAgICdyZWZsZWN0VG9BdHRyaWJ1dGUnIGluIGNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGVcbiAgICAgICAgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG4gICAgICBvdXRwdXRbbmFtZV0gPVxuICAgICAgICB0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgPyB7IHR5cGU6IHByb3BlcnR5IH0gOiBwcm9wZXJ0eTtcbiAgICAgIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzc2lnbihjb250ZXh0LCBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyk7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICB9XG4gICAgICBjb250ZXh0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIGNvbnRleHQuX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzXG4gICAgKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKS5tYXAoKHByb3BlcnR5KSA9PlxuICAgICAgICAgIHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpXG4gICAgICAgICkgfHwgW11cbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBiZWZvcmUoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSwgJ2F0dHJpYnV0ZUNoYW5nZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpLCAncHJvcGVydGllc0NoYW5nZWQnKSh0aGlzKTtcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpIHtcbiAgICAgIGxldCBwcm9wZXJ0eSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdO1xuICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCBoeXBlblJlZ0V4ID0gLy0oW2Etel0pL2c7XG4gICAgICAgIHByb3BlcnR5ID0gYXR0cmlidXRlLnJlcGxhY2UoaHlwZW5SZWdFeCwgbWF0Y2ggPT5cbiAgICAgICAgICBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSB7XG4gICAgICBsZXQgYXR0cmlidXRlID0gcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCB1cHBlcmNhc2VSZWdFeCA9IC8oW0EtWl0pL2c7XG4gICAgICAgIGF0dHJpYnV0ZSA9IHByb3BlcnR5LnJlcGxhY2UodXBwZXJjYXNlUmVnRXgsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjbGFzc1Byb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByb3BlcnRpZXNDb25maWcpIHtcbiAgICAgICAgY29uc3QgZ2V0UHJvcGVydGllc0NvbmZpZyA9ICgpID0+IHByb3BlcnRpZXNDb25maWcgfHwge307XG4gICAgICAgIGxldCBjaGVja09iaiA9IG51bGw7XG4gICAgICAgIGxldCBsb29wID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZSAobG9vcCkge1xuICAgICAgICAgIGNoZWNrT2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrT2JqID09PSBudWxsID8gdGhpcyA6IGNoZWNrT2JqKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY2hlY2tPYmogfHxcbiAgICAgICAgICAgICFjaGVja09iai5jb25zdHJ1Y3RvciB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEhUTUxFbGVtZW50IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gRnVuY3Rpb24gfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBjaGVja09iai5jb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbG9vcCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoY2hlY2tPYmosICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKGNoZWNrT2JqLnByb3BlcnRpZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcbiAgICAgIGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShcbiAgICAgICAgICBhdHRyaWJ1dGVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldXG4gICAgICAgIC50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzTnVtYmVyLFxuICAgICAgICBpc0FycmF5LFxuICAgICAgICBpc0Jvb2xlYW4sXG4gICAgICAgIGlzRGF0ZSxcbiAgICAgICAgaXNTdHJpbmcsXG4gICAgICAgIGlzT2JqZWN0XG4gICAgICB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPVxuICAgICAgICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gaXNBcnJheVxuICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgOiB7fVxuICAgICAgICAgICAgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbXG4gICAgICAgIHByb3BlcnR5XG4gICAgICBdO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdQcm9wZXJ0aWVzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzTWl4aW5UZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5yZW1vdmUocHJvcGVydGllc01peGluVGVzdCk7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdNYXAgU2V0IFN5bWJvbCBBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoXG4gICcgJ1xuKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IG9iaiA9PiBnZXRUeXBlKG9iaikgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZShvYmopIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKG9iaik7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKHNyYykgPT4gY2xvbmUoc3JjLCBbXSwgW10pO1xuXG5mdW5jdGlvbiBjbG9uZShzcmMsIGNpcmN1bGFycywgY2xvbmVzKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKHR5cGUuZGF0ZShzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNyYy5nZXRUaW1lKCkpO1xuICB9XG5cbiAgLy8gUmVnRXhwXG4gIGlmICh0eXBlLnJlZ2V4cChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc3JjKTtcbiAgfVxuXG4gIC8vIEFycmF5c1xuICBpZiAodHlwZS5hcnJheShzcmMpKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAoY2xvbmUpO1xuICB9XG5cbiAgLy8gRVM2IE1hcHNcbiAgaWYgKHR5cGUubWFwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHNyYy5lbnRyaWVzKCkpKTtcbiAgfVxuXG4gIC8vIEVTNiBTZXRzXG4gIGlmICh0eXBlLnNldChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbShzcmMudmFsdWVzKCkpKTtcbiAgfVxuXG4gIC8vIE9iamVjdFxuICBpZiAodHlwZS5vYmplY3Qoc3JjKSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHNyYyk7XG4gICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShzcmMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHNyYykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHNyY1trZXldKTtcbiAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHNyY1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufVxuIiwiaW1wb3J0IGNsb25lIGZyb20gJy4uLy4uL2xpYi9vYmplY3QvY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnQ2xvbmUnLCAoKSA9PiB7XG5cdGRlc2NyaWJlKCdwcmltaXRpdmVzJywgKCkgPT4ge1xuXHRcdGl0KCdSZXR1cm5zIGVxdWFsIGRhdGEgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG5cdFx0XHQvLyBOdWxsXG5cdFx0XHRleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cblx0XHRcdC8vIFVuZGVmaW5lZFxuXHRcdFx0ZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuXHRcdFx0Ly8gRnVuY3Rpb25cblx0XHRcdGNvbnN0IGZ1bmMgPSAoKSA9PiB7IH07XG5cdFx0XHRhc3NlcnQuaXNGdW5jdGlvbihjbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuXHRcdFx0Ly8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcblx0XHRcdGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuXHRcdH0pO1xuXHR9KTtcbn0pO1xuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi90eXBlLmpzJztcblxuZGVzY3JpYmUoJ1R5cGUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3Qgbm90QXJncyA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhub3RBcmdzKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYWxsIHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFsbChhcmdzLCBhcmdzLCBhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbnkgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBhcnJheSA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IGJvb2wgPSB0cnVlO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEJvb2wgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bGwgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcbiAgICAgIGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE9iamVjdCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcbiAgICAgIGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCBub3RSZWdleHAgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cblx0ZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBNYXAnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoaXMubWFwKG5ldyBNYXApKS50by5iZS50cnVlO1xuXHRcdH0pO1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG5cdFx0XHRleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcblx0XHR9KTtcblx0fSk7XG5cblx0ZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcblx0XHRpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoaXMuc2V0KG5ldyBTZXQpKS50by5iZS50cnVlO1xuXHRcdH0pO1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG5cdFx0XHRleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiJdLCJuYW1lcyI6WyJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiZG9jdW1lbnQiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtaWNyb1Rhc2tGbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwibWljcm9UYXNrIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYW5jZWwiLCJoYW5kbGUiLCJpZHgiLCJFcnJvciIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJyZXR1cm5WYWx1ZSIsInRhcmdldCIsInR5cGUiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJwYXJzZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwibWFwIiwicG9wIiwiYXNzaWduIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImFmdGVyIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwibGlzdGVuRXZlbnQiLCJkaXNwYXRjaCIsImRhdGEiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJvZmYiLCJoYW5kbGVyIiwiZXZ0Iiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJlbGVtZW50IiwicGFyZW50RWxlbWVudCIsInJlbW92ZUNoaWxkIiwiRXZlbnRzRW1pdHRlciIsImN1c3RvbUVsZW1lbnQiLCJFdmVudHNMaXN0ZW5lciIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwiZW1taXRlciIsImNyZWF0ZUVsZW1lbnQiLCJiZWZvcmUiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyRWFjaCIsInJlbW92ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJpdCIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImVxdWFsIiwiYSIsImRlZXAiLCJib2R5Iiwia2V5cyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJuYW1lIiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiYXNzZXJ0IiwiaXNPayIsImFyciIsImZuIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsImlzIiwic2V0dXAiLCJjaGVja3MiLCJnZXRUeXBlIiwibWF0Y2hlcyIsInNyYyIsImNsb25lIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwib2JqZWN0IiwiZnVuY3Rpb24iLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJrZXkiLCJmaW5kSW5kZXgiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBO0FBQ0EsdUJBQWUsWUFFVjtFQUFBLE1BREhBLE9BQ0csdUVBRE9DLE9BQU9DLE1BQVAsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixFQUEvQixDQUNQOztFQUNILE1BQUlDLFFBQVEsSUFBSUMs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
