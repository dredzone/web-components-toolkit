(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

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
  var isBrowser = ![typeof window === 'undefined' ? 'undefined' : _typeof(window), typeof document === 'undefined' ? 'undefined' : _typeof(document)].includes('undefined');

  var browser = function browser(fn) {
    var raise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return function () {
      if (isBrowser) {
        return fn.apply(undefined, arguments);
      }
      if (raise) {
        throw new Error(fn.name + ' is not running in browser');
      }
    };
  };

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

  var customElement = browser(function (baseClass) {
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

  var properties = browser(function (baseClass) {
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

  /*  */

  var listenEvent = browser(function (target, type, listener) {
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

  describe('properties-mixin', function () {
    var container = void 0;
    var propertiesMixinTest = document.createElement('properties-mixin-test');

    before(function () {
      container = document.getElementById('container');
      container.append(propertiesMixinTest);
    });

    after(function () {
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

  /**
   * Mixin adds CustomEvent handling to an element
   */
  var events = browser(function (baseClass) {
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

  var stopEvent = browser(function (evt) {
    if (evt.stopPropagation) {
      evt.stopPropagation();
    }
    evt.preventDefault();
  });

  /*  */

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

  describe('events-mixin', function () {
    var container = void 0;
    var emmiter = document.createElement('events-emitter');
    var listener = document.createElement('events-listener');

    before(function () {
      container = document.getElementById('container');
      listener.append(emmiter);
      container.append(listener);
    });

    after(function () {
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

  var templateContent = browser(function (template) {
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

  var createElement = browser(function (html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    var frag = templateContent(template);
    if (frag && frag.firstChild) {
      return frag.firstChild;
    }
    throw new Error('Unable to createElement for ' + html);
  });

  describe('create-element', function () {
  	it('create element', function () {
  		var el = createElement('\n\t\t\t<div class="my-class">Hello World</div>\n\t\t');
  		expect(el.classList.contains('my-class')).to.equal(true);
  		assert.instanceOf(el, Node, 'element is instance of node');
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

  var clone = function clone(src) {
    var circulars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var clones = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

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
      return src.map(clone);
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
        obj[key] = idx > -1 ? clones[idx] : clone(src[key], circulars, clones);
      };

      for (var key in src) {
        _loop(key);
      }
      return obj;
    }

    return src;
  };

  var jsonClone = function jsonClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  };

  describe('clone', function () {
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

    describe('jsonClone', function () {
      it('When non-serializable value is passed in, returns the same for Null/undefined/functions/etc', function () {
        // Null
        expect(jsonClone(null)).to.be.null;

        // Undefined
        expect(jsonClone()).to.be.undefined;

        // Function
        var func = function func() {};
        assert.isFunction(jsonClone(func), 'is a function');

        // Etc: numbers and string
        assert.equal(jsonClone(5), 5);
        assert.equal(jsonClone('string'), 'string');
        assert.equal(jsonClone(false), false);
        assert.equal(jsonClone(true), true);
      });
    });
  });

  describe('type', function () {
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

  /*  */

  var useFetch = function useFetch(httpClient) {
    return httpClient.addResponseStep(function (_ref) {
      var request = _ref.request,
          response = _ref.response;

      if (typeof response !== 'undefined') {
        return response;
      }
      var fetchOptions = {
        method: request.method,
        mode: request.mode,
        credentials: request.credentials,
        headers: request.headers
      };

      var body = getBodyFromReq(request);
      if (body) {
        fetchOptions.body = body;
      }

      if (!request.url) {
        throw new Error('http-client: url option is not set');
      }

      // $FlowFixMe
      return fetch(request.url, fetchOptions).then(function (response) {
        if (!response.ok) throw response;
        return response.text();
      }).then(function (response) {
        try {
          return JSON.parse(response);
        } catch (e) {
          return response;
        }
      });
    });
  };

  /*  */

  var defaultOptions = {
    mode: 'cors',
    data: undefined,
    headers: {
      'X-Requested-By': 'DEEP-UI',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin', //'include',
    returnRequestAndResponse: false
  };

  var httpClientFactory = function httpClientFactory() {
    var customInstanceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var instanceOptions = Object.assign({}, defaultOptions, customInstanceOptions);
    var requestSteps = [];
    var responseSteps = [];

    function run(method) {
      var customRunOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var request = Object.assign({}, instanceOptions, customRunOptions, {
        method: method
      });

      var response = undefined;

      var promise = Promise.resolve({
        request: request,
        response: response
      });

      requestSteps.forEach(function (_ref) {
        var promiseMethod = _ref.promiseMethod,
            callback = _ref.callback,
            rejectCallback = _ref.rejectCallback;

        // $FlowFixMe
        if (!promise[promiseMethod]) {
          throw new Error('http-client: requestStep promise method is not valid: ' + promiseMethod);
        }
        // $FlowFixMe
        promise = promise[promiseMethod](function (arg) {
          if (stepArgumentIsNormalized(arg)) {
            request = clone(arg.request);
            response = jsonClone(arg.response);
          } else {
            request = clone(arg);
          }
          return callback({
            request: clone(request),
            response: jsonClone(response)
          });
        }, rejectCallback);
      });

      //extract final request object
      promise = promise.then(function (arg) {
        if (stepArgumentIsNormalized(arg)) {
          request = clone(arg.request);
          response = jsonClone(arg.response);
        } else {
          request = clone(arg);
        }
        return {
          request: clone(request),
          response: jsonClone(response)
        };
      });

      responseSteps.forEach(function (_ref2) {
        var promiseMethod = _ref2.promiseMethod,
            callback = _ref2.callback,
            rejectCallback = _ref2.rejectCallback;

        // $FlowFixMe
        if (!promise[promiseMethod]) {
          throw new Error('http-client: responseStep method is not valid: ' + promiseMethod);
        }
        // $FlowFixMe
        promise = promise[promiseMethod](function (arg) {
          if (stepArgumentIsNormalized(arg)) {
            response = jsonClone(arg.response);
          } else {
            response = jsonClone(arg);
          }
          return callback({
            request: clone(request),
            response: jsonClone(response)
          });
        }, rejectCallback);
      });

      // one more step to extract final response and determine shape of data to return
      promise = promise.then(function (arg) {
        if (stepArgumentIsNormalized(arg)) {
          response = jsonClone(arg.response);
        } else {
          response = jsonClone(arg);
        }

        if (request.returnRequestAndResponse) {
          return {
            request: request,
            response: response
          };
        }
        return response;
      });

      return promise;
    } //end doFetch()

    var httpClient = {
      get: run.bind(this, 'GET'),
      post: run.bind(this, 'POST'),
      put: run.bind(this, 'PUT'),
      patch: run.bind(this, 'PATCH'),
      delete: run.bind(this, 'DELETE'),
      options: function options() {
        var newOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        return clone(Object.assign(instanceOptions, newOptions));
      },
      addRequestStep: function addRequestStep() {
        requestSteps.push(normalizeAddStepArguments(arguments));
        return this;
      },
      addResponseStep: function addResponseStep() {
        responseSteps.push(normalizeAddStepArguments(arguments));
        return this;
      }
    };

    return useFetch(httpClient);
  };

  var getBodyFromReq = function getBodyFromReq(req) {
    if (req.data) {
      return JSON.stringify(req.data);
    } else if (req.body) {
      return req.body;
    }
    return '';
  };

  function normalizeAddStepArguments(args) {
    var promiseMethod = void 0;
    var callback = void 0;
    var rejectCallback = void 0;
    if (typeof args[0] === 'string') {
      promiseMethod = args[0];
      callback = args[1];
      rejectCallback = args[2];
    } else {
      promiseMethod = 'then';
      callback = args[0];
      rejectCallback = args[1];
    }
    if (promiseMethod !== 'then' && promiseMethod !== 'catch' || typeof callback !== 'function') {
      throw new Error('http-client: bad arguments passed to add(Request/Response)Step');
    }
    return {
      promiseMethod: promiseMethod,
      callback: callback,
      rejectCallback: rejectCallback
    };
  }

  function stepArgumentIsNormalized(arg) {
    return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && Object.keys(arg).length === 2 && arg.hasOwnProperty('request') && arg.hasOwnProperty('response');
  }

  describe('http-client - basic usage', function () {
    it('able to make a GET request', function (done) {
      var httpClient = httpClientFactory();
      httpClient.get({
        url: '/http-client-get-test'
      }).then(function (response) {
        chai.expect(response.foo).to.equal('1');
        done();
      });
    });

    it('able to make a POST request', function (done) {
      var httpClient = httpClientFactory();
      httpClient.post({
        url: '/http-client-post-test',
        data: {
          testData: '1'
        }
      }).then(function (response) {
        chai.expect(response.foo).to.equal('2');
        done();
      });
    });

    it("doesn't blow up when response isn't JSON", function (done) {
      var httpClient = httpClientFactory();
      httpClient.get({
        url: '/http-client-response-not-json'
      }).then(function (response) {
        chai.expect(response).to.equal('not json');
        done();
      });
    });

    it('options can be overwritten at any level', function (done) {
      var httpClient = httpClientFactory({
        credentials: 'include'
      });
      chai.expect(httpClient.options().credentials).to.equal('include');

      httpClient.options({
        credentials: 'omit'
      });
      chai.expect(httpClient.options().credentials).to.equal('omit');

      httpClient.get({
        url: '/http-client-get-test',
        credentials: 'same-origin',
        returnRequestAndResponse: true
      }).then(function (_ref) {
        var request = _ref.request,
            response = _ref.response;

        chai.expect(request.credentials).to.equal('same-origin');
        done();
      });
    });

    it('request step can modify the request object', function (done) {
      var httpClient = httpClientFactory();
      httpClient.addRequestStep(function (_ref2) {
        var request = _ref2.request;

        return Object.assign({}, request, {
          url: '/http-client-modified-url',
          returnRequestAndResponse: true
        });
      });
      httpClient.get({ url: '/will-be-overwritten' }).then(function (_ref3) {
        var request = _ref3.request,
            response = _ref3.response;

        chai.expect(request.url).to.equal('/http-client-modified-url');
        chai.expect(response).to.equal('response for modified url');
        done();
      });
    });

    it('request step can add a response object', function (done) {
      var httpClient = httpClientFactory();
      httpClient.addRequestStep(function (_ref4) {
        var request = _ref4.request;

        if (request.url === '/does-not-exist') {
          return {
            request: request,
            response: 'shortcircuit response'
          };
        }
        return request;
      });
      httpClient.get({ url: '/does-not-exist' }).then(function (response) {
        chai.expect(response).to.equal('shortcircuit response');
        done();
      });
    });

    it('response step can modify the response object', function (done) {
      var httpClient = httpClientFactory();
      httpClient.addResponseStep(function (_ref5) {
        var response = _ref5.response;

        response.foo = 'a response step was here';
        return response;
      });
      httpClient.get({
        url: '/http-client-get-test'
      }).then(function (response) {
        chai.expect(response.foo).to.equal('a response step was here');
        done();
      });
    });
  });

  /*  */

  var memCache = {};

  var useMemCache = function useMemCache(httpClient) {
    useSaveToMemCache(httpClient);
    useGetFromCache(httpClient);
    return httpClient;
  };

  var useGetFromCache = function useGetFromCache(httpClient) {
    return httpClient.addRequestStep(function (_ref) {
      var request = _ref.request,
          response = _ref.response;

      if (!response && typeof memCache[cacheKey(request)] !== 'undefined' && (typeof request.responseIsCachable === 'undefined' || request.responseIsCachable({
        request: request,
        response: memCache[cacheKey(request)]
      }))) {
        request.response = jsonClone(memCache[cacheKey(request)]);
        request.servedFromCache = true;
      } else {
        request.servedFromCache = false;
      }
      return request;
    });
  };

  var useSaveToMemCache = function useSaveToMemCache(httpClient) {
    return httpClient.addResponseStep(function (_ref2) {
      var request = _ref2.request,
          response = _ref2.response;

      if (typeof request.responseIsCachable === 'undefined' || request.responseIsCachable({ request: request, response: response })) {
        memCache[cacheKey(request)] = response;
        request.savedToCache = true;
      } else {
        request.savedToCache = false;
      }
      return response;
    });
  };

  var bustMemCache = function bustMemCache() {
    var partialUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    Object.keys(memCache).forEach(function (k) {
      if (k.includes(partialUrl)) {
        memCache[k] = undefined;
      }
    });
  };

  function cacheKey(request) {
    return request.url + '::' + request.method + '::' + getBodyFromReq(request);
  }

  describe('http-client w/ mem-cache', function () {
    it('response can be cached', function (done) {
      var httpClient = useMemCache(httpClientFactory());
      httpClient.get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      }).then(function (_ref) {
        var request = _ref.request,
            response = _ref.response;

        chai.expect(response.foo).to.equal('1');
        chai.expect(request.servedFromCache).to.equal(false);
      }).then(function () {
        httpClient.get({
          url: '/http-client-get-test',
          returnRequestAndResponse: true
        }).then(function (_ref2) {
          var request = _ref2.request,
              response = _ref2.response;

          chai.expect(response.foo).to.equal('1');
          chai.expect(request.servedFromCache).to.equal(true);
          done();
        });
      });
    });

    it('cache can be busted', function (done) {
      var httpClient = useMemCache(httpClientFactory());
      httpClient.get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      }).then(function () {
        bustMemCache();
        httpClient.get({
          url: '/http-client-get-test',
          returnRequestAndResponse: true
        }).then(function (_ref3) {
          var request = _ref3.request,
              response = _ref3.response;

          chai.expect(response.foo).to.equal('1');
          chai.expect(request.servedFromCache).to.equal(false);
          done();
        });
      });
    });

    //TODO: FAILS due to jsonClone being used on a object that has a property that has a function as the value
    it('responseIsCachable can prevent cached response from being cached', function (done) {
      var httpClient = useMemCache(httpClientFactory({
        responseIsCachable: function responseIsCachable() {
          return false;
        }
      }));
      httpClient.get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      }).then(function () {
        httpClient.get({
          url: '/http-client-get-test',
          returnRequestAndResponse: true
        }).then(function (_ref4) {
          var request = _ref4.request,
              response = _ref4.response;

          chai.expect(response.foo).to.equal('1');
          chai.expect(request.servedFromCache).to.equal(false);
          done();
        });
      });
    });

    // it('responseIsCachable can prevent cached response from being returned', done => {});
  });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L3VzZS1mZXRjaC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9odHRwLWNsaWVudC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC1jbGllbnQvaHR0cC1jbGllbnQudGVzdC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLmpzIiwiLi4vLi4vdGVzdC9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLnRlc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgY29uc3QgaXNCcm93c2VyID0gIVt0eXBlb2Ygd2luZG93LCB0eXBlb2YgZG9jdW1lbnRdLmluY2x1ZGVzKCd1bmRlZmluZWQnKTtcblxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSAoZm4sIHJhaXNlID0gdHJ1ZSkgPT4gKFxuICAuLi5hcmdzXG4pID0+IHtcbiAgaWYgKGlzQnJvd3Nlcikge1xuICAgIHJldHVybiBmbiguLi5hcmdzKTtcbiAgfVxuICBpZiAocmFpc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7Zm4ubmFtZX0gaXMgbm90IHJ1bm5pbmcgaW4gYnJvd3NlcmApO1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pXG4pID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge1xuICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG59KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gICAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gICAqL1xuICBydW4oY2FsbGJhY2spIHtcbiAgICBtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuICAgIG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICBjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgaWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQge2Jyb3dzZXJ9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKFxuICBiYXNlQ2xhc3NcbikgPT4ge1xuICBjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuICAgICdjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnYWRvcHRlZENhbGxiYWNrJyxcbiAgICAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuICBdO1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBpZiAoIWJhc2VDbGFzcykge1xuICAgIGJhc2VDbGFzcyA9IGNsYXNzIGV4dGVuZHMgZ2xvYmFsLkhUTUxFbGVtZW50IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7fVxuXG4gICAgc3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuICAgICAgaWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7fSxcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjYWxsYmFja01ldGhvZE5hbWUubGVuZ3RoIC0gJ2NhbGxiYWNrJy5sZW5ndGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gcHJvdG9bY2FsbGJhY2tNZXRob2ROYW1lXTtcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcbiAgICAgICAgcmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuY29uc3RydWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge31cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZChcbiAgICAgIGF0dHJpYnV0ZU5hbWUsXG4gICAgICBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlXG4gICAgKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHticm93c2VyfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7YnJvd3Nlcn0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlID0gZmFsc2VcbikgPT4ge1xuICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59KTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IHByb3BlcnRpZXMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvbGlzdGVuLWV2ZW50LmpzJztcblxuY2xhc3MgUHJvcGVydGllc01peGluVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNNaXhpblRlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuZGVzY3JpYmUoJ3Byb3BlcnRpZXMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IHByb3BlcnRpZXNNaXhpblRlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuXHQgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzTWl4aW5UZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc01peGluVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQge2Jyb3dzZXJ9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHticm93c2VyfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQge2Jyb3dzZXJ9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZWxlbWVudCkgPT4ge1xuICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICB9XG59KTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvc3RvcC1ldmVudC5qcyc7XG5pbXBvcnQgcmVtb3ZlRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnZXZlbnRzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7YnJvd3Nlcn0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcblx0aXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuXHRcdGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuXHRcdGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuXHRcdGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG5cdH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gJ01hcCBTZXQgU3ltYm9sIEFycmF5IE9iamVjdCBTdHJpbmcgRGF0ZSBSZWdFeHAgRnVuY3Rpb24gQm9vbGVhbiBOdW1iZXIgTnVsbCBVbmRlZmluZWQgQXJndW1lbnRzIEVycm9yJy5zcGxpdChcbiAgJyAnXG4pO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcbmNvbnN0IGlzID0gc2V0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuXG5jb25zdCBjbG9uZSA9IGZ1bmN0aW9uKFxuICBzcmMsXG4gIGNpcmN1bGFycyA9IFtdLFxuICBjbG9uZXMgPSBbXVxuKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKHR5cGUuZGF0ZShzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNyYy5nZXRUaW1lKCkpO1xuICB9XG5cbiAgLy8gUmVnRXhwXG4gIGlmICh0eXBlLnJlZ2V4cChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc3JjKTtcbiAgfVxuXG4gIC8vIEFycmF5c1xuICBpZiAodHlwZS5hcnJheShzcmMpKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAoY2xvbmUpO1xuICB9XG5cbiAgLy8gRVM2IE1hcHNcbiAgaWYgKHR5cGUubWFwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHNyYy5lbnRyaWVzKCkpKTtcbiAgfVxuXG4gIC8vIEVTNiBTZXRzXG4gIGlmICh0eXBlLnNldChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbShzcmMudmFsdWVzKCkpKTtcbiAgfVxuXG4gIC8vIE9iamVjdFxuICBpZiAodHlwZS5vYmplY3Qoc3JjKSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHNyYyk7XG4gICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShzcmMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHNyYykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHNyY1trZXldKTtcbiAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHNyY1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xvbmU7XG5cbmV4cG9ydCBjb25zdCBqc29uQ2xvbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn07XG4iLCJpbXBvcnQgY2xvbmUsIHsganNvbkNsb25lIH0gZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiwgcmV0dXJucyB0aGUgc2FtZSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGpzb25DbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihqc29uQ2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgZ2V0Qm9keUZyb21SZXEgfSBmcm9tICcuL2h0dHAtY2xpZW50LmpzJztcblxuY29uc3QgdXNlRmV0Y2ggPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHJldHVybiBodHRwQ2xpZW50LmFkZFJlc3BvbnNlU3RlcChmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cbiAgICBsZXQgZmV0Y2hPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgIG1vZGU6IHJlcXVlc3QubW9kZSxcbiAgICAgIGNyZWRlbnRpYWxzOiByZXF1ZXN0LmNyZWRlbnRpYWxzLFxuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzXG4gICAgfTtcblxuICAgIGxldCBib2R5ID0gZ2V0Qm9keUZyb21SZXEocmVxdWVzdCk7XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIGZldGNoT3B0aW9ucy5ib2R5ID0gYm9keTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3QudXJsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGh0dHAtY2xpZW50OiB1cmwgb3B0aW9uIGlzIG5vdCBzZXRgKTtcbiAgICB9XG5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgcmV0dXJuIGZldGNoKHJlcXVlc3QudXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IHJlc3BvbnNlO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHVzZUZldGNoO1xuIiwiLyogICovXG5cbi8vIE5vdGU6IGZvciBub3cgbm90IHJlc3RyaWN0aW5nIHRoaXMgdG8gYnJvd3NlciB1c2FnZSBkdWUgdG8gaXQgcG90ZW50aWFsbHlcbi8vIGJlaW5nIHVzZWQgd2l0aCBhbiBucG0gcGFja2FnZSBsaWtlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL25vZGUtZmV0Y2hcblxuaW1wb3J0IHVzZUZldGNoIGZyb20gJy4vdXNlLWZldGNoLmpzJztcbmltcG9ydCBjbG9uZSwgeyBqc29uQ2xvbmUgfSBmcm9tICcuLi9vYmplY3QvY2xvbmUuanMnO1xuXG5cblxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIG1vZGU6ICdjb3JzJyxcbiAgZGF0YTogdW5kZWZpbmVkLFxuICBoZWFkZXJzOiB7XG4gICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknLFxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgfSxcbiAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsIC8vJ2luY2x1ZGUnLFxuICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IGZhbHNlXG59O1xuXG5jb25zdCBodHRwQ2xpZW50RmFjdG9yeSA9IGZ1bmN0aW9uKFxuICBjdXN0b21JbnN0YW5jZU9wdGlvbnMgPSB7fVxuKSB7XG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgZGVmYXVsdE9wdGlvbnMsXG4gICAgY3VzdG9tSW5zdGFuY2VPcHRpb25zXG4gICk7XG4gIGNvbnN0IHJlcXVlc3RTdGVwcyA9IFtdO1xuICBjb25zdCByZXNwb25zZVN0ZXBzID0gW107XG5cbiAgZnVuY3Rpb24gcnVuKG1ldGhvZCwgY3VzdG9tUnVuT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHJlcXVlc3QgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICBpbnN0YW5jZU9wdGlvbnMsXG4gICAgICBjdXN0b21SdW5PcHRpb25zLFxuICAgICAge1xuICAgICAgICBtZXRob2Q6IG1ldGhvZFxuICAgICAgfVxuICAgICk7XG5cbiAgICBsZXQgcmVzcG9uc2UgPSB1bmRlZmluZWQ7XG5cbiAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh7XG4gICAgICByZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICB9KTtcblxuICAgIHJlcXVlc3RTdGVwcy5mb3JFYWNoKGZ1bmN0aW9uKHsgcHJvbWlzZU1ldGhvZCwgY2FsbGJhY2ssIHJlamVjdENhbGxiYWNrIH0pIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGlmICghcHJvbWlzZVtwcm9taXNlTWV0aG9kXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGh0dHAtY2xpZW50OiByZXF1ZXN0U3RlcCBwcm9taXNlIG1ldGhvZCBpcyBub3QgdmFsaWQ6ICR7cHJvbWlzZU1ldGhvZH1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBwcm9taXNlID0gcHJvbWlzZVtwcm9taXNlTWV0aG9kXShmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgaWYgKHN0ZXBBcmd1bWVudElzTm9ybWFsaXplZChhcmcpKSB7XG4gICAgICAgICAgcmVxdWVzdCA9IGNsb25lKGFyZy5yZXF1ZXN0KTtcbiAgICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcXVlc3QgPSBjbG9uZShhcmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICAgICAgcmVxdWVzdDogY2xvbmUocmVxdWVzdCksXG4gICAgICAgICAgcmVzcG9uc2U6IGpzb25DbG9uZShyZXNwb25zZSlcbiAgICAgICAgfSk7XG4gICAgICB9LCByZWplY3RDYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICAvL2V4dHJhY3QgZmluYWwgcmVxdWVzdCBvYmplY3RcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHN0ZXBBcmd1bWVudElzTm9ybWFsaXplZChhcmcpKSB7XG4gICAgICAgIHJlcXVlc3QgPSBjbG9uZShhcmcucmVxdWVzdCk7XG4gICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZy5yZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gY2xvbmUoYXJnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVlc3Q6IGNsb25lKHJlcXVlc3QpLFxuICAgICAgICByZXNwb25zZToganNvbkNsb25lKHJlc3BvbnNlKVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJlc3BvbnNlU3RlcHMuZm9yRWFjaChmdW5jdGlvbih7XG4gICAgICBwcm9taXNlTWV0aG9kLFxuICAgICAgY2FsbGJhY2ssXG4gICAgICByZWplY3RDYWxsYmFja1xuICAgIH0pIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGlmICghcHJvbWlzZVtwcm9taXNlTWV0aG9kXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGh0dHAtY2xpZW50OiByZXNwb25zZVN0ZXAgbWV0aG9kIGlzIG5vdCB2YWxpZDogJHtwcm9taXNlTWV0aG9kfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIHByb21pc2UgPSBwcm9taXNlW3Byb21pc2VNZXRob2RdKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICBpZiAoc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykpIHtcbiAgICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgICByZXF1ZXN0OiBjbG9uZShyZXF1ZXN0KSxcbiAgICAgICAgICByZXNwb25zZToganNvbkNsb25lKHJlc3BvbnNlKVxuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdENhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIC8vIG9uZSBtb3JlIHN0ZXAgdG8gZXh0cmFjdCBmaW5hbCByZXNwb25zZSBhbmQgZGV0ZXJtaW5lIHNoYXBlIG9mIGRhdGEgdG8gcmV0dXJuXG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmIChzdGVwQXJndW1lbnRJc05vcm1hbGl6ZWQoYXJnKSkge1xuICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UgPSBqc29uQ2xvbmUoYXJnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcXVlc3QucmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH0gLy9lbmQgZG9GZXRjaCgpXG5cbiAgY29uc3QgaHR0cENsaWVudCA9IHtcbiAgICBnZXQ6IHJ1bi5iaW5kKHRoaXMsICdHRVQnKSxcbiAgICBwb3N0OiBydW4uYmluZCh0aGlzLCAnUE9TVCcpLFxuICAgIHB1dDogcnVuLmJpbmQodGhpcywgJ1BVVCcpLFxuICAgIHBhdGNoOiBydW4uYmluZCh0aGlzLCAnUEFUQ0gnKSxcbiAgICBkZWxldGU6IHJ1bi5iaW5kKHRoaXMsICdERUxFVEUnKSxcbiAgICBvcHRpb25zOiAobmV3T3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICByZXR1cm4gY2xvbmUoT2JqZWN0LmFzc2lnbihpbnN0YW5jZU9wdGlvbnMsIG5ld09wdGlvbnMpKTtcbiAgICB9LFxuICAgIGFkZFJlcXVlc3RTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJlcXVlc3RTdGVwcy5wdXNoKG5vcm1hbGl6ZUFkZFN0ZXBBcmd1bWVudHMoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGFkZFJlc3BvbnNlU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICByZXNwb25zZVN0ZXBzLnB1c2gobm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyhhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXNlRmV0Y2goaHR0cENsaWVudCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBodHRwQ2xpZW50RmFjdG9yeTtcblxuZXhwb3J0IGNvbnN0IGdldEJvZHlGcm9tUmVxID0gZnVuY3Rpb24ocmVxKSB7XG4gIGlmIChyZXEuZGF0YSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShyZXEuZGF0YSk7XG4gIH0gZWxzZSBpZiAocmVxLmJvZHkpIHtcbiAgICByZXR1cm4gcmVxLmJvZHk7XG4gIH1cbiAgcmV0dXJuICcnO1xufTtcblxuZnVuY3Rpb24gbm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyhhcmdzKSB7XG4gIGxldCBwcm9taXNlTWV0aG9kO1xuICBsZXQgY2FsbGJhY2s7XG4gIGxldCByZWplY3RDYWxsYmFjaztcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJykge1xuICAgIFtwcm9taXNlTWV0aG9kLCBjYWxsYmFjaywgcmVqZWN0Q2FsbGJhY2tdID0gYXJncztcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlTWV0aG9kID0gJ3RoZW4nO1xuICAgIFtjYWxsYmFjaywgcmVqZWN0Q2FsbGJhY2tdID0gYXJncztcbiAgfVxuICBpZiAoXG4gICAgKHByb21pc2VNZXRob2QgIT09ICd0aGVuJyAmJiBwcm9taXNlTWV0aG9kICE9PSAnY2F0Y2gnKSB8fFxuICAgIHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJ1xuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnaHR0cC1jbGllbnQ6IGJhZCBhcmd1bWVudHMgcGFzc2VkIHRvIGFkZChSZXF1ZXN0L1Jlc3BvbnNlKVN0ZXAnXG4gICAgKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHByb21pc2VNZXRob2QsXG4gICAgY2FsbGJhY2ssXG4gICAgcmVqZWN0Q2FsbGJhY2tcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmXG4gICAgT2JqZWN0LmtleXMoYXJnKS5sZW5ndGggPT09IDIgJiZcbiAgICBhcmcuaGFzT3duUHJvcGVydHkoJ3JlcXVlc3QnKSAmJlxuICAgIGFyZy5oYXNPd25Qcm9wZXJ0eSgncmVzcG9uc2UnKVxuICApO1xufVxuIiwiaW1wb3J0IGh0dHBDbGllbnRGYWN0b3J5IGZyb20gJy4uLy4uL2xpYi9odHRwLWNsaWVudC9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCAtIGJhc2ljIHVzYWdlJywgKCkgPT4ge1xuICBpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QnLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KCk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5wb3N0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LXBvc3QtdGVzdCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0ZXN0RGF0YTogJzEnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcyJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdChcImRvZXNuJ3QgYmxvdyB1cCB3aGVuIHJlc3BvbnNlIGlzbid0IEpTT05cIiwgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtcmVzcG9uc2Utbm90LWpzb24nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdub3QganNvbicpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ29wdGlvbnMgY2FuIGJlIG92ZXJ3cml0dGVuIGF0IGFueSBsZXZlbCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3Rvcnkoe1xuICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgIH0pO1xuICAgIGNoYWkuZXhwZWN0KGh0dHBDbGllbnQub3B0aW9ucygpLmNyZWRlbnRpYWxzKS50by5lcXVhbCgnaW5jbHVkZScpO1xuXG4gICAgaHR0cENsaWVudC5vcHRpb25zKHtcbiAgICAgIGNyZWRlbnRpYWxzOiAnb21pdCdcbiAgICB9KTtcbiAgICBjaGFpLmV4cGVjdChodHRwQ2xpZW50Lm9wdGlvbnMoKS5jcmVkZW50aWFscykudG8uZXF1YWwoJ29taXQnKTtcblxuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3QuY3JlZGVudGlhbHMpLnRvLmVxdWFsKCdzYW1lLW9yaWdpbicpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3JlcXVlc3Qgc3RlcCBjYW4gbW9kaWZ5IHRoZSByZXF1ZXN0IG9iamVjdCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3RvcnkoKTtcbiAgICBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKCh7IHJlcXVlc3QgfSkgPT4ge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHJlcXVlc3QsIHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LW1vZGlmaWVkLXVybCcsXG4gICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7IHVybDogJy93aWxsLWJlLW92ZXJ3cml0dGVuJyB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3QudXJsKS50by5lcXVhbCgnL2h0dHAtY2xpZW50LW1vZGlmaWVkLXVybCcpO1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZSkudG8uZXF1YWwoJ3Jlc3BvbnNlIGZvciBtb2RpZmllZCB1cmwnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdyZXF1ZXN0IHN0ZXAgY2FuIGFkZCBhIHJlc3BvbnNlIG9iamVjdCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3RvcnkoKTtcbiAgICBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKCh7IHJlcXVlc3QgfSkgPT4ge1xuICAgICAgaWYgKHJlcXVlc3QudXJsID09PSAnL2RvZXMtbm90LWV4aXN0Jykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgcmVzcG9uc2U6ICdzaG9ydGNpcmN1aXQgcmVzcG9uc2UnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9KTtcbiAgICBodHRwQ2xpZW50LmdldCh7IHVybDogJy9kb2VzLW5vdC1leGlzdCcgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdzaG9ydGNpcmN1aXQgcmVzcG9uc2UnKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Jlc3BvbnNlIHN0ZXAgY2FuIG1vZGlmeSB0aGUgcmVzcG9uc2Ugb2JqZWN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnQuYWRkUmVzcG9uc2VTdGVwKCh7IHJlc3BvbnNlIH0pID0+IHtcbiAgICAgIHJlc3BvbnNlLmZvbyA9ICdhIHJlc3BvbnNlIHN0ZXAgd2FzIGhlcmUnO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UuZm9vKS50by5lcXVhbCgnYSByZXNwb25zZSBzdGVwIHdhcyBoZXJlJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBnZXRCb2R5RnJvbVJlcSB9IGZyb20gJy4vaHR0cC1jbGllbnQuanMnO1xuaW1wb3J0IHsganNvbkNsb25lIH0gZnJvbSAnLi4vb2JqZWN0L2Nsb25lJztcblxuY29uc3QgbWVtQ2FjaGUgPSB7fTtcblxuY29uc3QgdXNlTWVtQ2FjaGUgPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHVzZVNhdmVUb01lbUNhY2hlKGh0dHBDbGllbnQpO1xuICB1c2VHZXRGcm9tQ2FjaGUoaHR0cENsaWVudCk7XG4gIHJldHVybiBodHRwQ2xpZW50O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlTWVtQ2FjaGU7XG5cbmV4cG9ydCBjb25zdCB1c2VHZXRGcm9tQ2FjaGUgPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHJldHVybiBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgIGlmIChcbiAgICAgICFyZXNwb25zZSAmJlxuICAgICAgdHlwZW9mIG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICh0eXBlb2YgcmVxdWVzdC5yZXNwb25zZUlzQ2FjaGFibGUgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VJc0NhY2hhYmxlKHtcbiAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgIHJlc3BvbnNlOiBtZW1DYWNoZVtjYWNoZUtleShyZXF1ZXN0KV1cbiAgICAgICAgfSkpXG4gICAgKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlID0ganNvbkNsb25lKG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSk7XG4gICAgICByZXF1ZXN0LnNlcnZlZEZyb21DYWNoZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VTYXZlVG9NZW1DYWNoZSA9IGZ1bmN0aW9uKGh0dHBDbGllbnQpIHtcbiAgcmV0dXJuIGh0dHBDbGllbnQuYWRkUmVzcG9uc2VTdGVwKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiByZXF1ZXN0LnJlc3BvbnNlSXNDYWNoYWJsZSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VJc0NhY2hhYmxlKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSlcbiAgICApIHtcbiAgICAgIG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSA9IHJlc3BvbnNlO1xuICAgICAgcmVxdWVzdC5zYXZlZFRvQ2FjaGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1ZXN0LnNhdmVkVG9DYWNoZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGJ1c3RNZW1DYWNoZSA9IGZ1bmN0aW9uKHBhcnRpYWxVcmwgPSAnJykge1xuICBPYmplY3Qua2V5cyhtZW1DYWNoZSkuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgaWYgKGsuaW5jbHVkZXMocGFydGlhbFVybCkpIHtcbiAgICAgIG1lbUNhY2hlW2tdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBjYWNoZUtleShyZXF1ZXN0KSB7XG4gIHJldHVybiBgJHtyZXF1ZXN0LnVybH06OiR7cmVxdWVzdC5tZXRob2R9Ojoke2dldEJvZHlGcm9tUmVxKHJlcXVlc3QpfWA7XG59XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vLi4vbGliL2h0dHAtY2xpZW50L2h0dHAtY2xpZW50LmpzJztcbmltcG9ydCB1c2VNZW1DYWNoZSwge1xuICBidXN0TWVtQ2FjaGVcbn0gZnJvbSAnLi4vLi4vbGliL2h0dHAtY2xpZW50L3VzZS1tZW0tY2FjaGUuanMnO1xuXG5kZXNjcmliZSgnaHR0cC1jbGllbnQgdy8gbWVtLWNhY2hlJywgKCkgPT4ge1xuICBpdCgncmVzcG9uc2UgY2FuIGJlIGNhY2hlZCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gdXNlTWVtQ2FjaGUoaHR0cENsaWVudEZhY3RvcnkoKSk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlKS50by5lcXVhbChmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGh0dHBDbGllbnRcbiAgICAgICAgICAuZ2V0KHtcbiAgICAgICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UuZm9vKS50by5lcXVhbCgnMScpO1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC5zZXJ2ZWRGcm9tQ2FjaGUpLnRvLmVxdWFsKHRydWUpO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdjYWNoZSBjYW4gYmUgYnVzdGVkJywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSB1c2VNZW1DYWNoZShodHRwQ2xpZW50RmFjdG9yeSgpKTtcbiAgICBodHRwQ2xpZW50XG4gICAgICAuZ2V0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGJ1c3RNZW1DYWNoZSgpO1xuICAgICAgICBodHRwQ2xpZW50XG4gICAgICAgICAgLmdldCh7XG4gICAgICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzEnKTtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlKS50by5lcXVhbChmYWxzZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9UT0RPOiBGQUlMUyBkdWUgdG8ganNvbkNsb25lIGJlaW5nIHVzZWQgb24gYSBvYmplY3QgdGhhdCBoYXMgYSBwcm9wZXJ0eSB0aGF0IGhhcyBhIGZ1bmN0aW9uIGFzIHRoZSB2YWx1ZVxuICBpdCgncmVzcG9uc2VJc0NhY2hhYmxlIGNhbiBwcmV2ZW50IGNhY2hlZCByZXNwb25zZSBmcm9tIGJlaW5nIGNhY2hlZCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gdXNlTWVtQ2FjaGUoXG4gICAgICBodHRwQ2xpZW50RmFjdG9yeSh7XG4gICAgICAgIHJlc3BvbnNlSXNDYWNoYWJsZTogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaHR0cENsaWVudFxuICAgICAgICAgIC5nZXQoe1xuICAgICAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXF1ZXN0LnNlcnZlZEZyb21DYWNoZSkudG8uZXF1YWwoZmFsc2UpO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vIGl0KCdyZXNwb25zZUlzQ2FjaGFibGUgY2FuIHByZXZlbnQgY2FjaGVkIHJlc3BvbnNlIGZyb20gYmVpbmcgcmV0dXJuZWQnLCBkb25lID0+IHt9KTtcbn0pO1xuIl0sIm5hbWVzIjpbImlzQnJvd3NlciIsIndpbmRvdyIsImRvY3VtZW50IiwiaW5jbHVkZXMiLCJicm93c2VyIiwiZm4iLCJyYWlzZSIsIkVycm9yIiwibmFtZSIsImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtaWNyb1Rhc2tGbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwibWljcm9UYXNrIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYW5jZWwiLCJoYW5kbGUiLCJpZHgiLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwia2V5cyIsImFzc2lnbiIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsInR5cGUiLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYmVmb3JlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwiZGF0YSIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwibWFwIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsInBvcCIsIlByb3BlcnRpZXNNaXhpblRlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsImN1c3RvbUVsZW1lbnQiLCJkZXNjcmliZSIsImNvbnRhaW5lciIsInByb3BlcnRpZXNNaXhpblRlc3QiLCJjcmVhdGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlciIsImlubmVySFRNTCIsIml0IiwiYXNzZXJ0IiwiZXF1YWwiLCJsaXN0ZW5FdmVudCIsImlzT2siLCJldnQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJkaXNwYXRjaCIsIm9mZiIsImhhbmRsZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJzdG9wRXZlbnQiLCJjaGFpIiwiZXhwZWN0IiwidG8iLCJhIiwiZGVlcCIsImJvZHkiLCJ0ZW1wbGF0ZSIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJodG1sIiwidHJpbSIsImZyYWciLCJ0ZW1wbGF0ZUNvbnRlbnQiLCJmaXJzdENoaWxkIiwiZWwiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImluc3RhbmNlT2YiLCJOb2RlIiwiYXJyIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsImlzIiwic2V0dXAiLCJjaGVja3MiLCJnZXRUeXBlIiwibWF0Y2hlcyIsImNsb25lIiwic3JjIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwib2JqZWN0IiwiZnVuY3Rpb24iLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJrZXkiLCJmaW5kSW5kZXgiLCJqc29uQ2xvbmUiLCJlIiwiYmUiLCJudWxsIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwic3RyaW5nIiwidXNlRmV0Y2giLCJodHRwQ2xpZW50IiwiYWRkUmVzcG9uc2VTdGVwIiwicmVxdWVzdCIsInJlc3BvbnNlIiwiZmV0Y2hPcHRpb25zIiwibW9kZSIsImNyZWRlbnRpYWxzIiwiaGVhZGVycyIsImdldEJvZHlGcm9tUmVxIiwidXJsIiwiZmV0Y2giLCJ0aGVuIiwib2siLCJ0ZXh0IiwiZGVmYXVsdE9wdGlvbnMiLCJyZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2UiLCJodHRwQ2xpZW50RmFjdG9yeSIsImN1c3RvbUluc3RhbmNlT3B0aW9ucyIsImluc3RhbmNlT3B0aW9ucyIsInJlcXVlc3RTdGVwcyIsInJlc3BvbnNlU3RlcHMiLCJjdXN0b21SdW5PcHRpb25zIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJvbWlzZU1ldGhvZCIsInJlamVjdENhbGxiYWNrIiwiYXJnIiwic3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkIiwicG9zdCIsInB1dCIsInBhdGNoIiwiZGVsZXRlIiwib3B0aW9ucyIsIm5ld09wdGlvbnMiLCJhZGRSZXF1ZXN0U3RlcCIsIm5vcm1hbGl6ZUFkZFN0ZXBBcmd1bWVudHMiLCJyZXEiLCJmb28iLCJkb25lIiwidGVzdERhdGEiLCJtZW1DYWNoZSIsInVzZU1lbUNhY2hlIiwidXNlU2F2ZVRvTWVtQ2FjaGUiLCJ1c2VHZXRGcm9tQ2FjaGUiLCJjYWNoZUtleSIsInJlc3BvbnNlSXNDYWNoYWJsZSIsInNlcnZlZEZyb21DYWNoZSIsInNhdmVkVG9DYWNoZSIsImJ1c3RNZW1DYWNoZSIsInBhcnRpYWxVcmwiLCJrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEVBQU8sSUFBTUEsWUFBWSxDQUFDLFFBQVFDLE1BQVIseUNBQVFBLE1BQVIsVUFBdUJDLFFBQXZCLHlDQUF1QkEsUUFBdkIsR0FBaUNDLFFBQWpDLENBQTBDLFdBQTFDLENBQW5COztBQUVQLEVBQU8sSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLEVBQUQ7RUFBQSxNQUFLQyxLQUFMLHVFQUFhLElBQWI7RUFBQSxTQUFzQixZQUV4QztFQUNILFFBQUlOLFNBQUosRUFBZTtFQUNiLGFBQU9LLDhCQUFQO0VBQ0Q7RUFDRCxRQUFJQyxLQUFKLEVBQVc7RUFDVCxZQUFNLElBQUlDLEtBQUosQ0FBYUYsR0FBR0csSUFBaEIsZ0NBQU47RUFDRDtFQUNGLEdBVHNCO0VBQUEsQ0FBaEI7O0VDSFA7QUFDQSx1QkFBZSxZQUVWO0VBQUEsTUFESEMsT0FDRyx1RUFET0MsT0FBT0MsTUFBUCxDQUFjQyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEVBQS9CLENBQ1A7O0VBQ0gsTUFBSUMsUUFBUSxJQUFJQyxPQUFKLEVBQVo7RUFDQSxTQUFPLFVBQUNDLEdBQUQsRUFBUztFQUNkLFFBQUlDLFFBQVFILE1BQU1JLEdBQU4sQ0FBVUYsR0FBVixDQUFaO0VBQ0EsUUFBSSxDQUFDQyxLQUFMLEVBQVk7RUFDVkgsWUFBTUssR0FBTixDQUFVSCxHQUFWLEVBQWdCQyxRQUFRUCxRQUFRTSxHQUFSLENBQXhCO0VBQ0Q7RUFDRCxXQUFPQyxLQUFQO0VBQ0QsR0FORDtFQU9ELENBWEQ7O0VDREE7QUFDQSxnQkFBZSxVQUFDRyxTQUFELEVBQStCO0VB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
