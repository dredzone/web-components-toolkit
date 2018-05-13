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

  	Configurator.prototype.useStandardConfigurator = function useStandardConfigurator() {
  		var standardConfig = { credentials: 'same-origin' };
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

  var buildRequest = (function (input, init, config) {
  	var defaults = config.defaults || {};
  	var request = void 0;
  	var body = '';
  	var requestContentType = void 0;

  	var parsedDefaultHeaders = parseHeaderValues(defaults.headers);
  	if (input instanceof Request) {
  		request = input;
  		requestContentType = new Headers(request.headers).get('Content-Type');
  	} else {
  		init || (init = {});
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
  });

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

  var applyInterceptors = (function (input) {
  	for (var _len = arguments.length, interceptorArgs = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
  		interceptorArgs[_key - 4] = arguments[_key];
  	}

  	var interceptors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  	var successName = arguments[2];
  	var errorName = arguments[3];
  	return interceptors.reduce(function (chain, interceptor) {
  		// $FlowFixMe
  		var successHandler = interceptor[successName] && interceptor[successName].bind(interceptor);
  		// $FlowFixMe
  		var errorHandler = interceptor[errorName] && interceptor[errorName].bind(interceptor);

  		return chain.then(successHandler && function (value) {
  			return successHandler.apply(undefined, [value].concat(interceptorArgs));
  		} || identity, errorHandler && function (reason) {
  			return errorHandler.apply(undefined, [reason].concat(interceptorArgs));
  		} || thrower);
  	}, Promise.resolve(input));
  });

  function identity(x) {
  	return x;
  }

  function thrower(x) {
  	throw x;
  }

  /*  */

  var createFetch = (function (configure) {
  	if (is.undefined(fetch)) {
  		throw new Error('Requires Fetch API implementation, but the current environment doesn\'t support it.');
  	}
  	var config = createConfig();
  	configure(config);

  	var fetchApi = function fetchApi(input) {
  		var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  		var request = buildRequest(input, init, config);

  		return processRequest(request, config).then(function (result) {
  			var response = void 0;

  			if (result instanceof Response) {
  				response = Promise.resolve(result);
  			} else if (result instanceof Request) {
  				request = result;
  				response = fetch(result);
  			} else {
  				throw new Error('An invalid result was returned by the interceptor chain. Expected a Request or Response instance');
  			}

  			return processResponse(response, request, config);
  		}).then(function (result) {
  			if (result instanceof Request) {
  				return fetchApi(result);
  			}
  			return result;
  		});
  	};

  	return fetchApi;
  });

  function processRequest(request, config) {
  	return applyInterceptors(request, config.interceptors, 'request', 'requestError', config);
  }

  function processResponse(response, request, config) {
  	return applyInterceptors(response, config.interceptors, 'response', 'responseError', request, config);
  }

  /*  */

  var httpClient = createFetch;

  describe('http-client', function () {

  	describe('standard configure', function () {
  		var fetch = void 0;
  		beforeEach(function () {
  			fetch = httpClient(function (config) {
  				config.useStandardConfigurator();
  			});
  		});

  		it('able to make a GET request', function (done) {
  			fetch('/http-client-get-test').then(function (response) {
  				return response.json();
  			}).then(function (data) {
  				chai.expect(data.foo).to.equal('1');
  				done();
  			});
  		});
  	});
  });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2NvbmZpZ3VyYXRvci5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9idWlsZC1yZXF1ZXN0LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2ludGVyY2VwdG9yLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2NyZWF0ZS1mZXRjaC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC1jbGllbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgY29uc3QgaXNCcm93c2VyID0gIVt0eXBlb2Ygd2luZG93LCB0eXBlb2YgZG9jdW1lbnRdLmluY2x1ZGVzKFxuICAndW5kZWZpbmVkJ1xuKTtcblxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSAoZm4sIHJhaXNlID0gdHJ1ZSkgPT4gKFxuICAuLi5hcmdzXG4pID0+IHtcbiAgaWYgKGlzQnJvd3Nlcikge1xuICAgIHJldHVybiBmbiguLi5hcmdzKTtcbiAgfVxuICBpZiAocmFpc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7Zm4ubmFtZX0gZm9yIGJyb3dzZXIgdXNlIG9ubHlgKTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KVxuKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmxldCBtaWNyb1Rhc2tDdXJySGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tMYXN0SGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tDYWxsYmFja3MgPSBbXTtcbmxldCBtaWNyb1Rhc2tOb2RlQ29udGVudCA9IDA7XG5sZXQgbWljcm9UYXNrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKG1pY3JvVGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvVGFza05vZGUsIHtcbiAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxufSk7XG5cblxuLyoqXG4gKiBCYXNlZCBvbiBQb2x5bWVyLmFzeW5jXG4gKi9cbmNvbnN0IG1pY3JvVGFzayA9IHtcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvVGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGNhbGxiYWNrKSB7XG4gICAgbWljcm9UYXNrTm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhtaWNyb1Rhc2tOb2RlQ29udGVudCsrKTtcbiAgICBtaWNyb1Rhc2tDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIG1pY3JvVGFza0N1cnJIYW5kbGUrKztcbiAgfSxcblxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYG1pY3JvVGFza2AgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbWljcm9UYXNrTGFzdEhhbmRsZTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGlmICghbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgICB9XG4gICAgICBtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWNyb1Rhc2s7XG5cbmZ1bmN0aW9uIG1pY3JvVGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb1Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm9UYXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbWljcm9UYXNrQ2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBtaWNyb1Rhc2tMYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuICAgICdjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnYWRvcHRlZENhbGxiYWNrJyxcbiAgICAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuICBdO1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBpZiAoIWJhc2VDbGFzcykge1xuICAgIGJhc2VDbGFzcyA9IGNsYXNzIGV4dGVuZHMgZ2xvYmFsLkhUTUxFbGVtZW50IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7fVxuXG4gICAgc3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuICAgICAgaWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7fSxcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjYWxsYmFja01ldGhvZE5hbWUubGVuZ3RoIC0gJ2NhbGxiYWNrJy5sZW5ndGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gcHJvdG9bY2FsbGJhY2tNZXRob2ROYW1lXTtcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcbiAgICAgICAgcmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuY29uc3RydWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge31cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZChcbiAgICAgIGF0dHJpYnV0ZU5hbWUsXG4gICAgICBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlXG4gICAgKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBiZWZvcmUgZnJvbSAnLi4vLi4vYWR2aWNlL2JlZm9yZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID1cbiAgICAgIGNvbmZpZy5oYXNPYnNlcnZlciAmJiB0eXBlb2YgY29uZmlnLm9ic2VydmVyID09PSAnc3RyaW5nJztcbiAgICBjb25maWcuaXNTdHJpbmcgPSBjb25maWcudHlwZSA9PT0gU3RyaW5nO1xuICAgIGNvbmZpZy5pc051bWJlciA9IGNvbmZpZy50eXBlID09PSBOdW1iZXI7XG4gICAgY29uZmlnLmlzQm9vbGVhbiA9IGNvbmZpZy50eXBlID09PSBCb29sZWFuO1xuICAgIGNvbmZpZy5pc09iamVjdCA9IGNvbmZpZy50eXBlID09PSBPYmplY3Q7XG4gICAgY29uZmlnLmlzQXJyYXkgPSBjb25maWcudHlwZSA9PT0gQXJyYXk7XG4gICAgY29uZmlnLmlzRGF0ZSA9IGNvbmZpZy50eXBlID09PSBEYXRlO1xuICAgIGNvbmZpZy5ub3RpZnkgPSAnbm90aWZ5JyBpbiBjb25maWc7XG4gICAgY29uZmlnLnJlYWRPbmx5ID0gJ3JlYWRPbmx5JyBpbiBjb25maWcgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcbiAgICBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID1cbiAgICAgICdyZWZsZWN0VG9BdHRyaWJ1dGUnIGluIGNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGVcbiAgICAgICAgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG4gICAgICBvdXRwdXRbbmFtZV0gPVxuICAgICAgICB0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgPyB7IHR5cGU6IHByb3BlcnR5IH0gOiBwcm9wZXJ0eTtcbiAgICAgIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzc2lnbihjb250ZXh0LCBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyk7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICB9XG4gICAgICBjb250ZXh0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIGNvbnRleHQuX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzXG4gICAgKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKS5tYXAoKHByb3BlcnR5KSA9PlxuICAgICAgICAgIHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpXG4gICAgICAgICkgfHwgW11cbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBiZWZvcmUoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSwgJ2F0dHJpYnV0ZUNoYW5nZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpLCAncHJvcGVydGllc0NoYW5nZWQnKSh0aGlzKTtcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpIHtcbiAgICAgIGxldCBwcm9wZXJ0eSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdO1xuICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCBoeXBlblJlZ0V4ID0gLy0oW2Etel0pL2c7XG4gICAgICAgIHByb3BlcnR5ID0gYXR0cmlidXRlLnJlcGxhY2UoaHlwZW5SZWdFeCwgbWF0Y2ggPT5cbiAgICAgICAgICBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSB7XG4gICAgICBsZXQgYXR0cmlidXRlID0gcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCB1cHBlcmNhc2VSZWdFeCA9IC8oW0EtWl0pL2c7XG4gICAgICAgIGF0dHJpYnV0ZSA9IHByb3BlcnR5LnJlcGxhY2UodXBwZXJjYXNlUmVnRXgsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjbGFzc1Byb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByb3BlcnRpZXNDb25maWcpIHtcbiAgICAgICAgY29uc3QgZ2V0UHJvcGVydGllc0NvbmZpZyA9ICgpID0+IHByb3BlcnRpZXNDb25maWcgfHwge307XG4gICAgICAgIGxldCBjaGVja09iaiA9IG51bGw7XG4gICAgICAgIGxldCBsb29wID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZSAobG9vcCkge1xuICAgICAgICAgIGNoZWNrT2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrT2JqID09PSBudWxsID8gdGhpcyA6IGNoZWNrT2JqKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY2hlY2tPYmogfHxcbiAgICAgICAgICAgICFjaGVja09iai5jb25zdHJ1Y3RvciB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEhUTUxFbGVtZW50IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gRnVuY3Rpb24gfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBjaGVja09iai5jb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbG9vcCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoY2hlY2tPYmosICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKGNoZWNrT2JqLnByb3BlcnRpZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcbiAgICAgIGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShcbiAgICAgICAgICBhdHRyaWJ1dGVcbiAgICAgICAgKTtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldXG4gICAgICAgIC50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzTnVtYmVyLFxuICAgICAgICBpc0FycmF5LFxuICAgICAgICBpc0Jvb2xlYW4sXG4gICAgICAgIGlzRGF0ZSxcbiAgICAgICAgaXNTdHJpbmcsXG4gICAgICAgIGlzT2JqZWN0XG4gICAgICB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPVxuICAgICAgICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gaXNBcnJheVxuICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgOiB7fVxuICAgICAgICAgICAgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbXG4gICAgICAgIHByb3BlcnR5XG4gICAgICBdO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKFxuICAoXG4gICAgdGFyZ2V0LFxuICAgIHR5cGUsXG4gICAgbGlzdGVuZXIsXG4gICAgY2FwdHVyZSA9IGZhbHNlXG4gICkgPT4ge1xuICAgIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgfVxuKTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IHByb3BlcnRpZXMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvbGlzdGVuLWV2ZW50LmpzJztcblxuY2xhc3MgUHJvcGVydGllc01peGluVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNNaXhpblRlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuZGVzY3JpYmUoJ3Byb3BlcnRpZXMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IHByb3BlcnRpZXNNaXhpblRlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuXHQgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzTWl4aW5UZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc01peGluVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uLy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KHR5cGUsIGFzc2lnbihldmVudERlZmF1bHRQYXJhbXMsIHsgZGV0YWlsOiBkYXRhIH0pKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZWxlbWVudCkgPT4ge1xuICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICB9XG59KTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvc3RvcC1ldmVudC5qcyc7XG5pbXBvcnQgcmVtb3ZlRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnZXZlbnRzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKHRlbXBsYXRlKSA9PiB7XG4gIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBsZXQgY2hpbGRyZW4gPSB0ZW1wbGF0ZS5jaGlsZE5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGRyZW5baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCB0ZW1wbGF0ZUNvbnRlbnQgZnJvbSAnLi90ZW1wbGF0ZS1jb250ZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoaHRtbCkgPT4ge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWwudHJpbSgpO1xuICBjb25zdCBmcmFnID0gdGVtcGxhdGVDb250ZW50KHRlbXBsYXRlKTtcbiAgaWYgKGZyYWcgJiYgZnJhZy5maXJzdENoaWxkKSB7XG4gICAgcmV0dXJuIGZyYWcuZmlyc3RDaGlsZDtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjcmVhdGVFbGVtZW50IGZvciAke2h0bWx9YCk7XG59KTtcbiIsImltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9icm93c2VyL2NyZWF0ZS1lbGVtZW50LmpzJztcblxuZGVzY3JpYmUoJ2NyZWF0ZS1lbGVtZW50JywgKCkgPT4ge1xuICBpdCgnY3JlYXRlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KGBcblx0XHRcdDxkaXYgY2xhc3M9XCJteS1jbGFzc1wiPkhlbGxvIFdvcmxkPC9kaXY+XG5cdFx0YCk7XG4gICAgZXhwZWN0KGVsLmNsYXNzTGlzdC5jb250YWlucygnbXktY2xhc3MnKSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgYXNzZXJ0Lmluc3RhbmNlT2YoZWwsIE5vZGUsICdlbGVtZW50IGlzIGluc3RhbmNlIG9mIG5vZGUnKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuc29tZShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLmV2ZXJ5KGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbnkgfSBmcm9tICcuL2FycmF5L2FueS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGFsbCB9IGZyb20gJy4vYXJyYXkvYWxsLmpzJztcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnTWFwIFNldCBTeW1ib2wgQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuICAnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuY29uc3QgaXMgPSBzZXR1cCgpO1xuXG5leHBvcnQgZGVmYXVsdCBpcztcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGxldCBjaGVja3MgPSB7fTtcbiAgZm9yIChsZXQgaSA9IGxlbjsgaS0tOyApIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaV0udG9Mb3dlckNhc2UoKTtcbiAgICBjaGVja3NbdHlwZV0gPSBvYmogPT4gZ2V0VHlwZShvYmopID09PSB0eXBlO1xuICAgIGNoZWNrc1t0eXBlXS5hbGwgPSBkb0FsbEFwaShjaGVja3NbdHlwZV0pO1xuICAgIGNoZWNrc1t0eXBlXS5hbnkgPSBkb0FueUFwaShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUob2JqKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChvYmopO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi4vdHlwZS5qcyc7XG5cbmNvbnN0IGNsb25lID0gZnVuY3Rpb24oXG4gIHNyYyxcbiAgY2lyY3VsYXJzID0gW10sXG4gIGNsb25lcyA9IFtdXG4pIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoIXNyYyB8fCAhdHlwZS5vYmplY3Qoc3JjKSB8fCB0eXBlLmZ1bmN0aW9uKHNyYykpIHtcbiAgICByZXR1cm4gc3JjO1xuICB9XG5cbiAgLy8gRGF0ZVxuICBpZiAodHlwZS5kYXRlKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoc3JjLmdldFRpbWUoKSk7XG4gIH1cblxuICAvLyBSZWdFeHBcbiAgaWYgKHR5cGUucmVnZXhwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzcmMpO1xuICB9XG5cbiAgLy8gQXJyYXlzXG4gIGlmICh0eXBlLmFycmF5KHNyYykpIHtcbiAgICByZXR1cm4gc3JjLm1hcChjbG9uZSk7XG4gIH1cblxuICAvLyBFUzYgTWFwc1xuICBpZiAodHlwZS5tYXAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20oc3JjLmVudHJpZXMoKSkpO1xuICB9XG5cbiAgLy8gRVM2IFNldHNcbiAgaWYgKHR5cGUuc2V0KHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFNldChBcnJheS5mcm9tKHNyYy52YWx1ZXMoKSkpO1xuICB9XG5cbiAgLy8gT2JqZWN0XG4gIGlmICh0eXBlLm9iamVjdChzcmMpKSB7XG4gICAgY2lyY3VsYXJzLnB1c2goc3JjKTtcbiAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKHNyYyk7XG4gICAgY2xvbmVzLnB1c2gob2JqKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gc3JjKSB7XG4gICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gc3JjW2tleV0pO1xuICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUoc3JjW2tleV0sIGNpcmN1bGFycywgY2xvbmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbG9uZTtcblxuZXhwb3J0IGNvbnN0IGpzb25DbG9uZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufTtcbiIsImltcG9ydCBjbG9uZSwgeyBqc29uQ2xvbmUgfSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuICBkZXNjcmliZSgncHJpbWl0aXZlcycsICgpID0+IHtcbiAgICBpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChjbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihjbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnanNvbkNsb25lJywgKCkgPT4ge1xuICAgIGl0KCdXaGVuIG5vbi1zZXJpYWxpemFibGUgdmFsdWUgaXMgcGFzc2VkIGluLCByZXR1cm5zIHRoZSBzYW1lIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGpzb25DbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoanNvbkNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIGFzc2VydC5pc0Z1bmN0aW9uKGpzb25DbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5cblxuLyoqXG4gKiBUaGUgaW5pdCBvYmplY3QgdXNlZCB0byBpbml0aWFsaXplIGEgZmV0Y2ggUmVxdWVzdC5cbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdC9SZXF1ZXN0XG4gKi9cblxuLyoqXG4gKiBBIGNsYXNzIGZvciBjb25maWd1cmluZyBIdHRwQ2xpZW50cy5cbiAqL1xuY2xhc3MgQ29uZmlndXJhdG9yIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmJhc2VVcmwgPSAnJztcblx0XHR0aGlzLmRlZmF1bHRzID0ge307XG5cdFx0dGhpcy5pbnRlcmNlcHRvcnMgPSBbXTtcblxuXHR9XG5cblx0d2l0aEJhc2VVcmwoYmFzZVVybCkge1xuXHRcdHRoaXMuYmFzZVVybCA9IGJhc2VVcmw7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHR3aXRoRGVmYXVsdHMoZGVmYXVsdHMpIHtcblx0XHR0aGlzLmRlZmF1bHRzID0gZGVmYXVsdHM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHR3aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpIHtcblx0XHR0aGlzLmludGVyY2VwdG9ycy5wdXNoKGludGVyY2VwdG9yKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCkge1xuXHRcdGxldCBzdGFuZGFyZENvbmZpZyA9IHsgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicgfTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdHMsIHN0YW5kYXJkQ29uZmlnLCB0aGlzLmRlZmF1bHRzKTtcblx0XHRyZXR1cm4gdGhpcy5yZWplY3RFcnJvclJlc3BvbnNlcygpO1xuXHR9XG5cblx0cmVqZWN0RXJyb3JSZXNwb25zZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMud2l0aEludGVyY2VwdG9yKHsgcmVzcG9uc2U6IHJlamVjdE9uRXJyb3IgfSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IENvbmZpZ3VyYXRvcigpO1xuXG5mdW5jdGlvbiByZWplY3RPbkVycm9yKHJlc3BvbnNlKSB7XG5cdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHR0aHJvdyByZXNwb25zZTtcblx0fVxuXG5cdHJldHVybiByZXNwb25zZTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi4vdHlwZS5qcyc7XG5pbXBvcnQge30gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoaW5wdXQsIGluaXQsIGNvbmZpZykgPT4ge1xuXHRsZXQgZGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHMgfHwge307XG5cdGxldCByZXF1ZXN0O1xuXHRsZXQgYm9keSA9ICcnO1xuXHRsZXQgcmVxdWVzdENvbnRlbnRUeXBlO1xuXG5cdGxldCBwYXJzZWREZWZhdWx0SGVhZGVycyA9IHBhcnNlSGVhZGVyVmFsdWVzKGRlZmF1bHRzLmhlYWRlcnMpO1xuXHRpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG5cdFx0cmVxdWVzdCA9IGlucHV0O1xuXHRcdHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3QuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcblx0fSBlbHNlIHtcblx0XHRpbml0IHx8IChpbml0ID0ge30pO1xuXHRcdGJvZHkgPSBpbml0LmJvZHk7XG5cdFx0bGV0IGJvZHlPYmogPSBib2R5ID8geyBib2R5IH0gOiBudWxsO1xuXHRcdGxldCByZXF1ZXN0SW5pdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCB7IGhlYWRlcnM6IHt9IH0sIGluaXQsIGJvZHlPYmopO1xuXHRcdHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3RJbml0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG5cdFx0cmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGdldFJlcXVlc3RVcmwoY29uZmlnLmJhc2VVcmwsIGlucHV0KSwgcmVxdWVzdEluaXQpO1xuXHR9XG5cdGlmICghcmVxdWVzdENvbnRlbnRUeXBlKSB7XG5cdFx0aWYgKG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBuZXcgSGVhZGVycyhwYXJzZWREZWZhdWx0SGVhZGVycykuZ2V0KCdjb250ZW50LXR5cGUnKSk7XG5cdFx0fSBlbHNlIGlmIChib2R5ICYmIGlzSlNPTihTdHJpbmcoYm9keSkpKSB7XG5cdFx0XHRyZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuXHRcdH1cblx0fVxuXHRzZXREZWZhdWx0SGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMsIHBhcnNlZERlZmF1bHRIZWFkZXJzKTtcblx0aWYgKGJvZHkgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IgJiYgYm9keS50eXBlKSB7XG5cdFx0Ly8gd29yayBhcm91bmQgYnVnIGluIElFICYgRWRnZSB3aGVyZSB0aGUgQmxvYiB0eXBlIGlzIGlnbm9yZWQgaW4gdGhlIHJlcXVlc3Rcblx0XHQvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzIxMzYxNjNcblx0XHRyZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBib2R5LnR5cGUpO1xuXHR9XG5cdHJldHVybiByZXF1ZXN0O1xufVxuXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyVmFsdWVzKGhlYWRlcnMpIHtcblx0bGV0IHBhcnNlZEhlYWRlcnMgPSB7fTtcblx0Zm9yIChsZXQgbmFtZSBpbiBoZWFkZXJzIHx8IHt9KSB7XG5cdFx0aWYgKGhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblx0XHRcdC8vICRGbG93Rml4TWVcblx0XHRcdHBhcnNlZEhlYWRlcnNbbmFtZV0gPSAodHlwZS5mdW5jdGlvbihoZWFkZXJzW25hbWVdKSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuXHRpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG5cdFx0cmV0dXJuIHVybDtcblx0fVxuXG5cdHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG5cdGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcblx0XHRpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG5cdFx0XHRoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcblx0dHJ5IHtcblx0XHRKU09OLnBhcnNlKHN0cik7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuIiwiLyogICovXG5cblxuZXhwb3J0IGRlZmF1bHQgKGlucHV0LCBpbnRlcmNlcHRvcnMgPSBbXSxcblx0XHRcdFx0c3VjY2Vzc05hbWUsIGVycm9yTmFtZSwgLi4uaW50ZXJjZXB0b3JBcmdzKSA9PiBpbnRlcmNlcHRvcnNcblx0LnJlZHVjZSgoY2hhaW4sIGludGVyY2VwdG9yKSA9PiB7XG5cdFx0Ly8gJEZsb3dGaXhNZVxuXHRcdGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdICYmIGludGVyY2VwdG9yW3N1Y2Nlc3NOYW1lXS5iaW5kKGludGVyY2VwdG9yKTtcblx0XHQvLyAkRmxvd0ZpeE1lXG5cdFx0Y29uc3QgZXJyb3JIYW5kbGVyID0gaW50ZXJjZXB0b3JbZXJyb3JOYW1lXSAmJiBpbnRlcmNlcHRvcltlcnJvck5hbWVdLmJpbmQoaW50ZXJjZXB0b3IpO1xuXG5cdFx0cmV0dXJuIGNoYWluLnRoZW4oXG5cdFx0XHRzdWNjZXNzSGFuZGxlciAmJiAodmFsdWUgPT4gc3VjY2Vzc0hhbmRsZXIodmFsdWUsIC4uLmludGVyY2VwdG9yQXJncykpIHx8IGlkZW50aXR5LFxuXHRcdFx0ZXJyb3JIYW5kbGVyICYmIChyZWFzb24gPT4gZXJyb3JIYW5kbGVyKHJlYXNvbiwgLi4uaW50ZXJjZXB0b3JBcmdzKSkgfHwgdGhyb3dlcik7XG5cdH0sIFByb21pc2UucmVzb2x2ZShpbnB1dCkpO1xuXG5cblxuZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuXHRyZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gdGhyb3dlcih4KSB7XG5cdHRocm93IHg7XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBjcmVhdGVDb25maWd9IGZyb20gJy4vY29uZmlndXJhdG9yLmpzJztcbmltcG9ydCBidWlsZFJlcXVlc3QgZnJvbSAnLi9idWlsZC1yZXF1ZXN0LmpzJztcbmltcG9ydCBhcHBseUludGVyY2VwdG9ycyBmcm9tICcuL2ludGVyY2VwdG9yLmpzJztcblxuXG5leHBvcnQgZGVmYXVsdCAoY29uZmlndXJlKSA9PiB7XG5cdGlmICh0eXBlLnVuZGVmaW5lZChmZXRjaCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuXFwndCBzdXBwb3J0IGl0LicpO1xuXHR9XG5cdGNvbnN0IGNvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuXHRjb25maWd1cmUoY29uZmlnKTtcblxuXHRjb25zdCBmZXRjaEFwaSA9IChpbnB1dCwgaW5pdCA9IHt9KSA9PiB7XG5cdFx0bGV0IHJlcXVlc3QgPSBidWlsZFJlcXVlc3QoaW5wdXQsIGluaXQsIGNvbmZpZyk7XG5cblx0XHRyZXR1cm4gcHJvY2Vzc1JlcXVlc3QocmVxdWVzdCwgY29uZmlnKVxuXHRcdFx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRsZXQgcmVzcG9uc2U7XG5cblx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmVzcG9uc2UgPSBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG5cdFx0XHRcdFx0cmVxdWVzdCA9IHJlc3VsdDtcblx0XHRcdFx0XHRyZXNwb25zZSA9IGZldGNoKHJlc3VsdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbiBpbnZhbGlkIHJlc3VsdCB3YXMgcmV0dXJuZWQgYnkgdGhlIGludGVyY2VwdG9yIGNoYWluLiBFeHBlY3RlZCBhIFJlcXVlc3Qgb3IgUmVzcG9uc2UgaW5zdGFuY2VgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UsIHJlcXVlc3QsIGNvbmZpZyk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4ocmVzdWx0ID0+IHtcblx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmV0Y2hBcGkocmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSk7XG5cdH07XG5cblx0cmV0dXJuIGZldGNoQXBpO1xufTtcblxuZnVuY3Rpb24gcHJvY2Vzc1JlcXVlc3QocmVxdWVzdCwgY29uZmlnKSB7XG5cdHJldHVybiBhcHBseUludGVyY2VwdG9ycyhyZXF1ZXN0LCBjb25maWcuaW50ZXJjZXB0b3JzLCAncmVxdWVzdCcsICdyZXF1ZXN0RXJyb3InLCBjb25maWcpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UsIHJlcXVlc3QsIGNvbmZpZykge1xuXHRyZXR1cm4gYXBwbHlJbnRlcmNlcHRvcnMocmVzcG9uc2UsIGNvbmZpZy5pbnRlcmNlcHRvcnMsICdyZXNwb25zZScsICdyZXNwb25zZUVycm9yJywgcmVxdWVzdCwgY29uZmlnKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZUZldGNoIGZyb20gJy4vaHR0cC1jbGllbnQvY3JlYXRlLWZldGNoLmpzJztcblxuY29uc3QgaHR0cENsaWVudCA9IGNyZWF0ZUZldGNoO1xuXG5leHBvcnQgZGVmYXVsdCBodHRwQ2xpZW50O1xuIiwiaW1wb3J0IGh0dHBDbGllbnRGYWN0b3J5IGZyb20gJy4uL2xpYi9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCcsICgpID0+IHtcblxuXHRkZXNjcmliZSgnc3RhbmRhcmQgY29uZmlndXJlJywgKCkgPT4ge1xuXHRcdGxldCBmZXRjaDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGZldGNoID0gaHR0cENsaWVudEZhY3RvcnkoY29uZmlnID0+IHtcblx0XHRcdFx0Y29uZmlnLnVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGl0KCdhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCcsIGRvbmUgPT4ge1xuXHRcdFx0ZmV0Y2goJy9odHRwLWNsaWVudC1nZXQtdGVzdCcpXG5cdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcxJyk7XG5cdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHR9KVxuXHRcdH0pO1xuXHR9KTtcbn0pOyJdLCJuYW1lcyI6WyJpc0Jyb3dzZXIiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImluY2x1ZGVzIiwiYnJvd3NlciIsImZuIiwicmFpc2UiLCJFcnJvciIsIm5hbWUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwibWljcm9UYXNrRmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsIm1pY3JvVGFzayIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJwb3AiLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiY3JlYXRlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJpbm5lckhUTUwiLCJpdCIsImFzc2VydCIsImVxdWFsIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiYSIsImRlZXAiLCJib2R5IiwidGVtcGxhdGUiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsImVsIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImFyciIsInNvbWUiLCJldmVyeSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJpcyIsInNldHVwIiwiY2hlY2tzIiwiZ2V0VHlwZSIsIm1hdGNoZXMiLCJjbG9uZSIsInNyYyIsImNpcmN1bGFycyIsImNsb25lcyIsIm9iamVjdCIsImZ1bmN0aW9uIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwia2V5IiwiZmluZEluZGV4IiwianNvbkNsb25lIiwiZSIsImJlIiwibnVsbCIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsInN0cmluZyIsIkNvbmZpZ3VyYXRvciIsImJhc2VVcmwiLCJkZWZhdWx0cyIsImludGVyY2VwdG9ycyIsIndpdGhCYXNlVXJsIiwid2l0aERlZmF1bHRzIiwid2l0aEludGVyY2VwdG9yIiwiaW50ZXJjZXB0b3IiLCJ1c2VTdGFuZGFyZENvbmZpZ3VyYXRvciIsInN0YW5kYXJkQ29uZmlnIiwiY3JlZGVudGlhbHMiLCJyZWplY3RFcnJvclJlc3BvbnNlcyIsInJlc3BvbnNlIiwicmVqZWN0T25FcnJvciIsIm9rIiwiaW5wdXQiLCJpbml0IiwicmVxdWVzdCIsInJlcXVlc3RDb250ZW50VHlwZSIsInBhcnNlZERlZmF1bHRIZWFkZXJzIiwicGFyc2VIZWFkZXJWYWx1ZXMiLCJoZWFkZXJzIiwiUmVxdWVzdCIsIkhlYWRlcnMiLCJib2R5T2JqIiwicmVxdWVzdEluaXQiLCJnZXRSZXF1ZXN0VXJsIiwiaGFzIiwiaXNKU09OIiwic2V0RGVmYXVsdEhlYWRlcnMiLCJCbG9iIiwicGFyc2VkSGVhZGVycyIsImFic29sdXRlVXJsUmVnZXhwIiwidXJsIiwidGVzdCIsImRlZmF1bHRIZWFkZXJzIiwic3RyIiwiaW50ZXJjZXB0b3JBcmdzIiwic3VjY2Vzc05hbWUiLCJlcnJvck5hbWUiLCJyZWR1Y2UiLCJjaGFpbiIsInN1Y2Nlc3NIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwidGhlbiIsImlkZW50aXR5IiwicmVhc29uIiwidGhyb3dlciIsIlByb21pc2UiLCJyZXNvbHZlIiwieCIsImNvbmZpZ3VyZSIsImZldGNoIiwiY3JlYXRlQ29uZmlnIiwiZmV0Y2hBcGkiLCJidWlsZFJlcXVlc3QiLCJwcm9jZXNzUmVxdWVzdCIsInJlc3VsdCIsIlJlc3BvbnNlIiwicHJvY2Vzc1Jlc3BvbnNlIiwiYXBwbHlJbnRlcmNlcHRvcnMiLCJodHRwQ2xpZW50IiwiY3JlYXRlRmV0Y2giLCJiZWZvcmVFYWNoIiwiaHR0cENsaWVudEZhY3RvcnkiLCJqc29uIiwiZm9vIiwiZG9uZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQUE7QUFDQSxFQUFPLElBQU1BLFlBQVksQ0FBQyxRQUFRQyxNQUFSLHlDQUFRQSxNQUFSLFVBQXVCQyxRQUF2Qix5Q0FBdUJBLFFBQXZCLEdBQWlDQyxRQUFqQyxDQUN4QixXQUR3QixDQUFuQjs7QUFJUCxFQUFPLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxFQUFEO0VBQUEsTUFBS0MsS0FBTCx1RUFBYSxJQUFiO0VBQUEsU0FBc0IsWUFFeEM7RUFDSCxRQUFJTixTQUFKLEVBQWU7RUFDYixhQUFPSyw4QkFBUDtFQUNEO0VBQ0QsUUFBSUMsS0FBSixFQUFXO0VBQ1QsWUFBTSxJQUFJQyxLQUFKLENBQWFGLEdBQUdHLElBQWhCLDJCQUFOO0VBQ0Q7RUFDRixHQVRzQjtFQUFBLENBQWhCOztFQ0xQO0FBQ0EsdUJBQWUsWUFFVjtFQUFBLE1BREhDLE9BQ0csdUVBRE9DLE9BQU9DLE1BQVAsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6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
