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

  /*  */

  var setPrototypeOf = Object.setPrototypeOf;

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

  /*  */

  var getPrototypeOf = Object.getPrototypeOf;

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

  /*  */

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
        cachedApplication = superClass[cachedApplicationKey] = new Map();
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

  /*  */

  var freeze = Object.freeze;


  var classBuilder = (function () {
    var klass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
      function _class() {
        classCallCheck(this, _class);
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

  /**
   * The init object used to initialize a fetch Request.
   * See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
   */

  /**
   * A class for configuring HttpClients.
   */
  var Configurator = function () {
    function Configurator() {
      classCallCheck(this, Configurator);

      this.baseUrl = '';
      this.defaults = {};
      this.interceptors = [];
    }

    Configurator.prototype.withBaseUrl = function withBaseUrl(baseUrl) {
      this.baseUrl = baseUrl;
      return this;
    };

    Configurator.prototype.withDefaults = function withDefaults(defaults$$1) {
      this.defaults = defaults$$1;
      return this;
    };

    Configurator.prototype.withInterceptor = function withInterceptor(interceptor) {
      this.interceptors.push(interceptor);
      return this;
    };

    Configurator.prototype.withMixins = function withMixins() {
      for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
        mixins[_key] = arguments[_key];
      }

      this.mixins = mixins;
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
      Object.assign(this.defaults, standardConfig, this.defaults);
      return this.rejectErrorResponses();
    };

    Configurator.prototype.rejectErrorResponses = function rejectErrorResponses() {
      return this.withInterceptor({ response: rejectOnError });
    };

    return Configurator;
  }();

  var createConfig = (function () {
    return new Configurator();
  });

  function rejectOnError(response) {
    if (!response.ok) {
      throw response;
    }

    return response;
  }

  /*  */

  var applyInterceptors = (function (input) {
    var interceptors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var successName = arguments[2];
    var errorName = arguments[3];
    return interceptors.reduce(function (chain, interceptor) {
      var successHandler = interceptor[successName];
      var errorHandler = interceptor[errorName];
      return chain.then(successHandler && successHandler.bind(interceptor) || identity, errorHandler && errorHandler.bind(interceptor) || thrower);
    }, Promise.resolve(input));
  });

  function identity(x) {
    return x;
  }

  function thrower(x) {
    throw x;
  }

  /*  */

  var buildRequest = function buildRequest(input) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var config = arguments[2];

    var defaults = config.defaults || {};
    var request = void 0;
    var body = '';
    var requestContentType = void 0;
    var parsedDefaultHeaders = parseHeaderValues(defaults.headers);

    if (input instanceof Request) {
      request = input;
      requestContentType = new Headers(request.headers).get('Content-Type');
    } else {
      body = init.body;
      var bodyObj = body ? { body: body } : null;
      var requestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
      requestContentType = new Headers(requestInit.headers).get('Content-Type');
      request = new Request(getRequestUrl(config.baseUrl, input), requestInit);
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

  var processRequest = function processRequest(request, config) {
    return applyInterceptors(request, config.interceptors, 'request', 'requestError');
  };

  var processResponse = function processResponse(response, config) {
    return applyInterceptors(response, config.interceptors, 'response', 'responseError');
  };

  function parseHeaderValues(headers) {
    var parsedHeaders = {};
    for (var name in headers || {}) {
      if (headers.hasOwnProperty(name)) {
        // $FlowFixMe
        parsedHeaders[name] = is.function(headers[name]) ? headers[name]() : headers[name];
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

  /*  */

  var privates = createStorage();

  var FetchClient = function () {
  	function FetchClient(config) {
  		classCallCheck(this, FetchClient);

  		privates(this).config = config;
  	}

  	FetchClient.prototype.addInterceptor = function addInterceptor(interceptor) {
  		privates(this).config.withInterceptor(interceptor);
  	};

  	FetchClient.prototype.fetch = function (_fetch) {
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

  		var request = buildRequest(input, init, privates(this).config);

  		return processRequest(request, privates(this).config.interceptors).then(function (result) {
  			var response = void 0;

  			if (result instanceof Response) {
  				response = Promise.resolve(result);
  			} else if (result instanceof Request) {
  				request = result;
  				response = fetch(result);
  			} else {
  				throw new Error('An invalid result was returned by the interceptor chain. Expected a Request or Response instance');
  			}
  			return processResponse(response, privates(_this).config.interceptors);
  		}).then(function (result) {
  			if (result instanceof Request) {
  				return _this.fetch(result);
  			}
  			return result;
  		});
  	});

  	return FetchClient;
  }();

  /*  */

  var configure = (function (configure) {
    if (is.undefined(fetch)) {
      throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
    }
    var config = createConfig();
    configure(config);

    if (config.mixins && config.mixins.length > 0) {
      var FetchWithMixins = classBuilder(FetchClient).with.apply(null, config.mixins);
      return new FetchWithMixins(config);
    }

    return new FetchClient(config);
  });

  /*  */

  describe('http-client', function () {

  	describe('standard configure', function () {
  		var client = void 0;
  		beforeEach(function () {
  			client = configure(function (config) {
  				config.useStandardConfigurator();
  			});
  		});

  		it('able to make a GET request', function (done) {
  			client.fetch('/http-client-get-test').then(function (response) {
  				return response.json();
  			}).then(function (data) {
  				chai.expect(data.foo).to.equal('1');
  				done();
  			});
  		});

  		it('able to make a POST request', function (done) {
  			client.fetch('/http-client-post-test', {
  				method: 'POST',
  				body: JSON.stringify({ testData: '1' })
  			}).then(function (response) {
  				return response.json();
  			}).then(function (data) {
  				chai.expect(data.foo).to.equal('2');
  				done();
  			});
  		});
  	});

  	describe('mixin configure', function () {
  		var client = void 0;
  		beforeEach(function () {
  			client = configure(function (config) {
  				config.withMixins(mixin);
  			});
  		});

  		it('call mixin method', function () {
  			chai.expect(client.testMethod()).equal('test');
  		});
  	});
  });

  var mixin = function mixin(base) {
  	return function (_base) {
  		inherits(_class, _base);

  		function _class() {
  			classCallCheck(this, _class);
  			return possibleConstructorReturn(this, _base.apply(this, arguments));
  		}

  		_class.prototype.testMethod = function testMethod() {
  			return 'test';
  		};

  		return _class;
  	}(base);
  };

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL3VuaXF1ZS1pZC5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL2NvbW1vbnMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci91bndyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9hcHBseS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL3dyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWNsYXJlLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvaXMtYXBwbGljYXRpb24tb2YuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9oYXMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWR1cGUuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9jYWNoZS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL21peGluLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQvY29uZmlndXJhdG9yLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2FwcGx5LWludGVyY2VwdG9ycy5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9yZXF1ZXN0LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2ZldGNoLWNsaWVudC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9jb25maWd1cmUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9ICFbdHlwZW9mIHdpbmRvdywgdHlwZW9mIGRvY3VtZW50XS5pbmNsdWRlcyhcbiAgJ3VuZGVmaW5lZCdcbik7XG5cbmV4cG9ydCBjb25zdCBicm93c2VyID0gKGZuLCByYWlzZSA9IHRydWUpID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbiAgaWYgKHJhaXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2ZuLm5hbWV9IGZvciBicm93c2VyIHVzZSBvbmx5YCk7XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcihcbiAgKFxuICAgIHRhcmdldCxcbiAgICB0eXBlLFxuICAgIGxpc3RlbmVyLFxuICAgIGNhcHR1cmUgPSBmYWxzZVxuICApID0+IHtcbiAgICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdwcm9wZXJ0aWVzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2V2ZW50cy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gJ01hcCBTZXQgU3ltYm9sIEFycmF5IE9iamVjdCBTdHJpbmcgRGF0ZSBSZWdFeHAgRnVuY3Rpb24gQm9vbGVhbiBOdW1iZXIgTnVsbCBVbmRlZmluZWQgQXJndW1lbnRzIEVycm9yJy5zcGxpdChcbiAgJyAnXG4pO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcbmNvbnN0IGlzID0gc2V0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuXG5jb25zdCBjbG9uZSA9IGZ1bmN0aW9uKFxuICBzcmMsXG4gIGNpcmN1bGFycyA9IFtdLFxuICBjbG9uZXMgPSBbXVxuKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKHR5cGUuZGF0ZShzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNyYy5nZXRUaW1lKCkpO1xuICB9XG5cbiAgLy8gUmVnRXhwXG4gIGlmICh0eXBlLnJlZ2V4cChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc3JjKTtcbiAgfVxuXG4gIC8vIEFycmF5c1xuICBpZiAodHlwZS5hcnJheShzcmMpKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAoY2xvbmUpO1xuICB9XG5cbiAgLy8gRVM2IE1hcHNcbiAgaWYgKHR5cGUubWFwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHNyYy5lbnRyaWVzKCkpKTtcbiAgfVxuXG4gIC8vIEVTNiBTZXRzXG4gIGlmICh0eXBlLnNldChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbShzcmMudmFsdWVzKCkpKTtcbiAgfVxuXG4gIC8vIE9iamVjdFxuICBpZiAodHlwZS5vYmplY3Qoc3JjKSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHNyYyk7XG4gICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShzcmMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHNyYykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHNyY1trZXldKTtcbiAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHNyY1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xvbmU7XG5cbmV4cG9ydCBjb25zdCBqc29uQ2xvbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn07XG4iLCJpbXBvcnQgY2xvbmUsIHsganNvbkNsb25lIH0gZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiwgcmV0dXJucyB0aGUgc2FtZSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGpzb25DbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihqc29uQ2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuXG5sZXQgcHJldlRpbWVJZCA9IDA7XG5sZXQgcHJldlVuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgKHByZWZpeCkgPT4ge1xuICBsZXQgbmV3VW5pcXVlSWQgPSBEYXRlLm5vdygpO1xuICBpZiAobmV3VW5pcXVlSWQgPT09IHByZXZUaW1lSWQpIHtcbiAgICArK3ByZXZVbmlxdWVJZDtcbiAgfSBlbHNlIHtcbiAgICBwcmV2VGltZUlkID0gbmV3VW5pcXVlSWQ7XG4gICAgcHJldlVuaXF1ZUlkID0gMDtcbiAgfVxuXG4gIGxldCB1bmlxdWVJZCA9IGAke1N0cmluZyhuZXdVbmlxdWVJZCl9JHtTdHJpbmcocHJldlVuaXF1ZUlkKX1gO1xuICBpZiAocHJlZml4KSB7XG4gICAgdW5pcXVlSWQgPSBgJHtwcmVmaXh9XyR7dW5pcXVlSWR9YDtcbiAgfVxuICByZXR1cm4gdW5pcXVlSWQ7XG59O1xuIiwiLyogICovXG5pbXBvcnQgdW5pcXVlSWQgZnJvbSAnLi4vdW5pcXVlLWlkLmpzJztcblxuLy8gdXNlZCBieSB3cmFwKCkgYW5kIHVud3JhcCgpXG5leHBvcnQgY29uc3Qgd3JhcHBlZE1peGluS2V5ID0gdW5pcXVlSWQoJ193cmFwcGVkTWl4aW4nKTtcblxuLy8gdXNlZCBieSBhcHBseSgpIGFuZCBpc0FwcGxpY2F0aW9uT2YoKVxuZXhwb3J0IGNvbnN0IGFwcGxpZWRNaXhpbktleSA9IHVuaXF1ZUlkKCdfYXBwbGllZE1peGluJyk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IHdyYXBwZWRNaXhpbktleSB9IGZyb20gJy4vY29tbW9ucy5qcyc7XG5cbi8qKlxuICogVW53cmFwcyB0aGUgZnVuY3Rpb24gYHdyYXBwZXJgIHRvIHJldHVybiB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd3JhcHBlZCBieVxuICogb25lIG9yIG1vcmUgY2FsbHMgdG8gYHdyYXBgLiBSZXR1cm5zIGB3cmFwcGVyYCBpZiBpdCdzIG5vdCBhIHdyYXBwZWRcbiAqIGZ1bmN0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBBIHdyYXBwZWQgbWl4aW4gcHJvZHVjZWQgYnkge0BsaW5rIHdyYXB9XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIG9yaWdpbmFsbHkgd3JhcHBlZCBtaXhpblxuICovXG5leHBvcnQgZGVmYXVsdCAod3JhcHBlcikgPT5cbiAgd3JhcHBlclt3cmFwcGVkTWl4aW5LZXldIHx8IHdyYXBwZXI7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFwcGxpZWRNaXhpbktleSB9IGZyb20gJy4vY29tbW9ucy5qcyc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4vdW53cmFwLmpzJztcblxuLyoqXG4gKiBBcHBsaWVzIGBtaXhpbmAgdG8gYHN1cGVyY2xhc3NgLlxuICpcbiAqIGBhcHBseWAgc3RvcmVzIGEgcmVmZXJlbmNlIGZyb20gdGhlIG1peGluIGFwcGxpY2F0aW9uIHRvIHRoZSB1bndyYXBwZWQgbWl4aW5cbiAqIHRvIG1ha2UgYGlzQXBwbGljYXRpb25PZmAgYW5kIGBoYXNNaXhpbmAgd29yay5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWZ1bGwgZm9yIG1peGluIHdyYXBwZXJzIHRoYXQgd2FudCB0byBhdXRvbWF0aWNhbGx5IGVuYWJsZVxuICoge0BsaW5rIGhhc01peGlufSBzdXBwb3J0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3VwZXJDbGFzcyBBIGNsYXNzIG9yIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBUaGUgbWl4aW4gdG8gYXBwbHlcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIHN1YmNsYXNzIG9mIGBzdXBlcmNsYXNzYCBwcm9kdWNlZCBieSBgbWl4aW5gXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChzdXBlckNsYXNzLCBtaXhpbikgPT4ge1xuICBsZXQgYXBwbGljYXRpb24gPSBtaXhpbihzdXBlckNsYXNzKTtcbiAgY29uc3QgcHJvdG8gPSBhcHBsaWNhdGlvbi5wcm90b3R5cGU7XG4gIHByb3RvW2FwcGxpZWRNaXhpbktleV0gPSB1bndyYXAobWl4aW4pO1xuICByZXR1cm4gYXBwbGljYXRpb247XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyB3cmFwcGVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuXG5jb25zdCB7IHNldFByb3RvdHlwZU9mIH0gPSBPYmplY3Q7XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgZnVuY3Rpb24gYG1peGluYCB0byBiZSB3cmFwcGVkIGJ5IHRoZSBmdW5jdGlvbiBgd3JhcHBlcmAsIHdoaWxlXG4gKiBhbGxvd2luZyBwcm9wZXJ0aWVzIG9uIGBtaXhpbmAgdG8gYmUgYXZhaWxhYmxlIHZpYSBgd3JhcHBlcmAsIGFuZCBhbGxvd2luZ1xuICogYHdyYXBwZXJgIHRvIGJlIHVud3JhcHBlZCB0byBnZXQgdG8gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICpcbiAqIGB3cmFwYCBkb2VzIHR3byB0aGluZ3M6XG4gKiAgIDEuIFNldHMgdGhlIHByb3RvdHlwZSBvZiBgbWl4aW5gIHRvIGB3cmFwcGVyYCBzbyB0aGF0IHByb3BlcnRpZXMgc2V0IG9uXG4gKiAgICAgIGBtaXhpbmAgaW5oZXJpdGVkIGJ5IGB3cmFwcGVyYC5cbiAqICAgMi4gU2V0cyBhIHNwZWNpYWwgcHJvcGVydHkgb24gYG1peGluYCB0aGF0IHBvaW50cyBiYWNrIHRvIGBtaXhpbmAgc28gdGhhdFxuICogICAgICBpdCBjYW4gYmUgcmV0cmVpdmVkIGZyb20gYHdyYXBwZXJgXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBBIG1peGluIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB3cmFwcGVyIEEgZnVuY3Rpb24gdGhhdCB3cmFwcyB7QGxpbmsgbWl4aW59XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYHdyYXBwZXJgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChtaXhpbiwgd3JhcHBlcikgPT4ge1xuICBzZXRQcm90b3R5cGVPZih3cmFwcGVyLCBtaXhpbik7XG4gIGlmICghbWl4aW5bd3JhcHBlZE1peGluS2V5XSkge1xuICAgIG1peGluW3dyYXBwZWRNaXhpbktleV0gPSBtaXhpbjtcbiAgfVxuICByZXR1cm4gd3JhcHBlcjtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBhcHBseSBmcm9tICcuL2FwcGx5LmpzJztcbmltcG9ydCB3cmFwIGZyb20gJy4vd3JhcC5qcyc7XG5cbi8qKlxuICogQSBiYXNpYyBtaXhpbiBkZWNvcmF0b3IgdGhhdCBhcHBsaWVzIHRoZSBtaXhpbiB3aXRoIHtAbGluayBhcHBseU1peGlufSBzbyB0aGF0IGl0XG4gKiBjYW4gYmUgdXNlZCB3aXRoIHtAbGluayBpc0FwcGxpY2F0aW9uT2Z9LCB7QGxpbmsgaGFzTWl4aW59IGFuZCB0aGUgb3RoZXJcbiAqIG1peGluIGRlY29yYXRvciBmdW5jdGlvbnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBUaGUgbWl4aW4gdG8gd3JhcFxuICogQHJldHVybiB7RnVuY3Rpb259IGEgbmV3IG1peGluIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChtaXhpbikgPT5cbiAgd3JhcChtaXhpbiwgKHN1cGVyQ2xhc3MpID0+IGFwcGx5KHN1cGVyQ2xhc3MsIG1peGluKSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFwcGxpZWRNaXhpbktleSB9IGZyb20gJy4vY29tbW9ucy5qcyc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4vdW53cmFwLmpzJztcblxuY29uc3QgeyBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmZiBgcHJvdG9gIGlzIGEgcHJvdG90eXBlIGNyZWF0ZWQgYnkgdGhlIGFwcGxpY2F0aW9uIG9mXG4gKiBgbWl4aW5gIHRvIGEgc3VwZXJjbGFzcy5cbiAqXG4gKiBgaXNBcHBsaWNhdGlvbk9mYCB3b3JrcyBieSBjaGVja2luZyB0aGF0IGBwcm90b2AgaGFzIGEgcmVmZXJlbmNlIHRvIGBtaXhpbmBcbiAqIGFzIGNyZWF0ZWQgYnkgYGFwcGx5YC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90byBBIHByb3RvdHlwZSBvYmplY3QgY3JlYXRlZCBieSB7QGxpbmsgYXBwbHl9LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gQSBtaXhpbiBmdW5jdGlvbiB1c2VkIHdpdGgge0BsaW5rIGFwcGx5fS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgYHByb3RvYCBpcyBhIHByb3RvdHlwZSBjcmVhdGVkIGJ5IHRoZSBhcHBsaWNhdGlvbiBvZlxuICogYG1peGluYCB0byBhIHN1cGVyY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKHByb3RvLCBtaXhpbikgPT4ge1xuICByZXR1cm4gKFxuICAgIGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGFwcGxpZWRNaXhpbktleSkgJiZcbiAgICBwcm90b1thcHBsaWVkTWl4aW5LZXldID09PSB1bndyYXAobWl4aW4pXG4gICk7XG59O1xuIiwiLyogICovXG5pbXBvcnQgaXNBcHBsaWNhdGlvbk9mIGZyb20gJy4vaXMtYXBwbGljYXRpb24tb2YuanMnO1xuXG5jb25zdCB7IGdldFByb3RvdHlwZU9mIH0gPSBPYmplY3Q7XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaWZmIGBvYCBoYXMgYW4gYXBwbGljYXRpb24gb2YgYG1peGluYCBvbiBpdHMgcHJvdG90eXBlXG4gKiBjaGFpbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvIEFuIG9iamVjdFxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gQSBtaXhpbiBhcHBsaWVkIHdpdGgge0BsaW5rIGFwcGx5fVxuICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciBgb2AgaGFzIGFuIGFwcGxpY2F0aW9uIG9mIGBtaXhpbmAgb24gaXRzIHByb3RvdHlwZVxuICogY2hhaW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG8sIG1peGluKSA9PiB7XG4gIHdoaWxlIChvICE9PSBudWxsKSB7XG4gICAgaWYgKGlzQXBwbGljYXRpb25PZihvLCBtaXhpbikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBvID0gZ2V0UHJvdG90eXBlT2Yobyk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGhhcyBmcm9tICcuL2hhcy5qcyc7XG5pbXBvcnQgd3JhcCBmcm9tICcuL3dyYXAuanMnO1xuXG4vKipcbiAqIERlY29yYXRlcyBgbWl4aW5gIHNvIHRoYXQgaXQgb25seSBhcHBsaWVzIGlmIGl0J3Mgbm90IGFscmVhZHkgb24gdGhlXG4gKiBwcm90b3R5cGUgY2hhaW4uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpbiBUaGUgbWl4aW4gdG8gd3JhcCB3aXRoIGRlZHVwbGljYXRpb24gYmVoYXZpb3JcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhIG5ldyBtaXhpbiBmdW5jdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+IHtcbiAgcmV0dXJuIHdyYXAoXG4gICAgbWl4aW4sXG4gICAgKHN1cGVyQ2xhc3MpID0+XG4gICAgICBoYXMoc3VwZXJDbGFzcy5wcm90b3R5cGUsIG1peGluKSA/IHN1cGVyQ2xhc3MgOiBtaXhpbihzdXBlckNsYXNzKVxuICApO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4uL3VuaXF1ZS1pZC5qcyc7XG5pbXBvcnQgd3JhcCBmcm9tICcuL3dyYXAuanMnO1xuXG5jb25zdCBjYWNoZWRBcHBsaWNhdGlvbktleSA9IHVuaXF1ZUlkKCdfY2FjaGVkQXBwbGljYXRpb24nKTtcblxuLyoqXG4gKiBEZWNvcmF0ZSB0aGUgZ2l2ZW4gbWl4aW4gY2xhc3Mgd2l0aCBhIFwiY2FjaGVkIGRlY29yYXRvclwiLlxuICpcbiAqIE1ldGhvZCB3aWxsIGVuc3VyZSB0aGF0IGlmIHRoZSBnaXZlbiBtaXhpbiBoYXMgYWxyZWFkeSBiZWVuIGFwcGxpZWQsXG4gKiB0aGVuIGl0IHdpbGwgYmUgcmV0dXJuZWQgLyBhcHBsaWVkIGEgc2luZ2xlIHRpbWUsIHJhdGhlciB0aGFuIG11bHRpcGxlXG4gKiB0aW1lcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtaXhpblxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+IHtcbiAgcmV0dXJuIHdyYXAobWl4aW4sIChzdXBlckNsYXNzKSA9PiB7XG4gICAgbGV0IGNhY2hlZEFwcGxpY2F0aW9uID0gc3VwZXJDbGFzc1tjYWNoZWRBcHBsaWNhdGlvbktleV07XG4gICAgaWYgKCFjYWNoZWRBcHBsaWNhdGlvbikge1xuICAgICAgY2FjaGVkQXBwbGljYXRpb24gPSBzdXBlckNsYXNzW2NhY2hlZEFwcGxpY2F0aW9uS2V5XSA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgbGV0IGFwcGxpY2F0aW9uID0gY2FjaGVkQXBwbGljYXRpb24uZ2V0KG1peGluKTtcbiAgICBpZiAoIWFwcGxpY2F0aW9uKSB7XG4gICAgICBhcHBsaWNhdGlvbiA9IG1peGluKHN1cGVyQ2xhc3MpO1xuICAgICAgY2FjaGVkQXBwbGljYXRpb24uc2V0KG1peGluLCBhcHBsaWNhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBhcHBsaWNhdGlvbjtcbiAgfSk7XG59O1xuIiwiLyogICovXG5pbXBvcnQgZGVjbGFyZSBmcm9tICcuL2RlY2xhcmUuanMnO1xuaW1wb3J0IGRlZHVwZSBmcm9tICcuL2RlZHVwZS5qcyc7XG5pbXBvcnQgY2FjaGUgZnJvbSAnLi9jYWNoZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChtaXhpbikgPT4gZGVkdXBlKGNhY2hlKGRlY2xhcmUobWl4aW4pKSk7XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVNaXhpbiBmcm9tICcuL2NsYXNzLWJ1aWxkZXIvbWl4aW4uanMnO1xuXG5jb25zdCB7IGZyZWV6ZSB9ID0gT2JqZWN0O1xuXG5cbmV4cG9ydCBkZWZhdWx0IChrbGFzcyA9IGNsYXNzIHt9KSA9PlxuICBmcmVlemUoe1xuICAgIHdpdGgoLi4ubWl4aW5zKSB7XG4gICAgICByZXR1cm4gbWl4aW5zXG4gICAgICAgIC5tYXAoKG1peGluKSA9PiBjcmVhdGVNaXhpbihtaXhpbikpXG4gICAgICAgIC5yZWR1Y2UoKGssIG0pID0+IG0oayksIGtsYXNzKTtcbiAgICB9XG4gIH0pO1xuIiwiLyogICovXG5cblxuLyoqXG4gKiBUaGUgaW5pdCBvYmplY3QgdXNlZCB0byBpbml0aWFsaXplIGEgZmV0Y2ggUmVxdWVzdC5cbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdC9SZXF1ZXN0XG4gKi9cblxuLyoqXG4gKiBBIGNsYXNzIGZvciBjb25maWd1cmluZyBIdHRwQ2xpZW50cy5cbiAqL1xuY2xhc3MgQ29uZmlndXJhdG9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmJhc2VVcmwgPSAnJztcbiAgICB0aGlzLmRlZmF1bHRzID0ge307XG4gICAgdGhpcy5pbnRlcmNlcHRvcnMgPSBbXTtcbiAgfVxuXG4gIHdpdGhCYXNlVXJsKGJhc2VVcmwpIHtcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aERlZmF1bHRzKGRlZmF1bHRzKSB7XG4gICAgdGhpcy5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aEludGVyY2VwdG9yKGludGVyY2VwdG9yKSB7XG4gICAgdGhpcy5pbnRlcmNlcHRvcnMucHVzaChpbnRlcmNlcHRvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoTWl4aW5zKC4uLm1peGlucykge1xuICAgIHRoaXMubWl4aW5zID0gbWl4aW5zO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKSB7XG4gICAgbGV0IHN0YW5kYXJkQ29uZmlnID0ge1xuICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSSdcbiAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5kZWZhdWx0cywgc3RhbmRhcmRDb25maWcsIHRoaXMuZGVmYXVsdHMpO1xuICAgIHJldHVybiB0aGlzLnJlamVjdEVycm9yUmVzcG9uc2VzKCk7XG4gIH1cblxuICByZWplY3RFcnJvclJlc3BvbnNlcygpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoSW50ZXJjZXB0b3IoeyByZXNwb25zZTogcmVqZWN0T25FcnJvciB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBuZXcgQ29uZmlndXJhdG9yKCk7XG5cbmZ1bmN0aW9uIHJlamVjdE9uRXJyb3IocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHRocm93IHJlc3BvbnNlO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgaW5wdXQsXG4gIGludGVyY2VwdG9ycyA9IFtdLFxuICBzdWNjZXNzTmFtZSxcbiAgZXJyb3JOYW1lXG4pID0+XG4gIGludGVyY2VwdG9ycy5yZWR1Y2UoKGNoYWluLCBpbnRlcmNlcHRvcikgPT4ge1xuICAgIGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdO1xuICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IGludGVyY2VwdG9yW2Vycm9yTmFtZV07XG4gICAgcmV0dXJuIGNoYWluLnRoZW4oXG4gICAgICAgIChzdWNjZXNzSGFuZGxlciAmJiBzdWNjZXNzSGFuZGxlci5iaW5kKGludGVyY2VwdG9yKSkgfHwgaWRlbnRpdHksXG4gICAgICAgIChlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCB0aHJvd2VyXG4gICAgKTtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKGlucHV0KSk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbmZ1bmN0aW9uIHRocm93ZXIoeCkge1xuICB0aHJvdyB4O1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCB7IH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuaW1wb3J0IGFwcGx5SW50ZXJjZXB0b3JzIGZyb20gJy4vYXBwbHktaW50ZXJjZXB0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVxdWVzdCA9IChcbiAgaW5wdXQsXG4gIGluaXQgPSB7fSxcbiAgY29uZmlnXG4pID0+IHtcbiAgbGV0IGRlZmF1bHRzID0gY29uZmlnLmRlZmF1bHRzIHx8IHt9O1xuICBsZXQgcmVxdWVzdDtcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IHJlcXVlc3RDb250ZW50VHlwZTtcbiAgbGV0IHBhcnNlZERlZmF1bHRIZWFkZXJzID0gcGFyc2VIZWFkZXJWYWx1ZXMoZGVmYXVsdHMuaGVhZGVycyk7XG5cbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gIH0gZWxzZSB7XG4gICAgYm9keSA9IGluaXQuYm9keTtcbiAgICBsZXQgYm9keU9iaiA9IGJvZHkgPyB7IGJvZHkgfSA6IG51bGw7XG4gICAgbGV0IHJlcXVlc3RJbml0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHsgaGVhZGVyczoge30gfSwgaW5pdCwgYm9keU9iaik7XG4gICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdEluaXQuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoZ2V0UmVxdWVzdFVybChjb25maWcuYmFzZVVybCwgaW5wdXQpLCByZXF1ZXN0SW5pdCk7XG4gIH1cbiAgaWYgKCFyZXF1ZXN0Q29udGVudFR5cGUpIHtcbiAgICBpZiAobmV3IEhlYWRlcnMocGFyc2VkRGVmYXVsdEhlYWRlcnMpLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgICB9IGVsc2UgaWYgKGJvZHkgJiYgaXNKU09OKFN0cmluZyhib2R5KSkpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfVxuICB9XG4gIHNldERlZmF1bHRIZWFkZXJzKHJlcXVlc3QuaGVhZGVycywgcGFyc2VkRGVmYXVsdEhlYWRlcnMpO1xuICBpZiAoYm9keSAmJiBib2R5IGluc3RhbmNlb2YgQmxvYiAmJiBib2R5LnR5cGUpIHtcbiAgICAvLyB3b3JrIGFyb3VuZCBidWcgaW4gSUUgJiBFZGdlIHdoZXJlIHRoZSBCbG9iIHR5cGUgaXMgaWdub3JlZCBpbiB0aGUgcmVxdWVzdFxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvMjEzNjE2M1xuICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGJvZHkudHlwZSk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1JlcXVlc3QgPSAocmVxdWVzdCwgY29uZmlnKSA9PlxuICBhcHBseUludGVyY2VwdG9ycyhyZXF1ZXN0LCBjb25maWcuaW50ZXJjZXB0b3JzLCAncmVxdWVzdCcsICdyZXF1ZXN0RXJyb3InKTtcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXNwb25zZSA9IChcbiAgcmVzcG9uc2UsXG4gIGNvbmZpZ1xuKSA9PiBhcHBseUludGVyY2VwdG9ycyhyZXNwb25zZSwgY29uZmlnLmludGVyY2VwdG9ycywgJ3Jlc3BvbnNlJywgJ3Jlc3BvbnNlRXJyb3InKTtcblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJWYWx1ZXMoaGVhZGVycykge1xuICBsZXQgcGFyc2VkSGVhZGVycyA9IHt9O1xuICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcGFyc2VkSGVhZGVyc1tuYW1lXSA9IHR5cGUuZnVuY3Rpb24oaGVhZGVyc1tuYW1lXSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQge2J1aWxkUmVxdWVzdCwgcHJvY2Vzc1JlcXVlc3QsIHByb2Nlc3NSZXNwb25zZX0gZnJvbSAnLi9yZXF1ZXN0LmpzJztcblxuXG5jb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuZXhwb3J0IGNsYXNzIEZldGNoQ2xpZW50IHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0cHJpdmF0ZXModGhpcykuY29uZmlnID0gY29uZmlnO1xuXHR9XG5cblx0YWRkSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpIHtcblx0XHRwcml2YXRlcyh0aGlzKS5jb25maWcud2l0aEludGVyY2VwdG9yKGludGVyY2VwdG9yKTtcblx0fVxuXG5cdGZldGNoKGlucHV0LCBpbml0ID0ge30pIHtcblx0XHRsZXQgcmVxdWVzdCA9IGJ1aWxkUmVxdWVzdChpbnB1dCwgaW5pdCwgcHJpdmF0ZXModGhpcykuY29uZmlnKTtcblxuXHRcdHJldHVybiBwcm9jZXNzUmVxdWVzdChyZXF1ZXN0LCBwcml2YXRlcyh0aGlzKS5jb25maWcuaW50ZXJjZXB0b3JzKVxuXHRcdFx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRsZXQgcmVzcG9uc2U7XG5cblx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmVzcG9uc2UgPSBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG5cdFx0XHRcdFx0cmVxdWVzdCA9IHJlc3VsdDtcblx0XHRcdFx0XHRyZXNwb25zZSA9IGZldGNoKHJlc3VsdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0YEFuIGludmFsaWQgcmVzdWx0IHdhcyByZXR1cm5lZCBieSB0aGUgaW50ZXJjZXB0b3IgY2hhaW4uIEV4cGVjdGVkIGEgUmVxdWVzdCBvciBSZXNwb25zZSBpbnN0YW5jZWBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UsIHByaXZhdGVzKHRoaXMpLmNvbmZpZy5pbnRlcmNlcHRvcnMpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChyZXN1bHQpID0+IHtcblx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mZXRjaChyZXN1bHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9KTtcblx0fVxufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCBjbGFzc0J1aWxkZXIgZnJvbSAnLi4vY2xhc3MtYnVpbGRlci5qcyc7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGNyZWF0ZUNvbmZpZyB9IGZyb20gJy4vY29uZmlndXJhdG9yLmpzJztcbmltcG9ydCB7IEZldGNoQ2xpZW50fSBmcm9tICcuL2ZldGNoLWNsaWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChjb25maWd1cmUpID0+IHtcbiAgaWYgKHR5cGUudW5kZWZpbmVkKGZldGNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIik7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuXG4gIGlmIChjb25maWcubWl4aW5zICYmIGNvbmZpZy5taXhpbnMubGVuZ3RoID4gMCkge1xuICAgIGxldCBGZXRjaFdpdGhNaXhpbnMgPSBjbGFzc0J1aWxkZXIoRmV0Y2hDbGllbnQpLndpdGguYXBwbHkobnVsbCwgY29uZmlnLm1peGlucyk7XG4gICAgcmV0dXJuIG5ldyBGZXRjaFdpdGhNaXhpbnMoY29uZmlnKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRmV0Y2hDbGllbnQoY29uZmlnKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBjb25maWd1cmUgZnJvbSAnLi9odHRwLWNsaWVudC9jb25maWd1cmUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWd1cmU7XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vbGliL2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50JywgKCkgPT4ge1xuXG5cdGRlc2NyaWJlKCdzdGFuZGFyZCBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy51c2VTdGFuZGFyZENvbmZpZ3VyYXRvcigpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QnLCBkb25lID0+IHtcblx0XHRcdGNsaWVudC5mZXRjaCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdH0pXG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0JywgZG9uZSA9PiB7XG5cdFx0XHRjbGllbnQuZmV0Y2goJy9odHRwLWNsaWVudC1wb3N0LXRlc3QnLCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IHRlc3REYXRhOiAnMScgfSlcblx0XHRcdH0pXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcyJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdtaXhpbiBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy53aXRoTWl4aW5zKG1peGluKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0aXQoJ2NhbGwgbWl4aW4gbWV0aG9kJywgKCkgPT4ge1xuXHRcdFx0Y2hhaS5leHBlY3QoY2xpZW50LnRlc3RNZXRob2QoKSkuZXF1YWwoJ3Rlc3QnKTtcblx0XHR9KTtcblx0fSk7XG59KTtcblxuY29uc3QgbWl4aW4gPSAoYmFzZSkgPT4gY2xhc3MgZXh0ZW5kcyBiYXNlIHtcblx0dGVzdE1ldGhvZCgpIHtcblx0XHRyZXR1cm4gJ3Rlc3QnO1xuXHR9XG59OyJdLCJuYW1lcyI6WyJpc0Jyb3dzZXIiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImluY2x1ZGVzIiwiYnJvd3NlciIsImZuIiwicmFpc2UiLCJFcnJvciIsIm5hbWUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwibWljcm9UYXNrRmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsIm1pY3JvVGFzayIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJwb3AiLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiY3JlYXRlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJpbm5lckhUTUwiLCJpdCIsImFzc2VydCIsImVxdWFsIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiYSIsImRlZXAiLCJib2R5IiwidGVtcGxhdGUiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsImVsIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImFyciIsInNvbWUiLCJldmVyeSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJpcyIsInNldHVwIiwiY2hlY2tzIiwiZ2V0VHlwZSIsIm1hdGNoZXMiLCJjbG9uZSIsInNyYyIsImNpcmN1bGFycyIsImNsb25lcyIsIm9iamVjdCIsImZ1bmN0aW9uIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwia2V5IiwiZmluZEluZGV4IiwianNvbkNsb25lIiwiZSIsImJlIiwibnVsbCIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsInN0cmluZyIsInByZXZUaW1lSWQiLCJwcmV2VW5pcXVlSWQiLCJwcmVmaXgiLCJuZXdVbmlxdWVJZCIsIm5vdyIsInVuaXF1ZUlkIiwid3JhcHBlZE1peGluS2V5IiwiYXBwbGllZE1peGluS2V5Iiwid3JhcHBlciIsInN1cGVyQ2xhc3MiLCJtaXhpbiIsImFwcGxpY2F0aW9uIiwidW53cmFwIiwic2V0UHJvdG90eXBlT2YiLCJ3cmFwIiwibyIsImlzQXBwbGljYXRpb25PZiIsImhhcyIsImNhY2hlZEFwcGxpY2F0aW9uS2V5IiwiY2FjaGVkQXBwbGljYXRpb24iLCJkZWR1cGUiLCJjYWNoZSIsImRlY2xhcmUiLCJmcmVlemUiLCJ3aXRoIiwibWl4aW5zIiwiY3JlYXRlTWl4aW4iLCJyZWR1Y2UiLCJrIiwibSIsIkNvbmZpZ3VyYXRvciIsImJhc2VVcmwiLCJkZWZhdWx0cyIsImludGVyY2VwdG9ycyIsIndpdGhCYXNlVXJsIiwid2l0aERlZmF1bHRzIiwid2l0aEludGVyY2VwdG9yIiwiaW50ZXJjZXB0b3IiLCJ3aXRoTWl4aW5zIiwidXNlU3RhbmRhcmRDb25maWd1cmF0b3IiLCJzdGFuZGFyZENvbmZpZyIsIm1vZGUiLCJjcmVkZW50aWFscyIsImhlYWRlcnMiLCJBY2NlcHQiLCJyZWplY3RFcnJvclJlc3BvbnNlcyIsInJlc3BvbnNlIiwicmVqZWN0T25FcnJvciIsIm9rIiwiaW5wdXQiLCJzdWNjZXNzTmFtZSIsImVycm9yTmFtZSIsImNoYWluIiwic3VjY2Vzc0hhbmRsZXIiLCJlcnJvckhhbmRsZXIiLCJ0aGVuIiwiaWRlbnRpdHkiLCJ0aHJvd2VyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ4IiwiYnVpbGRSZXF1ZXN0IiwiaW5pdCIsInJlcXVlc3QiLCJyZXF1ZXN0Q29udGVudFR5cGUiLCJwYXJzZWREZWZhdWx0SGVhZGVycyIsInBhcnNlSGVhZGVyVmFsdWVzIiwiUmVxdWVzdCIsIkhlYWRlcnMiLCJib2R5T2JqIiwicmVxdWVzdEluaXQiLCJnZXRSZXF1ZXN0VXJsIiwiaXNKU09OIiwic2V0RGVmYXVsdEhlYWRlcnMiLCJCbG9iIiwicHJvY2Vzc1JlcXVlc3QiLCJhcHBseUludGVyY2VwdG9ycyIsInByb2Nlc3NSZXNwb25zZSIsInBhcnNlZEhlYWRlcnMiLCJhYnNvbHV0ZVVybFJlZ2V4cCIsInVybCIsInRlc3QiLCJkZWZhdWx0SGVhZGVycyIsInN0ciIsIkZldGNoQ2xpZW50IiwiYWRkSW50ZXJjZXB0b3IiLCJmZXRjaCIsInJlc3VsdCIsIlJlc3BvbnNlIiwiY29uZmlndXJlIiwiY3JlYXRlQ29uZmlnIiwiRmV0Y2hXaXRoTWl4aW5zIiwiY2xhc3NCdWlsZGVyIiwiY2xpZW50IiwiYmVmb3JlRWFjaCIsImh0dHBDbGllbnRGYWN0b3J5IiwianNvbiIsImZvbyIsImRvbmUiLCJ0ZXN0RGF0YSIsInRlc3RNZXRob2QiLCJiYXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEVBQU8sSUFBTUEsWUFBWSxDQUFDLFFBQVFDLE1BQVIseUNBQVFBLE1BQVIsVUFBdUJDLFFBQXZCLHlDQUF1QkEsUUFBdkIsR0FBaUNDLFFBQWpDLENBQ3hCLFdBRHdCLENBQW5COztBQUlQLEVBQU8sSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLEVBQUQ7RUFBQSxNQUFLQyxLQUFMLHVFQUFhLElBQWI7RUFBQSxTQUFzQixZQUV4QztFQUNILFFBQUlOLFNBQUosRUFBZTtFQUNiLGFBQU9LLDhCQUFQO0VBQ0Q7RUFDRCxRQUFJQyxLQUFKLEVBQVc7RUFDVCxZQUFNLElBQUlDLEtBQUosQ0FBYUYsR0FBR0csSUFBaEIsMkJBQU47RUFDRDtFQUNGLEdBVHNCO0VBQUEsQ0FBaEI7O0VDTFA7QUFDQSx1QkFBZSxZQUVWO0VBQUEsTUFESEMsT0FDRyx1RUFET0MsT0FBT0MsTUFBUCxDQUFjQyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEVBQS9CLENBQ1A7O0VBQ0gsTUFBSUMsUUFBUSxJQUFJQyxPQUFKLEVBQVo7RUFDQSxTQUFPLFVBQUNDLEdBQUQsRUFBUztFQUNkLFFBQUlDLFFBQVFILE1BQU1JLEdBQU4sQ0FBVUYsR0FBVixDQUFaO0VBQ0EsUUFBSSxDQUFDQyxLQUFMLEVBQVk7RUFDVkgsWUFBTUssR0FBTixDQUFVSCxHQUFWLEVBQWdCQyxRQUFRUCxRQUFRTSxHQUFSLENBQXhCO0VBQ0Q7RUFDRCxXQUFPQyxLQUFQ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
