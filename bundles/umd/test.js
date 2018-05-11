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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L3VzZS1mZXRjaC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9odHRwLWNsaWVudC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC1jbGllbnQvaHR0cC1jbGllbnQudGVzdC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLmpzIiwiLi4vLi4vdGVzdC9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLnRlc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgY29uc3QgaXNCcm93c2VyID0gIVt0eXBlb2Ygd2luZG93LCB0eXBlb2YgZG9jdW1lbnRdLmluY2x1ZGVzKFxuICAndW5kZWZpbmVkJ1xuKTtcblxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSAoZm4sIHJhaXNlID0gdHJ1ZSkgPT4gKFxuICAuLi5hcmdzXG4pID0+IHtcbiAgaWYgKGlzQnJvd3Nlcikge1xuICAgIHJldHVybiBmbiguLi5hcmdzKTtcbiAgfVxuICBpZiAocmFpc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7Zm4ubmFtZX0gZm9yIGJyb3dzZXIgdXNlIG9ubHlgKTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KVxuKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmxldCBtaWNyb1Rhc2tDdXJySGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tMYXN0SGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tDYWxsYmFja3MgPSBbXTtcbmxldCBtaWNyb1Rhc2tOb2RlQ29udGVudCA9IDA7XG5sZXQgbWljcm9UYXNrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKG1pY3JvVGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvVGFza05vZGUsIHtcbiAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxufSk7XG5cblxuLyoqXG4gKiBCYXNlZCBvbiBQb2x5bWVyLmFzeW5jXG4gKi9cbmNvbnN0IG1pY3JvVGFzayA9IHtcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvVGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGNhbGxiYWNrKSB7XG4gICAgbWljcm9UYXNrTm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhtaWNyb1Rhc2tOb2RlQ29udGVudCsrKTtcbiAgICBtaWNyb1Rhc2tDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIG1pY3JvVGFza0N1cnJIYW5kbGUrKztcbiAgfSxcblxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYG1pY3JvVGFza2AgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbWljcm9UYXNrTGFzdEhhbmRsZTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGlmICghbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgICB9XG4gICAgICBtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWNyb1Rhc2s7XG5cbmZ1bmN0aW9uIG1pY3JvVGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb1Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm9UYXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbWljcm9UYXNrQ2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBtaWNyb1Rhc2tMYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuICAgICdjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnYWRvcHRlZENhbGxiYWNrJyxcbiAgICAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuICBdO1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBpZiAoIWJhc2VDbGFzcykge1xuICAgIGJhc2VDbGFzcyA9IGNsYXNzIGV4dGVuZHMgZ2xvYmFsLkhUTUxFbGVtZW50IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7fVxuXG4gICAgc3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuICAgICAgaWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7fSxcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjYWxsYmFja01ldGhvZE5hbWUubGVuZ3RoIC0gJ2NhbGxiYWNrJy5sZW5ndGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gcHJvdG9bY2FsbGJhY2tNZXRob2ROYW1lXTtcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcbiAgICAgICAgcmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuY29uc3RydWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge31cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZChcbiAgICAgIGF0dHJpYnV0ZU5hbWUsXG4gICAgICBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlXG4gICAgKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBiZWZvcmUgZnJvbSAnLi4vLi4vYWR2aWNlL2JlZm9yZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID1cbiAgICAgIGNvbmZpZy5oYXNPYnNlcnZlciAmJiB0eXBlb2YgY29uZmlnLm9ic2VydmVyID09PSAnc3RyaW5nJztcbiAgICBjb25maWcuaXNTdHJpbmcgPSBjb25maWcudHlwZSA9PT0gU3RyaW5nO1xuICAgIGNvbmZpZy5pc051bWJlciA9IGNvbmZpZy50eXBlID09PSBOdW1iZXI7XG4gICAgY29uZmlnLmlzQm9vbGVhbiA9IGNvbmZpZy50eXBlID09PSBCb29sZWFuO1xuICAgIGNvbmZpZy5pc09iamVjdCA9IGNvbmZpZy50eXBlID09PSBPYmplY3Q7XG4gICAgY29uZmlnLmlzQXJyYXkgPSBjb25maWcudHlwZSA9PT0gQXJyYXk7XG4gICAgY29uZmlnLmlzRGF0ZSA9IGNvbmZpZy50eXBlID09PSBEYXRlO1xuICAgIGNvbmZpZy5ub3RpZnkgPSAnbm90aWZ5JyBpbiBjb25maWc7XG4gICAgY29uZmlnLnJlYWRPbmx5ID0gJ3JlYWRPbmx5JyBpbiBjb25maWcgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcbiAgICBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID1cbiAgICAgICdyZWZsZWN0VG9BdHRyaWJ1dGUnIGluIGNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGVcbiAgICAgICAgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG4gICAgICBvdXRwdXRbbmFtZV0gPVxuICAgICAgICB0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgPyB7IHR5cGU6IHByb3BlcnR5IH0gOiBwcm9wZXJ0eTtcbiAgICAgIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzc2lnbihjb250ZXh0LCBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyk7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICB9XG4gICAgICBjb250ZXh0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIGNvbnRleHQuX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzXG4gICAgKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKS5tYXAoKHByb3BlcnR5KSA9PlxuICAgICAgICAgIHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpXG4gICAgICAgICkgfHwgW11cbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBiZWZvcmUoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSwgJ2F0dHJpYnV0ZUNoYW5nZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpLCAncHJvcGVydGllc0NoYW5nZWQnKSh0aGlzKTtcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpIHtcbiAgICAgIGxldCBwcm9wZXJ0eSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdO1xuICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCBoeXBlblJlZ0V4ID0gLy0oW2Etel0pL2c7XG4gICAgICAgIHByb3BlcnR5ID0gYXR0cmlidXRlLnJlcGxhY2UoaHlwZW5SZWdFeCwgbWF0Y2ggPT5cbiAgICAgICAgICBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSB7XG4gICAgICBsZXQgYXR0cmlidXRlID0gcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCB1cHBlcmNhc2VSZWdFeCA9IC8oW0EtWl0pL2c7XG4gICAgICAgIGF0dHJpYnV0ZSA9IHByb3BlcnR5LnJlcGxhY2UodXBwZXJjYXNlUmVnRXgsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjbGFzc1Byb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByb3BlcnRpZXNDb25maWcpIHtcbiAgICAgICAgY29uc3QgZ2V0UHJvcGVydGllc0NvbmZpZyA9ICgpID0+IHByb3BlcnRpZXNDb25maWcgfHwge307XG4gICAgICAgIGxldCBjaGVja09iaiA9IG51bGw7XG4gICAgICAgIGxldCBsb29wID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZSAobG9vcCkge1xuICAgICAgICAgIGNoZWNrT2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrT2JqID09PSBudWxsID8gdGhpcyA6IGNoZWNrT2JqKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY2hlY2tPYmogfHxcbiAgICAgICAgICAgICFjaGVja09iai5jb25zdHJ1Y3RvciB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEhUTUxFbGVtZW50IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gRnVuY3Rpb24gfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBjaGVja09iai5jb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbG9vcCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoY2hlY2tPYmosICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKGNoZWNrT2JqLnByb3BlcnRpZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcbiAgICAgIGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShcbiAgICAgICAgICBhdHRyaWJ1dGVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldXG4gICAgICAgIC50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzTnVtYmVyLFxuICAgICAgICBpc0FycmF5LFxuICAgICAgICBpc0Jvb2xlYW4sXG4gICAgICAgIGlzRGF0ZSxcbiAgICAgICAgaXNTdHJpbmcsXG4gICAgICAgIGlzT2JqZWN0XG4gICAgICB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPVxuICAgICAgICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gaXNBcnJheVxuICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgOiB7fVxuICAgICAgICAgICAgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbXG4gICAgICAgIHByb3BlcnR5XG4gICAgICBdO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKFxuICAoXG4gICAgdGFyZ2V0LFxuICAgIHR5cGUsXG4gICAgbGlzdGVuZXIsXG4gICAgY2FwdHVyZSA9IGZhbHNlXG4gICkgPT4ge1xuICAgIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgfVxuKTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IHByb3BlcnRpZXMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvbGlzdGVuLWV2ZW50LmpzJztcblxuY2xhc3MgUHJvcGVydGllc01peGluVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNNaXhpblRlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuZGVzY3JpYmUoJ3Byb3BlcnRpZXMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IHByb3BlcnRpZXNNaXhpblRlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuXHQgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzTWl4aW5UZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc01peGluVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uLy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KHR5cGUsIGFzc2lnbihldmVudERlZmF1bHRQYXJhbXMsIHsgZGV0YWlsOiBkYXRhIH0pKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZWxlbWVudCkgPT4ge1xuICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICB9XG59KTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvc3RvcC1ldmVudC5qcyc7XG5pbXBvcnQgcmVtb3ZlRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnZXZlbnRzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKHRlbXBsYXRlKSA9PiB7XG4gIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBsZXQgY2hpbGRyZW4gPSB0ZW1wbGF0ZS5jaGlsZE5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGRyZW5baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCB0ZW1wbGF0ZUNvbnRlbnQgZnJvbSAnLi90ZW1wbGF0ZS1jb250ZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoaHRtbCkgPT4ge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWwudHJpbSgpO1xuICBjb25zdCBmcmFnID0gdGVtcGxhdGVDb250ZW50KHRlbXBsYXRlKTtcbiAgaWYgKGZyYWcgJiYgZnJhZy5maXJzdENoaWxkKSB7XG4gICAgcmV0dXJuIGZyYWcuZmlyc3RDaGlsZDtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjcmVhdGVFbGVtZW50IGZvciAke2h0bWx9YCk7XG59KTtcbiIsImltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9icm93c2VyL2NyZWF0ZS1lbGVtZW50LmpzJztcblxuZGVzY3JpYmUoJ2NyZWF0ZS1lbGVtZW50JywgKCkgPT4ge1xuICBpdCgnY3JlYXRlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KGBcblx0XHRcdDxkaXYgY2xhc3M9XCJteS1jbGFzc1wiPkhlbGxvIFdvcmxkPC9kaXY+XG5cdFx0YCk7XG4gICAgZXhwZWN0KGVsLmNsYXNzTGlzdC5jb250YWlucygnbXktY2xhc3MnKSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgYXNzZXJ0Lmluc3RhbmNlT2YoZWwsIE5vZGUsICdlbGVtZW50IGlzIGluc3RhbmNlIG9mIG5vZGUnKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuc29tZShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLmV2ZXJ5KGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbnkgfSBmcm9tICcuL2FycmF5L2FueS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGFsbCB9IGZyb20gJy4vYXJyYXkvYWxsLmpzJztcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnTWFwIFNldCBTeW1ib2wgQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuICAnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuY29uc3QgaXMgPSBzZXR1cCgpO1xuXG5leHBvcnQgZGVmYXVsdCBpcztcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGxldCBjaGVja3MgPSB7fTtcbiAgZm9yIChsZXQgaSA9IGxlbjsgaS0tOyApIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaV0udG9Mb3dlckNhc2UoKTtcbiAgICBjaGVja3NbdHlwZV0gPSBvYmogPT4gZ2V0VHlwZShvYmopID09PSB0eXBlO1xuICAgIGNoZWNrc1t0eXBlXS5hbGwgPSBkb0FsbEFwaShjaGVja3NbdHlwZV0pO1xuICAgIGNoZWNrc1t0eXBlXS5hbnkgPSBkb0FueUFwaShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUob2JqKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChvYmopO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi4vdHlwZS5qcyc7XG5cbmNvbnN0IGNsb25lID0gZnVuY3Rpb24oXG4gIHNyYyxcbiAgY2lyY3VsYXJzID0gW10sXG4gIGNsb25lcyA9IFtdXG4pIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoIXNyYyB8fCAhdHlwZS5vYmplY3Qoc3JjKSB8fCB0eXBlLmZ1bmN0aW9uKHNyYykpIHtcbiAgICByZXR1cm4gc3JjO1xuICB9XG5cbiAgLy8gRGF0ZVxuICBpZiAodHlwZS5kYXRlKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoc3JjLmdldFRpbWUoKSk7XG4gIH1cblxuICAvLyBSZWdFeHBcbiAgaWYgKHR5cGUucmVnZXhwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzcmMpO1xuICB9XG5cbiAgLy8gQXJyYXlzXG4gIGlmICh0eXBlLmFycmF5KHNyYykpIHtcbiAgICByZXR1cm4gc3JjLm1hcChjbG9uZSk7XG4gIH1cblxuICAvLyBFUzYgTWFwc1xuICBpZiAodHlwZS5tYXAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20oc3JjLmVudHJpZXMoKSkpO1xuICB9XG5cbiAgLy8gRVM2IFNldHNcbiAgaWYgKHR5cGUuc2V0KHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFNldChBcnJheS5mcm9tKHNyYy52YWx1ZXMoKSkpO1xuICB9XG5cbiAgLy8gT2JqZWN0XG4gIGlmICh0eXBlLm9iamVjdChzcmMpKSB7XG4gICAgY2lyY3VsYXJzLnB1c2goc3JjKTtcbiAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKHNyYyk7XG4gICAgY2xvbmVzLnB1c2gob2JqKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gc3JjKSB7XG4gICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gc3JjW2tleV0pO1xuICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUoc3JjW2tleV0sIGNpcmN1bGFycywgY2xvbmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbG9uZTtcblxuZXhwb3J0IGNvbnN0IGpzb25DbG9uZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcbiIsImltcG9ydCBjbG9uZSwgeyBqc29uQ2xvbmUgfSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuICBkZXNjcmliZSgncHJpbWl0aXZlcycsICgpID0+IHtcbiAgICBpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChjbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihjbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnanNvbkNsb25lJywgKCkgPT4ge1xuICAgIGl0KCdXaGVuIG5vbi1zZXJpYWxpemFibGUgdmFsdWUgaXMgcGFzc2VkIGluLCByZXR1cm5zIHRoZSBzYW1lIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGpzb25DbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoanNvbkNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIGFzc2VydC5pc0Z1bmN0aW9uKGpzb25DbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBnZXRCb2R5RnJvbVJlcSB9IGZyb20gJy4vaHR0cC1jbGllbnQuanMnO1xuXG5jb25zdCB1c2VGZXRjaCA9IGZ1bmN0aW9uKGh0dHBDbGllbnQpIHtcbiAgcmV0dXJuIGh0dHBDbGllbnQuYWRkUmVzcG9uc2VTdGVwKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgIGlmICh0eXBlb2YgcmVzcG9uc2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgICAgbW9kZTogcmVxdWVzdC5tb2RlLFxuICAgICAgY3JlZGVudGlhbHM6IHJlcXVlc3QuY3JlZGVudGlhbHMsXG4gICAgICBoZWFkZXJzOiByZXF1ZXN0LmhlYWRlcnNcbiAgICB9O1xuXG4gICAgbGV0IGJvZHkgPSBnZXRCb2R5RnJvbVJlcShyZXF1ZXN0KTtcbiAgICBpZiAoYm9keSkge1xuICAgICAgZmV0Y2hPcHRpb25zLmJvZHkgPSBib2R5O1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdC51cmwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaHR0cC1jbGllbnQ6IHVybCBvcHRpb24gaXMgbm90IHNldGApO1xuICAgIH1cblxuICAgIC8vICRGbG93Rml4TWVcbiAgICByZXR1cm4gZmV0Y2gocmVxdWVzdC51cmwsIGZldGNoT3B0aW9ucylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgcmVzcG9uc2U7XG4gICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlRmV0Y2g7XG4iLCIvKiAgKi9cblxuLy8gTm90ZTogZm9yIG5vdyBub3QgcmVzdHJpY3RpbmcgdGhpcyB0byBicm93c2VyIHVzYWdlIGR1ZSB0byBpdCBwb3RlbnRpYWxseVxuLy8gYmVpbmcgdXNlZCB3aXRoIGFuIG5wbSBwYWNrYWdlIGxpa2UgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvbm9kZS1mZXRjaFxuXG5pbXBvcnQgdXNlRmV0Y2ggZnJvbSAnLi91c2UtZmV0Y2guanMnO1xuaW1wb3J0IGNsb25lLCB7IGpzb25DbG9uZSB9IGZyb20gJy4uL29iamVjdC9jbG9uZS5qcyc7XG5cblxuXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgbW9kZTogJ2NvcnMnLFxuICBkYXRhOiB1bmRlZmluZWQsXG4gIGhlYWRlcnM6IHtcbiAgICAnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSScsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICB9LFxuICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJywgLy8naW5jbHVkZScsXG4gIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogZmFsc2Vcbn07XG5cbmNvbnN0IGh0dHBDbGllbnRGYWN0b3J5ID0gZnVuY3Rpb24oXG4gIGN1c3RvbUluc3RhbmNlT3B0aW9ucyA9IHt9XG4pIHtcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBkZWZhdWx0T3B0aW9ucyxcbiAgICBjdXN0b21JbnN0YW5jZU9wdGlvbnNcbiAgKTtcbiAgY29uc3QgcmVxdWVzdFN0ZXBzID0gW107XG4gIGNvbnN0IHJlc3BvbnNlU3RlcHMgPSBbXTtcblxuICBmdW5jdGlvbiBydW4obWV0aG9kLCBjdXN0b21SdW5PcHRpb25zID0ge30pIHtcbiAgICBsZXQgcmVxdWVzdCA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIGluc3RhbmNlT3B0aW9ucyxcbiAgICAgIGN1c3RvbVJ1bk9wdGlvbnMsXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogbWV0aG9kXG4gICAgICB9XG4gICAgKTtcblxuICAgIGxldCByZXNwb25zZSA9IHVuZGVmaW5lZDtcblxuICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgIHJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgIH0pO1xuXG4gICAgcmVxdWVzdFN0ZXBzLmZvckVhY2goZnVuY3Rpb24oeyBwcm9taXNlTWV0aG9kLCBjYWxsYmFjaywgcmVqZWN0Q2FsbGJhY2sgfSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgaWYgKCFwcm9taXNlW3Byb21pc2VNZXRob2RdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgaHR0cC1jbGllbnQ6IHJlcXVlc3RTdGVwIHByb21pc2UgbWV0aG9kIGlzIG5vdCB2YWxpZDogJHtwcm9taXNlTWV0aG9kfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIHByb21pc2UgPSBwcm9taXNlW3Byb21pc2VNZXRob2RdKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICBpZiAoc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gY2xvbmUoYXJnLnJlcXVlc3QpO1xuICAgICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZy5yZXNwb25zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVxdWVzdCA9IGNsb25lKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgICByZXF1ZXN0OiBjbG9uZShyZXF1ZXN0KSxcbiAgICAgICAgICByZXNwb25zZToganNvbkNsb25lKHJlc3BvbnNlKVxuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdENhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIC8vZXh0cmFjdCBmaW5hbCByZXF1ZXN0IG9iamVjdFxuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAoc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykpIHtcbiAgICAgICAgcmVxdWVzdCA9IGNsb25lKGFyZy5yZXF1ZXN0KTtcbiAgICAgICAgcmVzcG9uc2UgPSBqc29uQ2xvbmUoYXJnLnJlc3BvbnNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBjbG9uZShhcmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWVzdDogY2xvbmUocmVxdWVzdCksXG4gICAgICAgIHJlc3BvbnNlOiBqc29uQ2xvbmUocmVzcG9uc2UpXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmVzcG9uc2VTdGVwcy5mb3JFYWNoKGZ1bmN0aW9uKHtcbiAgICAgIHByb21pc2VNZXRob2QsXG4gICAgICBjYWxsYmFjayxcbiAgICAgIHJlamVjdENhbGxiYWNrXG4gICAgfSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgaWYgKCFwcm9taXNlW3Byb21pc2VNZXRob2RdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgaHR0cC1jbGllbnQ6IHJlc3BvbnNlU3RlcCBtZXRob2QgaXMgbm90IHZhbGlkOiAke3Byb21pc2VNZXRob2R9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcHJvbWlzZSA9IHByb21pc2VbcHJvbWlzZU1ldGhvZF0oZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIGlmIChzdGVwQXJndW1lbnRJc05vcm1hbGl6ZWQoYXJnKSkge1xuICAgICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZy5yZXNwb25zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBqc29uQ2xvbmUoYXJnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soe1xuICAgICAgICAgIHJlcXVlc3Q6IGNsb25lKHJlcXVlc3QpLFxuICAgICAgICAgIHJlc3BvbnNlOiBqc29uQ2xvbmUocmVzcG9uc2UpXG4gICAgICAgIH0pO1xuICAgICAgfSwgcmVqZWN0Q2FsbGJhY2spO1xuICAgIH0pO1xuXG4gICAgLy8gb25lIG1vcmUgc3RlcCB0byBleHRyYWN0IGZpbmFsIHJlc3BvbnNlIGFuZCBkZXRlcm1pbmUgc2hhcGUgb2YgZGF0YSB0byByZXR1cm5cbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHN0ZXBBcmd1bWVudElzTm9ybWFsaXplZChhcmcpKSB7XG4gICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZy5yZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVxdWVzdC5yZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgIHJlc3BvbnNlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfSAvL2VuZCBkb0ZldGNoKClcblxuICBjb25zdCBodHRwQ2xpZW50ID0ge1xuICAgIGdldDogcnVuLmJpbmQodGhpcywgJ0dFVCcpLFxuICAgIHBvc3Q6IHJ1bi5iaW5kKHRoaXMsICdQT1NUJyksXG4gICAgcHV0OiBydW4uYmluZCh0aGlzLCAnUFVUJyksXG4gICAgcGF0Y2g6IHJ1bi5iaW5kKHRoaXMsICdQQVRDSCcpLFxuICAgIGRlbGV0ZTogcnVuLmJpbmQodGhpcywgJ0RFTEVURScpLFxuICAgIG9wdGlvbnM6IChuZXdPcHRpb25zID0ge30pID0+IHtcbiAgICAgIHJldHVybiBjbG9uZShPYmplY3QuYXNzaWduKGluc3RhbmNlT3B0aW9ucywgbmV3T3B0aW9ucykpO1xuICAgIH0sXG4gICAgYWRkUmVxdWVzdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmVxdWVzdFN0ZXBzLnB1c2gobm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyhhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgYWRkUmVzcG9uc2VTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJlc3BvbnNlU3RlcHMucHVzaChub3JtYWxpemVBZGRTdGVwQXJndW1lbnRzKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB1c2VGZXRjaChodHRwQ2xpZW50KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGh0dHBDbGllbnRGYWN0b3J5O1xuXG5leHBvcnQgY29uc3QgZ2V0Qm9keUZyb21SZXEgPSBmdW5jdGlvbihyZXEpIHtcbiAgaWYgKHJlcS5kYXRhKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlcS5kYXRhKTtcbiAgfSBlbHNlIGlmIChyZXEuYm9keSkge1xuICAgIHJldHVybiByZXEuYm9keTtcbiAgfVxuICByZXR1cm4gJyc7XG59O1xuXG5mdW5jdGlvbiBub3JtYWxpemVBZGRTdGVwQXJndW1lbnRzKGFyZ3MpIHtcbiAgbGV0IHByb21pc2VNZXRob2Q7XG4gIGxldCBjYWxsYmFjaztcbiAgbGV0IHJlamVjdENhbGxiYWNrO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgW3Byb21pc2VNZXRob2QsIGNhbGxiYWNrLCByZWplY3RDYWxsYmFja10gPSBhcmdzO1xuICB9IGVsc2Uge1xuICAgIHByb21pc2VNZXRob2QgPSAndGhlbic7XG4gICAgW2NhbGxiYWNrLCByZWplY3RDYWxsYmFja10gPSBhcmdzO1xuICB9XG4gIGlmIChcbiAgICAocHJvbWlzZU1ldGhvZCAhPT0gJ3RoZW4nICYmIHByb21pc2VNZXRob2QgIT09ICdjYXRjaCcpIHx8XG4gICAgdHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdodHRwLWNsaWVudDogYmFkIGFyZ3VtZW50cyBwYXNzZWQgdG8gYWRkKFJlcXVlc3QvUmVzcG9uc2UpU3RlcCdcbiAgICApO1xuICB9XG4gIHJldHVybiB7XG4gICAgcHJvbWlzZU1ldGhvZCxcbiAgICBjYWxsYmFjayxcbiAgICByZWplY3RDYWxsYmFja1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGVwQXJndW1lbnRJc05vcm1hbGl6ZWQoYXJnKSB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiZcbiAgICBPYmplY3Qua2V5cyhhcmcpLmxlbmd0aCA9PT0gMiAmJlxuICAgIGFyZy5oYXNPd25Qcm9wZXJ0eSgncmVxdWVzdCcpICYmXG4gICAgYXJnLmhhc093blByb3BlcnR5KCdyZXNwb25zZScpXG4gICk7XG59XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vLi4vbGliL2h0dHAtY2xpZW50L2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50IC0gYmFzaWMgdXNhZ2UnLCAoKSA9PiB7XG4gIGl0KCdhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3RvcnkoKTtcbiAgICBodHRwQ2xpZW50XG4gICAgICAuZ2V0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0J1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzEnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdhYmxlIHRvIG1ha2UgYSBQT1NUIHJlcXVlc3QnLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KCk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLnBvc3Qoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtcG9zdC10ZXN0JyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHRlc3REYXRhOiAnMSdcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzInKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KFwiZG9lc24ndCBibG93IHVwIHdoZW4gcmVzcG9uc2UgaXNuJ3QgSlNPTlwiLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KCk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1yZXNwb25zZS1ub3QtanNvbidcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZSkudG8uZXF1YWwoJ25vdCBqc29uJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdCgnb3B0aW9ucyBjYW4gYmUgb3ZlcndyaXR0ZW4gYXQgYW55IGxldmVsJywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSh7XG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnXG4gICAgfSk7XG4gICAgY2hhaS5leHBlY3QoaHR0cENsaWVudC5vcHRpb25zKCkuY3JlZGVudGlhbHMpLnRvLmVxdWFsKCdpbmNsdWRlJyk7XG5cbiAgICBodHRwQ2xpZW50Lm9wdGlvbnMoe1xuICAgICAgY3JlZGVudGlhbHM6ICdvbWl0J1xuICAgIH0pO1xuICAgIGNoYWkuZXhwZWN0KGh0dHBDbGllbnQub3B0aW9ucygpLmNyZWRlbnRpYWxzKS50by5lcXVhbCgnb21pdCcpO1xuXG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC5jcmVkZW50aWFscykudG8uZXF1YWwoJ3NhbWUtb3JpZ2luJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdCgncmVxdWVzdCBzdGVwIGNhbiBtb2RpZnkgdGhlIHJlcXVlc3Qgb2JqZWN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnQuYWRkUmVxdWVzdFN0ZXAoKHsgcmVxdWVzdCB9KSA9PiB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgcmVxdWVzdCwge1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtbW9kaWZpZWQtdXJsJyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBodHRwQ2xpZW50XG4gICAgICAuZ2V0KHsgdXJsOiAnL3dpbGwtYmUtb3ZlcndyaXR0ZW4nIH0pXG4gICAgICAudGhlbihmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC51cmwpLnRvLmVxdWFsKCcvaHR0cC1jbGllbnQtbW9kaWZpZWQtdXJsJyk7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlKS50by5lcXVhbCgncmVzcG9uc2UgZm9yIG1vZGlmaWVkIHVybCcpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3JlcXVlc3Qgc3RlcCBjYW4gYWRkIGEgcmVzcG9uc2Ugb2JqZWN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnQuYWRkUmVxdWVzdFN0ZXAoKHsgcmVxdWVzdCB9KSA9PiB7XG4gICAgICBpZiAocmVxdWVzdC51cmwgPT09ICcvZG9lcy1ub3QtZXhpc3QnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICByZXNwb25zZTogJ3Nob3J0Y2lyY3VpdCByZXNwb25zZSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0pO1xuICAgIGh0dHBDbGllbnQuZ2V0KHsgdXJsOiAnL2RvZXMtbm90LWV4aXN0JyB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjaGFpLmV4cGVjdChyZXNwb25zZSkudG8uZXF1YWwoJ3Nob3J0Y2lyY3VpdCByZXNwb25zZScpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgncmVzcG9uc2Ugc3RlcCBjYW4gbW9kaWZ5IHRoZSByZXNwb25zZSBvYmplY3QnLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KCk7XG4gICAgaHR0cENsaWVudC5hZGRSZXNwb25zZVN0ZXAoKHsgcmVzcG9uc2UgfSkgPT4ge1xuICAgICAgcmVzcG9uc2UuZm9vID0gJ2EgcmVzcG9uc2Ugc3RlcCB3YXMgaGVyZSc7XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCdhIHJlc3BvbnNlIHN0ZXAgd2FzIGhlcmUnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGdldEJvZHlGcm9tUmVxIH0gZnJvbSAnLi9odHRwLWNsaWVudC5qcyc7XG5pbXBvcnQgeyBqc29uQ2xvbmUgfSBmcm9tICcuLi9vYmplY3QvY2xvbmUuanMnO1xuXG5jb25zdCBtZW1DYWNoZSA9IHt9O1xuXG5jb25zdCB1c2VNZW1DYWNoZSA9IGZ1bmN0aW9uKGh0dHBDbGllbnQpIHtcbiAgdXNlU2F2ZVRvTWVtQ2FjaGUoaHR0cENsaWVudCk7XG4gIHVzZUdldEZyb21DYWNoZShodHRwQ2xpZW50KTtcbiAgcmV0dXJuIGh0dHBDbGllbnQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB1c2VNZW1DYWNoZTtcblxuZXhwb3J0IGNvbnN0IHVzZUdldEZyb21DYWNoZSA9IGZ1bmN0aW9uKGh0dHBDbGllbnQpIHtcbiAgcmV0dXJuIGh0dHBDbGllbnQuYWRkUmVxdWVzdFN0ZXAoZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgaWYgKFxuICAgICAgIXJlc3BvbnNlICYmXG4gICAgICB0eXBlb2YgbWVtQ2FjaGVbY2FjaGVLZXkocmVxdWVzdCldICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgKHR5cGVvZiByZXF1ZXN0LnJlc3BvbnNlSXNDYWNoYWJsZSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZUlzQ2FjaGFibGUoe1xuICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgcmVzcG9uc2U6IG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXVxuICAgICAgICB9KSlcbiAgICApIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2UgPSBqc29uQ2xvbmUobWVtQ2FjaGVbY2FjaGVLZXkocmVxdWVzdCldKTtcbiAgICAgIHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWVzdC5zZXJ2ZWRGcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHVzZVNhdmVUb01lbUNhY2hlID0gZnVuY3Rpb24oaHR0cENsaWVudCkge1xuICByZXR1cm4gaHR0cENsaWVudC5hZGRSZXNwb25zZVN0ZXAoZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgaWYgKFxuICAgICAgdHlwZW9mIHJlcXVlc3QucmVzcG9uc2VJc0NhY2hhYmxlID09PSAndW5kZWZpbmVkJyB8fFxuICAgICAgcmVxdWVzdC5yZXNwb25zZUlzQ2FjaGFibGUoeyByZXF1ZXN0LCByZXNwb25zZSB9KVxuICAgICkge1xuICAgICAgbWVtQ2FjaGVbY2FjaGVLZXkocmVxdWVzdCldID0gcmVzcG9uc2U7XG4gICAgICByZXF1ZXN0LnNhdmVkVG9DYWNoZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3Quc2F2ZWRUb0NhY2hlID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYnVzdE1lbUNhY2hlID0gZnVuY3Rpb24ocGFydGlhbFVybCA9ICcnKSB7XG4gIE9iamVjdC5rZXlzKG1lbUNhY2hlKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAoay5pbmNsdWRlcyhwYXJ0aWFsVXJsKSkge1xuICAgICAgbWVtQ2FjaGVba10gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIGNhY2hlS2V5KHJlcXVlc3QpIHtcbiAgcmV0dXJuIGAke3JlcXVlc3QudXJsfTo6JHtyZXF1ZXN0Lm1ldGhvZH06OiR7Z2V0Qm9keUZyb21SZXEocmVxdWVzdCl9YDtcbn1cbiIsImltcG9ydCBodHRwQ2xpZW50RmFjdG9yeSBmcm9tICcuLi8uLi9saWIvaHR0cC1jbGllbnQvaHR0cC1jbGllbnQuanMnO1xuaW1wb3J0IHVzZU1lbUNhY2hlLCB7XG4gIGJ1c3RNZW1DYWNoZVxufSBmcm9tICcuLi8uLi9saWIvaHR0cC1jbGllbnQvdXNlLW1lbS1jYWNoZS5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCB3LyBtZW0tY2FjaGUnLCAoKSA9PiB7XG4gIGl0KCdyZXNwb25zZSBjYW4gYmUgY2FjaGVkJywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSB1c2VNZW1DYWNoZShodHRwQ2xpZW50RmFjdG9yeSgpKTtcbiAgICBodHRwQ2xpZW50XG4gICAgICAuZ2V0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzEnKTtcbiAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC5zZXJ2ZWRGcm9tQ2FjaGUpLnRvLmVxdWFsKGZhbHNlKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaHR0cENsaWVudFxuICAgICAgICAgIC5nZXQoe1xuICAgICAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXF1ZXN0LnNlcnZlZEZyb21DYWNoZSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ2NhY2hlIGNhbiBiZSBidXN0ZWQnLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IHVzZU1lbUNhY2hlKGh0dHBDbGllbnRGYWN0b3J5KCkpO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgYnVzdE1lbUNhY2hlKCk7XG4gICAgICAgIGh0dHBDbGllbnRcbiAgICAgICAgICAuZ2V0KHtcbiAgICAgICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UuZm9vKS50by5lcXVhbCgnMScpO1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC5zZXJ2ZWRGcm9tQ2FjaGUpLnRvLmVxdWFsKGZhbHNlKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9KTtcblxuICAvL1RPRE86IEZBSUxTIGR1ZSB0byBqc29uQ2xvbmUgYmVpbmcgdXNlZCBvbiBhIG9iamVjdCB0aGF0IGhhcyBhIHByb3BlcnR5IHRoYXQgaGFzIGEgZnVuY3Rpb24gYXMgdGhlIHZhbHVlXG4gIGl0KCdyZXNwb25zZUlzQ2FjaGFibGUgY2FuIHByZXZlbnQgY2FjaGVkIHJlc3BvbnNlIGZyb20gYmVpbmcgY2FjaGVkJywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSB1c2VNZW1DYWNoZShcbiAgICAgIGh0dHBDbGllbnRGYWN0b3J5KHtcbiAgICAgICAgcmVzcG9uc2VJc0NhY2hhYmxlOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBodHRwQ2xpZW50XG4gICAgICAgICAgLmdldCh7XG4gICAgICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzEnKTtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlKS50by5lcXVhbChmYWxzZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy8gaXQoJ3Jlc3BvbnNlSXNDYWNoYWJsZSBjYW4gcHJldmVudCBjYWNoZWQgcmVzcG9uc2UgZnJvbSBiZWluZyByZXR1cm5lZCcsIGRvbmUgPT4ge30pO1xufSk7XG4iXSwibmFtZXMiOlsiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJpbmNsdWRlcyIsImJyb3dzZXIiLCJmbiIsInJhaXNlIiwiRXJyb3IiLCJuYW1lIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImxlbmd0aCIsImRlZmluZVByb3BlcnR5IiwiaSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImEiLCJkZWVwIiwiYm9keSIsInRlbXBsYXRlIiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJlbCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJhcnIiLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwiaXMiLCJzZXR1cCIsImNoZWNrcyIsImdldFR5cGUiLCJtYXRjaGVzIiwiY2xvbmUiLCJzcmMiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJvYmplY3QiLCJmdW5jdGlvbiIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsImtleSIsImZpbmRJbmRleCIsImpzb25DbG9uZSIsImUiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJzdHJpbmciLCJ1c2VGZXRjaCIsImh0dHBDbGllbnQiLCJhZGRSZXNwb25zZVN0ZXAiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJmZXRjaE9wdGlvbnMiLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiZ2V0Qm9keUZyb21SZXEiLCJ1cmwiLCJmZXRjaCIsInRoZW4iLCJvayIsInRleHQiLCJkZWZhdWx0T3B0aW9ucyIsInJldHVyblJlcXVlc3RBbmRSZXNwb25zZSIsImh0dHBDbGllbnRGYWN0b3J5IiwiY3VzdG9tSW5zdGFuY2VPcHRpb25zIiwiaW5zdGFuY2VPcHRpb25zIiwicmVxdWVzdFN0ZXBzIiwicmVzcG9uc2VTdGVwcyIsImN1c3RvbVJ1bk9wdGlvbnMiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJwcm9taXNlTWV0aG9kIiwicmVqZWN0Q2FsbGJhY2siLCJhcmciLCJzdGVwQXJndW1lbnRJc05vcm1hbGl6ZWQiLCJwb3N0IiwicHV0IiwicGF0Y2giLCJkZWxldGUiLCJvcHRpb25zIiwibmV3T3B0aW9ucyIsImFkZFJlcXVlc3RTdGVwIiwibm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyIsInJlcSIsImZvbyIsImRvbmUiLCJ0ZXN0RGF0YSIsIm1lbUNhY2hlIiwidXNlTWVtQ2FjaGUiLCJ1c2VTYXZlVG9NZW1DYWNoZSIsInVzZUdldEZyb21DYWNoZSIsImNhY2hlS2V5IiwicmVzcG9uc2VJc0NhY2hhYmxlIiwic2VydmVkRnJvbUNhY2hlIiwic2F2ZWRUb0NhY2hlIiwiYnVzdE1lbUNhY2hlIiwicGFydGlhbFVybCIsImsiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBO0FBQ0EsRUFBTyxJQUFNQSxZQUFZLENBQUMsUUFBUUMsTUFBUix5Q0FBUUEsTUFBUixVQUF1QkMsUUFBdkIseUNBQXVCQSxRQUF2QixHQUFpQ0MsUUFBakMsQ0FDeEIsV0FEd0IsQ0FBbkI7O0FBSVAsRUFBTyxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsRUFBRDtFQUFBLE1BQUtDLEtBQUwsdUVBQWEsSUFBYjtFQUFBLFNBQXNCLFlBRXhDO0VBQ0gsUUFBSU4sU0FBSixFQUFlO0VBQ2IsYUFBT0ssOEJBQVA7RUFDRDtFQUNELFFBQUlDLEtBQUosRUFBVztFQUNULFlBQU0sSUFBSUMsS0FBSixDQUFhRixHQUFHRyxJQUFoQiwyQkFBTjtFQUNEO0VBQ0YsR0FUc0I7RUFBQSxDQUFoQjs7RUNMUDtBQUNBLHVCQUFlLFlBRVY7RUFBQSxNQURIQyxPQUNHLHVFQURPQyxPQUFPQyxNQUFQLENBQWNDLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsRUFBL0IsQ0FDUDs7RUFDSCxNQUFJQyxRQUFRLElBQUlDLE9BQUosRUFBWjtFQUNBLFNBQU8sVUFBQ0MsR0FBRCxFQUFTO0VBQ2QsUUFBSUMsUUFBUUgsTUFBTUksR0FBTixDQUFVRixHQUFWLENBQVo7RUFDQSxRQUFJLENBQUNDLEtBQUwsRUFBWTtFQUNWSCxZQUFNSyxHQUFOLENBQVVILEdBQVYsRUFBZ0JDLFFBQVFQLFFBQVFNLEdBQVIsQ0FBeEI7RUFDRDtFQUNELFdBQU9DLEtBQVA7RUFDRCxHQU5EO0VBT0QsQ0FYRDs7RUNEQTtBQUNBLGdCQUFlLFVBQUNHLFNBQUQsRUFBK0I7RUFBQSxvQ0FBaEJDLFdBQWdCO0VBQWhCQSxlQUFnQjtFQUFBOztFQUM1QyxTQUFPLFVBQVNDLEtBQVQsRUFBZ0I7RUFDckIsUUFBTUMsUUFBUUQsTUFBTUUsU0FBcEI7RUFDQSxRQUFNQyxNQUFNSixZQUFZSyxNQUF4QjtFQUZxQixRQUdiQyxjQUhhLEdBR01oQixNQUhOLENBR2JnQixjQUhhOztFQUFBLCtCQUlaQyxDQUpZO0VBS25CLFVBQU1DLGFBQWFSLFlBQVlPLENBQVosQ0FBbkI7RUFDQSxVQUFNRSxTQUFTUCxNQUFNTSxVQUFOLENBQWY7RUFDQUYscUJBQWVKLEtBQWYsRUFBc0JNLFVBQXRCLEVBQWtDO0VBQ2hDWixlQUFPLGlCQUFrQjtFQUFBLDZDQUFOYyxJQUFNO0VBQU5BLGdCQUFNO0VBQUE7O0VBQ3ZCQSxlQUFLQyxPQUFMLENBQWFGLE1BQWI7RUFDQVYsb0JBQVVhLEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCO0VBQ0QsU0FKK0I7RUFLaENHLGtCQUFVO0VBTHNCLE9BQWxDO0VBUG1COztFQUlyQixTQUFLLElBQUlOLElBQUksQ0FBYixFQUFnQkEsSUFBSUgsR0FBcEIsRUFBeUJHLEdBQXpCLEVBQThCO0VBQUEsWUFBckJBLENBQXFCO0VBVTdCO0VBQ0QsV0FBT04sS0FBUDtFQUNELEdBaEJEO0VBaUJELENBbEJEOztFQ0RBOztFQUVBLElBQUlhLHNCQUFzQixDQUExQjtFQUNBLElBQUlDLHNCQUFzQixDQUExQjtFQUNBLElBQUlDLHFCQUFxQixFQUF6QjtFQUNBLElBQUlDLHVCQUF1QixDQUEzQjtFQUNBLElBQUlDLGdCQUFnQnBDLFNBQVNxQyxjQUFULENBQXdCLEVBQXhCLENBQXBCO0VBQ0EsSUFBSUMsZ0JBQUosQ0FBcUJDLGNBQXJCLEVBQXFDQyxPQUFyQyxDQUE2Q0osYUFBN0MsRUFBNEQ7RUFDMURLLGlCQUFlO0VBRDJDLENBQTVEOztFQUtBOzs7RUFHQSxJQUFNQyxZQUFZO0VBQ2hCOzs7Ozs7RUFNQUMsS0FQZ0IsZUFPWkMsUUFQWSxFQU9GO0VBQ1pSLGtCQUFjUyxXQUFkLEdBQTRCQyxPQUFPWCxzQkFBUCxDQUE1QjtFQUNBRCx1QkFBbUJhLElBQW5CLENBQXdCSCxRQUF4QjtFQUNBLFdBQU9aLHFCQUFQO0VBQ0QsR0FYZTs7O0VBYWhCOzs7OztFQUtBZ0IsUUFsQmdCLGtCQWtCVEMsTUFsQlMsRUFrQkQ7RUFDYixRQUFNQyxNQUFNRCxTQUFTaEIsbUJBQXJCO0VBQ0EsUUFBSWlCLE9BQU8sQ0FBWCxFQUFjO0VBQ1osVUFBSSxDQUFDaEIsbUJBQW1CZ0IsR0FBbkIsQ0FBTCxFQUE4QjtFQUM1QixjQUFNLElBQUk3QyxLQUFKLENBQVUsMkJBQTJCNEMsTUFBckMsQ0FBTjtFQUNEO0VBQ0RmLHlCQUFtQmdCLEdBQW5CLElBQTBCLElBQTFCO0VBQ0Q7RUFDRjtFQTFCZSxDQUFsQjs7RUErQkEsU0FBU1gsY0FBVCxHQUEwQjtFQUN4QixNQUFNakIsTUFBTVksbUJBQW1CWCxNQUEvQjtFQUNBLE9BQUssSUFBSUUsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSCxHQUFwQixFQUF5QkcsR0FBekIsRUFBOEI7RUFDNUIsUUFBSTBCLEtBQUtqQixtQkFBbUJULENBQW5CLENBQVQ7RUFDQSxRQUFJMEIsTUFBTSxPQUFPQSxFQUFQLEtBQWMsVUFBeEIsRUFBb0M7RUFDbEMsVUFBSTtFQUNGQTtFQUNELE9BRkQsQ0FFRSxPQUFPQyxHQUFQLEVBQVk7RUFDWkMsbUJBQVcsWUFBTTtFQUNmLGdCQUFNRCxHQUFOO0VBQ0QsU0FGRDtFQUdEO0VBQ0Y7RUFDRjtFQUNEbEIscUJBQW1Cb0IsTUFBbkIsQ0FBMEIsQ0FBMUIsRUFBNkJoQyxHQUE3QjtFQUNBVyx5QkFBdUJYLEdBQXZCO0VBQ0Q7O0VDOUREO0FBQ0E7RUFLQSxJQUFNaUMsV0FBU3ZELFNBQVN3RCxXQUF4Qjs7RUFFQTtFQUNBLElBQUksT0FBT0QsU0FBT0UsV0FBZCxLQUE4QixVQUFsQyxFQUE4QztFQUM1QyxNQUFNQyxlQUFlLFNBQVNELFdBQVQsR0FBdUI7RUFDMUM7RUFDRCxHQUZEO0VBR0FDLGVBQWFyQyxTQUFiLEdBQXlCa0MsU0FBT0UsV0FBUCxDQUFtQnBDLFNBQTVDO0VBQ0FrQyxXQUFPRSxXQUFQLEdBQXFCQyxZQUFyQjtFQUNEOztBQUdELHNCQUFleEQsUUFBUSxVQUFDeUQsU0FBRCxFQUFlO0VBQ3BDLE1BQU1DLDRCQUE0QixDQUNoQyxtQkFEZ0MsRUFFaEMsc0JBRmdDLEVBR2hDLGlCQUhnQyxFQUloQywwQkFKZ0MsQ0FBbEM7RUFEb0MsTUFPNUJwQyxpQkFQNEIsR0FPT2hCLE1BUFAsQ0FPNUJnQixjQVA0QjtFQUFBLE1BT1pxQyxjQVBZLEdBT09yRCxNQVBQLENBT1pxRCxjQVBZOztFQVFwQyxNQUFNQyxXQUFXQyxlQUFqQjs7RUFFQSxNQUFJLENBQUNKLFNBQUwsRUFBZ0I7RUFDZEE7RUFBQTs7RUFBQTtFQUFBO0VBQUE7RUFBQTs7RUFBQTtFQUFBLE1BQTBCSixTQUFPRSxXQUFqQztFQUNEOztFQUVEO0VBQUE7O0VBQUEsa0JBTVNPLGFBTlQsNEJBTXlCLEVBTnpCOztFQUFBLGtCQVFTQyxNQVJULG1CQVFnQkMsT0FSaEIsRUFReUI7RUFDckIsVUFBTUMsV0FBV0MsY0FBakI7RUFDQSxVQUFJLENBQUNELFNBQVNwRCxHQUFULENBQWFtRCxPQUFiLENBQUwsRUFBNEI7RUFDMUIsWUFBTTlDLFFBQVEsS0FBS0MsU0FBbkI7RUFDQXVDLGtDQUEwQlMsT0FBMUIsQ0FBa0MsVUFBQ0Msa0JBQUQsRUFBd0I7RUFDeEQsY0FBSSxDQUFDVCxlQUFlVSxJQUFmLENBQW9CbkQsS0FBcEIsRUFBMkJrRCxrQkFBM0IsQ0FBTCxFQUFxRDtFQUNuRDlDLDhCQUFlSixLQUFmLEVBQXNCa0Qsa0JBQXRCLEVBQTBDO0VBQ3hDeEQsbUJBRHdDLG1CQUNoQyxFQURnQzs7RUFFeEMwRCw0QkFBYztFQUYwQixhQUExQztFQUlEO0VBQ0QsY0FBTUMsa0JBQWtCSCxtQkFBbUJJLFNBQW5CLENBQ3RCLENBRHNCLEVBRXRCSixtQkFBbUIvQyxNQUFuQixHQUE0QixXQUFXQSxNQUZqQixDQUF4QjtFQUlBLGNBQU1vRCxpQkFBaUJ2RCxNQUFNa0Qsa0JBQU4sQ0FBdkI7RUFDQTlDLDRCQUFlSixLQUFmLEVBQXNCa0Qsa0JBQXRCLEVBQTBDO0VBQ3hDeEQsbUJBQU8saUJBQWtCO0VBQUEsZ0RBQU5jLElBQU07RUFBTkEsb0JBQU07RUFBQTs7RUFDdkIsbUJBQUs2QyxlQUFMLEVBQXNCM0MsS0FBdEIsQ0FBNEIsSUFBNUIsRUFBa0NGLElBQWxDO0VBQ0ErQyw2QkFBZTdDLEtBQWYsQ0FBcUIsSUFBckIsRUFBMkJGLElBQTNCO0VBQ0QsYUFKdUM7RUFLeEM0QywwQkFBYztFQUwwQixXQUExQztFQU9ELFNBbkJEOztFQXFCQSxhQUFLUixhQUFMO0VBQ0FZLGVBQU9DLHVCQUFQLEVBQWdDLFdBQWhDLEVBQTZDLElBQTdDO0VBQ0FELGVBQU9FLDBCQUFQLEVBQW1DLGNBQW5DLEVBQW1ELElBQW5EO0VBQ0FGLGVBQU9HLG9CQUFQLEVBQTZCLFFBQTdCLEVBQXVDLElBQXZDO0VBQ0FaLGlCQUFTRixNQUFULENBQWdCQyxPQUFoQixFQUF5QixJQUF6QjtFQUNEO0VBQ0YsS0F2Q0g7O0VBQUE7RUFBQTtFQUFBLDZCQXlDb0I7RUFDaEIsZUFBT0osU0FBUyxJQUFULEVBQWVrQixXQUFmLEtBQStCLElBQXRDO0VBQ0Q7RUEzQ0g7RUFBQTtFQUFBLDZCQUVrQztFQUM5QixlQUFPLEVBQVA7RUFDRDtFQUpIOztFQTZDRSw2QkFBcUI7RUFBQTs7RUFBQSx5Q0FBTnBELElBQU07RUFBTkEsWUFBTTtFQUFBOztFQUFBLG1EQUNuQixnREFBU0EsSUFBVCxFQURtQjs7RUFFbkIsYUFBS3FELFNBQUw7RUFGbUI7RUFHcEI7O0VBaERILDRCQWtERUEsU0FsREYsd0JBa0RjLEVBbERkOztFQW9ERTs7O0VBcERGLDRCQXFERUMsZ0JBckRGLDZCQXNESUMsYUF0REosRUF1RElDLFFBdkRKLEVBd0RJQyxRQXhESixFQXlESSxFQXpESjtFQTBERTs7RUExREYsNEJBNERFQyxTQTVERix3QkE0RGMsRUE1RGQ7O0VBQUEsNEJBOERFQyxZQTlERiwyQkE4RGlCLEVBOURqQjs7RUFBQSw0QkFnRUVDLE9BaEVGLHNCQWdFWSxFQWhFWjs7RUFBQSw0QkFrRUVDLE1BbEVGLHFCQWtFVyxFQWxFWDs7RUFBQSw0QkFvRUVDLFNBcEVGLHdCQW9FYyxFQXBFZDs7RUFBQSw0QkFzRUVDLFdBdEVGLDBCQXNFZ0IsRUF0RWhCOztFQUFBO0VBQUEsSUFBbUNoQyxTQUFuQzs7RUF5RUEsV0FBU2tCLHFCQUFULEdBQWlDO0VBQy9CLFdBQU8sVUFBU2UsaUJBQVQsRUFBNEI7RUFDakMsVUFBTUMsVUFBVSxJQUFoQjtFQUNBL0IsZUFBUytCLE9BQVQsRUFBa0JQLFNBQWxCLEdBQThCLElBQTlCO0VBQ0EsVUFBSSxDQUFDeEIsU0FBUytCLE9BQVQsRUFBa0JiLFdBQXZCLEVBQW9DO0VBQ2xDbEIsaUJBQVMrQixPQUFULEVBQWtCYixXQUFsQixHQUFnQyxJQUFoQztFQUNBWSwwQkFBa0JyQixJQUFsQixDQUF1QnNCLE9BQXZCO0VBQ0FBLGdCQUFRSixNQUFSO0VBQ0Q7RUFDRixLQVJEO0VBU0Q7O0VBRUQsV0FBU1Ysa0JBQVQsR0FBOEI7RUFDNUIsV0FBTyxVQUFTZSxjQUFULEVBQXlCO0VBQzlCLFVBQU1ELFVBQVUsSUFBaEI7RUFDQSxVQUFJLENBQUMvQixTQUFTK0IsT0FBVCxFQUFrQkUsU0FBdkIsRUFBa0M7RUFDaEMsWUFBTUMsY0FBY2xDLFNBQVMrQixPQUFULEVBQWtCRSxTQUFsQixLQUFnQ0UsU0FBcEQ7RUFDQW5DLGlCQUFTK0IsT0FBVCxFQUFrQkUsU0FBbEIsR0FBOEIsSUFBOUI7RUFDQXJELGtCQUFVQyxHQUFWLENBQWMsWUFBTTtFQUNsQixjQUFJbUIsU0FBUytCLE9BQVQsRUFBa0JFLFNBQXRCLEVBQWlDO0VBQy9CakMscUJBQVMrQixPQUFULEVBQWtCRSxTQUFsQixHQUE4QixLQUE5QjtFQUNBRixvQkFBUUgsU0FBUixDQUFrQk0sV0FBbEI7RUFDQUYsMkJBQWV2QixJQUFmLENBQW9Cc0IsT0FBcEI7RUFDQUEsb0JBQVFGLFdBQVIsQ0FBb0JLLFdBQXBCO0VBQ0Q7RUFDRixTQVBEO0VBUUQ7RUFDRixLQWREO0VBZUQ7O0VBRUQsV0FBU2xCLHdCQUFULEdBQW9DO0VBQ2xDLFdBQU8sVUFBU29CLG9CQUFULEVBQStCO0VBQ3BDLFVBQU1MLFVBQVUsSUFBaEI7RUFDQS9CLGVBQVMrQixPQUFULEVBQWtCUCxTQUFsQixHQUE4QixLQUE5QjtFQUNBNUMsZ0JBQVVDLEdBQVYsQ0FBYyxZQUFNO0VBQ2xCLFlBQUksQ0FBQ21CLFNBQVMrQixPQUFULEVBQWtCUCxTQUFuQixJQUFnQ3hCLFNBQVMrQixPQUFULEVBQWtCYixXQUF0RCxFQUFtRTtFQUNqRWxCLG1CQUFTK0IsT0FBVCxFQUFrQmIsV0FBbEIsR0FBZ0MsS0FBaEM7RUFDQWtCLCtCQUFxQjNCLElBQXJCLENBQTBCc0IsT0FBMUI7RUFDRDtFQUNGLE9BTEQ7RUFNRCxLQVREO0VBVUQ7RUFDRixDQWpJYyxDQUFmOztFQ2xCQTtBQUNBLGtCQUFlLFVBQUM1RSxTQUFELEVBQStCO0VBQUEsb0NBQWhCQyxXQUFnQjtFQUFoQkEsZUFBZ0I7RUFBQTs7RUFDNUMsU0FBTyxVQUFTQyxLQUFULEVBQWdCO0VBQ3JCLFFBQU1DLFFBQVFELE1BQU1FLFNBQXBCO0VBQ0EsUUFBTUMsTUFBTUosWUFBWUssTUFBeEI7RUFGcUIsUUFHYkMsY0FIYSxHQUdNaEIsTUFITixDQUdiZ0IsY0FIYTs7RUFBQSwrQkFJWkMsQ0FKWTtFQUtuQixVQUFNQyxhQUFhUixZQUFZTyxDQUFaLENBQW5CO0VBQ0EsVUFBTUUsU0FBU1AsTUFBTU0sVUFBTixDQUFmO0VBQ0FGLHFCQUFlSixLQUFmLEVBQXNCTSxVQUF0QixFQUFrQztFQUNoQ1osZUFBTyxpQkFBa0I7RUFBQSw2Q0FBTmMsSUFBTTtFQUFOQSxnQkFBTTtFQUFBOztFQUN2Qlgsb0JBQVVhLEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCO0VBQ0EsaUJBQU9ELE9BQU9HLEtBQVAsQ0FBYSxJQUFiLEVBQW1CRixJQUFuQixDQUFQO0VBQ0QsU0FKK0I7RUFLaENHLGtCQUFVO0VBTHNCLE9BQWxDO0VBUG1COztFQUlyQixTQUFLLElBQUlOLElBQUksQ0FBYixFQUFnQkEsSUFBSUgsR0FBcEIsRUFBeUJHLEdBQXpCLEVBQThCO0VBQUEsWUFBckJBLENBQXFCO0VBVTdCO0VBQ0QsV0FBT04sS0FBUDtFQUNELEdBaEJEO0VBaUJELENBbEJEOztFQ0RBO0FBQ0E7QUFTQSxtQkFBZWpCLFFBQVEsVUFBQ3lELFNBQUQsRUFBZTtFQUFBLE1BQzVCbkMsaUJBRDRCLEdBQ0toQixNQURMLENBQzVCZ0IsY0FENEI7RUFBQSxNQUNaMkUsSUFEWSxHQUNLM0YsTUFETCxDQUNaMkYsSUFEWTtFQUFBLE1BQ05DLE1BRE0sR0FDSzVGLE1BREwsQ0FDTjRGLE1BRE07O0VBRXBDLE1BQU1DLDJCQUEyQixFQUFqQztFQUNBLE1BQU1DLDRCQUE0QixFQUFsQztFQUNBLE1BQU14QyxXQUFXQyxlQUFqQjs7RUFFQSxNQUFJd0MseUJBQUo7RUFDQSxNQUFJQyxrQkFBa0IsRUFBdEI7RUFDQSxNQUFJQyxrQkFBa0IsRUFBdEI7O0VBRUEsV0FBU0MscUJBQVQsQ0FBK0JDLE1BQS9CLEVBQXVDO0VBQ3JDQSxXQUFPQyxXQUFQLEdBQXFCLGNBQWNELE1BQW5DO0VBQ0FBLFdBQU9FLGdCQUFQLEdBQ0VGLE9BQU9DLFdBQVAsSUFBc0IsT0FBT0QsT0FBT0csUUFBZCxLQUEyQixRQURuRDtFQUVBSCxXQUFPSSxRQUFQLEdBQWtCSixPQUFPSyxJQUFQLEtBQWdCbEUsTUFBbEM7RUFDQTZELFdBQU9NLFFBQVAsR0FBa0JOLE9BQU9LLElBQVAsS0FBZ0JFLE1BQWxDO0VBQ0FQLFdBQU9RLFNBQVAsR0FBbUJSLE9BQU9LLElBQVAsS0FBZ0JJLE9BQW5DO0VBQ0FULFdBQU9VLFFBQVAsR0FBa0JWLE9BQU9LLElBQVAsS0FBZ0J4RyxNQUFsQztFQUNBbUcsV0FBT1csT0FBUCxHQUFpQlgsT0FBT0ssSUFBUCxLQUFnQk8sS0FBakM7RUFDQVosV0FBT2EsTUFBUCxHQUFnQmIsT0FBT0ssSUFBUCxLQUFnQlMsSUFBaEM7RUFDQWQsV0FBT2UsTUFBUCxHQUFnQixZQUFZZixNQUE1QjtFQUNBQSxXQUFPZ0IsUUFBUCxHQUFrQixjQUFjaEIsTUFBZCxHQUF1QkEsT0FBT2dCLFFBQTlCLEdBQXlDLEtBQTNEO0VBQ0FoQixXQUFPaUIsa0JBQVAsR0FDRSx3QkFBd0JqQixNQUF4QixHQUNJQSxPQUFPaUIsa0JBRFgsR0FFSWpCLE9BQU9JLFFBQVAsSUFBbUJKLE9BQU9NLFFBQTFCLElBQXNDTixPQUFPUSxTQUhuRDtFQUlEOztFQUVELFdBQVNVLG1CQUFULENBQTZCQyxVQUE3QixFQUF5QztFQUN2QyxRQUFNQyxTQUFTLEVBQWY7RUFDQSxTQUFLLElBQUl6SCxJQUFULElBQWlCd0gsVUFBakIsRUFBNkI7RUFDM0IsVUFBSSxDQUFDdEgsT0FBT3FELGNBQVAsQ0FBc0JVLElBQXRCLENBQTJCdUQsVUFBM0IsRUFBdUN4SCxJQUF2QyxDQUFMLEVBQW1EO0VBQ2pEO0VBQ0Q7RUFDRCxVQUFNMEgsV0FBV0YsV0FBV3hILElBQVgsQ0FBakI7RUFDQXlILGFBQU96SCxJQUFQLElBQ0UsT0FBTzBILFFBQVAsS0FBb0IsVUFBcEIsR0FBaUMsRUFBRWhCLE1BQU1nQixRQUFSLEVBQWpDLEdBQXNEQSxRQUR4RDtFQUVBdEIsNEJBQXNCcUIsT0FBT3pILElBQVAsQ0FBdEI7RUFDRDtFQUNELFdBQU95SCxNQUFQO0VBQ0Q7O0VBRUQsV0FBU2xELHFCQUFULEdBQWlDO0VBQy9CLFdBQU8sWUFBVztFQUNoQixVQUFNZ0IsVUFBVSxJQUFoQjtFQUNBLFVBQUlyRixPQUFPMkYsSUFBUCxDQUFZckMsU0FBUytCLE9BQVQsRUFBa0JvQyxvQkFBOUIsRUFBb0QxRyxNQUFwRCxHQUE2RCxDQUFqRSxFQUFvRTtFQUNsRTZFLGVBQU9QLE9BQVAsRUFBZ0IvQixTQUFTK0IsT0FBVCxFQUFrQm9DLG9CQUFsQztFQUNBbkUsaUJBQVMrQixPQUFULEVBQWtCb0Msb0JBQWxCLEdBQXlDLEVBQXpDO0VBQ0Q7RUFDRHBDLGNBQVFxQyxnQkFBUjtFQUNELEtBUEQ7RUFRRDs7RUFFRCxXQUFTQywyQkFBVCxHQUF1QztFQUNyQyxXQUFPLFVBQVNDLFNBQVQsRUFBb0JoRCxRQUFwQixFQUE4QkMsUUFBOUIsRUFBd0M7RUFDN0MsVUFBTVEsVUFBVSxJQUFoQjtFQUNBLFVBQUlULGFBQWFDLFFBQWpCLEVBQTJCO0VBQ3pCUSxnQkFBUXdDLG9CQUFSLENBQTZCRCxTQUE3QixFQUF3Qy9DLFFBQXhDO0VBQ0Q7RUFDRixLQUxEO0VBTUQ7O0VBRUQsV0FBU2lELDZCQUFULEdBQXlDO0VBQ3ZDLFdBQU8sVUFDTEMsWUFESyxFQUVMQyxZQUZLLEVBR0xDLFFBSEssRUFJTDtFQUFBOztFQUNBLFVBQUk1QyxVQUFVLElBQWQ7RUFDQXJGLGFBQU8yRixJQUFQLENBQVlxQyxZQUFaLEVBQTBCbkUsT0FBMUIsQ0FBa0MsVUFBQzJELFFBQUQsRUFBYztFQUFBLG9DQU8xQ25DLFFBQVE2QyxXQUFSLENBQW9CQyxlQUFwQixDQUFvQ1gsUUFBcEMsQ0FQMEM7RUFBQSxZQUU1Q04sTUFGNEMseUJBRTVDQSxNQUY0QztFQUFBLFlBRzVDZCxXQUg0Qyx5QkFHNUNBLFdBSDRDO0VBQUEsWUFJNUNnQixrQkFKNEMseUJBSTVDQSxrQkFKNEM7RUFBQSxZQUs1Q2YsZ0JBTDRDLHlCQUs1Q0EsZ0JBTDRDO0VBQUEsWUFNNUNDLFFBTjRDLHlCQU01Q0EsUUFONEM7O0VBUTlDLFlBQUljLGtCQUFKLEVBQXdCO0VBQ3RCL0Isa0JBQVErQyxvQkFBUixDQUE2QlosUUFBN0IsRUFBdUNRLGFBQWFSLFFBQWIsQ0FBdkM7RUFDRDtFQUNELFlBQUlwQixlQUFlQyxnQkFBbkIsRUFBcUM7RUFDbkMsZ0JBQUtDLFFBQUwsRUFBZTBCLGFBQWFSLFFBQWIsQ0FBZixFQUF1Q1MsU0FBU1QsUUFBVCxDQUF2QztFQUNELFNBRkQsTUFFTyxJQUFJcEIsZUFBZSxPQUFPRSxRQUFQLEtBQW9CLFVBQXZDLEVBQW1EO0VBQ3hEQSxtQkFBU2hGLEtBQVQsQ0FBZStELE9BQWYsRUFBd0IsQ0FBQzJDLGFBQWFSLFFBQWIsQ0FBRCxFQUF5QlMsU0FBU1QsUUFBVCxDQUF6QixDQUF4QjtFQUNEO0VBQ0QsWUFBSU4sTUFBSixFQUFZO0VBQ1Y3QixrQkFBUWdELGFBQVIsQ0FDRSxJQUFJQyxXQUFKLENBQW1CZCxRQUFuQixlQUF1QztFQUNyQ2Usb0JBQVE7RUFDTjFELHdCQUFVbUQsYUFBYVIsUUFBYixDQURKO0VBRU41Qyx3QkFBVXFELFNBQVNULFFBQVQ7RUFGSjtFQUQ2QixXQUF2QyxDQURGO0VBUUQ7RUFDRixPQTFCRDtFQTJCRCxLQWpDRDtFQWtDRDs7RUFFRDtFQUFBOztFQUFBO0VBQUE7RUFBQTtFQUFBOztFQUFBLGVBVVNoRSxhQVZULDRCQVV5QjtFQUNyQixpQkFBTUEsYUFBTjtFQUNBZ0YsZUFBT25FLHVCQUFQLEVBQWdDLFdBQWhDLEVBQTZDLElBQTdDO0VBQ0FtRSxlQUFPYiw2QkFBUCxFQUFzQyxrQkFBdEMsRUFBMEQsSUFBMUQ7RUFDQWEsZUFBT1YsK0JBQVAsRUFBd0MsbUJBQXhDLEVBQTZELElBQTdEO0VBQ0EsV0FBS1csZ0JBQUw7RUFDRCxLQWhCSDs7RUFBQSxlQWtCU0MsdUJBbEJULG9DQWtCaUNkLFNBbEJqQyxFQWtCNEM7RUFDeEMsVUFBSUosV0FBVzNCLHlCQUF5QitCLFNBQXpCLENBQWY7RUFDQSxVQUFJLENBQUNKLFFBQUwsRUFBZTtFQUNiO0VBQ0EsWUFBTW1CLGFBQWEsV0FBbkI7RUFDQW5CLG1CQUFXSSxVQUFVZ0IsT0FBVixDQUFrQkQsVUFBbEIsRUFBOEI7RUFBQSxpQkFDdkNFLE1BQU0sQ0FBTixFQUFTQyxXQUFULEVBRHVDO0VBQUEsU0FBOUIsQ0FBWDtFQUdBakQsaUNBQXlCK0IsU0FBekIsSUFBc0NKLFFBQXRDO0VBQ0Q7RUFDRCxhQUFPQSxRQUFQO0VBQ0QsS0E3Qkg7O0VBQUEsZUErQlN1Qix1QkEvQlQsb0NBK0JpQ3ZCLFFBL0JqQyxFQStCMkM7RUFDdkMsVUFBSUksWUFBWTlCLDBCQUEwQjBCLFFBQTFCLENBQWhCO0VBQ0EsVUFBSSxDQUFDSSxTQUFMLEVBQWdCO0VBQ2Q7RUFDQSxZQUFNb0IsaUJBQWlCLFVBQXZCO0VBQ0FwQixvQkFBWUosU0FBU29CLE9BQVQsQ0FBaUJJLGNBQWpCLEVBQWlDLEtBQWpDLEVBQXdDQyxXQUF4QyxFQUFaO0VBQ0FuRCxrQ0FBMEIwQixRQUExQixJQUFzQ0ksU0FBdEM7RUFDRDtFQUNELGFBQU9BLFNBQVA7RUFDRCxLQXhDSDs7RUFBQSxlQStFU2EsZ0JBL0VULCtCQStFNEI7RUFDeEIsVUFBTTdILFFBQVEsS0FBS0MsU0FBbkI7RUFDQSxVQUFNeUcsYUFBYSxLQUFLYSxlQUF4QjtFQUNBeEMsV0FBSzJCLFVBQUwsRUFBaUJ6RCxPQUFqQixDQUF5QixVQUFDMkQsUUFBRCxFQUFjO0VBQ3JDLFlBQUl4SCxPQUFPcUQsY0FBUCxDQUFzQlUsSUFBdEIsQ0FBMkJuRCxLQUEzQixFQUFrQzRHLFFBQWxDLENBQUosRUFBaUQ7RUFDL0MsZ0JBQU0sSUFBSTNILEtBQUosaUNBQ3lCMkgsUUFEekIsaUNBQU47RUFHRDtFQUNELFlBQU0wQixnQkFBZ0I1QixXQUFXRSxRQUFYLEVBQXFCbEgsS0FBM0M7RUFDQSxZQUFJNEksa0JBQWtCekQsU0FBdEIsRUFBaUM7RUFDL0JRLDBCQUFnQnVCLFFBQWhCLElBQTRCMEIsYUFBNUI7RUFDRDtFQUNEdEksY0FBTXVJLHVCQUFOLENBQThCM0IsUUFBOUIsRUFBd0NGLFdBQVdFLFFBQVgsRUFBcUJMLFFBQTdEO0VBQ0QsT0FYRDtFQVlELEtBOUZIOztFQUFBLHlCQWdHRTFDLFNBaEdGLHdCQWdHYztFQUNWLDJCQUFNQSxTQUFOO0VBQ0FuQixlQUFTLElBQVQsRUFBZThGLElBQWYsR0FBc0IsRUFBdEI7RUFDQTlGLGVBQVMsSUFBVCxFQUFlK0YsV0FBZixHQUE2QixLQUE3QjtFQUNBL0YsZUFBUyxJQUFULEVBQWVtRSxvQkFBZixHQUFzQyxFQUF0QztFQUNBbkUsZUFBUyxJQUFULEVBQWVnRyxXQUFmLEdBQTZCLElBQTdCO0VBQ0FoRyxlQUFTLElBQVQsRUFBZWlHLE9BQWYsR0FBeUIsSUFBekI7RUFDQWpHLGVBQVMsSUFBVCxFQUFla0csV0FBZixHQUE2QixLQUE3QjtFQUNBLFdBQUtDLDBCQUFMO0VBQ0EsV0FBS0MscUJBQUw7RUFDRCxLQTFHSDs7RUFBQSx5QkE0R0VDLGlCQTVHRiw4QkE2R0k1QixZQTdHSixFQThHSUMsWUE5R0osRUErR0lDLFFBL0dKO0VBQUEsTUFnSEksRUFoSEo7O0VBQUEseUJBa0hFa0IsdUJBbEhGLG9DQWtIMEIzQixRQWxIMUIsRUFrSG9DTCxRQWxIcEMsRUFrSDhDO0VBQzFDLFVBQUksQ0FBQ25CLGdCQUFnQndCLFFBQWhCLENBQUwsRUFBZ0M7RUFDOUJ4Qix3QkFBZ0J3QixRQUFoQixJQUE0QixJQUE1QjtFQUNBeEcsMEJBQWUsSUFBZixFQUFxQndHLFFBQXJCLEVBQStCO0VBQzdCb0Msc0JBQVksSUFEaUI7RUFFN0I1Rix3QkFBYyxJQUZlO0VBRzdCekQsYUFINkIsb0JBR3ZCO0VBQ0osbUJBQU8sS0FBS3NKLFlBQUwsQ0FBa0JyQyxRQUFsQixDQUFQO0VBQ0QsV0FMNEI7O0VBTTdCaEgsZUFBSzJHLFdBQ0QsWUFBTSxFQURMLEdBRUQsVUFBU3RDLFFBQVQsRUFBbUI7RUFDakIsaUJBQUtpRixZQUFMLENBQWtCdEMsUUFBbEIsRUFBNEIzQyxRQUE1QjtFQUNEO0VBVndCLFNBQS9CO0VBWUQ7RUFDRixLQWxJSDs7RUFBQSx5QkFvSUVnRixZQXBJRix5QkFvSWVyQyxRQXBJZixFQW9JeUI7RUFDckIsYUFBT2xFLFNBQVMsSUFBVCxFQUFlOEYsSUFBZixDQUFvQjVCLFFBQXBCLENBQVA7RUFDRCxLQXRJSDs7RUFBQSx5QkF3SUVzQyxZQXhJRix5QkF3SWV0QyxRQXhJZixFQXdJeUIzQyxRQXhJekIsRUF3SW1DO0VBQy9CLFVBQUksS0FBS2tGLHFCQUFMLENBQTJCdkMsUUFBM0IsRUFBcUMzQyxRQUFyQyxDQUFKLEVBQW9EO0VBQ2xELFlBQUksS0FBS21GLG1CQUFMLENBQXlCeEMsUUFBekIsRUFBbUMzQyxRQUFuQyxDQUFKLEVBQWtEO0VBQ2hELGVBQUtvRixxQkFBTDtFQUNEO0VBQ0YsT0FKRCxNQUlPO0VBQ0w7RUFDQUMsZ0JBQVFDLEdBQVIsb0JBQTZCdEYsUUFBN0Isc0JBQXNEMkMsUUFBdEQsNEJBQ0ksS0FBS1UsV0FBTCxDQUFpQkMsZUFBakIsQ0FBaUNYLFFBQWpDLEVBQTJDaEIsSUFBM0MsQ0FBZ0QxRyxJQURwRDtFQUVEO0VBQ0YsS0FsSkg7O0VBQUEseUJBb0pFMkosMEJBcEpGLHlDQW9KK0I7RUFBQTs7RUFDM0J6SixhQUFPMkYsSUFBUCxDQUFZTSxlQUFaLEVBQTZCcEMsT0FBN0IsQ0FBcUMsVUFBQzJELFFBQUQsRUFBYztFQUNqRCxZQUFNbEgsUUFDSixPQUFPMkYsZ0JBQWdCdUIsUUFBaEIsQ0FBUCxLQUFxQyxVQUFyQyxHQUNJdkIsZ0JBQWdCdUIsUUFBaEIsRUFBMEJ6RCxJQUExQixDQUErQixNQUEvQixDQURKLEdBRUlrQyxnQkFBZ0J1QixRQUFoQixDQUhOO0VBSUEsZUFBS3NDLFlBQUwsQ0FBa0J0QyxRQUFsQixFQUE0QmxILEtBQTVCO0VBQ0QsT0FORDtFQU9ELEtBNUpIOztFQUFBLHlCQThKRW9KLHFCQTlKRixvQ0E4SjBCO0VBQUE7O0VBQ3RCMUosYUFBTzJGLElBQVAsQ0FBWUssZUFBWixFQUE2Qm5DLE9BQTdCLENBQXFDLFVBQUMyRCxRQUFELEVBQWM7RUFDakQsWUFBSXhILE9BQU9xRCxjQUFQLENBQXNCVSxJQUF0QixDQUEyQixNQUEzQixFQUFpQ3lELFFBQWpDLENBQUosRUFBZ0Q7RUFDOUNsRSxtQkFBUyxNQUFULEVBQWVtRSxvQkFBZixDQUFvQ0QsUUFBcEMsSUFBZ0QsT0FBS0EsUUFBTCxDQUFoRDtFQUNBLGlCQUFPLE9BQUtBLFFBQUwsQ0FBUDtFQUNEO0VBQ0YsT0FMRDtFQU1ELEtBcktIOztFQUFBLHlCQXVLRUssb0JBdktGLGlDQXVLdUJELFNBdkt2QixFQXVLa0N0SCxLQXZLbEMsRUF1S3lDO0VBQ3JDLFVBQUksQ0FBQ2dELFNBQVMsSUFBVCxFQUFlK0YsV0FBcEIsRUFBaUM7RUFDL0IsWUFBTTdCLFdBQVcsS0FBS1UsV0FBTCxDQUFpQlEsdUJBQWpCLENBQ2ZkLFNBRGUsQ0FBakI7RUFHQSxhQUFLSixRQUFMLElBQWlCLEtBQUs0QyxpQkFBTCxDQUF1QjVDLFFBQXZCLEVBQWlDbEgsS0FBakMsQ0FBakI7RUFDRDtFQUNGLEtBOUtIOztFQUFBLHlCQWdMRXlKLHFCQWhMRixrQ0FnTHdCdkMsUUFoTHhCLEVBZ0xrQ2xILEtBaExsQyxFQWdMeUM7RUFDckMsVUFBTStKLGVBQWUsS0FBS25DLFdBQUwsQ0FBaUJDLGVBQWpCLENBQWlDWCxRQUFqQyxFQUNsQmhCLElBREg7RUFFQSxVQUFJOEQsVUFBVSxLQUFkO0VBQ0EsVUFBSSxRQUFPaEssS0FBUCx5Q0FBT0EsS0FBUCxPQUFpQixRQUFyQixFQUErQjtFQUM3QmdLLGtCQUFVaEssaUJBQWlCK0osWUFBM0I7RUFDRCxPQUZELE1BRU87RUFDTEMsa0JBQVUsYUFBVWhLLEtBQVYseUNBQVVBLEtBQVYsT0FBc0IrSixhQUFhdkssSUFBYixDQUFrQm1KLFdBQWxCLEVBQWhDO0VBQ0Q7RUFDRCxhQUFPcUIsT0FBUDtFQUNELEtBMUxIOztFQUFBLHlCQTRMRWxDLG9CQTVMRixpQ0E0THVCWixRQTVMdkIsRUE0TGlDbEgsS0E1TGpDLEVBNEx3QztFQUNwQ2dELGVBQVMsSUFBVCxFQUFlK0YsV0FBZixHQUE2QixJQUE3QjtFQUNBLFVBQU16QixZQUFZLEtBQUtNLFdBQUwsQ0FBaUJhLHVCQUFqQixDQUF5Q3ZCLFFBQXpDLENBQWxCO0VBQ0FsSCxjQUFRLEtBQUtpSyxlQUFMLENBQXFCL0MsUUFBckIsRUFBK0JsSCxLQUEvQixDQUFSO0VBQ0EsVUFBSUEsVUFBVW1GLFNBQWQsRUFBeUI7RUFDdkIsYUFBSytFLGVBQUwsQ0FBcUI1QyxTQUFyQjtFQUNELE9BRkQsTUFFTyxJQUFJLEtBQUs2QyxZQUFMLENBQWtCN0MsU0FBbEIsTUFBaUN0SCxLQUFyQyxFQUE0QztFQUNqRCxhQUFLb0ssWUFBTCxDQUFrQjlDLFNBQWxCLEVBQTZCdEgsS0FBN0I7RUFDRDtFQUNEZ0QsZUFBUyxJQUFULEVBQWUrRixXQUFmLEdBQTZCLEtBQTdCO0VBQ0QsS0F0TUg7O0VBQUEseUJBd01FZSxpQkF4TUYsOEJBd01vQjVDLFFBeE1wQixFQXdNOEJsSCxLQXhNOUIsRUF3TXFDO0VBQUEsa0NBUTdCLEtBQUs0SCxXQUFMLENBQWlCQyxlQUFqQixDQUFpQ1gsUUFBakMsQ0FSNkI7RUFBQSxVQUUvQmYsUUFGK0IseUJBRS9CQSxRQUYrQjtFQUFBLFVBRy9CSyxPQUgrQix5QkFHL0JBLE9BSCtCO0VBQUEsVUFJL0JILFNBSitCLHlCQUkvQkEsU0FKK0I7RUFBQSxVQUsvQkssTUFMK0IseUJBSy9CQSxNQUwrQjtFQUFBLFVBTS9CVCxRQU4rQix5QkFNL0JBLFFBTitCO0VBQUEsVUFPL0JNLFFBUCtCLHlCQU8vQkEsUUFQK0I7O0VBU2pDLFVBQUlGLFNBQUosRUFBZTtFQUNickcsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVW1GLFNBQXBDO0VBQ0QsT0FGRCxNQUVPLElBQUlnQixRQUFKLEVBQWM7RUFDbkJuRyxnQkFBUUEsVUFBVSxJQUFWLElBQWtCQSxVQUFVbUYsU0FBNUIsR0FBd0MsQ0FBeEMsR0FBNENpQixPQUFPcEcsS0FBUCxDQUFwRDtFQUNELE9BRk0sTUFFQSxJQUFJaUcsUUFBSixFQUFjO0VBQ25CakcsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVW1GLFNBQTVCLEdBQXdDLEVBQXhDLEdBQTZDbkQsT0FBT2hDLEtBQVAsQ0FBckQ7RUFDRCxPQUZNLE1BRUEsSUFBSXVHLFlBQVlDLE9BQWhCLEVBQXlCO0VBQzlCeEcsZ0JBQ0VBLFVBQVUsSUFBVixJQUFrQkEsVUFBVW1GLFNBQTVCLEdBQ0lxQixVQUNFLElBREYsR0FFRSxFQUhOLEdBSUk2RCxLQUFLQyxLQUFMLENBQVd0SyxLQUFYLENBTE47RUFNRCxPQVBNLE1BT0EsSUFBSTBHLE1BQUosRUFBWTtFQUNqQjFHLGdCQUFRQSxVQUFVLElBQVYsSUFBa0JBLFVBQVVtRixTQUE1QixHQUF3QyxFQUF4QyxHQUE2QyxJQUFJd0IsSUFBSixDQUFTM0csS0FBVCxDQUFyRDtFQUNEO0VBQ0QsYUFBT0EsS0FBUDtFQUNELEtBbE9IOztFQUFBLHlCQW9PRWlLLGVBcE9GLDRCQW9Pa0IvQyxRQXBPbEIsRUFvTzRCbEgsS0FwTzVCLEVBb09tQztFQUMvQixVQUFNdUssaUJBQWlCLEtBQUszQyxXQUFMLENBQWlCQyxlQUFqQixDQUNyQlgsUUFEcUIsQ0FBdkI7RUFEK0IsVUFJdkJiLFNBSnVCLEdBSVVrRSxjQUpWLENBSXZCbEUsU0FKdUI7RUFBQSxVQUlaRSxRQUpZLEdBSVVnRSxjQUpWLENBSVpoRSxRQUpZO0VBQUEsVUFJRkMsT0FKRSxHQUlVK0QsY0FKVixDQUlGL0QsT0FKRTs7O0VBTS9CLFVBQUlILFNBQUosRUFBZTtFQUNiLGVBQU9yRyxRQUFRLEVBQVIsR0FBYW1GLFNBQXBCO0VBQ0Q7RUFDRCxVQUFJb0IsWUFBWUMsT0FBaEIsRUFBeUI7RUFDdkIsZUFBTzZELEtBQUtHLFNBQUwsQ0FBZXhLLEtBQWYsQ0FBUDtFQUNEOztFQUVEQSxjQUFRQSxRQUFRQSxNQUFNeUssUUFBTixFQUFSLEdBQTJCdEYsU0FBbkM7RUFDQSxhQUFPbkYsS0FBUDtFQUNELEtBblBIOztFQUFBLHlCQXFQRTBKLG1CQXJQRixnQ0FxUHNCeEMsUUFyUHRCLEVBcVBnQ2xILEtBclBoQyxFQXFQdUM7RUFDbkMsVUFBSTBLLE1BQU0xSCxTQUFTLElBQVQsRUFBZThGLElBQWYsQ0FBb0I1QixRQUFwQixDQUFWO0VBQ0EsVUFBSXlELFVBQVUsS0FBS0MscUJBQUwsQ0FBMkIxRCxRQUEzQixFQUFxQ2xILEtBQXJDLEVBQTRDMEssR0FBNUMsQ0FBZDtFQUNBLFVBQUlDLE9BQUosRUFBYTtFQUNYLFlBQUksQ0FBQzNILFNBQVMsSUFBVCxFQUFlZ0csV0FBcEIsRUFBaUM7RUFDL0JoRyxtQkFBUyxJQUFULEVBQWVnRyxXQUFmLEdBQTZCLEVBQTdCO0VBQ0FoRyxtQkFBUyxJQUFULEVBQWVpRyxPQUFmLEdBQXlCLEVBQXpCO0VBQ0Q7RUFDRDtFQUNBLFlBQUlqRyxTQUFTLElBQVQsRUFBZWlHLE9BQWYsSUFBMEIsRUFBRS9CLFlBQVlsRSxTQUFTLElBQVQsRUFBZWlHLE9BQTdCLENBQTlCLEVBQXFFO0VBQ25FakcsbUJBQVMsSUFBVCxFQUFlaUcsT0FBZixDQUF1Qi9CLFFBQXZCLElBQW1Dd0QsR0FBbkM7RUFDRDtFQUNEMUgsaUJBQVMsSUFBVCxFQUFlOEYsSUFBZixDQUFvQjVCLFFBQXBCLElBQWdDbEgsS0FBaEM7RUFDQWdELGlCQUFTLElBQVQsRUFBZWdHLFdBQWYsQ0FBMkI5QixRQUEzQixJQUF1Q2xILEtBQXZDO0VBQ0Q7RUFDRCxhQUFPMkssT0FBUDtFQUNELEtBclFIOztFQUFBLHlCQXVRRWhCLHFCQXZRRixvQ0F1UTBCO0VBQUE7O0VBQ3RCLFVBQUksQ0FBQzNHLFNBQVMsSUFBVCxFQUFla0csV0FBcEIsRUFBaUM7RUFDL0JsRyxpQkFBUyxJQUFULEVBQWVrRyxXQUFmLEdBQTZCLElBQTdCO0VBQ0F0SCxrQkFBVUMsR0FBVixDQUFjLFlBQU07RUFDbEIsY0FBSW1CLFNBQVMsTUFBVCxFQUFla0csV0FBbkIsRUFBZ0M7RUFDOUJsRyxxQkFBUyxNQUFULEVBQWVrRyxXQUFmLEdBQTZCLEtBQTdCO0VBQ0EsbUJBQUs5QixnQkFBTDtFQUNEO0VBQ0YsU0FMRDtFQU1EO0VBQ0YsS0FqUkg7O0VBQUEseUJBbVJFQSxnQkFuUkYsK0JBbVJxQjtFQUNqQixVQUFNeUQsUUFBUTdILFNBQVMsSUFBVCxFQUFlOEYsSUFBN0I7RUFDQSxVQUFNcEIsZUFBZTFFLFNBQVMsSUFBVCxFQUFlZ0csV0FBcEM7RUFDQSxVQUFNMEIsTUFBTTFILFNBQVMsSUFBVCxFQUFlaUcsT0FBM0I7O0VBRUEsVUFBSSxLQUFLNkIsdUJBQUwsQ0FBNkJELEtBQTdCLEVBQW9DbkQsWUFBcEMsRUFBa0RnRCxHQUFsRCxDQUFKLEVBQTREO0VBQzFEMUgsaUJBQVMsSUFBVCxFQUFlZ0csV0FBZixHQUE2QixJQUE3QjtFQUNBaEcsaUJBQVMsSUFBVCxFQUFlaUcsT0FBZixHQUF5QixJQUF6QjtFQUNBLGFBQUtJLGlCQUFMLENBQXVCd0IsS0FBdkIsRUFBOEJuRCxZQUE5QixFQUE0Q2dELEdBQTVDO0VBQ0Q7RUFDRixLQTdSSDs7RUFBQSx5QkErUkVJLHVCQS9SRixvQ0FnU0lyRCxZQWhTSixFQWlTSUMsWUFqU0osRUFrU0lDLFFBbFNKO0VBQUEsTUFtU0k7RUFDQSxhQUFPckIsUUFBUW9CLFlBQVIsQ0FBUDtFQUNELEtBclNIOztFQUFBLHlCQXVTRWtELHFCQXZTRixrQ0F1U3dCMUQsUUF2U3hCLEVBdVNrQ2xILEtBdlNsQyxFQXVTeUMwSyxHQXZTekMsRUF1UzhDO0VBQzFDO0VBQ0U7RUFDQUEsZ0JBQVExSyxLQUFSO0VBQ0E7RUFDQzBLLGdCQUFRQSxHQUFSLElBQWUxSyxVQUFVQSxLQUYxQixDQUZGOztFQUFBO0VBTUQsS0E5U0g7O0VBQUE7RUFBQTtFQUFBLDZCQUVrQztFQUFBOztFQUM5QixlQUNFTixPQUFPMkYsSUFBUCxDQUFZLEtBQUt3QyxlQUFqQixFQUFrQ2tELEdBQWxDLENBQXNDLFVBQUM3RCxRQUFEO0VBQUEsaUJBQ3BDLE9BQUt1Qix1QkFBTCxDQUE2QnZCLFFBQTdCLENBRG9DO0VBQUEsU0FBdEMsS0FFSyxFQUhQO0VBS0Q7RUFSSDtFQUFBO0VBQUEsNkJBMEMrQjtFQUMzQixZQUFJLENBQUN6QixnQkFBTCxFQUF1QjtFQUNyQixjQUFNdUYsc0JBQXNCLFNBQXRCQSxtQkFBc0I7RUFBQSxtQkFBTXZGLG9CQUFvQixFQUExQjtFQUFBLFdBQTVCO0VBQ0EsY0FBSXdGLFdBQVcsSUFBZjtFQUNBLGNBQUlDLE9BQU8sSUFBWDs7RUFFQSxpQkFBT0EsSUFBUCxFQUFhO0VBQ1hELHVCQUFXdkwsT0FBT3lMLGNBQVAsQ0FBc0JGLGFBQWEsSUFBYixHQUFvQixJQUFwQixHQUEyQkEsUUFBakQsQ0FBWDtFQUNBLGdCQUNFLENBQUNBLFFBQUQsSUFDQSxDQUFDQSxTQUFTckQsV0FEVixJQUVBcUQsU0FBU3JELFdBQVQsS0FBeUJqRixXQUZ6QixJQUdBc0ksU0FBU3JELFdBQVQsS0FBeUJ3RCxRQUh6QixJQUlBSCxTQUFTckQsV0FBVCxLQUF5QmxJLE1BSnpCLElBS0F1TCxTQUFTckQsV0FBVCxLQUF5QnFELFNBQVNyRCxXQUFULENBQXFCQSxXQU5oRCxFQU9FO0VBQ0FzRCxxQkFBTyxLQUFQO0VBQ0Q7RUFDRCxnQkFBSXhMLE9BQU9xRCxjQUFQLENBQXNCVSxJQUF0QixDQUEyQndILFFBQTNCLEVBQXFDLFlBQXJDLENBQUosRUFBd0Q7RUFDdEQ7RUFDQXhGLGlDQUFtQkgsT0FDakIwRixxQkFEaUI7RUFFakJqRSxrQ0FBb0JrRSxTQUFTakUsVUFBN0IsQ0FGaUIsQ0FBbkI7RUFJRDtFQUNGO0VBQ0QsY0FBSSxLQUFLQSxVQUFULEVBQXFCO0VBQ25CO0VBQ0F2QiwrQkFBbUJILE9BQ2pCMEYscUJBRGlCO0VBRWpCakUsZ0NBQW9CLEtBQUtDLFVBQXpCLENBRmlCLENBQW5CO0VBSUQ7RUFDRjtFQUNELGVBQU92QixnQkFBUDtFQUNEO0VBN0VIO0VBQUE7RUFBQSxJQUFnQzVDLFNBQWhDO0VBZ1RELENBblpjLENBQWY7O0VDVkE7QUFDQTtBQUdBLG9CQUFlekQsUUFDYixVQUNFaU0sTUFERixFQUVFbkYsSUFGRixFQUdFb0YsUUFIRixFQUtLO0VBQUEsTUFESEMsT0FDRyx1RUFETyxLQUNQOztFQUNILFNBQU9qQixNQUFNZSxNQUFOLEVBQWNuRixJQUFkLEVBQW9Cb0YsUUFBcEIsRUFBOEJDLE9BQTlCLENBQVA7RUFDRCxDQVJZLENBQWY7O0VBV0EsU0FBU0MsV0FBVCxDQUNFSCxNQURGLEVBRUVuRixJQUZGLEVBR0VvRixRQUhGLEVBSUVDLE9BSkYsRUFLRTtFQUNBLE1BQUlGLE9BQU9JLGdCQUFYLEVBQTZCO0VBQzNCSixXQUFPSSxnQkFBUCxDQUF3QnZGLElBQXhCLEVBQThCb0YsUUFBOUIsRUFBd0NDLE9BQXhDO0VBQ0EsV0FBTztFQUNMRyxjQUFRLGtCQUFXO0VBQ2pCLGFBQUtBLE1BQUwsR0FBYyxZQUFNLEVBQXBCO0VBQ0FMLGVBQU9NLG1CQUFQLENBQTJCekYsSUFBM0IsRUFBaUNvRixRQUFqQyxFQUEyQ0MsT0FBM0M7RUFDRDtFQUpJLEtBQVA7RUFNRDtFQUNELFFBQU0sSUFBSWhNLEtBQUosQ0FBVSxpQ0FBVixDQUFOO0VBQ0Q7O0VBRUQsU0FBUytLLEtBQVQsQ0FDRWUsTUFERixFQUVFbkYsSUFGRixFQUdFb0YsUUFIRixFQUlFQyxPQUpGLEVBS0U7RUFDQSxNQUFJckYsS0FBSzBGLE9BQUwsQ0FBYSxHQUFiLElBQW9CLENBQUMsQ0FBekIsRUFBNEI7RUFDMUIsUUFBSUMsU0FBUzNGLEtBQUs0RixLQUFMLENBQVcsU0FBWCxDQUFiO0VBQ0EsUUFBSUMsVUFBVUYsT0FBT2QsR0FBUCxDQUFXLFVBQVM3RSxJQUFULEVBQWU7RUFDdEMsYUFBT3NGLFlBQVlILE1BQVosRUFBb0JuRixJQUFwQixFQUEwQm9GLFFBQTFCLEVBQW9DQyxPQUFwQyxDQUFQO0VBQ0QsS0FGYSxDQUFkO0VBR0EsV0FBTztFQUNMRyxZQURLLG9CQUNJO0VBQ1AsYUFBS0EsTUFBTCxHQUFjLFlBQU0sRUFBcEI7RUFDQSxZQUFJdkosZUFBSjtFQUNBLGVBQVFBLFNBQVM0SixRQUFRQyxHQUFSLEVBQWpCLEVBQWlDO0VBQy9CN0osaUJBQU91SixNQUFQO0VBQ0Q7RUFDRjtFQVBJLEtBQVA7RUFTRDtFQUNELFNBQU9GLFlBQVlILE1BQVosRUFBb0JuRixJQUFwQixFQUEwQm9GLFFBQTFCLEVBQW9DQyxPQUFwQyxDQUFQO0VBQ0Q7O01DbkRLVTs7Ozs7Ozs7Ozs2QkFDb0I7RUFDdEIsYUFBTztFQUNMQyxjQUFNO0VBQ0poRyxnQkFBTWxFLE1BREY7RUFFSmhDLGlCQUFPLE1BRkg7RUFHSjhHLDhCQUFvQixJQUhoQjtFQUlKcUYsZ0NBQXNCLElBSmxCO0VBS0puRyxvQkFBVSxvQkFBTSxFQUxaO0VBTUpZLGtCQUFRO0VBTkosU0FERDtFQVNMd0YscUJBQWE7RUFDWGxHLGdCQUFNTyxLQURLO0VBRVh6RyxpQkFBTyxpQkFBVztFQUNoQixtQkFBTyxFQUFQO0VBQ0Q7RUFKVTtFQVRSLE9BQVA7RUFnQkQ7OztJQWxCK0JnSCxXQUFXcUYsZUFBWDs7RUFxQmxDSixvQkFBb0I5SSxNQUFwQixDQUEyQix1QkFBM0I7O0VBRUFtSixTQUFTLGtCQUFULEVBQTZCLFlBQU07RUFDakMsTUFBSUMsa0JBQUo7RUFDQSxNQUFNQyxzQkFBc0J0TixTQUFTdU4sYUFBVCxDQUF1Qix1QkFBdkIsQ0FBNUI7O0VBRUF2RSxTQUFPLFlBQU07RUFDWnFFLGdCQUFZck4sU0FBU3dOLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBWjtFQUNHSCxjQUFVSSxNQUFWLENBQWlCSCxtQkFBakI7RUFDSCxHQUhEOztFQUtBSSxRQUFNLFlBQU07RUFDUkwsY0FBVU0sU0FBVixHQUFzQixFQUF0QjtFQUNILEdBRkQ7O0VBSUFDLEtBQUcsWUFBSCxFQUFpQixZQUFNO0VBQ3JCQyxXQUFPQyxLQUFQLENBQWFSLG9CQUFvQk4sSUFBakMsRUFBdUMsTUFBdkM7RUFDRCxHQUZEOztFQUlBWSxLQUFHLHVCQUFILEVBQTRCLFlBQU07RUFDaENOLHdCQUFvQk4sSUFBcEIsR0FBMkIsV0FBM0I7RUFDQU0sd0JBQW9CcEYsZ0JBQXBCO0VBQ0EyRixXQUFPQyxLQUFQLENBQWFSLG9CQUFvQnJDLFlBQXBCLENBQWlDLE1BQWpDLENBQWIsRUFBdUQsV0FBdkQ7RUFDRCxHQUpEOztFQU1BMkMsS0FBRyx3QkFBSCxFQUE2QixZQUFNO0VBQ2pDRyxnQkFBWVQsbUJBQVosRUFBaUMsY0FBakMsRUFBaUQsZUFBTztFQUN0RE8sYUFBT0csSUFBUCxDQUFZQyxJQUFJakgsSUFBSixLQUFhLGNBQXpCLEVBQXlDLGtCQUF6QztFQUNELEtBRkQ7O0VBSUFzRyx3QkFBb0JOLElBQXBCLEdBQTJCLFdBQTNCO0VBQ0QsR0FORDs7RUFRQVksS0FBRyxxQkFBSCxFQUEwQixZQUFNO0VBQzlCQyxXQUFPRyxJQUFQLENBQ0V6RyxNQUFNRCxPQUFOLENBQWNnRyxvQkFBb0JKLFdBQWxDLENBREYsRUFFRSxtQkFGRjtFQUlELEdBTEQ7RUFNRCxDQXJDRDs7RUMzQkE7QUFDQSxpQkFBZSxVQUFDak0sU0FBRCxFQUErQjtFQUFBLG9DQUFoQkMsV0FBZ0I7RUFBaEJBLGVBQWdCO0VBQUE7O0VBQzVDLFNBQU8sVUFBU0MsS0FBVCxFQUFnQjtFQUNyQixRQUFNQyxRQUFRRCxNQUFNRSxTQUFwQjtFQUNBLFFBQU1DLE1BQU1KLFlBQVlLLE1BQXhCO0VBRnFCLFFBR2JDLGNBSGEsR0FHTWhCLE1BSE4sQ0FHYmdCLGNBSGE7O0VBQUEsK0JBSVpDLENBSlk7RUFLbkIsVUFBTUMsYUFBYVIsWUFBWU8sQ0FBWixDQUFuQjtFQUNBLFVBQU1FLFNBQVNQLE1BQU1NLFVBQU4sQ0FBZjtFQUNBRixxQkFBZUosS0FBZixFQUFzQk0sVUFBdEIsRUFBa0M7RUFDaENaLGVBQU8saUJBQWtCO0VBQUEsNkNBQU5jLElBQU07RUFBTkEsZ0JBQU07RUFBQTs7RUFDdkIsY0FBTXNNLGNBQWN2TSxPQUFPRyxLQUFQLENBQWEsSUFBYixFQUFtQkYsSUFBbkIsQ0FBcEI7RUFDQVgsb0JBQVVhLEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCO0VBQ0EsaUJBQU9zTSxXQUFQO0VBQ0QsU0FMK0I7RUFNaENuTSxrQkFBVTtFQU5zQixPQUFsQztFQVBtQjs7RUFJckIsU0FBSyxJQUFJTixJQUFJLENBQWIsRUFBZ0JBLElBQUlILEdBQXBCLEVBQXlCRyxHQUF6QixFQUE4QjtFQUFBLFlBQXJCQSxDQUFxQjtFQVc3QjtFQUNELFdBQU9OLEtBQVA7RUFDRCxHQWpCRDtFQWtCRCxDQW5CRDs7RUNEQTtBQUNBO0VBT0E7OztBQUdBLGVBQWVqQixRQUFRLFVBQUN5RCxTQUFELEVBQWU7RUFBQSxNQUM1QnlDLE1BRDRCLEdBQ2pCNUYsTUFEaUIsQ0FDNUI0RixNQUQ0Qjs7RUFFcEMsTUFBTXRDLFdBQVdDLGNBQWMsWUFBVztFQUN4QyxXQUFPO0VBQ0xvSyxnQkFBVTtFQURMLEtBQVA7RUFHRCxHQUpnQixDQUFqQjtFQUtBLE1BQU1DLHFCQUFxQjtFQUN6QkMsYUFBUyxLQURnQjtFQUV6QkMsZ0JBQVk7RUFGYSxHQUEzQjs7RUFLQTtFQUFBOztFQUFBO0VBQUE7RUFBQTtFQUFBOztFQUFBLFdBRVN0SyxhQUZULDRCQUV5QjtFQUNyQixpQkFBTUEsYUFBTjtFQUNBMEosY0FBTTVJLDBCQUFOLEVBQWtDLGNBQWxDLEVBQWtELElBQWxEO0VBQ0QsS0FMSDs7RUFBQSxxQkFPRXlKLFdBUEYsd0JBT2NDLEtBUGQsRUFPcUI7RUFDakIsVUFBTXZMLGdCQUFjdUwsTUFBTXhILElBQTFCO0VBQ0EsVUFBSSxPQUFPLEtBQUsvRCxNQUFMLENBQVAsS0FBd0IsVUFBNUIsRUFBd0M7RUFDdEM7RUFDQSxhQUFLQSxNQUFMLEVBQWF1TCxLQUFiO0VBQ0Q7RUFDRixLQWJIOztFQUFBLHFCQWVFQyxFQWZGLGVBZUt6SCxJQWZMLEVBZVdvRixRQWZYLEVBZXFCQyxPQWZyQixFQWU4QjtFQUMxQixXQUFLcUMsR0FBTCxDQUFTWCxZQUFZLElBQVosRUFBa0IvRyxJQUFsQixFQUF3Qm9GLFFBQXhCLEVBQWtDQyxPQUFsQyxDQUFUO0VBQ0QsS0FqQkg7O0VBQUEscUJBbUJFc0MsUUFuQkYscUJBbUJXM0gsSUFuQlgsRUFtQjRCO0VBQUEsVUFBWDRDLElBQVcsdUVBQUosRUFBSTs7RUFDeEIsV0FBS2YsYUFBTCxDQUNFLElBQUlDLFdBQUosQ0FBZ0I5QixJQUFoQixFQUFzQlosT0FBT2dJLGtCQUFQLEVBQTJCLEVBQUVyRixRQUFRYSxJQUFWLEVBQTNCLENBQXRCLENBREY7RUFHRCxLQXZCSDs7RUFBQSxxQkF5QkVnRixHQXpCRixrQkF5QlE7RUFDSjlLLGVBQVMsSUFBVCxFQUFlcUssUUFBZixDQUF3QjlKLE9BQXhCLENBQWdDLFVBQUN3SyxPQUFELEVBQWE7RUFDM0NBLGdCQUFRckMsTUFBUjtFQUNELE9BRkQ7RUFHRCxLQTdCSDs7RUFBQSxxQkErQkVrQyxHQS9CRixrQkErQm1CO0VBQUE7O0VBQUEsd0NBQVZQLFFBQVU7RUFBVkEsZ0JBQVU7RUFBQTs7RUFDZkEsZUFBUzlKLE9BQVQsQ0FBaUIsVUFBQ3dLLE9BQUQsRUFBYTtFQUM1Qi9LLGlCQUFTLE1BQVQsRUFBZXFLLFFBQWYsQ0FBd0JwTCxJQUF4QixDQUE2QjhMLE9BQTdCO0VBQ0QsT0FGRDtFQUdELEtBbkNIOztFQUFBO0VBQUEsSUFBNEJsTCxTQUE1Qjs7RUFzQ0EsV0FBU21CLHdCQUFULEdBQW9DO0VBQ2xDLFdBQU8sWUFBVztFQUNoQixVQUFNZSxVQUFVLElBQWhCO0VBQ0FBLGNBQVErSSxHQUFSO0VBQ0QsS0FIRDtFQUlEO0VBQ0YsQ0F4RGMsQ0FBZjs7RUNYQTtBQUNBO0FBRUEsa0JBQWUxTyxRQUFRLFVBQUMrTixHQUFELEVBQVM7RUFDOUIsTUFBSUEsSUFBSWEsZUFBUixFQUF5QjtFQUN2QmIsUUFBSWEsZUFBSjtFQUNEO0VBQ0RiLE1BQUljLGNBQUo7RUFDRCxDQUxjLENBQWY7O0VDSEE7O01DS01DOzs7Ozs7Ozs0QkFDSjFKLGlDQUFZOzs0QkFFWkMsdUNBQWU7OztJQUhXb0gsT0FBT1EsZUFBUDs7TUFNdEI4Qjs7Ozs7Ozs7NkJBQ0ozSixpQ0FBWTs7NkJBRVpDLHVDQUFlOzs7SUFIWW9ILE9BQU9RLGVBQVA7O0VBTTdCNkIsY0FBYy9LLE1BQWQsQ0FBcUIsZ0JBQXJCO0VBQ0FnTCxlQUFlaEwsTUFBZixDQUFzQixpQkFBdEI7O0VBRUFtSixTQUFTLGNBQVQsRUFBeUIsWUFBTTtFQUM3QixNQUFJQyxrQkFBSjtFQUNBLE1BQU02QixVQUFVbFAsU0FBU3VOLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQWhCO0VBQ0EsTUFBTW5CLFdBQVdwTSxTQUFTdU4sYUFBVCxDQUF1QixpQkFBdkIsQ0FBakI7O0VBRUF2RSxTQUFPLFlBQU07RUFDWHFFLGdCQUFZck4sU0FBU3dOLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBWjtFQUNBcEIsYUFBU3FCLE1BQVQsQ0FBZ0J5QixPQUFoQjtFQUNBN0IsY0FBVUksTUFBVixDQUFpQnJCLFFBQWpCO0VBQ0QsR0FKRDs7RUFNQXNCLFFBQU0sWUFBTTtFQUNWTCxjQUFVTSxTQUFWLEdBQXNCLEVBQXRCO0VBQ0QsR0FGRDs7RUFJQUMsS0FBRyw2REFBSCxFQUFrRSxZQUFNO0VBQ3RFeEIsYUFBU3FDLEVBQVQsQ0FBWSxJQUFaLEVBQWtCLGVBQU87RUFDdkJVLGdCQUFVbEIsR0FBVjtFQUNBbUIsV0FBS0MsTUFBTCxDQUFZcEIsSUFBSTlCLE1BQWhCLEVBQXdCbUQsRUFBeEIsQ0FBMkJ4QixLQUEzQixDQUFpQ29CLE9BQWpDO0VBQ0FFLFdBQUtDLE1BQUwsQ0FBWXBCLElBQUlsRixNQUFoQixFQUF3QndHLENBQXhCLENBQTBCLFFBQTFCO0VBQ0FILFdBQUtDLE1BQUwsQ0FBWXBCLElBQUlsRixNQUFoQixFQUF3QnVHLEVBQXhCLENBQTJCRSxJQUEzQixDQUFnQzFCLEtBQWhDLENBQXNDLEVBQUUyQixNQUFNLFVBQVIsRUFBdEM7RUFDRCxLQUxEO0VBTUFQLFlBQVFQLFFBQVIsQ0FBaUIsSUFBakIsRUFBdUIsRUFBRWMsTUFBTSxVQUFSLEVBQXZCO0VBQ0QsR0FSRDtFQVNELENBeEJEOztFQ3BCQTtBQUNBO0FBRUEsd0JBQWV2UCxRQUFRLFVBQUN3UCxRQUFELEVBQWM7RUFDbkMsTUFBSSxhQUFhMVAsU0FBU3VOLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBakIsRUFBcUQ7RUFDbkQsV0FBT3ZOLFNBQVMyUCxVQUFULENBQW9CRCxTQUFTRSxPQUE3QixFQUFzQyxJQUF0QyxDQUFQO0VBQ0Q7O0VBRUQsTUFBSUMsV0FBVzdQLFNBQVM4UCxzQkFBVCxFQUFmO0VBQ0EsTUFBSUMsV0FBV0wsU0FBU00sVUFBeEI7RUFDQSxPQUFLLElBQUl2TyxJQUFJLENBQWIsRUFBZ0JBLElBQUlzTyxTQUFTeE8sTUFBN0IsRUFBcUNFLEdBQXJDLEVBQTBDO0VBQ3hDb08sYUFBU0ksV0FBVCxDQUFxQkYsU0FBU3RPLENBQVQsRUFBWXlPLFNBQVosQ0FBc0IsSUFBdEIsQ0FBckI7RUFDRDtFQUNELFNBQU9MLFFBQVA7RUFDRCxDQVhjLENBQWY7O0VDSEE7QUFDQTtBQUdBLHNCQUFlM1AsUUFBUSxVQUFDaVEsSUFBRCxFQUFVO0VBQy9CLE1BQU1ULFdBQVcxUCxTQUFTdU4sYUFBVCxDQUF1QixVQUF2QixDQUFqQjtFQUNBbUMsV0FBUy9CLFNBQVQsR0FBcUJ3QyxLQUFLQyxJQUFMLEVBQXJCO0VBQ0EsTUFBTUMsT0FBT0MsZ0JBQWdCWixRQUFoQixDQUFiO0VBQ0EsTUFBSVcsUUFBUUEsS0FBS0UsVUFBakIsRUFBNkI7RUFDM0IsV0FBT0YsS0FBS0UsVUFBWjtFQUNEO0VBQ0QsUUFBTSxJQUFJbFEsS0FBSixrQ0FBeUM4UCxJQUF6QyxDQUFOO0VBQ0QsQ0FSYyxDQUFmOztFQ0ZBL0MsU0FBUyxnQkFBVCxFQUEyQixZQUFNO0VBQy9CUSxLQUFHLGdCQUFILEVBQXFCLFlBQU07RUFDekIsUUFBTTRDLEtBQUtqRCxzRUFBWDtFQUdBOEIsV0FBT21CLEdBQUdDLFNBQUgsQ0FBYUMsUUFBYixDQUFzQixVQUF0QixDQUFQLEVBQTBDcEIsRUFBMUMsQ0FBNkN4QixLQUE3QyxDQUFtRCxJQUFuRDtFQUNBRCxXQUFPOEMsVUFBUCxDQUFrQkgsRUFBbEIsRUFBc0JJLElBQXRCLEVBQTRCLDZCQUE1QjtFQUNELEdBTkQ7RUFPRCxDQVJEOztFQ0ZBO0FBQ0EsYUFBZSxVQUFDQyxHQUFEO0VBQUEsTUFBTTFRLEVBQU4sdUVBQVdpSCxPQUFYO0VBQUEsU0FBdUJ5SixJQUFJQyxJQUFKLENBQVMzUSxFQUFULENBQXZCO0VBQUEsQ0FBZjs7RUNEQTtBQUNBLGFBQWUsVUFBQzBRLEdBQUQ7RUFBQSxNQUFNMVEsRUFBTix1RUFBV2lILE9BQVg7RUFBQSxTQUF1QnlKLElBQUlFLEtBQUosQ0FBVTVRLEVBQVYsQ0FBdkI7RUFBQSxDQUFmOztFQ0RBOztFQ0FBO0FBQ0E7RUFJQSxJQUFNNlEsV0FBVyxTQUFYQSxRQUFXLENBQUM3USxFQUFEO0VBQUEsU0FBUTtFQUFBLHNDQUNwQjhRLE1BRG9CO0VBQ3BCQSxZQURvQjtFQUFBOztFQUFBLFdBRXBCQyxJQUFJRCxNQUFKLEVBQVk5USxFQUFaLENBRm9CO0VBQUEsR0FBUjtFQUFBLENBQWpCO0VBR0EsSUFBTWdSLFdBQVcsU0FBWEEsUUFBVyxDQUFDaFIsRUFBRDtFQUFBLFNBQVE7RUFBQSx1Q0FDcEI4USxNQURvQjtFQUNwQkEsWUFEb0I7RUFBQTs7RUFBQSxXQUVwQkcsSUFBSUgsTUFBSixFQUFZOVEsRUFBWixDQUZvQjtFQUFBLEdBQVI7RUFBQSxDQUFqQjtFQUdBLElBQU1vTCxXQUFXL0ssT0FBT2EsU0FBUCxDQUFpQmtLLFFBQWxDO0VBQ0EsSUFBTThGLFFBQVEsd0dBQXdHekUsS0FBeEcsQ0FDWixHQURZLENBQWQ7RUFHQSxJQUFNdEwsTUFBTStQLE1BQU05UCxNQUFsQjtFQUNBLElBQU0rUCxZQUFZLEVBQWxCO0VBQ0EsSUFBTUMsYUFBYSxlQUFuQjtFQUNBLElBQU1DLEtBQUtDLE9BQVg7O0VBSUEsU0FBU0EsS0FBVCxHQUFpQjtFQUNmLE1BQUlDLFNBQVMsRUFBYjs7RUFEZSw2QkFFTmpRLENBRk07RUFHYixRQUFNdUYsT0FBT3FLLE1BQU01UCxDQUFOLEVBQVNnSSxXQUFULEVBQWI7RUFDQWlJLFdBQU8xSyxJQUFQLElBQWU7RUFBQSxhQUFPMkssUUFBUTlRLEdBQVIsTUFBaUJtRyxJQUF4QjtFQUFBLEtBQWY7RUFDQTBLLFdBQU8xSyxJQUFQLEVBQWFrSyxHQUFiLEdBQW1CRixTQUFTVSxPQUFPMUssSUFBUCxDQUFULENBQW5CO0VBQ0EwSyxXQUFPMUssSUFBUCxFQUFhb0ssR0FBYixHQUFtQkQsU0FBU08sT0FBTzFLLElBQVAsQ0FBVCxDQUFuQjtFQU5hOztFQUVmLE9BQUssSUFBSXZGLElBQUlILEdBQWIsRUFBa0JHLEdBQWxCLEdBQXlCO0VBQUEsVUFBaEJBLENBQWdCO0VBS3hCO0VBQ0QsU0FBT2lRLE1BQVA7RUFDRDs7RUFFRCxTQUFTQyxPQUFULENBQWlCOVEsR0FBakIsRUFBc0I7RUFDcEIsTUFBSW1HLE9BQU91RSxTQUFTaEgsSUFBVCxDQUFjMUQsR0FBZCxDQUFYO0VBQ0EsTUFBSSxDQUFDeVEsVUFBVXRLLElBQVYsQ0FBTCxFQUFzQjtFQUNwQixRQUFJNEssVUFBVTVLLEtBQUtxQyxLQUFMLENBQVdrSSxVQUFYLENBQWQ7RUFDQSxRQUFJaEssTUFBTUQsT0FBTixDQUFjc0ssT0FBZCxLQUEwQkEsUUFBUXJRLE1BQVIsR0FBaUIsQ0FBL0MsRUFBa0Q7RUFDaEQrUCxnQkFBVXRLLElBQVYsSUFBa0I0SyxRQUFRLENBQVIsRUFBV25JLFdBQVgsRUFBbEI7RUFDRDtFQUNGO0VBQ0QsU0FBTzZILFVBQVV0SyxJQUFWLENBQVA7RUFDRDs7RUMxQ0Q7QUFDQTtFQUVBLElBQU02SyxRQUFRLFNBQVJBLEtBQVEsQ0FDWkMsR0FEWSxFQUlaO0VBQUEsTUFGQUMsU0FFQSx1RUFGWSxFQUVaO0VBQUEsTUFEQUMsTUFDQSx1RUFEUyxFQUNUOztFQUNBO0VBQ0EsTUFBSSxDQUFDRixHQUFELElBQVEsQ0FBQzlLLEdBQUtpTCxNQUFMLENBQVlILEdBQVosQ0FBVCxJQUE2QjlLLEdBQUtrTCxRQUFMLENBQWNKLEdBQWQsQ0FBakMsRUFBcUQ7RUFDbkQsV0FBT0EsR0FBUDtFQUNEOztFQUVEO0VBQ0EsTUFBSTlLLEdBQUttTCxJQUFMLENBQVVMLEdBQVYsQ0FBSixFQUFvQjtFQUNsQixXQUFPLElBQUlySyxJQUFKLENBQVNxSyxJQUFJTSxPQUFKLEVBQVQsQ0FBUDtFQUNEOztFQUVEO0VBQ0EsTUFBSXBMLEdBQUtxTCxNQUFMLENBQVlQLEdBQVosQ0FBSixFQUFzQjtFQUNwQixXQUFPLElBQUlRLE1BQUosQ0FBV1IsR0FBWCxDQUFQO0VBQ0Q7O0VBRUQ7RUFDQSxNQUFJOUssR0FBS3VMLEtBQUwsQ0FBV1QsR0FBWCxDQUFKLEVBQXFCO0VBQ25CLFdBQU9BLElBQUlqRyxHQUFKLENBQVFnRyxLQUFSLENBQVA7RUFDRDs7RUFFRDtFQUNBLE1BQUk3SyxHQUFLNkUsR0FBTCxDQUFTaUcsR0FBVCxDQUFKLEVBQW1CO0VBQ2pCLFdBQU8sSUFBSVUsR0FBSixDQUFRakwsTUFBTWtMLElBQU4sQ0FBV1gsSUFBSVksT0FBSixFQUFYLENBQVIsQ0FBUDtFQUNEOztFQUVEO0VBQ0EsTUFBSTFMLEdBQUtoRyxHQUFMLENBQVM4USxHQUFULENBQUosRUFBbUI7RUFDakIsV0FBTyxJQUFJYSxHQUFKLENBQVFwTCxNQUFNa0wsSUFBTixDQUFXWCxJQUFJYyxNQUFKLEVBQVgsQ0FBUixDQUFQO0VBQ0Q7O0VBRUQ7RUFDQSxNQUFJNUwsR0FBS2lMLE1BQUwsQ0FBWUgsR0FBWixDQUFKLEVBQXNCO0VBQ3BCQyxjQUFVaFAsSUFBVixDQUFlK08sR0FBZjtFQUNBLFFBQU1qUixNQUFNTCxPQUFPQyxNQUFQLENBQWNxUixHQUFkLENBQVo7RUFDQUUsV0FBT2pQLElBQVAsQ0FBWWxDLEdBQVo7O0VBSG9CLCtCQUlYZ1MsR0FKVztFQUtsQixVQUFJM1AsTUFBTTZPLFVBQVVlLFNBQVYsQ0FBb0IsVUFBQ3JSLENBQUQ7RUFBQSxlQUFPQSxNQUFNcVEsSUFBSWUsR0FBSixDQUFiO0VBQUEsT0FBcEIsQ0FBVjtFQUNBaFMsVUFBSWdTLEdBQUosSUFBVzNQLE1BQU0sQ0FBQyxDQUFQLEdBQVc4TyxPQUFPOU8sR0FBUCxDQUFYLEdBQXlCMk8sTUFBTUMsSUFBSWUsR0FBSixDQUFOLEVBQWdCZCxTQUFoQixFQUEyQkMsTUFBM0IsQ0FBcEM7RUFOa0I7O0VBSXBCLFNBQUssSUFBSWEsR0FBVCxJQUFnQmYsR0FBaEIsRUFBcUI7RUFBQSxZQUFaZSxHQUFZO0VBR3BCO0VBQ0QsV0FBT2hTLEdBQVA7RUFDRDs7RUFFRCxTQUFPaVIsR0FBUDtFQUNELENBaEREOztBQW9EQSxFQUFPLElBQU1pQixZQUFZLFNBQVpBLFNBQVksQ0FBU2pTLEtBQVQsRUFBZ0I7RUFDdkMsTUFBSTtFQUNGLFdBQU9xSyxLQUFLQyxLQUFMLENBQVdELEtBQUtHLFNBQUwsQ0FBZXhLLEtBQWYsQ0FBWCxDQUFQO0VBQ0QsR0FGRCxDQUVFLE9BQU9rUyxDQUFQLEVBQVU7RUFDVixXQUFPbFMsS0FBUDtFQUNEO0VBQ0YsQ0FOTTs7RUNyRFBzTSxTQUFTLE9BQVQsRUFBa0IsWUFBTTtFQUN0QkEsV0FBUyxZQUFULEVBQXVCLFlBQU07RUFDM0JRLE9BQUcscURBQUgsRUFBMEQsWUFBTTtFQUM5RDtFQUNBeUIsYUFBT3dDLE1BQU0sSUFBTixDQUFQLEVBQW9CdkMsRUFBcEIsQ0FBdUIyRCxFQUF2QixDQUEwQkMsSUFBMUI7O0VBRUE7RUFDQTdELGFBQU93QyxPQUFQLEVBQWdCdkMsRUFBaEIsQ0FBbUIyRCxFQUFuQixDQUFzQmhOLFNBQXRCOztFQUVBO0VBQ0EsVUFBTWtOLE9BQU8sU0FBUEEsSUFBTyxHQUFNLEVBQW5CO0VBQ0F0RixhQUFPdUYsVUFBUCxDQUFrQnZCLE1BQU1zQixJQUFOLENBQWxCLEVBQStCLGVBQS9COztFQUVBO0VBQ0F0RixhQUFPQyxLQUFQLENBQWErRCxNQUFNLENBQU4sQ0FBYixFQUF1QixDQUF2QjtFQUNBaEUsYUFBT0MsS0FBUCxDQUFhK0QsTUFBTSxRQUFOLENBQWIsRUFBOEIsUUFBOUI7RUFDQWhFLGFBQU9DLEtBQVAsQ0FBYStELE1BQU0sS0FBTixDQUFiLEVBQTJCLEtBQTNCO0VBQ0FoRSxhQUFPQyxLQUFQLENBQWErRCxNQUFNLElBQU4sQ0FBYixFQUEwQixJQUExQjtFQUNELEtBaEJEO0VBaUJELEdBbEJEOztFQW9CQXpFLFdBQVMsV0FBVCxFQUFzQixZQUFNO0VBQzFCUSxPQUFHLDZGQUFILEVBQWtHLFlBQU07RUFDdEc7RUFDQXlCLGFBQU8wRCxVQUFVLElBQVYsQ0FBUCxFQUF3QnpELEVBQXhCLENBQTJCMkQsRUFBM0IsQ0FBOEJDLElBQTlCOztFQUVBO0VBQ0E3RCxhQUFPMEQsV0FBUCxFQUFvQnpELEVBQXBCLENBQXVCMkQsRUFBdkIsQ0FBMEJoTixTQUExQjs7RUFFQTtFQUNBLFVBQU1rTixPQUFPLFNBQVBBLElBQU8sR0FBTSxFQUFuQjtFQUNBdEYsYUFBT3VGLFVBQVAsQ0FBa0JMLFVBQVVJLElBQVYsQ0FBbEIsRUFBbUMsZUFBbkM7O0VBRUE7RUFDQXRGLGFBQU9DLEtBQVAsQ0FBYWlGLFVBQVUsQ0FBVixDQUFiLEVBQTJCLENBQTNCO0VBQ0FsRixhQUFPQyxLQUFQLENBQWFpRixVQUFVLFFBQVYsQ0FBYixFQUFrQyxRQUFsQztFQUNBbEYsYUFBT0MsS0FBUCxDQUFhaUYsVUFBVSxLQUFWLENBQWIsRUFBK0IsS0FBL0I7RUFDQWxGLGFBQU9DLEtBQVAsQ0FBYWlGLFVBQVUsSUFBVixDQUFiLEVBQThCLElBQTlCO0VBQ0QsS0FoQkQ7RUFpQkQsR0FsQkQ7RUFtQkQsQ0F4Q0Q7O0VDQUEzRixTQUFTLE1BQVQsRUFBaUIsWUFBTTtFQUNyQkEsV0FBUyxXQUFULEVBQXNCLFlBQU07RUFDMUJRLE9BQUcsMERBQUgsRUFBK0QsWUFBTTtFQUNuRSxVQUFJeUYsZUFBZSxTQUFmQSxZQUFlLEdBQVc7RUFDNUIsZUFBT0MsU0FBUDtFQUNELE9BRkQ7RUFHQSxVQUFJMVIsT0FBT3lSLGFBQWEsTUFBYixDQUFYO0VBQ0FoRSxhQUFPbUMsR0FBRzhCLFNBQUgsQ0FBYTFSLElBQWIsQ0FBUCxFQUEyQjBOLEVBQTNCLENBQThCMkQsRUFBOUIsQ0FBaUNNLElBQWpDO0VBQ0QsS0FORDtFQU9BM0YsT0FBRywrREFBSCxFQUFvRSxZQUFNO0VBQ3hFLFVBQU00RixVQUFVLENBQUMsTUFBRCxDQUFoQjtFQUNBbkUsYUFBT21DLEdBQUc4QixTQUFILENBQWFFLE9BQWIsQ0FBUCxFQUE4QmxFLEVBQTlCLENBQWlDMkQsRUFBakMsQ0FBb0NRLEtBQXBDO0VBQ0QsS0FIRDtFQUlBN0YsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFLFVBQUl5RixlQUFlLFNBQWZBLFlBQWUsR0FBVztFQUM1QixlQUFPQyxTQUFQO0VBQ0QsT0FGRDtFQUdBLFVBQUkxUixPQUFPeVIsYUFBYSxNQUFiLENBQVg7RUFDQWhFLGFBQU9tQyxHQUFHOEIsU0FBSCxDQUFhcEMsR0FBYixDQUFpQnRQLElBQWpCLEVBQXVCQSxJQUF2QixFQUE2QkEsSUFBN0IsQ0FBUCxFQUEyQzBOLEVBQTNDLENBQThDMkQsRUFBOUMsQ0FBaURNLElBQWpEO0VBQ0QsS0FORDtFQU9BM0YsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFLFVBQUl5RixlQUFlLFNBQWZBLFlBQWUsR0FBVztFQUM1QixlQUFPQyxTQUFQO0VBQ0QsT0FGRDtFQUdBLFVBQUkxUixPQUFPeVIsYUFBYSxNQUFiLENBQVg7RUFDQWhFLGFBQU9tQyxHQUFHOEIsU0FBSCxDQUFhbEMsR0FBYixDQUFpQnhQLElBQWpCLEVBQXVCLE1BQXZCLEVBQStCLE9BQS9CLENBQVAsRUFBZ0QwTixFQUFoRCxDQUFtRDJELEVBQW5ELENBQXNETSxJQUF0RDtFQUNELEtBTkQ7RUFPRCxHQTFCRDs7RUE0QkFuRyxXQUFTLE9BQVQsRUFBa0IsWUFBTTtFQUN0QlEsT0FBRyxzREFBSCxFQUEyRCxZQUFNO0VBQy9ELFVBQUkyRSxRQUFRLENBQUMsTUFBRCxDQUFaO0VBQ0FsRCxhQUFPbUMsR0FBR2UsS0FBSCxDQUFTQSxLQUFULENBQVAsRUFBd0JqRCxFQUF4QixDQUEyQjJELEVBQTNCLENBQThCTSxJQUE5QjtFQUNELEtBSEQ7RUFJQTNGLE9BQUcsMkRBQUgsRUFBZ0UsWUFBTTtFQUNwRSxVQUFJOEYsV0FBVyxNQUFmO0VBQ0FyRSxhQUFPbUMsR0FBR2UsS0FBSCxDQUFTbUIsUUFBVCxDQUFQLEVBQTJCcEUsRUFBM0IsQ0FBOEIyRCxFQUE5QixDQUFpQ1EsS0FBakM7RUFDRCxLQUhEO0VBSUE3RixPQUFHLG1EQUFILEVBQXdELFlBQU07RUFDNUR5QixhQUFPbUMsR0FBR2UsS0FBSCxDQUFTckIsR0FBVCxDQUFhLENBQUMsT0FBRCxDQUFiLEVBQXdCLENBQUMsT0FBRCxDQUF4QixFQUFtQyxDQUFDLE9BQUQsQ0FBbkMsQ0FBUCxFQUFzRDVCLEVBQXRELENBQXlEMkQsRUFBekQsQ0FBNERNLElBQTVEO0VBQ0QsS0FGRDtFQUdBM0YsT0FBRyxtREFBSCxFQUF3RCxZQUFNO0VBQzVEeUIsYUFBT21DLEdBQUdlLEtBQUgsQ0FBU25CLEdBQVQsQ0FBYSxDQUFDLE9BQUQsQ0FBYixFQUF3QixPQUF4QixFQUFpQyxPQUFqQyxDQUFQLEVBQWtEOUIsRUFBbEQsQ0FBcUQyRCxFQUFyRCxDQUF3RE0sSUFBeEQ7RUFDRCxLQUZEO0VBR0QsR0FmRDs7RUFpQkFuRyxXQUFTLFNBQVQsRUFBb0IsWUFBTTtFQUN4QlEsT0FBRyx3REFBSCxFQUE2RCxZQUFNO0VBQ2pFLFVBQUkrRixPQUFPLElBQVg7RUFDQXRFLGFBQU9tQyxHQUFHb0MsT0FBSCxDQUFXRCxJQUFYLENBQVAsRUFBeUJyRSxFQUF6QixDQUE0QjJELEVBQTVCLENBQStCTSxJQUEvQjtFQUNELEtBSEQ7RUFJQTNGLE9BQUcsNkRBQUgsRUFBa0UsWUFBTTtFQUN0RSxVQUFJaUcsVUFBVSxNQUFkO0VBQ0F4RSxhQUFPbUMsR0FBR29DLE9BQUgsQ0FBV0MsT0FBWCxDQUFQLEVBQTRCdkUsRUFBNUIsQ0FBK0IyRCxFQUEvQixDQUFrQ1EsS0FBbEM7RUFDRCxLQUhEO0VBSUQsR0FURDs7RUFXQXJHLFdBQVMsT0FBVCxFQUFrQixZQUFNO0VBQ3RCUSxPQUFHLHNEQUFILEVBQTJELFlBQU07RUFDL0QsVUFBSWtHLFFBQVEsSUFBSXpULEtBQUosRUFBWjtFQUNBZ1AsYUFBT21DLEdBQUdzQyxLQUFILENBQVNBLEtBQVQsQ0FBUCxFQUF3QnhFLEVBQXhCLENBQTJCMkQsRUFBM0IsQ0FBOEJNLElBQTlCO0VBQ0QsS0FIRDtFQUlBM0YsT0FBRywyREFBSCxFQUFnRSxZQUFNO0VBQ3BFLFVBQUltRyxXQUFXLE1BQWY7RUFDQTFFLGFBQU9tQyxHQUFHc0MsS0FBSCxDQUFTQyxRQUFULENBQVAsRUFBMkJ6RSxFQUEzQixDQUE4QjJELEVBQTlCLENBQWlDUSxLQUFqQztFQUNELEtBSEQ7RUFJRCxHQVREOztFQVdBckcsV0FBUyxVQUFULEVBQXFCLFlBQU07RUFDekJRLE9BQUcseURBQUgsRUFBOEQsWUFBTTtFQUNsRXlCLGFBQU9tQyxHQUFHVSxRQUFILENBQVlWLEdBQUdVLFFBQWYsQ0FBUCxFQUFpQzVDLEVBQWpDLENBQW9DMkQsRUFBcEMsQ0FBdUNNLElBQXZDO0VBQ0QsS0FGRDtFQUdBM0YsT0FBRyw4REFBSCxFQUFtRSxZQUFNO0VBQ3ZFLFVBQUlvRyxjQUFjLE1BQWxCO0VBQ0EzRSxhQUFPbUMsR0FBR1UsUUFBSCxDQUFZOEIsV0FBWixDQUFQLEVBQWlDMUUsRUFBakMsQ0FBb0MyRCxFQUFwQyxDQUF1Q1EsS0FBdkM7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQXJHLFdBQVMsTUFBVCxFQUFpQixZQUFNO0VBQ3JCUSxPQUFHLHFEQUFILEVBQTBELFlBQU07RUFDOUR5QixhQUFPbUMsR0FBRzBCLElBQUgsQ0FBUSxJQUFSLENBQVAsRUFBc0I1RCxFQUF0QixDQUF5QjJELEVBQXpCLENBQTRCTSxJQUE1QjtFQUNELEtBRkQ7RUFHQTNGLE9BQUcsMERBQUgsRUFBK0QsWUFBTTtFQUNuRSxVQUFJcUcsVUFBVSxNQUFkO0VBQ0E1RSxhQUFPbUMsR0FBRzBCLElBQUgsQ0FBUWUsT0FBUixDQUFQLEVBQXlCM0UsRUFBekIsQ0FBNEIyRCxFQUE1QixDQUErQlEsS0FBL0I7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQXJHLFdBQVMsUUFBVCxFQUFtQixZQUFNO0VBQ3ZCUSxPQUFHLHVEQUFILEVBQTRELFlBQU07RUFDaEV5QixhQUFPbUMsR0FBRzBDLE1BQUgsQ0FBVSxDQUFWLENBQVAsRUFBcUI1RSxFQUFyQixDQUF3QjJELEVBQXhCLENBQTJCTSxJQUEzQjtFQUNELEtBRkQ7RUFHQTNGLE9BQUcsNERBQUgsRUFBaUUsWUFBTTtFQUNyRSxVQUFJdUcsWUFBWSxNQUFoQjtFQUNBOUUsYUFBT21DLEdBQUcwQyxNQUFILENBQVVDLFNBQVYsQ0FBUCxFQUE2QjdFLEVBQTdCLENBQWdDMkQsRUFBaEMsQ0FBbUNRLEtBQW5DO0VBQ0QsS0FIRDtFQUlELEdBUkQ7O0VBVUFyRyxXQUFTLFFBQVQsRUFBbUIsWUFBTTtFQUN2QlEsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFeUIsYUFBT21DLEdBQUdTLE1BQUgsQ0FBVSxFQUFWLENBQVAsRUFBc0IzQyxFQUF0QixDQUF5QjJELEVBQXpCLENBQTRCTSxJQUE1QjtFQUNELEtBRkQ7RUFHQTNGLE9BQUcsNERBQUgsRUFBaUUsWUFBTTtFQUNyRSxVQUFJd0csWUFBWSxNQUFoQjtFQUNBL0UsYUFBT21DLEdBQUdTLE1BQUgsQ0FBVW1DLFNBQVYsQ0FBUCxFQUE2QjlFLEVBQTdCLENBQWdDMkQsRUFBaEMsQ0FBbUNRLEtBQW5DO0VBQ0QsS0FIRDtFQUlELEdBUkQ7O0VBVUFyRyxXQUFTLFFBQVQsRUFBbUIsWUFBTTtFQUN2QlEsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFLFVBQUl5RSxTQUFTLElBQUlDLE1BQUosRUFBYjtFQUNBakQsYUFBT21DLEdBQUdhLE1BQUgsQ0FBVUEsTUFBVixDQUFQLEVBQTBCL0MsRUFBMUIsQ0FBNkIyRCxFQUE3QixDQUFnQ00sSUFBaEM7RUFDRCxLQUhEO0VBSUEzRixPQUFHLDREQUFILEVBQWlFLFlBQU07RUFDckUsVUFBSXlHLFlBQVksTUFBaEI7RUFDQWhGLGFBQU9tQyxHQUFHYSxNQUFILENBQVVnQyxTQUFWLENBQVAsRUFBNkIvRSxFQUE3QixDQUFnQzJELEVBQWhDLENBQW1DUSxLQUFuQztFQUNELEtBSEQ7RUFJRCxHQVREOztFQVdBckcsV0FBUyxRQUFULEVBQW1CLFlBQU07RUFDdkJRLE9BQUcsdURBQUgsRUFBNEQsWUFBTTtFQUNoRXlCLGFBQU9tQyxHQUFHOEMsTUFBSCxDQUFVLE1BQVYsQ0FBUCxFQUEwQmhGLEVBQTFCLENBQTZCMkQsRUFBN0IsQ0FBZ0NNLElBQWhDO0VBQ0QsS0FGRDtFQUdBM0YsT0FBRyw0REFBSCxFQUFpRSxZQUFNO0VBQ3JFeUIsYUFBT21DLEdBQUc4QyxNQUFILENBQVUsQ0FBVixDQUFQLEVBQXFCaEYsRUFBckIsQ0FBd0IyRCxFQUF4QixDQUEyQlEsS0FBM0I7RUFDRCxLQUZEO0VBR0QsR0FQRDs7RUFTQXJHLFdBQVMsV0FBVCxFQUFzQixZQUFNO0VBQzFCUSxPQUFHLDBEQUFILEVBQStELFlBQU07RUFDbkV5QixhQUFPbUMsR0FBR3ZMLFNBQUgsQ0FBYUEsU0FBYixDQUFQLEVBQWdDcUosRUFBaEMsQ0FBbUMyRCxFQUFuQyxDQUFzQ00sSUFBdEM7RUFDRCxLQUZEO0VBR0EzRixPQUFHLCtEQUFILEVBQW9FLFlBQU07RUFDeEV5QixhQUFPbUMsR0FBR3ZMLFNBQUgsQ0FBYSxJQUFiLENBQVAsRUFBMkJxSixFQUEzQixDQUE4QjJELEVBQTlCLENBQWlDUSxLQUFqQztFQUNBcEUsYUFBT21DLEdBQUd2TCxTQUFILENBQWEsTUFBYixDQUFQLEVBQTZCcUosRUFBN0IsQ0FBZ0MyRCxFQUFoQyxDQUFtQ1EsS0FBbkM7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQXJHLFdBQVMsS0FBVCxFQUFnQixZQUFNO0VBQ3BCUSxPQUFHLG9EQUFILEVBQXlELFlBQU07RUFDN0R5QixhQUFPbUMsR0FBRzNGLEdBQUgsQ0FBTyxJQUFJMkcsR0FBSixFQUFQLENBQVAsRUFBMEJsRCxFQUExQixDQUE2QjJELEVBQTdCLENBQWdDTSxJQUFoQztFQUNELEtBRkQ7RUFHQTNGLE9BQUcseURBQUgsRUFBOEQsWUFBTTtFQUNsRXlCLGFBQU9tQyxHQUFHM0YsR0FBSCxDQUFPLElBQVAsQ0FBUCxFQUFxQnlELEVBQXJCLENBQXdCMkQsRUFBeEIsQ0FBMkJRLEtBQTNCO0VBQ0FwRSxhQUFPbUMsR0FBRzNGLEdBQUgsQ0FBT3JMLE9BQU9DLE1BQVAsQ0FBYyxJQUFkLENBQVAsQ0FBUCxFQUFvQzZPLEVBQXBDLENBQXVDMkQsRUFBdkMsQ0FBMENRLEtBQTFDO0VBQ0QsS0FIRDtFQUlELEdBUkQ7O0VBVUFyRyxXQUFTLEtBQVQsRUFBZ0IsWUFBTTtFQUNwQlEsT0FBRyxvREFBSCxFQUF5RCxZQUFNO0VBQzdEeUIsYUFBT21DLEdBQUd4USxHQUFILENBQU8sSUFBSTJSLEdBQUosRUFBUCxDQUFQLEVBQTBCckQsRUFBMUIsQ0FBNkIyRCxFQUE3QixDQUFnQ00sSUFBaEM7RUFDRCxLQUZEO0VBR0EzRixPQUFHLHlEQUFILEVBQThELFlBQU07RUFDbEV5QixhQUFPbUMsR0FBR3hRLEdBQUgsQ0FBTyxJQUFQLENBQVAsRUFBcUJzTyxFQUFyQixDQUF3QjJELEVBQXhCLENBQTJCUSxLQUEzQjtFQUNBcEUsYUFBT21DLEdBQUd4USxHQUFILENBQU9SLE9BQU9DLE1BQVAsQ0FBYyxJQUFkLENBQVAsQ0FBUCxFQUFvQzZPLEVBQXBDLENBQXVDMkQsRUFBdkMsQ0FBMENRLEtBQTFDO0VBQ0QsS0FIRDtFQUlELEdBUkQ7RUFTRCxDQTdKRDs7RUNGQTtBQUNBO0VBRUEsSUFBTWMsV0FBVyxTQUFYQSxRQUFXLENBQVNDLFVBQVQsRUFBcUI7RUFDcEMsU0FBT0EsV0FBV0MsZUFBWCxDQUEyQixnQkFBZ0M7RUFBQSxRQUFyQkMsT0FBcUIsUUFBckJBLE9BQXFCO0VBQUEsUUFBWkMsUUFBWSxRQUFaQSxRQUFZOztFQUNoRSxRQUFJLE9BQU9BLFFBQVAsS0FBb0IsV0FBeEIsRUFBcUM7RUFDbkMsYUFBT0EsUUFBUDtFQUNEO0VBQ0QsUUFBSUMsZUFBZTtFQUNqQmpULGNBQVErUyxRQUFRL1MsTUFEQztFQUVqQmtULFlBQU1ILFFBQVFHLElBRkc7RUFHakJDLG1CQUFhSixRQUFRSSxXQUhKO0VBSWpCQyxlQUFTTCxRQUFRSztFQUpBLEtBQW5COztFQU9BLFFBQUl0RixPQUFPdUYsZUFBZU4sT0FBZixDQUFYO0VBQ0EsUUFBSWpGLElBQUosRUFBVTtFQUNSbUYsbUJBQWFuRixJQUFiLEdBQW9CQSxJQUFwQjtFQUNEOztFQUVELFFBQUksQ0FBQ2lGLFFBQVFPLEdBQWIsRUFBa0I7RUFDaEIsWUFBTSxJQUFJNVUsS0FBSixzQ0FBTjtFQUNEOztFQUVEO0VBQ0EsV0FBTzZVLE1BQU1SLFFBQVFPLEdBQWQsRUFBbUJMLFlBQW5CLEVBQ0pPLElBREksQ0FDQyxvQkFBWTtFQUNoQixVQUFJLENBQUNSLFNBQVNTLEVBQWQsRUFBa0IsTUFBTVQsUUFBTjtFQUNsQixhQUFPQSxTQUFTVSxJQUFULEVBQVA7RUFDRCxLQUpJLEVBS0pGLElBTEksQ0FLQyxvQkFBWTtFQUNoQixVQUFJO0VBQ0YsZUFBT2hLLEtBQUtDLEtBQUwsQ0FBV3VKLFFBQVgsQ0FBUDtFQUNELE9BRkQsQ0FFRSxPQUFPM0IsQ0FBUCxFQUFVO0VBQ1YsZUFBTzJCLFFBQVA7RUFDRDtFQUNGLEtBWEksQ0FBUDtFQVlELEdBakNNLENBQVA7RUFrQ0QsQ0FuQ0Q7O0VDSEE7O0VBVUEsSUFBTVcsaUJBQWlCO0VBQ3JCVCxRQUFNLE1BRGU7RUFFckJqTCxRQUFNM0QsU0FGZTtFQUdyQjhPLFdBQVM7RUFDUCxzQkFBa0IsU0FEWDtFQUVQLG9CQUFnQjtFQUZULEdBSFk7RUFPckJELGVBQWEsYUFQUTtFQVFyQlMsNEJBQTBCO0VBUkwsQ0FBdkI7O0VBV0EsSUFBTUMsb0JBQW9CLFNBQXBCQSxpQkFBb0IsR0FFeEI7RUFBQSxNQURBQyxxQkFDQSx1RUFEd0IsRUFDeEI7O0VBQ0EsTUFBTUMsa0JBQWtCbFYsT0FBTzRGLE1BQVAsQ0FDdEIsRUFEc0IsRUFFdEJrUCxjQUZzQixFQUd0QkcscUJBSHNCLENBQXhCO0VBS0EsTUFBTUUsZUFBZSxFQUFyQjtFQUNBLE1BQU1DLGdCQUFnQixFQUF0Qjs7RUFFQSxXQUFTalQsR0FBVCxDQUFhaEIsTUFBYixFQUE0QztFQUFBLFFBQXZCa1UsZ0JBQXVCLHVFQUFKLEVBQUk7O0VBQzFDLFFBQUluQixVQUFVbFUsT0FBTzRGLE1BQVAsQ0FDWixFQURZLEVBRVpzUCxlQUZZLEVBR1pHLGdCQUhZLEVBSVo7RUFDRWxVLGNBQVFBO0VBRFYsS0FKWSxDQUFkOztFQVNBLFFBQUlnVCxXQUFXMU8sU0FBZjs7RUFFQSxRQUFJNlAsVUFBVUMsUUFBUUMsT0FBUixDQUFnQjtFQUM1QnRCLHNCQUQ0QjtFQUU1QkM7RUFGNEIsS0FBaEIsQ0FBZDs7RUFLQWdCLGlCQUFhdFIsT0FBYixDQUFxQixnQkFBc0Q7RUFBQSxVQUEzQzRSLGFBQTJDLFFBQTNDQSxhQUEyQztFQUFBLFVBQTVCclQsUUFBNEIsUUFBNUJBLFFBQTRCO0VBQUEsVUFBbEJzVCxjQUFrQixRQUFsQkEsY0FBa0I7O0VBQ3pFO0VBQ0EsVUFBSSxDQUFDSixRQUFRRyxhQUFSLENBQUwsRUFBNkI7RUFDM0IsY0FBTSxJQUFJNVYsS0FBSiw0REFDcUQ0VixhQURyRCxDQUFOO0VBR0Q7RUFDRDtFQUNBSCxnQkFBVUEsUUFBUUcsYUFBUixFQUF1QixVQUFTRSxHQUFULEVBQWM7RUFDN0MsWUFBSUMseUJBQXlCRCxHQUF6QixDQUFKLEVBQW1DO0VBQ2pDekIsb0JBQVU3QyxNQUFNc0UsSUFBSXpCLE9BQVYsQ0FBVjtFQUNBQyxxQkFBVzVCLFVBQVVvRCxJQUFJeEIsUUFBZCxDQUFYO0VBQ0QsU0FIRCxNQUdPO0VBQ0xELG9CQUFVN0MsTUFBTXNFLEdBQU4sQ0FBVjtFQUNEO0VBQ0QsZUFBT3ZULFNBQVM7RUFDZDhSLG1CQUFTN0MsTUFBTTZDLE9BQU4sQ0FESztFQUVkQyxvQkFBVTVCLFVBQVU0QixRQUFWO0VBRkksU0FBVCxDQUFQO0VBSUQsT0FYUyxFQVdQdUIsY0FYTyxDQUFWO0VBWUQsS0FwQkQ7O0VBc0JBO0VBQ0FKLGNBQVVBLFFBQVFYLElBQVIsQ0FBYSxVQUFTZ0IsR0FBVCxFQUFjO0VBQ25DLFVBQUlDLHlCQUF5QkQsR0FBekIsQ0FBSixFQUFtQztFQUNqQ3pCLGtCQUFVN0MsTUFBTXNFLElBQUl6QixPQUFWLENBQVY7RUFDQUMsbUJBQVc1QixVQUFVb0QsSUFBSXhCLFFBQWQsQ0FBWDtFQUNELE9BSEQsTUFHTztFQUNMRCxrQkFBVTdDLE1BQU1zRSxHQUFOLENBQVY7RUFDRDtFQUNELGFBQU87RUFDTHpCLGlCQUFTN0MsTUFBTTZDLE9BQU4sQ0FESjtFQUVMQyxrQkFBVTVCLFVBQVU0QixRQUFWO0VBRkwsT0FBUDtFQUlELEtBWFMsQ0FBVjs7RUFhQWlCLGtCQUFjdlIsT0FBZCxDQUFzQixpQkFJbkI7RUFBQSxVQUhENFIsYUFHQyxTQUhEQSxhQUdDO0VBQUEsVUFGRHJULFFBRUMsU0FGREEsUUFFQztFQUFBLFVBRERzVCxjQUNDLFNBRERBLGNBQ0M7O0VBQ0Q7RUFDQSxVQUFJLENBQUNKLFFBQVFHLGFBQVIsQ0FBTCxFQUE2QjtFQUMzQixjQUFNLElBQUk1VixLQUFKLHFEQUM4QzRWLGFBRDlDLENBQU47RUFHRDtFQUNEO0VBQ0FILGdCQUFVQSxRQUFRRyxhQUFSLEVBQXVCLFVBQVNFLEdBQVQsRUFBYztFQUM3QyxZQUFJQyx5QkFBeUJELEdBQXpCLENBQUosRUFBbUM7RUFDakN4QixxQkFBVzVCLFVBQVVvRCxJQUFJeEIsUUFBZCxDQUFYO0VBQ0QsU0FGRCxNQUVPO0VBQ0xBLHFCQUFXNUIsVUFBVW9ELEdBQVYsQ0FBWDtFQUNEO0VBQ0QsZUFBT3ZULFNBQVM7RUFDZDhSLG1CQUFTN0MsTUFBTTZDLE9BQU4sQ0FESztFQUVkQyxvQkFBVTVCLFVBQVU0QixRQUFWO0VBRkksU0FBVCxDQUFQO0VBSUQsT0FWUyxFQVVQdUIsY0FWTyxDQUFWO0VBV0QsS0F2QkQ7O0VBeUJBO0VBQ0FKLGNBQVVBLFFBQVFYLElBQVIsQ0FBYSxVQUFTZ0IsR0FBVCxFQUFjO0VBQ25DLFVBQUlDLHlCQUF5QkQsR0FBekIsQ0FBSixFQUFtQztFQUNqQ3hCLG1CQUFXNUIsVUFBVW9ELElBQUl4QixRQUFkLENBQVg7RUFDRCxPQUZELE1BRU87RUFDTEEsbUJBQVc1QixVQUFVb0QsR0FBVixDQUFYO0VBQ0Q7O0VBRUQsVUFBSXpCLFFBQVFhLHdCQUFaLEVBQXNDO0VBQ3BDLGVBQU87RUFDTGIsMEJBREs7RUFFTEM7RUFGSyxTQUFQO0VBSUQ7RUFDRCxhQUFPQSxRQUFQO0VBQ0QsS0FkUyxDQUFWOztFQWdCQSxXQUFPbUIsT0FBUDtFQUNELEdBekdEOztFQTJHQSxNQUFNdEIsYUFBYTtFQUNqQnpULFNBQUs0QixJQUFJakMsSUFBSixDQUFTLElBQVQsRUFBZSxLQUFmLENBRFk7RUFFakIyVixVQUFNMVQsSUFBSWpDLElBQUosQ0FBUyxJQUFULEVBQWUsTUFBZixDQUZXO0VBR2pCNFYsU0FBSzNULElBQUlqQyxJQUFKLENBQVMsSUFBVCxFQUFlLEtBQWYsQ0FIWTtFQUlqQjZWLFdBQU81VCxJQUFJakMsSUFBSixDQUFTLElBQVQsRUFBZSxPQUFmLENBSlU7RUFLakI4VixZQUFRN1QsSUFBSWpDLElBQUosQ0FBUyxJQUFULEVBQWUsUUFBZixDQUxTO0VBTWpCK1YsYUFBUyxtQkFBcUI7RUFBQSxVQUFwQkMsVUFBb0IsdUVBQVAsRUFBTzs7RUFDNUIsYUFBTzdFLE1BQU1yUixPQUFPNEYsTUFBUCxDQUFjc1AsZUFBZCxFQUErQmdCLFVBQS9CLENBQU4sQ0FBUDtFQUNELEtBUmdCO0VBU2pCQyxvQkFBZ0IsMEJBQVc7RUFDekJoQixtQkFBYTVTLElBQWIsQ0FBa0I2VCwwQkFBMEJ0RCxTQUExQixDQUFsQjtFQUNBLGFBQU8sSUFBUDtFQUNELEtBWmdCO0VBYWpCbUIscUJBQWlCLDJCQUFXO0VBQzFCbUIsb0JBQWM3UyxJQUFkLENBQW1CNlQsMEJBQTBCdEQsU0FBMUIsQ0FBbkI7RUFDQSxhQUFPLElBQVA7RUFDRDtFQWhCZ0IsR0FBbkI7O0VBbUJBLFNBQU9pQixTQUFTQyxVQUFULENBQVA7RUFDRCxDQWpJRDs7QUFxSUEsRUFBTyxJQUFNUSxpQkFBaUIsU0FBakJBLGNBQWlCLENBQVM2QixHQUFULEVBQWM7RUFDMUMsTUFBSUEsSUFBSWpOLElBQVIsRUFBYztFQUNaLFdBQU91QixLQUFLRyxTQUFMLENBQWV1TCxJQUFJak4sSUFBbkIsQ0FBUDtFQUNELEdBRkQsTUFFTyxJQUFJaU4sSUFBSXBILElBQVIsRUFBYztFQUNuQixXQUFPb0gsSUFBSXBILElBQVg7RUFDRDtFQUNELFNBQU8sRUFBUDtFQUNELENBUE07O0VBU1AsU0FBU21ILHlCQUFULENBQW1DaFYsSUFBbkMsRUFBeUM7RUFDdkMsTUFBSXFVLHNCQUFKO0VBQ0EsTUFBSXJULGlCQUFKO0VBQ0EsTUFBSXNULHVCQUFKO0VBQ0EsTUFBSSxPQUFPdFUsS0FBSyxDQUFMLENBQVAsS0FBbUIsUUFBdkIsRUFBaUM7RUFDOUJxVSxpQkFEOEIsR0FDYXJVLElBRGI7RUFDZmdCLFlBRGUsR0FDYWhCLElBRGI7RUFDTHNVLGtCQURLLEdBQ2F0VSxJQURiO0VBRWhDLEdBRkQsTUFFTztFQUNMcVUsb0JBQWdCLE1BQWhCO0VBQ0NyVCxZQUZJLEdBRXdCaEIsSUFGeEI7RUFFTXNVLGtCQUZOLEdBRXdCdFUsSUFGeEI7RUFHTjtFQUNELE1BQ0dxVSxrQkFBa0IsTUFBbEIsSUFBNEJBLGtCQUFrQixPQUEvQyxJQUNBLE9BQU9yVCxRQUFQLEtBQW9CLFVBRnRCLEVBR0U7RUFDQSxVQUFNLElBQUl2QyxLQUFKLENBQ0osZ0VBREksQ0FBTjtFQUdEO0VBQ0QsU0FBTztFQUNMNFYsZ0NBREs7RUFFTHJULHNCQUZLO0VBR0xzVDtFQUhLLEdBQVA7RUFLRDs7RUFFRCxTQUFTRSx3QkFBVCxDQUFrQ0QsR0FBbEMsRUFBdUM7RUFDckMsU0FDRSxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLE9BQWUsUUFBZixJQUNBM1YsT0FBTzJGLElBQVAsQ0FBWWdRLEdBQVosRUFBaUI1VSxNQUFqQixLQUE0QixDQUQ1QixJQUVBNFUsSUFBSXRTLGNBQUosQ0FBbUIsU0FBbkIsQ0FGQSxJQUdBc1MsSUFBSXRTLGNBQUosQ0FBbUIsVUFBbkIsQ0FKRjtFQU1EOztFQ2pNRHVKLFNBQVMsMkJBQVQsRUFBc0MsWUFBTTtFQUMxQ1EsS0FBRyw0QkFBSCxFQUFpQyxnQkFBUTtFQUN2QyxRQUFJNEcsYUFBYWdCLG1CQUFqQjtFQUNBaEIsZUFDR3pULEdBREgsQ0FDTztFQUNIa1UsV0FBSztFQURGLEtBRFAsRUFJR0UsSUFKSCxDQUlRLFVBQVNSLFFBQVQsRUFBbUI7RUFDdkJ2RixXQUFLQyxNQUFMLENBQVlzRixTQUFTbUMsR0FBckIsRUFBMEJ4SCxFQUExQixDQUE2QnhCLEtBQTdCLENBQW1DLEdBQW5DO0VBQ0FpSjtFQUNELEtBUEg7RUFRRCxHQVZEOztFQVlBbkosS0FBRyw2QkFBSCxFQUFrQyxnQkFBUTtFQUN4QyxRQUFJNEcsYUFBYWdCLG1CQUFqQjtFQUNBaEIsZUFDRzZCLElBREgsQ0FDUTtFQUNKcEIsV0FBSyx3QkFERDtFQUVKckwsWUFBTTtFQUNKb04sa0JBQVU7RUFETjtFQUZGLEtBRFIsRUFPRzdCLElBUEgsQ0FPUSxVQUFTUixRQUFULEVBQW1CO0VBQ3ZCdkYsV0FBS0MsTUFBTCxDQUFZc0YsU0FBU21DLEdBQXJCLEVBQTBCeEgsRUFBMUIsQ0FBNkJ4QixLQUE3QixDQUFtQyxHQUFuQztFQUNBaUo7RUFDRCxLQVZIO0VBV0QsR0FiRDs7RUFlQW5KLEtBQUcsMENBQUgsRUFBK0MsZ0JBQVE7RUFDckQsUUFBSTRHLGFBQWFnQixtQkFBakI7RUFDQWhCLGVBQ0d6VCxHQURILENBQ087RUFDSGtVLFdBQUs7RUFERixLQURQLEVBSUdFLElBSkgsQ0FJUSxVQUFTUixRQUFULEVBQW1CO0VBQ3ZCdkYsV0FBS0MsTUFBTCxDQUFZc0YsUUFBWixFQUFzQnJGLEVBQXRCLENBQXlCeEIsS0FBekIsQ0FBK0IsVUFBL0I7RUFDQWlKO0VBQ0QsS0FQSDtFQVFELEdBVkQ7O0VBWUFuSixLQUFHLHlDQUFILEVBQThDLGdCQUFRO0VBQ3BELFFBQUk0RyxhQUFhZ0Isa0JBQWtCO0VBQ2pDVixtQkFBYTtFQURvQixLQUFsQixDQUFqQjtFQUdBMUYsU0FBS0MsTUFBTCxDQUFZbUYsV0FBV2lDLE9BQVgsR0FBcUIzQixXQUFqQyxFQUE4Q3hGLEVBQTlDLENBQWlEeEIsS0FBakQsQ0FBdUQsU0FBdkQ7O0VBRUEwRyxlQUFXaUMsT0FBWCxDQUFtQjtFQUNqQjNCLG1CQUFhO0VBREksS0FBbkI7RUFHQTFGLFNBQUtDLE1BQUwsQ0FBWW1GLFdBQVdpQyxPQUFYLEdBQXFCM0IsV0FBakMsRUFBOEN4RixFQUE5QyxDQUFpRHhCLEtBQWpELENBQXVELE1BQXZEOztFQUVBMEcsZUFDR3pULEdBREgsQ0FDTztFQUNIa1UsV0FBSyx1QkFERjtFQUVISCxtQkFBYSxhQUZWO0VBR0hTLGdDQUEwQjtFQUh2QixLQURQLEVBTUdKLElBTkgsQ0FNUSxnQkFBZ0M7RUFBQSxVQUFyQlQsT0FBcUIsUUFBckJBLE9BQXFCO0VBQUEsVUFBWkMsUUFBWSxRQUFaQSxRQUFZOztFQUNwQ3ZGLFdBQUtDLE1BQUwsQ0FBWXFGLFFBQVFJLFdBQXBCLEVBQWlDeEYsRUFBakMsQ0FBb0N4QixLQUFwQyxDQUEwQyxhQUExQztFQUNBaUo7RUFDRCxLQVRIO0VBVUQsR0FyQkQ7O0VBdUJBbkosS0FBRyw0Q0FBSCxFQUFpRCxnQkFBUTtFQUN2RCxRQUFJNEcsYUFBYWdCLG1CQUFqQjtFQUNBaEIsZUFBV21DLGNBQVgsQ0FBMEIsaUJBQWlCO0VBQUEsVUFBZGpDLE9BQWMsU0FBZEEsT0FBYzs7RUFDekMsYUFBT2xVLE9BQU80RixNQUFQLENBQWMsRUFBZCxFQUFrQnNPLE9BQWxCLEVBQTJCO0VBQ2hDTyxhQUFLLDJCQUQyQjtFQUVoQ00sa0NBQTBCO0VBRk0sT0FBM0IsQ0FBUDtFQUlELEtBTEQ7RUFNQWYsZUFDR3pULEdBREgsQ0FDTyxFQUFFa1UsS0FBSyxzQkFBUCxFQURQLEVBRUdFLElBRkgsQ0FFUSxpQkFBZ0M7RUFBQSxVQUFyQlQsT0FBcUIsU0FBckJBLE9BQXFCO0VBQUEsVUFBWkMsUUFBWSxTQUFaQSxRQUFZOztFQUNwQ3ZGLFdBQUtDLE1BQUwsQ0FBWXFGLFFBQVFPLEdBQXBCLEVBQXlCM0YsRUFBekIsQ0FBNEJ4QixLQUE1QixDQUFrQywyQkFBbEM7RUFDQXNCLFdBQUtDLE1BQUwsQ0FBWXNGLFFBQVosRUFBc0JyRixFQUF0QixDQUF5QnhCLEtBQXpCLENBQStCLDJCQUEvQjtFQUNBaUo7RUFDRCxLQU5IO0VBT0QsR0FmRDs7RUFpQkFuSixLQUFHLHdDQUFILEVBQTZDLGdCQUFRO0VBQ25ELFFBQUk0RyxhQUFhZ0IsbUJBQWpCO0VBQ0FoQixlQUFXbUMsY0FBWCxDQUEwQixpQkFBaUI7RUFBQSxVQUFkakMsT0FBYyxTQUFkQSxPQUFjOztFQUN6QyxVQUFJQSxRQUFRTyxHQUFSLEtBQWdCLGlCQUFwQixFQUF1QztFQUNyQyxlQUFPO0VBQ0xQLG1CQUFTQSxPQURKO0VBRUxDLG9CQUFVO0VBRkwsU0FBUDtFQUlEO0VBQ0QsYUFBT0QsT0FBUDtFQUNELEtBUkQ7RUFTQUYsZUFBV3pULEdBQVgsQ0FBZSxFQUFFa1UsS0FBSyxpQkFBUCxFQUFmLEVBQTJDRSxJQUEzQyxDQUFnRCxVQUFTUixRQUFULEVBQW1CO0VBQ2pFdkYsV0FBS0MsTUFBTCxDQUFZc0YsUUFBWixFQUFzQnJGLEVBQXRCLENBQXlCeEIsS0FBekIsQ0FBK0IsdUJBQS9CO0VBQ0FpSjtFQUNELEtBSEQ7RUFJRCxHQWZEOztFQWlCQW5KLEtBQUcsOENBQUgsRUFBbUQsZ0JBQVE7RUFDekQsUUFBSTRHLGFBQWFnQixtQkFBakI7RUFDQWhCLGVBQVdDLGVBQVgsQ0FBMkIsaUJBQWtCO0VBQUEsVUFBZkUsUUFBZSxTQUFmQSxRQUFlOztFQUMzQ0EsZUFBU21DLEdBQVQsR0FBZSwwQkFBZjtFQUNBLGFBQU9uQyxRQUFQO0VBQ0QsS0FIRDtFQUlBSCxlQUNHelQsR0FESCxDQUNPO0VBQ0hrVSxXQUFLO0VBREYsS0FEUCxFQUlHRSxJQUpILENBSVEsVUFBU1IsUUFBVCxFQUFtQjtFQUN2QnZGLFdBQUtDLE1BQUwsQ0FBWXNGLFNBQVNtQyxHQUFyQixFQUEwQnhILEVBQTFCLENBQTZCeEIsS0FBN0IsQ0FBbUMsMEJBQW5DO0VBQ0FpSjtFQUNELEtBUEg7RUFRRCxHQWREO0VBZUQsQ0FoSEQ7O0VDRkE7QUFDQTtFQUdBLElBQU1FLFdBQVcsRUFBakI7O0VBRUEsSUFBTUMsY0FBYyxTQUFkQSxXQUFjLENBQVMxQyxVQUFULEVBQXFCO0VBQ3ZDMkMsb0JBQWtCM0MsVUFBbEI7RUFDQTRDLGtCQUFnQjVDLFVBQWhCO0VBQ0EsU0FBT0EsVUFBUDtFQUNELENBSkQ7O0FBUUEsRUFBTyxJQUFNNEMsa0JBQWtCLFNBQWxCQSxlQUFrQixDQUFTNUMsVUFBVCxFQUFxQjtFQUNsRCxTQUFPQSxXQUFXbUMsY0FBWCxDQUEwQixnQkFBZ0M7RUFBQSxRQUFyQmpDLE9BQXFCLFFBQXJCQSxPQUFxQjtFQUFBLFFBQVpDLFFBQVksUUFBWkEsUUFBWTs7RUFDL0QsUUFDRSxDQUFDQSxRQUFELElBQ0EsT0FBT3NDLFNBQVNJLFNBQVMzQyxPQUFULENBQVQsQ0FBUCxLQUF1QyxXQUR2QyxLQUVDLE9BQU9BLFFBQVE0QyxrQkFBZixLQUFzQyxXQUF0QyxJQUNDNUMsUUFBUTRDLGtCQUFSLENBQTJCO0VBQ3pCNUMsZUFBU0EsT0FEZ0I7RUFFekJDLGdCQUFVc0MsU0FBU0ksU0FBUzNDLE9BQVQsQ0FBVDtFQUZlLEtBQTNCLENBSEYsQ0FERixFQVFFO0VBQ0FBLGNBQVFDLFFBQVIsR0FBbUI1QixVQUFVa0UsU0FBU0ksU0FBUzNDLE9BQVQsQ0FBVCxDQUFWLENBQW5CO0VBQ0FBLGNBQVE2QyxlQUFSLEdBQTBCLElBQTFCO0VBQ0QsS0FYRCxNQVdPO0VBQ0w3QyxjQUFRNkMsZUFBUixHQUEwQixLQUExQjtFQUNEO0VBQ0QsV0FBTzdDLE9BQVA7RUFDRCxHQWhCTSxDQUFQO0VBaUJELENBbEJNOztBQW9CUCxFQUFPLElBQU15QyxvQkFBb0IsU0FBcEJBLGlCQUFvQixDQUFTM0MsVUFBVCxFQUFxQjtFQUNwRCxTQUFPQSxXQUFXQyxlQUFYLENBQTJCLGlCQUFnQztFQUFBLFFBQXJCQyxPQUFxQixTQUFyQkEsT0FBcUI7RUFBQSxRQUFaQyxRQUFZLFNBQVpBLFFBQVk7O0VBQ2hFLFFBQ0UsT0FBT0QsUUFBUTRDLGtCQUFmLEtBQXNDLFdBQXRDLElBQ0E1QyxRQUFRNEMsa0JBQVIsQ0FBMkIsRUFBRTVDLGdCQUFGLEVBQVdDLGtCQUFYLEVBQTNCLENBRkYsRUFHRTtFQUNBc0MsZUFBU0ksU0FBUzNDLE9BQVQsQ0FBVCxJQUE4QkMsUUFBOUI7RUFDQUQsY0FBUThDLFlBQVIsR0FBdUIsSUFBdkI7RUFDRCxLQU5ELE1BTU87RUFDTDlDLGNBQVE4QyxZQUFSLEdBQXVCLEtBQXZCO0VBQ0Q7RUFDRCxXQUFPN0MsUUFBUDtFQUNELEdBWE0sQ0FBUDtFQVlELENBYk07O0FBZVAsRUFBTyxJQUFNOEMsZUFBZSxTQUFmQSxZQUFlLEdBQTBCO0VBQUEsTUFBakJDLFVBQWlCLHVFQUFKLEVBQUk7O0VBQ3BEbFgsU0FBTzJGLElBQVAsQ0FBWThRLFFBQVosRUFBc0I1UyxPQUF0QixDQUE4QixVQUFTc1QsQ0FBVCxFQUFZO0VBQ3hDLFFBQUlBLEVBQUUxWCxRQUFGLENBQVd5WCxVQUFYLENBQUosRUFBNEI7RUFDMUJULGVBQVNVLENBQVQsSUFBYzFSLFNBQWQ7RUFDRDtFQUNGLEdBSkQ7RUFLRCxDQU5NOztFQVFQLFNBQVNvUixRQUFULENBQWtCM0MsT0FBbEIsRUFBMkI7RUFDekIsU0FBVUEsUUFBUU8sR0FBbEIsVUFBMEJQLFFBQVEvUyxNQUFsQyxVQUE2Q3FULGVBQWVOLE9BQWYsQ0FBN0M7RUFDRDs7RUN0RER0SCxTQUFTLDBCQUFULEVBQXFDLFlBQU07RUFDekNRLEtBQUcsd0JBQUgsRUFBNkIsZ0JBQVE7RUFDbkMsUUFBSTRHLGFBQWEwQyxZQUFZMUIsbUJBQVosQ0FBakI7RUFDQWhCLGVBQ0d6VCxHQURILENBQ087RUFDSGtVLFdBQUssdUJBREY7RUFFSE0sZ0NBQTBCO0VBRnZCLEtBRFAsRUFLR0osSUFMSCxDQUtRLGdCQUFnQztFQUFBLFVBQXJCVCxPQUFxQixRQUFyQkEsT0FBcUI7RUFBQSxVQUFaQyxRQUFZLFFBQVpBLFFBQVk7O0VBQ3BDdkYsV0FBS0MsTUFBTCxDQUFZc0YsU0FBU21DLEdBQXJCLEVBQTBCeEgsRUFBMUIsQ0FBNkJ4QixLQUE3QixDQUFtQyxHQUFuQztFQUNBc0IsV0FBS0MsTUFBTCxDQUFZcUYsUUFBUTZDLGVBQXBCLEVBQXFDakksRUFBckMsQ0FBd0N4QixLQUF4QyxDQUE4QyxLQUE5QztFQUNELEtBUkgsRUFTR3FILElBVEgsQ0FTUSxZQUFXO0VBQ2ZYLGlCQUNHelQsR0FESCxDQUNPO0VBQ0hrVSxhQUFLLHVCQURGO0VBRUhNLGtDQUEwQjtFQUZ2QixPQURQLEVBS0dKLElBTEgsQ0FLUSxpQkFBZ0M7RUFBQSxZQUFyQlQsT0FBcUIsU0FBckJBLE9BQXFCO0VBQUEsWUFBWkMsUUFBWSxTQUFaQSxRQUFZOztFQUNwQ3ZGLGFBQUtDLE1BQUwsQ0FBWXNGLFNBQVNtQyxHQUFyQixFQUEwQnhILEVBQTFCLENBQTZCeEIsS0FBN0IsQ0FBbUMsR0FBbkM7RUFDQXNCLGFBQUtDLE1BQUwsQ0FBWXFGLFFBQVE2QyxlQUFwQixFQUFxQ2pJLEVBQXJDLENBQXdDeEIsS0FBeEMsQ0FBOEMsSUFBOUM7RUFDQWlKO0VBQ0QsT0FUSDtFQVVELEtBcEJIO0VBcUJELEdBdkJEOztFQXlCQW5KLEtBQUcscUJBQUgsRUFBMEIsZ0JBQVE7RUFDaEMsUUFBSTRHLGFBQWEwQyxZQUFZMUIsbUJBQVosQ0FBakI7RUFDQWhCLGVBQ0d6VCxHQURILENBQ087RUFDSGtVLFdBQUssdUJBREY7RUFFSE0sZ0NBQTBCO0VBRnZCLEtBRFAsRUFLR0osSUFMSCxDQUtRLFlBQVc7RUFDZnNDO0VBQ0FqRCxpQkFDR3pULEdBREgsQ0FDTztFQUNIa1UsYUFBSyx1QkFERjtFQUVITSxrQ0FBMEI7RUFGdkIsT0FEUCxFQUtHSixJQUxILENBS1EsaUJBQWdDO0VBQUEsWUFBckJULE9BQXFCLFNBQXJCQSxPQUFxQjtFQUFBLFlBQVpDLFFBQVksU0FBWkEsUUFBWTs7RUFDcEN2RixhQUFLQyxNQUFMLENBQVlzRixTQUFTbUMsR0FBckIsRUFBMEJ4SCxFQUExQixDQUE2QnhCLEtBQTdCLENBQW1DLEdBQW5DO0VBQ0FzQixhQUFLQyxNQUFMLENBQVlxRixRQUFRNkMsZUFBcEIsRUFBcUNqSSxFQUFyQyxDQUF3Q3hCLEtBQXhDLENBQThDLEtBQTlDO0VBQ0FpSjtFQUNELE9BVEg7RUFVRCxLQWpCSDtFQWtCRCxHQXBCRDs7RUFzQkE7RUFDQW5KLEtBQUcsa0VBQUgsRUFBdUUsZ0JBQVE7RUFDN0UsUUFBSTRHLGFBQWEwQyxZQUNmMUIsa0JBQWtCO0VBQ2hCOEIsMEJBQW9CLDhCQUFNO0VBQ3hCLGVBQU8sS0FBUDtFQUNEO0VBSGUsS0FBbEIsQ0FEZSxDQUFqQjtFQU9BOUMsZUFDR3pULEdBREgsQ0FDTztFQUNIa1UsV0FBSyx1QkFERjtFQUVITSxnQ0FBMEI7RUFGdkIsS0FEUCxFQUtHSixJQUxILENBS1EsWUFBVztFQUNmWCxpQkFDR3pULEdBREgsQ0FDTztFQUNIa1UsYUFBSyx1QkFERjtFQUVITSxrQ0FBMEI7RUFGdkIsT0FEUCxFQUtHSixJQUxILENBS1EsaUJBQWdDO0VBQUEsWUFBckJULE9BQXFCLFNBQXJCQSxPQUFxQjtFQUFBLFlBQVpDLFFBQVksU0FBWkEsUUFBWTs7RUFDcEN2RixhQUFLQyxNQUFMLENBQVlzRixTQUFTbUMsR0FBckIsRUFBMEJ4SCxFQUExQixDQUE2QnhCLEtBQTdCLENBQW1DLEdBQW5DO0VBQ0FzQixhQUFLQyxNQUFMLENBQVlxRixRQUFRNkMsZUFBcEIsRUFBcUNqSSxFQUFyQyxDQUF3Q3hCLEtBQXhDLENBQThDLEtBQTlDO0VBQ0FpSjtFQUNELE9BVEg7RUFVRCxLQWhCSDtFQWlCRCxHQXpCRDs7RUEyQkE7RUFDRCxDQTdFRDs7OzsifQ==
