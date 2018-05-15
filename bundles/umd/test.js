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
        throw new Error(fn.name + ' for browser use only');
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
  var all = function all(arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.every(fn);
  };

  var any = function any(arr) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
    return arr.some(fn);
  };

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

  var type = setup();

  var getType = function getType(src) {
  	return getSrcType(src);
  };

  function getSrcType(src) {
  	var type = toString.call(src);
  	if (!typeCache[type]) {
  		var matches = type.match(typeRegexp);
  		if (Array.isArray(matches) && matches.length > 1) {
  			typeCache[type] = matches[1].toLowerCase();
  		}
  	}
  	return typeCache[type];
  }

  function setup() {
  	var checks = {};

  	var _loop = function _loop(i) {
  		var type = types[i].toLowerCase();
  		checks[type] = function (src) {
  			return getSrcType(src) === type;
  		};
  		checks[type].all = doAllApi(checks[type]);
  		checks[type].any = doAnyApi(checks[type]);
  	};

  	for (var i = len; i--;) {
  		_loop(i);
  	}
  	return checks;
  }

  /*  */

  var clone = (function (src) {
    return clone$1(src, [], []);
  });

  var jsonClone = function jsonClone(value) {
    var reviver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (k, v) {
      return v;
    };
    return JSON.parse(JSON.stringify(value), reviver);
  };

  function clone$1(src) {
    var circulars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var clones = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    // Null/undefined/functions/etc
    if (!src || !type.object(src) || type.function(src)) {
      return src;
    }
    var t = getType(src);
    if (t in cloneTypes) {
      return cloneTypes[t].apply(src, [circulars, clones]);
    }
    return src;
  }

  var cloneTypes = Object.freeze({
    'date': function date() {
      return new Date(this.getTime());
    },
    'regexp': function regexp() {
      return new RegExp(this);
    },
    'array': function array() {
      return this.map(clone$1);
    },
    'map': function map() {
      return new Map(Array.from(this.entries()));
    },
    'set': function set() {
      return new Set(Array.from(this.values()));
    },
    'object': function object() {
      var _this = this;

      var circulars = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var clones = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      circulars.push(this);
      var obj = Object.create(this);
      clones.push(obj);

      var _loop = function _loop(key) {
        var idx = circulars.findIndex(function (i) {
          return i === _this[key];
        });
        obj[key] = idx > -1 ? clones[idx] : clone$1(_this[key], circulars, clones);
      };

      for (var key in this) {
        _loop(key);
      }
      return obj;
    }
  });

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
  		it('When non-serializable value is passed in it throws', function () {
  			expect(function () {
  				return jsonClone();
  			}).to.throw(Error);
  			expect(function () {
  				return jsonClone(function () {});
  			}).to.throw(Error);
  			expect(function () {
  				return jsonClone(undefined);
  			}).to.throw(Error);
  		});

  		it('Primitive serializable values', function () {
  			expect(jsonClone(null)).to.be.null;
  			assert.equal(jsonClone(5), 5);
  			assert.equal(jsonClone('string'), 'string');
  			assert.equal(jsonClone(false), false);
  			assert.equal(jsonClone(true), true);
  		});

  		it('Object is not same', function () {
  			var obj = { 'a': 'b' };
  			expect(jsonClone(obj)).not.to.be.equal(obj);
  		});

  		it('Object reviver function', function () {
  			var obj = { 'a': '2' };
  			var cloned = jsonClone(obj, function (k, v) {
  				return k !== '' ? Number(v) * 2 : v;
  			});
  			expect(cloned.a).equal(4);
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
        expect(type.arguments(args)).to.be.true;
      });
      it('should return false if passed parameter type is not arguments', function () {
        var notArgs = ['test'];
        expect(type.arguments(notArgs)).to.be.false;
      });
      it('should return true if passed all parameters arguments', function () {
        var getArguments = function getArguments() {
          return arguments;
        };
        var args = getArguments('test');
        expect(type.arguments.all(args, args, args)).to.be.true;
      });
      it('should return true if passed any parameters arguments', function () {
        var getArguments = function getArguments() {
          return arguments;
        };
        var args = getArguments('test');
        expect(type.arguments.any(args, 'test', 'test2')).to.be.true;
      });
    });

    describe('array', function () {
      it('should return true if passed parameter type is array', function () {
        var array = ['test'];
        expect(type.array(array)).to.be.true;
      });
      it('should return false if passed parameter type is not array', function () {
        var notArray = 'test';
        expect(type.array(notArray)).to.be.false;
      });
      it('should return true if passed parameters all array', function () {
        expect(type.array.all(['test1'], ['test2'], ['test3'])).to.be.true;
      });
      it('should return true if passed parameters any array', function () {
        expect(type.array.any(['test1'], 'test2', 'test3')).to.be.true;
      });
    });

    describe('boolean', function () {
      it('should return true if passed parameter type is boolean', function () {
        var bool = true;
        expect(type.boolean(bool)).to.be.true;
      });
      it('should return false if passed parameter type is not boolean', function () {
        var notBool = 'test';
        expect(type.boolean(notBool)).to.be.false;
      });
    });

    describe('error', function () {
      it('should return true if passed parameter type is error', function () {
        var error = new Error();
        expect(type.error(error)).to.be.true;
      });
      it('should return false if passed parameter type is not error', function () {
        var notError = 'test';
        expect(type.error(notError)).to.be.false;
      });
    });

    describe('function', function () {
      it('should return true if passed parameter type is function', function () {
        expect(type.function(type.function)).to.be.true;
      });
      it('should return false if passed parameter type is not function', function () {
        var notFunction = 'test';
        expect(type.function(notFunction)).to.be.false;
      });
    });

    describe('null', function () {
      it('should return true if passed parameter type is null', function () {
        expect(type.null(null)).to.be.true;
      });
      it('should return false if passed parameter type is not null', function () {
        var notNull = 'test';
        expect(type.null(notNull)).to.be.false;
      });
    });

    describe('number', function () {
      it('should return true if passed parameter type is number', function () {
        expect(type.number(1)).to.be.true;
      });
      it('should return false if passed parameter type is not number', function () {
        var notNumber = 'test';
        expect(type.number(notNumber)).to.be.false;
      });
    });

    describe('object', function () {
      it('should return true if passed parameter type is object', function () {
        expect(type.object({})).to.be.true;
      });
      it('should return false if passed parameter type is not object', function () {
        var notObject = 'test';
        expect(type.object(notObject)).to.be.false;
      });
    });

    describe('regexp', function () {
      it('should return true if passed parameter type is regexp', function () {
        var regexp = new RegExp();
        expect(type.regexp(regexp)).to.be.true;
      });
      it('should return false if passed parameter type is not regexp', function () {
        var notRegexp = 'test';
        expect(type.regexp(notRegexp)).to.be.false;
      });
    });

    describe('string', function () {
      it('should return true if passed parameter type is string', function () {
        expect(type.string('test')).to.be.true;
      });
      it('should return false if passed parameter type is not string', function () {
        expect(type.string(1)).to.be.false;
      });
    });

    describe('undefined', function () {
      it('should return true if passed parameter type is undefined', function () {
        expect(type.undefined(undefined)).to.be.true;
      });
      it('should return false if passed parameter type is not undefined', function () {
        expect(type.undefined(null)).to.be.false;
        expect(type.undefined('test')).to.be.false;
      });
    });

    describe('map', function () {
      it('should return true if passed parameter type is Map', function () {
        expect(type.map(new Map())).to.be.true;
      });
      it('should return false if passed parameter type is not Map', function () {
        expect(type.map(null)).to.be.false;
        expect(type.map(Object.create(null))).to.be.false;
      });
    });

    describe('set', function () {
      it('should return true if passed parameter type is Set', function () {
        expect(type.set(new Set())).to.be.true;
      });
      it('should return false if passed parameter type is not Set', function () {
        expect(type.set(null)).to.be.false;
        expect(type.set(Object.create(null))).to.be.false;
      });
    });
  });

  /*  */

  /**
   * The init object used to initialize a fetch Request.
   * See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
   */

  var privates = createStorage();

  /**
   * A class for configuring HttpClients.
   */
  var Configurator = function () {
    createClass(Configurator, [{
      key: 'baseUrl',
      get: function get$$1() {
        return privates(this).baseUrl;
      }
    }, {
      key: 'defaults',
      get: function get$$1() {
        return Object.freeze(privates(this).defaults);
      }
    }, {
      key: 'interceptors',
      get: function get$$1() {
        return privates(this).interceptors;
      }
    }]);

    function Configurator() {
      classCallCheck(this, Configurator);

      privates(this).baseUrl = '';
      privates(this).interceptors = [];
    }

    Configurator.prototype.withBaseUrl = function withBaseUrl(baseUrl) {
      privates(this).baseUrl = baseUrl;
      return this;
    };

    Configurator.prototype.withDefaults = function withDefaults(defaults$$1) {
      privates(this).defaults = defaults$$1;
      return this;
    };

    Configurator.prototype.withInterceptor = function withInterceptor(interceptor) {
      privates(this).interceptors.push(interceptor);
      return this;
    };

    Configurator.prototype.useStandardConfigurator = function useStandardConfigurator() {
      var standardConfig = {
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-Requested-By': 'DEEP-UI'
        }
      };
      privates(this).defaults = Object.assign({}, standardConfig);
      return this.rejectErrorResponses();
    };

    Configurator.prototype.rejectErrorResponses = function rejectErrorResponses() {
      return this.withInterceptor({ response: rejectOnError });
    };

    return Configurator;
  }();

  var HttpClient = function () {
    function HttpClient(config) {
      classCallCheck(this, HttpClient);

      privates(this).config = config;
    }

    HttpClient.prototype.addInterceptor = function addInterceptor(interceptor) {
      privates(this).config.withInterceptor(interceptor);
    };

    HttpClient.prototype.fetch = function (_fetch) {
      function fetch(_x) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function (input) {
      var _this = this;

      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var request = this._buildRequest(input, init);

      return this._processRequest(request).then(function (result) {
        var response = void 0;

        if (result instanceof Response) {
          response = Promise.resolve(result);
        } else if (result instanceof Request) {
          request = result;
          response = fetch(result);
        } else {
          throw new Error('An invalid result was returned by the interceptor chain. Expected a Request or Response instance');
        }
        return _this._processResponse(response);
      }).then(function (result) {
        if (result instanceof Request) {
          return _this.fetch(result);
        }
        return result;
      });
    });

    HttpClient.prototype.get = function get$$1(input, init) {
      return this.fetch(input, init);
    };

    HttpClient.prototype.post = function post(input, body, init) {
      return this._fetch(input, 'POST', body, init);
    };

    HttpClient.prototype.put = function put(input, body, init) {
      return this._fetch(input, 'PUT', body, init);
    };

    HttpClient.prototype.patch = function patch(input, body, init) {
      return this._fetch(input, 'PATCH', body, init);
    };

    HttpClient.prototype.delete = function _delete(input, body, init) {
      return this._fetch(input, 'DELETE', body, init);
    };

    HttpClient.prototype._buildRequest = function _buildRequest(input) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var defaults$$1 = privates(this).config.defaults || {};
      var request = void 0;
      var body = '';
      var requestContentType = void 0;
      var parsedDefaultHeaders = parseHeaderValues(defaults$$1.headers);

      if (input instanceof Request) {
        request = input;
        requestContentType = new Headers(request.headers).get('Content-Type');
      } else {
        body = init.body;
        var bodyObj = body ? { body: body } : null;
        var requestInit = Object.assign({}, defaults$$1, { headers: {} }, init, bodyObj);
        requestContentType = new Headers(requestInit.headers).get('Content-Type');
        request = new Request(getRequestUrl(privates(this).config.baseUrl, input), requestInit);
      }
      if (!requestContentType) {
        if (new Headers(parsedDefaultHeaders).has('content-type')) {
          request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
        } else if (body && isJSON(String(body))) {
          request.headers.set('Content-Type', 'application/json');
        }
      }
      setDefaultHeaders(request.headers, parsedDefaultHeaders);
      if (body && body instanceof Blob && body.type) {
        // work around bug in IE & Edge where the Blob type is ignored in the request
        // https://connect.microsoft.com/IE/feedback/details/2136163
        request.headers.set('Content-Type', body.type);
      }
      return request;
    };

    HttpClient.prototype._processRequest = function _processRequest(request) {
      return applyInterceptors(request, privates(this).config.interceptors, 'request', 'requestError');
    };

    HttpClient.prototype._processResponse = function _processResponse(response) {
      return applyInterceptors(response, privates(this).config.interceptors, 'response', 'responseError');
    };

    HttpClient.prototype._fetch = function _fetch(input, method, body, init) {
      if (!init) {
        init = {};
      }
      init.method = method;
      if (body) {
        init.body = body;
      }
      return this.fetch(input, init);
    };

    return HttpClient;
  }();

  var createHttpClient = (function () {
    var configure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig;

    if (type.undefined(fetch)) {
      throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
    }
    var config = new Configurator();
    configure(config);
    return new HttpClient(config);
  });

  function applyInterceptors(input) {
    var interceptors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var successName = arguments[2];
    var errorName = arguments[3];

    return interceptors.reduce(function (chain, interceptor) {
      // $FlowFixMe
      var successHandler = interceptor[successName];
      // $FlowFixMe
      var errorHandler = interceptor[errorName];
      return chain.then(successHandler && successHandler.bind(interceptor) || identity, errorHandler && errorHandler.bind(interceptor) || thrower);
    }, Promise.resolve(input));
  }

  function rejectOnError(response) {
    if (!response.ok) {
      throw response;
    }
    return response;
  }

  function identity(x) {
    return x;
  }

  function thrower(x) {
    throw x;
  }

  function parseHeaderValues(headers) {
    var parsedHeaders = {};
    for (var name in headers || {}) {
      if (headers.hasOwnProperty(name)) {
        // $FlowFixMe
        parsedHeaders[name] = type.function(headers[name]) ? headers[name]() : headers[name];
      }
    }
    return parsedHeaders;
  }

  var absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

  function getRequestUrl(baseUrl, url) {
    if (absoluteUrlRegexp.test(url)) {
      return url;
    }

    return (baseUrl || '') + url;
  }

  function setDefaultHeaders(headers, defaultHeaders) {
    for (var name in defaultHeaders || {}) {
      if (defaultHeaders.hasOwnProperty(name) && !headers.has(name)) {
        headers.set(name, defaultHeaders[name]);
      }
    }
  }

  function isJSON(str) {
    try {
      JSON.parse(str);
    } catch (err) {
      return false;
    }

    return true;
  }

  function defaultConfig(config) {
    config.useStandardConfigurator();
  }

  describe('http-client', function () {
  	it('able to make a GET request for JSON', function (done) {
  		createHttpClient().get('/http-client-get-test').then(function (response) {
  			return response.json();
  		}).then(function (data) {
  			chai.expect(data.foo).to.equal('1');
  			done();
  		});
  	});

  	it('able to make a POST request for JSON', function (done) {
  		createHttpClient().post('/http-client-post-test', JSON.stringify({ testData: '1' })).then(function (response) {
  			return response.json();
  		}).then(function (data) {
  			chai.expect(data.foo).to.equal('2');
  			done();
  		});
  	});

  	it('able to make a PUT request for JSON', function (done) {
  		createHttpClient().put('/http-client-put-test').then(function (response) {
  			return response.json();
  		}).then(function (data) {
  			chai.expect(data.created).to.equal(true);
  			done();
  		});
  	});

  	it('able to make a PATCH request for JSON', function (done) {
  		createHttpClient().patch('/http-client-patch-test').then(function (response) {
  			return response.json();
  		}).then(function (data) {
  			chai.expect(data.updated).to.equal(true);
  			done();
  		});
  	});

  	it('able to make a DELETE request for JSON', function (done) {
  		createHttpClient().delete('/http-client-delete-test').then(function (response) {
  			return response.json();
  		}).then(function (data) {
  			chai.expect(data.deleted).to.equal(true);
  			done();
  		});
  	});

  	it("able to make a GET request for a TEXT", function (done) {
  		createHttpClient().get('/http-client-response-not-json').then(function (response) {
  			return response.text();
  		}).then(function (response) {
  			chai.expect(response).to.equal('not json');
  			done();
  		});
  	});
  });

  /*  */

  var dset = function dset(obj, key, value) {
    if (key.indexOf('.') === -1) {
      obj[key] = value;
      return;
    }
    var parts = key.split('.');
    var depth = parts.length - 1;
    var object = obj;

    for (var i = 0; i < depth; i++) {
      if (type.undefined(object[parts[i]])) {
        object[parts[i]] = {};
      }
      object = object[parts[i]];
    }
    object[parts[depth]] = value;
  };

  var dget = function dget(obj, key) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    if (key.indexOf('.') === -1) {
      return obj[key] ? obj[key] : defaultValue;
    }
    var parts = key.split('.');
    var length = parts.length;
    var object = obj;

    for (var i = 0; i < length; i++) {
      object = object[parts[i]];
      if (type.undefined(object)) {
        object = defaultValue;
        return;
      }
    }
    return object;
  };

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

  var model = function model() {
    var baseClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
      function _class() {
        classCallCheck(this, _class);
      }

      return _class;
    }();

    var privates = createStorage();
    var subscriberCount = 0;

    return function (_baseClass) {
      inherits(Model, _baseClass);

      function Model() {
        classCallCheck(this, Model);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var _this = possibleConstructorReturn(this, _baseClass.call.apply(_baseClass, [this].concat(args)));

        _this._stateKey = uniqueId('_state');
        _this._subscribers = new Map();
        _this._setState(_this.defaultState);
        return _this;
      }

      Model.prototype.get = function get$$1(accessor) {
        return this._getState(accessor);
      };

      Model.prototype.set = function set$$1(arg1, arg2) {
        //supports (accessor, state) OR (state) arguments for setting the whole thing
        var accessor = void 0,
            value = void 0;
        if (!type.string(arg1) && type.undefined(arg2)) {
          value = arg1;
        } else {
          value = arg2;
          accessor = arg1;
        }
        var oldState = this._getState();
        var newState = jsonClone(oldState);

        if (accessor) {
          dset(newState, accessor, value);
        } else {
          newState = value;
        }
        this._setState(newState);
        this._notifySubscribers(accessor, newState, oldState);
        return this;
      };

      Model.prototype.createSubscriber = function createSubscriber() {
        var context = subscriberCount++;
        var self = this;
        return {
          on: function on() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            self._subscribe.apply(self, [context].concat(args));
            return this;
          },
          //TODO: is off() needed for individual subscription?
          destroy: this._destroySubscriber.bind(this, context)
        };
      };

      Model.prototype.createPropertyBinder = function createPropertyBinder(context) {
        if (!context) {
          throw new Error('createPropertyBinder(context) - context must be object');
        }
        var self = this;
        return {
          addBindings: function addBindings(bindRules) {
            if (!Array.isArray(bindRules[0])) {
              bindRules = [bindRules];
            }
            bindRules.forEach(function (bindRule) {
              self._subscribe(context, bindRule[0], function (value) {
                dset(context, bindRule[1], value);
              });
            });
            return this;
          },
          destroy: this._destroySubscriber.bind(this, context)
        };
      };

      Model.prototype._getState = function _getState(accessor) {
        return jsonClone(accessor ? dget(privates[this._stateKey], accessor) : privates[this._stateKey]);
      };

      Model.prototype._setState = function _setState(newState) {
        privates[this._stateKey] = newState;
      };

      Model.prototype._subscribe = function _subscribe(context, accessor, cb) {
        var subscriptions = this._subscribers.get(context) || [];
        subscriptions.push({ accessor: accessor, cb: cb });
        this._subscribers.set(context, subscriptions);
      };

      Model.prototype._destroySubscriber = function _destroySubscriber(context) {
        this._subscribers.delete(context);
      };

      Model.prototype._notifySubscribers = function _notifySubscribers(setAccessor, newState, oldState) {
        this._subscribers.forEach(function (subscribers) {
          subscribers.forEach(function (_ref) {
            var accessor = _ref.accessor,
                cb = _ref.cb;

            //e.g.  sa='foo.bar.baz', a='foo.bar.baz'
            //e.g.  sa='foo.bar.baz', a='foo.bar.baz.blaz'
            if (accessor.indexOf(setAccessor) === 0) {
              cb(dget(newState, accessor), dget(oldState, accessor));
              return;
            }
            //e.g. sa='foo.bar.baz', a='foo.*'
            if (accessor.indexOf('*') > -1) {
              var deepAccessor = accessor.replace('.*', '').replace('*', '');
              if (setAccessor.indexOf(deepAccessor) === 0) {
                cb(dget(newState, deepAccessor), dget(oldState, deepAccessor));
                return;
              }
            }
          });
        });
      };

      createClass(Model, [{
        key: 'defaultState',
        get: function get$$1() {
          return {};
        }
      }]);
      return Model;
    }(baseClass);
  };

  var _this2 = undefined;

  var Model = function (_model) {
  	inherits(Model, _model);

  	function Model() {
  		classCallCheck(this, Model);
  		return possibleConstructorReturn(this, _model.apply(this, arguments));
  	}

  	createClass(Model, [{
  		key: "defaultState",
  		get: function get$$1() {
  			return { foo: 1 };
  		}
  	}]);
  	return Model;
  }(model());

  describe("Model methods", function () {

  	it("defaultState works", function () {
  		var myModel = new Model();
  		chai.expect(myModel.get('foo')).to.equal(1);
  	});

  	it("get()/set() works", function () {
  		var myModel = new Model().set('foo', 2);
  		chai.expect(myModel.get('foo')).to.equal(2);
  	});

  	it("deep get()/set() works", function () {
  		var myModel = new Model().set({
  			deepObj1: {
  				deepObj2: 1
  			}
  		});
  		myModel.set('deepObj1.deepObj2', 2);
  		chai.expect(myModel.get('deepObj1.deepObj2')).to.equal(2);
  	});

  	it("deep get()/set() with arrays work", function () {
  		var myModel = new Model().set({
  			deepObj1: {
  				deepObj2: []
  			}
  		});
  		myModel.set('deepObj1.deepObj2.0', 'dog');
  		chai.expect(myModel.get('deepObj1.deepObj2.0')).to.equal('dog');
  		myModel.set('deepObj1.deepObj2.0', { foo: 1 });
  		chai.expect(myModel.get('deepObj1.deepObj2.0.foo')).to.equal(1);
  		myModel.set('deepObj1.deepObj2.0.foo', 2);
  		chai.expect(myModel.get('deepObj1.deepObj2.0.foo')).to.equal(2);
  	});

  	it("subscriptions works", function () {
  		var myModel = new Model().set({
  			deepObj1: {
  				deepObj2: [{
  					selected: false
  				}, {
  					selected: true
  				}]
  			}
  		});
  		var TEST_SEL = 'deepObj1.deepObj2.0.selected';

  		var myModelSubscriber = myModel.createSubscriber();
  		var numCallbacksCalled = 0;

  		myModelSubscriber.on(TEST_SEL, function (newValue, oldValue) {
  			numCallbacksCalled++;
  			chai.expect(newValue).to.equal(true);
  			chai.expect(oldValue).to.equal(false);
  		});

  		myModelSubscriber.on('deepObj1', function (newValue, oldValue) {
  			numCallbacksCalled++;
  			throw 'no subscriber should be called for deepObj1';
  		});

  		myModelSubscriber.on('deepObj1.*', function (newValue, oldValue) {
  			numCallbacksCalled++;
  			chai.expect(newValue.deepObj2[0].selected).to.equal(true);
  			chai.expect(oldValue.deepObj2[0].selected).to.equal(false);
  		});

  		myModel.set(TEST_SEL, true);
  		myModelSubscriber.destroy();
  		chai.expect(numCallbacksCalled).to.equal(2);
  	});

  	it("subscribers can be destroyed", function () {
  		var myModel = new Model().set({
  			deepObj1: {
  				deepObj2: [{
  					selected: false
  				}, {
  					selected: true
  				}]
  			}
  		});
  		myModel.TEST_SEL = 'deepObj1.deepObj2.0.selected';

  		var myModelSubscriber = myModel.createSubscriber();

  		myModelSubscriber.on(myModel.TEST_SEL, function (newValue, oldValue) {
  			throw new Error('should not be observed');
  		});
  		myModelSubscriber.destroy();
  		myModel.set(myModel.TEST_SEL, true);
  	});

  	it("properties bound from model to custom element", function () {
  		var myModel = new Model();
  		chai.expect(myModel.get('foo')).to.equal(1);

  		var myElement = document.createElement('properties-mixin-test');

  		var observer = myModel.createSubscriber().on('foo', function (value) {
  			_this2.prop = value;
  		});
  		observer.destroy();

  		var propertyBinder = myModel.createPropertyBinder(myElement).addBindings(['foo', 'prop']);

  		myModel.set('foo', '3');
  		chai.expect(myElement.prop).to.equal('3');
  		propertyBinder.destroy();
  		myModel.set('foo', '2');
  		chai.expect(myElement.prop).to.equal('3');
  	});
  });

  /*  */

  var eventHubFactory = function eventHubFactory() {
    var subscribers = new Map();
    var subscriberCount = 0;

    //$FlowFixMe
    return {
      publish: function publish(event) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        subscribers.forEach(function (subscriptions) {
          (subscriptions.get(event) || []).forEach(function (callback) {
            callback.apply(undefined, args);
          });
        });
        return this;
      },
      createSubscriber: function createSubscriber() {
        var context = subscriberCount++;
        return {
          on: function on(event, callback) {
            if (!subscribers.has(context)) {
              subscribers.set(context, new Map());
            }
            //$FlowFixMe
            var subscriber = subscribers.get(context);
            if (!subscriber.has(event)) {
              subscriber.set(event, []);
            }
            //$FlowFixMe
            subscriber.get(event).push(callback);
            return this;
          },
          off: function off(event) {
            //$FlowFixMe
            subscribers.get(context).delete(event);
            return this;
          },
          destroy: function destroy() {
            subscribers.delete(context);
          }
        };
      }
    };
  };

  describe("EventHub methods", function () {

    it("basic pub/sub works", function (done) {
      var myEventHub = eventHubFactory();
      var myEventHubSubscriber = myEventHub.createSubscriber().on('foo', function (data) {
        chai.expect(data).to.equal(1);
        done();
      });
      myEventHub.publish('foo', 1); //should trigger event
    });

    it("multiple subscribers work", function () {
      var myEventHub = eventHubFactory();
      var numCallbacksCalled = 0;
      var myEventHubSubscriber = myEventHub.createSubscriber().on('foo', function (data) {
        numCallbacksCalled++;
        chai.expect(data).to.equal(1);
      });

      var myEventHubSubscriber2 = myEventHub.createSubscriber().on('foo', function (data) {
        numCallbacksCalled++;
        chai.expect(data).to.equal(1);
      });

      myEventHub.publish('foo', 1); //should trigger event
      chai.expect(numCallbacksCalled).to.equal(2);
    });

    it("multiple subscriptions work", function () {
      var myEventHub = eventHubFactory();
      var numCallbacksCalled = 0;
      var myEventHubSubscriber = myEventHub.createSubscriber().on('foo', function (data) {
        numCallbacksCalled++;
        chai.expect(data).to.equal(1);
      }).on('bar', function (data) {
        numCallbacksCalled++;
        chai.expect(data).to.equal(2);
      });

      myEventHub.publish('foo', 1); //should trigger event
      myEventHub.publish('bar', 2); //should trigger event
      chai.expect(numCallbacksCalled).to.equal(2);
    });

    it("destroy() works", function () {
      var myEventHub = eventHubFactory();
      var numCallbacksCalled = 0;
      var myEventHubSubscriber = myEventHub.createSubscriber().on('foo', function (data) {
        numCallbacksCalled++;
        throw new Error('foo should not get called in this test');
      });
      myEventHub.publish('nothing listening', 2); //should be no-op
      myEventHubSubscriber.destroy();
      myEventHub.publish('foo'); //should be no-op
      chai.expect(numCallbacksCalled).to.equal(0);
    });

    it("off() works", function () {
      var myEventHub = eventHubFactory();
      var numCallbacksCalled = 0;
      var myEventHubSubscriber = myEventHub.createSubscriber().on('foo', function (data) {
        numCallbacksCalled++;
        throw new Error('foo should not get called in this test');
      }).on('bar', function (data) {
        numCallbacksCalled++;
        chai.expect(data).to.equal(undefined);
      }).off('foo');
      myEventHub.publish('nothing listening', 2); //should be no-op
      myEventHub.publish('foo'); //should be no-op
      myEventHub.publish('bar'); //should called
      chai.expect(numCallbacksCalled).to.equal(1);
    });
  });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkuanMiLCIuLi8uLi9saWIvdHlwZS5qcyIsIi4uLy4uL2xpYi9jbG9uZS5qcyIsIi4uLy4uL3Rlc3QvY2xvbmUuanMiLCIuLi8uLi90ZXN0L3R5cGUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9ICFbdHlwZW9mIHdpbmRvdywgdHlwZW9mIGRvY3VtZW50XS5pbmNsdWRlcyhcbiAgJ3VuZGVmaW5lZCdcbik7XG5cbmV4cG9ydCBjb25zdCBicm93c2VyID0gKGZuLCByYWlzZSA9IHRydWUpID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbiAgaWYgKHJhaXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2ZuLm5hbWV9IGZvciBicm93c2VyIHVzZSBvbmx5YCk7XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcihcbiAgKFxuICAgIHRhcmdldCxcbiAgICB0eXBlLFxuICAgIGxpc3RlbmVyLFxuICAgIGNhcHR1cmUgPSBmYWxzZVxuICApID0+IHtcbiAgICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdwcm9wZXJ0aWVzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2V2ZW50cy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBjb25zdCBhbGwgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG5cbmV4cG9ydCBjb25zdCBhbnkgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoXG5cdC4uLnBhcmFtc1xuKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKFxuXHQuLi5wYXJhbXNcbikgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnTWFwIFNldCBTeW1ib2wgQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuXHQnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuXG5leHBvcnQgZGVmYXVsdCAoc2V0dXAoKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUeXBlID0gKHNyYykgPT4gZ2V0U3JjVHlwZShzcmMpO1xuXG5mdW5jdGlvbiBnZXRTcmNUeXBlKHNyYykge1xuXHRsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwoc3JjKTtcblx0aWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcblx0XHRsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHR0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gc3JjID0+IGdldFNyY1R5cGUoc3JjKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSwge2dldFR5cGV9IGZyb20gJy4vdHlwZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzcmMpID0+IGNsb25lKHNyYywgW10sIFtdKTtcblxuZXhwb3J0IGNvbnN0IGpzb25DbG9uZSA9IChcblx0dmFsdWUsXG5cdHJldml2ZXIgPSAoaywgdikgPT4gdlxuKSA9PiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSwgcmV2aXZlcik7XG5cbmZ1bmN0aW9uIGNsb25lKHNyYywgY2lyY3VsYXJzID0gW10sIGNsb25lcyA9IFtdKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuICBjb25zdCB0ID0gZ2V0VHlwZShzcmMpO1xuICBpZiAodCBpbiBjbG9uZVR5cGVzKSB7XG4gICAgcmV0dXJuIGNsb25lVHlwZXNbdF0uYXBwbHkoc3JjLCBbY2lyY3VsYXJzLCBjbG9uZXNdKTtcbiAgfVxuICByZXR1cm4gc3JjO1xufVxuXG5jb25zdCBjbG9uZVR5cGVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICdkYXRlJzogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlKHRoaXMuZ2V0VGltZSgpKTtcbiAgfSxcblx0J3JlZ2V4cCc6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBuZXcgUmVnRXhwKHRoaXMpO1xuICB9LFxuICAnYXJyYXknOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoY2xvbmUpO1xuICB9LFxuICAnbWFwJzogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbSh0aGlzLmVudHJpZXMoKSkpO1xuICB9LFxuICAnc2V0JzogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbSh0aGlzLnZhbHVlcygpKSk7XG4gIH0sXG4gICdvYmplY3QnOiBmdW5jdGlvbihjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcblx0XHRjaXJjdWxhcnMucHVzaCh0aGlzKTtcblx0XHRjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuXHRcdGNsb25lcy5wdXNoKG9iaik7XG5cdFx0Zm9yIChsZXQga2V5IGluIHRoaXMpIHtcblx0XHRcdGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSB0aGlzW2tleV0pO1xuXHRcdFx0b2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG5cdFx0fVxuXHRcdHJldHVybiBvYmo7XG5cdH1cbn0pOyIsImltcG9ydCBjbG9uZSwge2pzb25DbG9uZX0gZnJvbSAnLi4vbGliL2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuICBkZXNjcmliZSgncHJpbWl0aXZlcycsICgpID0+IHtcbiAgICBpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChjbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihjbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnanNvbkNsb25lJywgKCkgPT4ge1xuICAgIGl0KCdXaGVuIG5vbi1zZXJpYWxpemFibGUgdmFsdWUgaXMgcGFzc2VkIGluIGl0IHRocm93cycsICgpID0+IHtcblx0XHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKSkudG8udGhyb3coRXJyb3IpO1xuXHRcdFx0ZXhwZWN0KCgpID0+IGpzb25DbG9uZSgoKSA9PiB7fSkpLnRvLnRocm93KEVycm9yKTtcblx0XHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUodW5kZWZpbmVkKSkudG8udGhyb3coRXJyb3IpO1xuICAgIH0pO1xuXG5cdFx0aXQoJ1ByaW1pdGl2ZSBzZXJpYWxpemFibGUgdmFsdWVzJywgKCkgPT4ge1xuXHRcdFx0ZXhwZWN0KGpzb25DbG9uZShudWxsKSkudG8uYmUubnVsbDtcblx0XHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuXHRcdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcblx0XHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcblx0XHR9KTtcblxuXHRcdGl0KCdPYmplY3QgaXMgbm90IHNhbWUnLCAoKSA9PiB7XG5cdFx0ICBjb25zdCBvYmogPSB7J2EnOiAnYid9O1xuXHRcdFx0ZXhwZWN0KGpzb25DbG9uZShvYmopKS5ub3QudG8uYmUuZXF1YWwob2JqKTtcblx0XHR9KTtcblxuXHRcdGl0KCdPYmplY3QgcmV2aXZlciBmdW5jdGlvbicsICgpID0+IHtcblx0XHRcdGNvbnN0IG9iaiA9IHsnYSc6ICcyJ307XG5cdFx0XHRjb25zdCBjbG9uZWQgPSBqc29uQ2xvbmUob2JqLCAoaywgdikgPT4gayAhPT0gJycgPyBOdW1iZXIodikgKiAyIDogdik7XG5cdFx0XHRleHBlY3QoY2xvbmVkLmEpLmVxdWFsKDQpO1xuXHRcdH0pO1xuXHR9KTtcbn0pO1xuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi90eXBlLmpzJztcblxuZGVzY3JpYmUoJ3R5cGUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3Qgbm90QXJncyA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhub3RBcmdzKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYWxsIHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFsbChhcmdzLCBhcmdzLCBhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbnkgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBhcnJheSA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IGJvb2wgPSB0cnVlO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEJvb2wgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bGwgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcbiAgICAgIGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE9iamVjdCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcbiAgICAgIGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCBub3RSZWdleHAgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG5ldyBNYXAoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5tYXAoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobmV3IFNldCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnNldChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IHR5cGUgZnJvbSAnLi90eXBlLmpzJztcblxuXG5cbi8qKlxuICogVGhlIGluaXQgb2JqZWN0IHVzZWQgdG8gaW5pdGlhbGl6ZSBhIGZldGNoIFJlcXVlc3QuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QvUmVxdWVzdFxuICovXG5cbmNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4vKipcbiAqIEEgY2xhc3MgZm9yIGNvbmZpZ3VyaW5nIEh0dHBDbGllbnRzLlxuICovXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhdG9yIHtcbiAgZ2V0IGJhc2VVcmwoKSB7XG4gICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmJhc2VVcmw7XG4gIH1cblxuICBnZXQgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5mcmVlemUocHJpdmF0ZXModGhpcykuZGVmYXVsdHMpO1xuICB9XG5cbiAgZ2V0IGludGVyY2VwdG9ycygpIHtcbiAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW50ZXJjZXB0b3JzO1xuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgcHJpdmF0ZXModGhpcykuYmFzZVVybCA9ICcnO1xuICAgIHByaXZhdGVzKHRoaXMpLmludGVyY2VwdG9ycyA9IFtdO1xuICB9XG5cbiAgd2l0aEJhc2VVcmwoYmFzZVVybCkge1xuICAgIHByaXZhdGVzKHRoaXMpLmJhc2VVcmwgPSBiYXNlVXJsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aERlZmF1bHRzKGRlZmF1bHRzKSB7XG4gICAgcHJpdmF0ZXModGhpcykuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHByaXZhdGVzKHRoaXMpLmludGVyY2VwdG9ycy5wdXNoKGludGVyY2VwdG9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCkge1xuICAgIGxldCBzdGFuZGFyZENvbmZpZyA9IHtcbiAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknXG4gICAgICB9XG4gICAgfTtcbiAgICBwcml2YXRlcyh0aGlzKS5kZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oe30sIHN0YW5kYXJkQ29uZmlnKTtcbiAgICByZXR1cm4gdGhpcy5yZWplY3RFcnJvclJlc3BvbnNlcygpO1xuICB9XG5cbiAgcmVqZWN0RXJyb3JSZXNwb25zZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aEludGVyY2VwdG9yKHsgcmVzcG9uc2U6IHJlamVjdE9uRXJyb3IgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnQge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBhZGRJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZy53aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpO1xuICB9XG5cbiAgZmV0Y2goaW5wdXQsIGluaXQgPSB7fSkge1xuICAgIGxldCByZXF1ZXN0ID0gdGhpcy5fYnVpbGRSZXF1ZXN0KGlucHV0LCBpbml0KTtcblxuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVxdWVzdChyZXF1ZXN0KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBsZXQgcmVzcG9uc2U7XG5cbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICAgICAgcmVxdWVzdCA9IHJlc3VsdDtcbiAgICAgICAgICByZXNwb25zZSA9IGZldGNoKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEFuIGludmFsaWQgcmVzdWx0IHdhcyByZXR1cm5lZCBieSB0aGUgaW50ZXJjZXB0b3IgY2hhaW4uIEV4cGVjdGVkIGEgUmVxdWVzdCBvciBSZXNwb25zZSBpbnN0YW5jZWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaChyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgfVxuXG4gIGdldChpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLmZldGNoKGlucHV0LCBpbml0KTtcbiAgfVxuXG4gIHBvc3QoaW5wdXQsIGJvZHksIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2goaW5wdXQsICdQT1NUJywgYm9keSwgaW5pdCk7XG4gIH1cblxuICBwdXQoaW5wdXQsIGJvZHksIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2goaW5wdXQsICdQVVQnLCBib2R5LCBpbml0KTtcbiAgfVxuXG4gIHBhdGNoKGlucHV0LCBib2R5LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoKGlucHV0LCAnUEFUQ0gnLCBib2R5LCBpbml0KTtcbiAgfVxuXG4gIGRlbGV0ZShpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ0RFTEVURScsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgX2J1aWxkUmVxdWVzdChpbnB1dCwgaW5pdCA9IHt9KSB7XG4gICAgbGV0IGRlZmF1bHRzID0gcHJpdmF0ZXModGhpcykuY29uZmlnLmRlZmF1bHRzIHx8IHt9O1xuICAgIGxldCByZXF1ZXN0O1xuICAgIGxldCBib2R5ID0gJyc7XG4gICAgbGV0IHJlcXVlc3RDb250ZW50VHlwZTtcbiAgICBsZXQgcGFyc2VkRGVmYXVsdEhlYWRlcnMgPSBwYXJzZUhlYWRlclZhbHVlcyhkZWZhdWx0cy5oZWFkZXJzKTtcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3QuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm9keSA9IGluaXQuYm9keTtcbiAgICAgIGxldCBib2R5T2JqID0gYm9keSA/IHsgYm9keSB9IDogbnVsbDtcbiAgICAgIGxldCByZXF1ZXN0SW5pdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCB7IGhlYWRlcnM6IHt9IH0sIGluaXQsIGJvZHlPYmopO1xuICAgICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdEluaXQuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChnZXRSZXF1ZXN0VXJsKHByaXZhdGVzKHRoaXMpLmNvbmZpZy5iYXNlVXJsLCBpbnB1dCksIHJlcXVlc3RJbml0KTtcbiAgICB9XG4gICAgaWYgKCFyZXF1ZXN0Q29udGVudFR5cGUpIHtcbiAgICAgIGlmIChuZXcgSGVhZGVycyhwYXJzZWREZWZhdWx0SGVhZGVycykuaGFzKCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBuZXcgSGVhZGVycyhwYXJzZWREZWZhdWx0SGVhZGVycykuZ2V0KCdjb250ZW50LXR5cGUnKSk7XG4gICAgICB9IGVsc2UgaWYgKGJvZHkgJiYgaXNKU09OKFN0cmluZyhib2R5KSkpIHtcbiAgICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0RGVmYXVsdEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzLCBwYXJzZWREZWZhdWx0SGVhZGVycyk7XG4gICAgaWYgKGJvZHkgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IgJiYgYm9keS50eXBlKSB7XG4gICAgICAvLyB3b3JrIGFyb3VuZCBidWcgaW4gSUUgJiBFZGdlIHdoZXJlIHRoZSBCbG9iIHR5cGUgaXMgaWdub3JlZCBpbiB0aGUgcmVxdWVzdFxuICAgICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy8yMTM2MTYzXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBib2R5LnR5cGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfVxuXG4gIF9wcm9jZXNzUmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIGFwcGx5SW50ZXJjZXB0b3JzKHJlcXVlc3QsIHByaXZhdGVzKHRoaXMpLmNvbmZpZy5pbnRlcmNlcHRvcnMsICdyZXF1ZXN0JywgJ3JlcXVlc3RFcnJvcicpO1xuICB9XG5cbiAgX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSkge1xuICAgIHJldHVybiBhcHBseUludGVyY2VwdG9ycyhyZXNwb25zZSwgcHJpdmF0ZXModGhpcykuY29uZmlnLmludGVyY2VwdG9ycywgJ3Jlc3BvbnNlJywgJ3Jlc3BvbnNlRXJyb3InKTtcbiAgfVxuXG4gIF9mZXRjaChpbnB1dCwgbWV0aG9kLCBib2R5LCBpbml0KSB7XG4gICAgaWYgKCFpbml0KSB7XG4gICAgICBpbml0ID0ge307XG4gICAgfVxuICAgIGluaXQubWV0aG9kID0gbWV0aG9kO1xuICAgIGlmIChib2R5KSB7XG4gICAgICBpbml0LmJvZHkgPSBib2R5O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5mZXRjaChpbnB1dCwgaW5pdCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKGNvbmZpZ3VyZSA9IGRlZmF1bHRDb25maWcpID0+IHtcbiAgaWYgKHR5cGUudW5kZWZpbmVkKGZldGNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIik7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gbmV3IENvbmZpZ3VyYXRvcigpO1xuICBjb25maWd1cmUoY29uZmlnKTtcbiAgcmV0dXJuIG5ldyBIdHRwQ2xpZW50KGNvbmZpZyk7XG59O1xuXG5mdW5jdGlvbiBhcHBseUludGVyY2VwdG9ycyhcbiAgaW5wdXQsXG4gIGludGVyY2VwdG9ycyA9IFtdLFxuICBzdWNjZXNzTmFtZSxcbiAgZXJyb3JOYW1lXG4pIHtcbiAgcmV0dXJuIGludGVyY2VwdG9ycy5yZWR1Y2UoKGNoYWluLCBpbnRlcmNlcHRvcikgPT4ge1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBzdWNjZXNzSGFuZGxlciA9IGludGVyY2VwdG9yW3N1Y2Nlc3NOYW1lXTtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3QgZXJyb3JIYW5kbGVyID0gaW50ZXJjZXB0b3JbZXJyb3JOYW1lXTtcbiAgICByZXR1cm4gY2hhaW4udGhlbihcbiAgICAgIChzdWNjZXNzSGFuZGxlciAmJiBzdWNjZXNzSGFuZGxlci5iaW5kKGludGVyY2VwdG9yKSkgfHwgaWRlbnRpdHksXG4gICAgICAoZXJyb3JIYW5kbGVyICYmIGVycm9ySGFuZGxlci5iaW5kKGludGVyY2VwdG9yKSkgfHwgdGhyb3dlclxuICAgICk7XG4gIH0sIFByb21pc2UucmVzb2x2ZShpbnB1dCkpO1xufVxuXG5mdW5jdGlvbiByZWplY3RPbkVycm9yKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyByZXNwb25zZTtcbiAgfVxuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbmZ1bmN0aW9uIHRocm93ZXIoeCkge1xuICB0aHJvdyB4O1xufVxuXG5mdW5jdGlvbiBwYXJzZUhlYWRlclZhbHVlcyhoZWFkZXJzKSB7XG4gIGxldCBwYXJzZWRIZWFkZXJzID0ge307XG4gIGZvciAobGV0IG5hbWUgaW4gaGVhZGVycyB8fCB7fSkge1xuICAgIGlmIChoZWFkZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBwYXJzZWRIZWFkZXJzW25hbWVdID0gdHlwZS5mdW5jdGlvbihoZWFkZXJzW25hbWVdKSA/IGhlYWRlcnNbbmFtZV0oKSA6IGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJzZWRIZWFkZXJzO1xufVxuXG5jb25zdCBhYnNvbHV0ZVVybFJlZ2V4cCA9IC9eKFthLXpdW2EtejAtOStcXC0uXSo6KT9cXC9cXC8vaTtcblxuZnVuY3Rpb24gZ2V0UmVxdWVzdFVybChiYXNlVXJsLCB1cmwpIHtcbiAgaWYgKGFic29sdXRlVXJsUmVnZXhwLnRlc3QodXJsKSkge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICByZXR1cm4gKGJhc2VVcmwgfHwgJycpICsgdXJsO1xufVxuXG5mdW5jdGlvbiBzZXREZWZhdWx0SGVhZGVycyhoZWFkZXJzLCBkZWZhdWx0SGVhZGVycykge1xuICBmb3IgKGxldCBuYW1lIGluIGRlZmF1bHRIZWFkZXJzIHx8IHt9KSB7XG4gICAgaWYgKGRlZmF1bHRIZWFkZXJzLmhhc093blByb3BlcnR5KG5hbWUpICYmICFoZWFkZXJzLmhhcyhuYW1lKSkge1xuICAgICAgaGVhZGVycy5zZXQobmFtZSwgZGVmYXVsdEhlYWRlcnNbbmFtZV0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0pTT04oc3RyKSB7XG4gIHRyeSB7XG4gICAgSlNPTi5wYXJzZShzdHIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdENvbmZpZyhjb25maWcpIHtcbiAgY29uZmlnLnVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCk7XG59XG4iLCJpbXBvcnQgY3JlYXRlSHR0cENsaWVudCBmcm9tICcuLi9saWIvaHR0cC1jbGllbnQuanMnO1xuXG5kZXNjcmliZSgnaHR0cC1jbGllbnQnLCAoKSA9PiB7XG5cdGl0KCdhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5nZXQoJy9odHRwLWNsaWVudC1nZXQtdGVzdCcpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcxJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pXG5cdH0pO1xuXG5cdGl0KCdhYmxlIHRvIG1ha2UgYSBQT1NUIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkucG9zdCgnL2h0dHAtY2xpZW50LXBvc3QtdGVzdCcsIEpTT04uc3RyaW5naWZ5KHsgdGVzdERhdGE6ICcxJyB9KSlcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzInKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdGl0KCdhYmxlIHRvIG1ha2UgYSBQVVQgcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5wdXQoJy9odHRwLWNsaWVudC1wdXQtdGVzdCcpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5jcmVhdGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdGl0KCdhYmxlIHRvIG1ha2UgYSBQQVRDSCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLnBhdGNoKCcvaHR0cC1jbGllbnQtcGF0Y2gtdGVzdCcpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS51cGRhdGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdGl0KCdhYmxlIHRvIG1ha2UgYSBERUxFVEUgcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5kZWxldGUoJy9odHRwLWNsaWVudC1kZWxldGUtdGVzdCcpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5kZWxldGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG5cdGl0KFwiYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QgZm9yIGEgVEVYVFwiLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkuZ2V0KCcvaHR0cC1jbGllbnQtcmVzcG9uc2Utbm90LWpzb24nKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChyZXNwb25zZSkudG8uZXF1YWwoJ25vdCBqc29uJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pO1xuXHR9KTtcblxufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4vdHlwZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBkc2V0ID0gKG9iaiwga2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBkZXB0aCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGUudW5kZWZpbmVkKG9iamVjdFtwYXJ0c1tpXV0pKSB7XG4gICAgICBvYmplY3RbcGFydHNbaV1dID0ge307XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gIH1cbiAgb2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBkZ2V0ID0gKG9iaiwga2V5LCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIG9ialtrZXldID8gb2JqW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgbGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICAgIGlmICh0eXBlLnVuZGVmaW5lZChvYmplY3QpKSB7XG4gICAgICBvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG5jb25zdCB7IGtleXMgfSA9IE9iamVjdDtcblxuZXhwb3J0IGNvbnN0IHRvTWFwID0gKG8pID0+XG4gIGtleXMobykucmVkdWNlKChtLCBrKSA9PiBtLnNldChrLCBvW2tdKSwgbmV3IE1hcCgpKTtcbiIsIi8qICAqL1xuXG5sZXQgcHJldlRpbWVJZCA9IDA7XG5sZXQgcHJldlVuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgKHByZWZpeCkgPT4ge1xuICBsZXQgbmV3VW5pcXVlSWQgPSBEYXRlLm5vdygpO1xuICBpZiAobmV3VW5pcXVlSWQgPT09IHByZXZUaW1lSWQpIHtcbiAgICArK3ByZXZVbmlxdWVJZDtcbiAgfSBlbHNlIHtcbiAgICBwcmV2VGltZUlkID0gbmV3VW5pcXVlSWQ7XG4gICAgcHJldlVuaXF1ZUlkID0gMDtcbiAgfVxuXG4gIGxldCB1bmlxdWVJZCA9IGAke1N0cmluZyhuZXdVbmlxdWVJZCl9JHtTdHJpbmcocHJldlVuaXF1ZUlkKX1gO1xuICBpZiAocHJlZml4KSB7XG4gICAgdW5pcXVlSWQgPSBgJHtwcmVmaXh9XyR7dW5pcXVlSWR9YDtcbiAgfVxuICByZXR1cm4gdW5pcXVlSWQ7XG59O1xuIiwiaW1wb3J0IHsgZGdldCB9IGZyb20gJy4vb2JqZWN0LmpzJztcbmltcG9ydCB7IGRzZXQgfSBmcm9tICcuL29iamVjdC5qcyc7XG5pbXBvcnQge2pzb25DbG9uZX0gZnJvbSAnLi9jbG9uZS5qcyc7XG5pbXBvcnQgaXMgZnJvbSAnLi90eXBlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4vdW5pcXVlLWlkLmpzJztcblxuY29uc3QgbW9kZWwgPSAoYmFzZUNsYXNzID0gY2xhc3Mge30pID0+IHtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIHJldHVybiBjbGFzcyBNb2RlbCBleHRlbmRzIGJhc2VDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLl9zdGF0ZUtleSA9IHVuaXF1ZUlkKCdfc3RhdGUnKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fc2V0U3RhdGUodGhpcy5kZWZhdWx0U3RhdGUpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgZ2V0KGFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdGUoYWNjZXNzb3IpO1xuICAgIH1cblxuICAgIHNldChhcmcxLCBhcmcyKSB7XG4gICAgICAvL3N1cHBvcnRzIChhY2Nlc3Nvciwgc3RhdGUpIE9SIChzdGF0ZSkgYXJndW1lbnRzIGZvciBzZXR0aW5nIHRoZSB3aG9sZSB0aGluZ1xuICAgICAgbGV0IGFjY2Vzc29yLCB2YWx1ZTtcbiAgICAgIGlmICghaXMuc3RyaW5nKGFyZzEpICYmIGlzLnVuZGVmaW5lZChhcmcyKSkge1xuICAgICAgICB2YWx1ZSA9IGFyZzE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFyZzI7XG4gICAgICAgIGFjY2Vzc29yID0gYXJnMTtcbiAgICAgIH1cbiAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMuX2dldFN0YXRlKCk7XG4gICAgICBsZXQgbmV3U3RhdGUgPSBqc29uQ2xvbmUob2xkU3RhdGUpO1xuXG4gICAgICBpZiAoYWNjZXNzb3IpIHtcbiAgICAgICAgZHNldChuZXdTdGF0ZSwgYWNjZXNzb3IsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1N0YXRlID0gdmFsdWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyhhY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZVN1YnNjcmliZXIoKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICAvL1RPRE86IGlzIG9mZigpIG5lZWRlZCBmb3IgaW5kaXZpZHVhbCBzdWJzY3JpcHRpb24/XG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkgLSBjb250ZXh0IG11c3QgYmUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFkZEJpbmRpbmdzOiBmdW5jdGlvbihiaW5kUnVsZXMpIHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmluZFJ1bGVzWzBdKSkge1xuICAgICAgICAgICAgYmluZFJ1bGVzID0gW2JpbmRSdWxlc107XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpbmRSdWxlcy5mb3JFYWNoKGJpbmRSdWxlID0+IHtcbiAgICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCBiaW5kUnVsZVswXSwgdmFsdWUgPT4ge1xuICAgICAgICAgICAgICBkc2V0KGNvbnRleHQsIGJpbmRSdWxlWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBfZ2V0U3RhdGUoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiBqc29uQ2xvbmUoYWNjZXNzb3IgPyBkZ2V0KHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSwgYWNjZXNzb3IpIDogcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldKTtcbiAgICB9XG5cbiAgICBfc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgIHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSA9IG5ld1N0YXRlO1xuICAgIH1cblxuICAgIF9zdWJzY3JpYmUoY29udGV4dCwgYWNjZXNzb3IsIGNiKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpIHx8IFtdO1xuICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHsgYWNjZXNzb3IsIGNiIH0pO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIHN1YnNjcmlwdGlvbnMpO1xuICAgIH1cblxuICAgIF9kZXN0cm95U3Vic2NyaWJlcihjb250ZXh0KSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgfVxuXG4gICAgX25vdGlmeVN1YnNjcmliZXJzKHNldEFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oc3Vic2NyaWJlcnMpIHtcbiAgICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbih7IGFjY2Vzc29yLCBjYiB9KSB7XG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJheidcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6LmJsYXonXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2Yoc2V0QWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBhY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGFjY2Vzc29yKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vZS5nLiBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uKidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZignKicpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZXBBY2Nlc3NvciA9IGFjY2Vzc29yLnJlcGxhY2UoJy4qJywgJycpLnJlcGxhY2UoJyonLCAnJyk7XG4gICAgICAgICAgICBpZiAoc2V0QWNjZXNzb3IuaW5kZXhPZihkZWVwQWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGRlZXBBY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGRlZXBBY2Nlc3NvcikpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCBtb2RlbDtcbiIsImltcG9ydCBtb2RlbCBmcm9tICcuLi9saWIvbW9kZWwuanMnO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIG1vZGVsKCkge1xuXHRnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgIHJldHVybiB7Zm9vOjF9O1xuICB9XG59XG5cbmRlc2NyaWJlKFwiTW9kZWwgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJkZWZhdWx0U3RhdGUgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblx0aXQoXCJnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoJ2ZvbycsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogMVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMicsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd2l0aCBhcnJheXMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFtdXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLCdkb2cnKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMCcpKS50by5lcXVhbCgnZG9nJyk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLHtmb286MX0pO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgxKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nLDIpO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpcHRpb25zIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNvbnN0IFRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblx0XHRsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKFRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMScsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHR0aHJvdygnbm8gc3Vic2NyaWJlciBzaG91bGQgYmUgY2FsbGVkIGZvciBkZWVwT2JqMScpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxLionLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWwuc2V0KFRFU1RfU0VMLCB0cnVlKTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0Y2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblxuXHR9KTtcblxuXHRpdChcInN1YnNjcmliZXJzIGNhbiBiZSBkZXN0cm95ZWRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5URVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihteU1vZGVsLlRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdHRocm93KG5ldyBFcnJvcignc2hvdWxkIG5vdCBiZSBvYnNlcnZlZCcpKTtcblx0XHR9KTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQobXlNb2RlbC5URVNUX1NFTCwgdHJ1ZSk7XG5cdH0pO1xuXG5cdGl0KFwicHJvcGVydGllcyBib3VuZCBmcm9tIG1vZGVsIHRvIGN1c3RvbSBlbGVtZW50XCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cbiAgICBsZXQgbXlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsICh2YWx1ZSkgPT4geyB0aGlzLnByb3AgPSB2YWx1ZTsgfSk7XG4gICAgb2JzZXJ2ZXIuZGVzdHJveSgpO1xuXG4gICAgY29uc3QgcHJvcGVydHlCaW5kZXIgPSBteU1vZGVsLmNyZWF0ZVByb3BlcnR5QmluZGVyKG15RWxlbWVudCkuYWRkQmluZGluZ3MoXG4gICAgICBbJ2ZvbycsICdwcm9wJ11cbiAgICApO1xuXG4gICAgbXlNb2RlbC5zZXQoJ2ZvbycsICczJyk7XG4gICAgY2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG4gICAgcHJvcGVydHlCaW5kZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KCdmb28nLCAnMicpO1xuXHRcdGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuXHR9KTtcblxufSk7XG4iLCIvKiAgKi9cblxuXG5cbmNvbnN0IGV2ZW50SHViRmFjdG9yeSA9ICgpID0+IHtcbiAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIC8vJEZsb3dGaXhNZVxuICByZXR1cm4ge1xuICAgIHB1Ymxpc2g6IGZ1bmN0aW9uKGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKHN1YnNjcmlwdGlvbnMgPT4ge1xuICAgICAgICAoc3Vic2NyaXB0aW9ucy5nZXQoZXZlbnQpIHx8IFtdKS5mb3JFYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY3JlYXRlU3Vic2NyaWJlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlcnMuaGFzKGNvbnRleHQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5zZXQoY29udGV4dCwgbmV3IE1hcCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgY29uc3Qgc3Vic2NyaWJlciA9IHN1YnNjcmliZXJzLmdldChjb250ZXh0KTtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXIuaGFzKGV2ZW50KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5zZXQoZXZlbnQsIFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlci5nZXQoZXZlbnQpLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpLmRlbGV0ZShldmVudCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBldmVudEh1YkZhY3Rvcnk7XG4iLCJpbXBvcnQgZXZlbnRIdWJGYWN0b3J5IGZyb20gJy4uL2xpYi9ldmVudC1odWIuanMnO1xuXG5kZXNjcmliZShcIkV2ZW50SHViIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiYmFzaWMgcHViL3N1YiB3b3Jrc1wiLCAoZG9uZSkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmliZXJzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlcjIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaXB0aW9ucyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgyKTtcbiAgICAgIH0pXG5cbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJywgMik7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcImRlc3Ryb3koKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWJTdWJzY3JpYmVyLmRlc3Ryb3koKTtcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDApO1xuXHR9KTtcblxuICBpdChcIm9mZigpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKHVuZGVmaW5lZCk7XG4gICAgICB9KVxuICAgICAgLm9mZignZm9vJylcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInKTsgIC8vc2hvdWxkIGNhbGxlZFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cbn0pO1xuIl0sIm5hbWVzIjpbImlzQnJvd3NlciIsIndpbmRvdyIsImRvY3VtZW50IiwiaW5jbHVkZXMiLCJicm93c2VyIiwiZm4iLCJyYWlzZSIsIkVycm9yIiwibmFtZSIsImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtaWNyb1Rhc2tGbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwibWljcm9UYXNrIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYW5jZWwiLCJoYW5kbGUiLCJpZHgiLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwia2V5cyIsImFzc2lnbiIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsInR5cGUiLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYmVmb3JlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwiZGF0YSIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwibWFwIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsInBvcCIsIlByb3BlcnRpZXNNaXhpblRlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsImN1c3RvbUVsZW1lbnQiLCJkZXNjcmliZSIsImNvbnRhaW5lciIsInByb3BlcnRpZXNNaXhpblRlc3QiLCJjcmVhdGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlciIsImlubmVySFRNTCIsIml0IiwiYXNzZXJ0IiwiZXF1YWwiLCJsaXN0ZW5FdmVudCIsImlzT2siLCJldnQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJkaXNwYXRjaCIsIm9mZiIsImhhbmRsZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJzdG9wRXZlbnQiLCJjaGFpIiwiZXhwZWN0IiwidG8iLCJhIiwiZGVlcCIsImJvZHkiLCJ0ZW1wbGF0ZSIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJodG1sIiwidHJpbSIsImZyYWciLCJ0ZW1wbGF0ZUNvbnRlbnQiLCJmaXJzdENoaWxkIiwiZWwiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImluc3RhbmNlT2YiLCJOb2RlIiwiYWxsIiwiYXJyIiwiZXZlcnkiLCJhbnkiLCJzb21lIiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJkb0FueUFwaSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsInNldHVwIiwiZ2V0VHlwZSIsInNyYyIsImdldFNyY1R5cGUiLCJtYXRjaGVzIiwiY2hlY2tzIiwiY2xvbmUiLCJqc29uQ2xvbmUiLCJyZXZpdmVyIiwiayIsInYiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJvYmplY3QiLCJmdW5jdGlvbiIsInQiLCJjbG9uZVR5cGVzIiwiZnJlZXplIiwiZ2V0VGltZSIsIlJlZ0V4cCIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwia2V5IiwiZmluZEluZGV4IiwiYmUiLCJudWxsIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJ0aHJvdyIsIm5vdCIsImNsb25lZCIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsImlzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsImFycmF5Iiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0IiwicmVnZXhwIiwibm90UmVnZXhwIiwic3RyaW5nIiwiQ29uZmlndXJhdG9yIiwiYmFzZVVybCIsImRlZmF1bHRzIiwiaW50ZXJjZXB0b3JzIiwid2l0aEJhc2VVcmwiLCJ3aXRoRGVmYXVsdHMiLCJ3aXRoSW50ZXJjZXB0b3IiLCJpbnRlcmNlcHRvciIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJIdHRwQ2xpZW50IiwiYWRkSW50ZXJjZXB0b3IiLCJmZXRjaCIsImlucHV0IiwiaW5pdCIsInJlcXVlc3QiLCJfYnVpbGRSZXF1ZXN0IiwiX3Byb2Nlc3NSZXF1ZXN0IiwidGhlbiIsInJlc3VsdCIsIlJlc3BvbnNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJSZXF1ZXN0IiwiX3Byb2Nlc3NSZXNwb25zZSIsInBvc3QiLCJfZmV0Y2giLCJwdXQiLCJwYXRjaCIsImRlbGV0ZSIsInJlcXVlc3RDb250ZW50VHlwZSIsInBhcnNlZERlZmF1bHRIZWFkZXJzIiwicGFyc2VIZWFkZXJWYWx1ZXMiLCJIZWFkZXJzIiwiYm9keU9iaiIsInJlcXVlc3RJbml0IiwiZ2V0UmVxdWVzdFVybCIsImhhcyIsImlzSlNPTiIsInNldERlZmF1bHRIZWFkZXJzIiwiQmxvYiIsImFwcGx5SW50ZXJjZXB0b3JzIiwiY29uZmlndXJlIiwiZGVmYXVsdENvbmZpZyIsInN1Y2Nlc3NOYW1lIiwiZXJyb3JOYW1lIiwicmVkdWNlIiwiY2hhaW4iLCJzdWNjZXNzSGFuZGxlciIsImVycm9ySGFuZGxlciIsImlkZW50aXR5IiwidGhyb3dlciIsIm9rIiwieCIsInBhcnNlZEhlYWRlcnMiLCJhYnNvbHV0ZVVybFJlZ2V4cCIsInVybCIsInRlc3QiLCJkZWZhdWx0SGVhZGVycyIsInN0ciIsImNyZWF0ZUh0dHBDbGllbnQiLCJqc29uIiwiZm9vIiwiZG9uZSIsInRlc3REYXRhIiwiY3JlYXRlZCIsInVwZGF0ZWQiLCJkZWxldGVkIiwidGV4dCIsImRzZXQiLCJwYXJ0cyIsImRlcHRoIiwiZGdldCIsImRlZmF1bHRWYWx1ZSIsInByZXZUaW1lSWQiLCJwcmV2VW5pcXVlSWQiLCJwcmVmaXgiLCJuZXdVbmlxdWVJZCIsIm5vdyIsInVuaXF1ZUlkIiwibW9kZWwiLCJzdWJzY3JpYmVyQ291bnQiLCJfc3RhdGVLZXkiLCJfc3Vic2NyaWJlcnMiLCJfc2V0U3RhdGUiLCJkZWZhdWx0U3RhdGUiLCJhY2Nlc3NvciIsIl9nZXRTdGF0ZSIsImFyZzEiLCJhcmcyIiwib2xkU3RhdGUiLCJuZXdTdGF0ZSIsIl9ub3RpZnlTdWJzY3JpYmVycyIsImNyZWF0ZVN1YnNjcmliZXIiLCJzZWxmIiwiX3N1YnNjcmliZSIsImRlc3Ryb3kiLCJfZGVzdHJveVN1YnNjcmliZXIiLCJjcmVhdGVQcm9wZXJ0eUJpbmRlciIsImFkZEJpbmRpbmdzIiwiYmluZFJ1bGVzIiwiYmluZFJ1bGUiLCJzdWJzY3JpcHRpb25zIiwic2V0QWNjZXNzb3IiLCJzdWJzY3JpYmVycyIsImRlZXBBY2Nlc3NvciIsIk1vZGVsIiwibXlNb2RlbCIsImRlZXBPYmoxIiwiZGVlcE9iajIiLCJzZWxlY3RlZCIsIlRFU1RfU0VMIiwibXlNb2RlbFN1YnNjcmliZXIiLCJudW1DYWxsYmFja3NDYWxsZWQiLCJteUVsZW1lbnQiLCJwcm9wZXJ0eUJpbmRlciIsImV2ZW50SHViRmFjdG9yeSIsInB1Ymxpc2giLCJzdWJzY3JpYmVyIiwibXlFdmVudEh1YiIsIm15RXZlbnRIdWJTdWJzY3JpYmVyIiwibXlFdmVudEh1YlN1YnNjcmliZXIyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEVBQU8sSUFBTUEsWUFBWSxDQUFDLFFBQVFDLE1BQVIseUNBQVFB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
