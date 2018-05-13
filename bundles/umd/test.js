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

  var buildRequest = function buildRequest(input, init, config) {
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
  };

  var processRequest = function processRequest(request, config) {
    return applyInterceptors(request, config.interceptors, 'request', 'requestError', config);
  };

  var processResponse = function processResponse(response, request, config) {
    return applyInterceptors(response, config.interceptors, 'response', 'responseError', request, config);
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

  var factory = (function (configure) {
    if (is.undefined(fetch)) {
      throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
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

  /*  */

  describe('http-client', function () {

  	describe('standard configure', function () {
  		var fetch = void 0;
  		beforeEach(function () {
  			fetch = factory(function (config) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2NvbmZpZ3VyYXRvci5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9hcHBseS1pbnRlcmNlcHRvci5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9yZXF1ZXN0LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2NsaWVudC1mYWN0b3J5LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vdGVzdC9odHRwLWNsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBjb25zdCBpc0Jyb3dzZXIgPSAhW3R5cGVvZiB3aW5kb3csIHR5cGVvZiBkb2N1bWVudF0uaW5jbHVkZXMoXG4gICd1bmRlZmluZWQnXG4pO1xuXG5leHBvcnQgY29uc3QgYnJvd3NlciA9IChmbiwgcmFpc2UgPSB0cnVlKSA9PiAoXG4gIC4uLmFyZ3NcbikgPT4ge1xuICBpZiAoaXNCcm93c2VyKSB7XG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xuICB9XG4gIGlmIChyYWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtmbi5uYW1lfSBmb3IgYnJvd3NlciB1c2Ugb25seWApO1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pXG4pID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge1xuICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG59KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gICAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gICAqL1xuICBydW4oY2FsbGJhY2spIHtcbiAgICBtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuICAgIG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICBjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgaWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi8uLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWVzXG4gIH07XG4gIF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICBnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKFxuICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgIG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWVcbiAgICApIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi8uLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPVxuICAgICAgY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9XG4gICAgICAgIHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHNcbiAgICApIHtcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgIE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5vdGlmeSxcbiAgICAgICAgICBoYXNPYnNlcnZlcixcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGUsXG4gICAgICAgICAgaXNPYnNlcnZlclN0cmluZyxcbiAgICAgICAgICBvYnNlcnZlclxuICAgICAgICB9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICBpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGAke3Byb3BlcnR5fS1jaGFuZ2VkYCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZTogb2xkUHJvcHNbcHJvcGVydHldXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+XG4gICAgICAgICAgdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSlcbiAgICAgICAgKSB8fCBbXVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PlxuICAgICAgICAgIG1hdGNoWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKFxuICAgICAgICAgIGF0dHJpYnV0ZVxuICAgICAgICApO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV1cbiAgICAgICAgLnR5cGU7XG4gICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNOdW1iZXIsXG4gICAgICAgIGlzQXJyYXksXG4gICAgICAgIGlzQm9vbGVhbixcbiAgICAgICAgaXNEYXRlLFxuICAgICAgICBpc1N0cmluZyxcbiAgICAgICAgaXNPYmplY3RcbiAgICAgIH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9XG4gICAgICAgICAgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBpc0FycmF5XG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHt9XG4gICAgICAgICAgICA6IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc0RhdGUpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlDb25maWcgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1tcbiAgICAgICAgcHJvcGVydHlcbiAgICAgIF07XG4gICAgICBjb25zdCB7IGlzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXkgfSA9IHByb3BlcnR5Q29uZmlnO1xuXG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGxldCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZykge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0ge307XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhT2xkICYmICEocHJvcGVydHkgaW4gcHJpdmF0ZXModGhpcykuZGF0YU9sZCkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZ1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cblxuICAgIF9pbnZhbGlkYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9mbHVzaFByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZztcbiAgICAgIGNvbnN0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFPbGQ7XG5cbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oY2hhbmdlZFByb3BzKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFN0cmljdCBlcXVhbGl0eSBjaGVja1xuICAgICAgICBvbGQgIT09IHZhbHVlICYmXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyAob2xkPT1OYU4sIHZhbHVlPT1OYU4pIGFsd2F5cyByZXR1cm5zIGZhbHNlXG4gICAgICAgIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICApO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoXG4gIChcbiAgICB0YXJnZXQsXG4gICAgdHlwZSxcbiAgICBsaXN0ZW5lcixcbiAgICBjYXB0dXJlID0gZmFsc2VcbiAgKSA9PiB7XG4gICAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICB9XG4pO1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBldmVudCBlbWl0dGVyJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHR5cGUuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICBsZXQgZXZlbnRzID0gdHlwZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gICAgbGV0IGhhbmRsZXMgPSBldmVudHMubWFwKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICBsZXQgaGFuZGxlO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZSA9IGhhbmRsZXMucG9wKCkpKSB7XG4gICAgICAgICAgaGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzTWl4aW5UZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc01peGluVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5kZXNjcmliZSgncHJvcGVydGllcy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzTWl4aW5UZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyczogW11cbiAgICB9O1xuICB9KTtcbiAgY29uc3QgZXZlbnREZWZhdWx0UGFyYW1zID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEV2ZW50cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGFmdGVyKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IGBvbiR7ZXZlbnQudHlwZX1gO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW2hhbmRsZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICB0aGlzW2hhbmRsZV0oZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB0aGlzLm93bihsaXN0ZW5FdmVudCh0aGlzLCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIG9mZigpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgaGFuZGxlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG93biguLi5oYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGNvbnRleHQub2ZmKCk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChlbGVtZW50KSA9PiB7XG4gIGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn0pO1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3JlbW92ZS1lbGVtZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdldmVudHMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigodGVtcGxhdGUpID0+IHtcbiAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBjaGlsZHJlbiA9IHRlbXBsYXRlLmNoaWxkTm9kZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHRlbXBsYXRlQ29udGVudCBmcm9tICcuL3RlbXBsYXRlLWNvbnRlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn0pO1xuIiwiaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMnO1xuXG5kZXNjcmliZSgnY3JlYXRlLWVsZW1lbnQnLCAoKSA9PiB7XG4gIGl0KCdjcmVhdGUgZWxlbWVudCcsICgpID0+IHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQoYFxuXHRcdFx0PGRpdiBjbGFzcz1cIm15LWNsYXNzXCI+SGVsbG8gV29ybGQ8L2Rpdj5cblx0XHRgKTtcbiAgICBleHBlY3QoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdteS1jbGFzcycpKS50by5lcXVhbCh0cnVlKTtcbiAgICBhc3NlcnQuaW5zdGFuY2VPZihlbCwgTm9kZSwgJ2VsZW1lbnQgaXMgaW5zdGFuY2Ugb2Ygbm9kZScpO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdNYXAgU2V0IFN5bWJvbCBBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoXG4gICcgJ1xuKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IG9iaiA9PiBnZXRUeXBlKG9iaikgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZShvYmopIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKG9iaik7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcblxuY29uc3QgY2xvbmUgPSBmdW5jdGlvbihcbiAgc3JjLFxuICBjaXJjdWxhcnMgPSBbXSxcbiAgY2xvbmVzID0gW11cbikge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmICghc3JjIHx8ICF0eXBlLm9iamVjdChzcmMpIHx8IHR5cGUuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBEYXRlXG4gIGlmICh0eXBlLmRhdGUoc3JjKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShzcmMuZ2V0VGltZSgpKTtcbiAgfVxuXG4gIC8vIFJlZ0V4cFxuICBpZiAodHlwZS5yZWdleHAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNyYyk7XG4gIH1cblxuICAvLyBBcnJheXNcbiAgaWYgKHR5cGUuYXJyYXkoc3JjKSkge1xuICAgIHJldHVybiBzcmMubWFwKGNsb25lKTtcbiAgfVxuXG4gIC8vIEVTNiBNYXBzXG4gIGlmICh0eXBlLm1hcChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbShzcmMuZW50cmllcygpKSk7XG4gIH1cblxuICAvLyBFUzYgU2V0c1xuICBpZiAodHlwZS5zZXQoc3JjKSkge1xuICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20oc3JjLnZhbHVlcygpKSk7XG4gIH1cblxuICAvLyBPYmplY3RcbiAgaWYgKHR5cGUub2JqZWN0KHNyYykpIHtcbiAgICBjaXJjdWxhcnMucHVzaChzcmMpO1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoc3JjKTtcbiAgICBjbG9uZXMucHVzaChvYmopO1xuICAgIGZvciAobGV0IGtleSBpbiBzcmMpIHtcbiAgICAgIGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSBzcmNba2V5XSk7XG4gICAgICBvYmpba2V5XSA9IGlkeCA+IC0xID8gY2xvbmVzW2lkeF0gOiBjbG9uZShzcmNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcmV0dXJuIHNyYztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lO1xuXG5leHBvcnQgY29uc3QganNvbkNsb25lID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59O1xuIiwiaW1wb3J0IGNsb25lLCB7IGpzb25DbG9uZSB9IGZyb20gJy4uLy4uL2xpYi9vYmplY3QvY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnY2xvbmUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdwcmltaXRpdmVzJywgKCkgPT4ge1xuICAgIGl0KCdSZXR1cm5zIGVxdWFsIGRhdGEgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdqc29uQ2xvbmUnLCAoKSA9PiB7XG4gICAgaXQoJ1doZW4gbm9uLXNlcmlhbGl6YWJsZSB2YWx1ZSBpcyBwYXNzZWQgaW4sIHJldHVybnMgdGhlIHNhbWUgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oanNvbkNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi90eXBlLmpzJztcblxuZGVzY3JpYmUoJ3R5cGUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3Qgbm90QXJncyA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhub3RBcmdzKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYWxsIHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFsbChhcmdzLCBhcmdzLCBhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbnkgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBhcnJheSA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IGJvb2wgPSB0cnVlO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEJvb2wgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bGwgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcbiAgICAgIGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE9iamVjdCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcbiAgICAgIGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCBub3RSZWdleHAgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG5ldyBNYXAoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5tYXAoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobmV3IFNldCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnNldChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cblxuXG4vKipcbiAqIFRoZSBpbml0IG9iamVjdCB1c2VkIHRvIGluaXRpYWxpemUgYSBmZXRjaCBSZXF1ZXN0LlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SZXF1ZXN0L1JlcXVlc3RcbiAqL1xuXG4vKipcbiAqIEEgY2xhc3MgZm9yIGNvbmZpZ3VyaW5nIEh0dHBDbGllbnRzLlxuICovXG5jbGFzcyBDb25maWd1cmF0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmFzZVVybCA9ICcnO1xuICAgIHRoaXMuZGVmYXVsdHMgPSB7fTtcbiAgICB0aGlzLmludGVyY2VwdG9ycyA9IFtdO1xuICB9XG5cbiAgd2l0aEJhc2VVcmwoYmFzZVVybCkge1xuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoRGVmYXVsdHMoZGVmYXVsdHMpIHtcbiAgICB0aGlzLmRlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpIHtcbiAgICB0aGlzLmludGVyY2VwdG9ycy5wdXNoKGludGVyY2VwdG9yKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCkge1xuICAgIGxldCBzdGFuZGFyZENvbmZpZyA9IHtcbiAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknXG4gICAgICB9XG4gICAgfTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdHMsIHN0YW5kYXJkQ29uZmlnLCB0aGlzLmRlZmF1bHRzKTtcbiAgICByZXR1cm4gdGhpcy5yZWplY3RFcnJvclJlc3BvbnNlcygpO1xuICB9XG5cbiAgcmVqZWN0RXJyb3JSZXNwb25zZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aEludGVyY2VwdG9yKHsgcmVzcG9uc2U6IHJlamVjdE9uRXJyb3IgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IENvbmZpZ3VyYXRvcigpO1xuXG5mdW5jdGlvbiByZWplY3RPbkVycm9yKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyByZXNwb25zZTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiIsIi8qICAqL1xuXG5cbmV4cG9ydCBkZWZhdWx0IChcbiAgaW5wdXQsXG4gIGludGVyY2VwdG9ycyA9IFtdLFxuICBzdWNjZXNzTmFtZSxcbiAgZXJyb3JOYW1lLFxuICAuLi5pbnRlcmNlcHRvckFyZ3NcbikgPT5cbiAgaW50ZXJjZXB0b3JzLnJlZHVjZSgoY2hhaW4sIGludGVyY2VwdG9yKSA9PiB7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdICYmIGludGVyY2VwdG9yW3N1Y2Nlc3NOYW1lXS5iaW5kKGludGVyY2VwdG9yKTtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3QgZXJyb3JIYW5kbGVyID0gaW50ZXJjZXB0b3JbZXJyb3JOYW1lXSAmJiBpbnRlcmNlcHRvcltlcnJvck5hbWVdLmJpbmQoaW50ZXJjZXB0b3IpO1xuXG4gICAgcmV0dXJuIGNoYWluLnRoZW4oXG4gICAgICAoc3VjY2Vzc0hhbmRsZXIgJiYgKHZhbHVlID0+IHN1Y2Nlc3NIYW5kbGVyKHZhbHVlLCAuLi5pbnRlcmNlcHRvckFyZ3MpKSkgfHwgaWRlbnRpdHksXG4gICAgICAoZXJyb3JIYW5kbGVyICYmIChyZWFzb24gPT4gZXJyb3JIYW5kbGVyKHJlYXNvbiwgLi4uaW50ZXJjZXB0b3JBcmdzKSkpIHx8IHRocm93ZXJcbiAgICApO1xuICB9LCBQcm9taXNlLnJlc29sdmUoaW5wdXQpKTtcblxuZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gdGhyb3dlcih4KSB7XG4gIHRocm93IHg7XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IHsgfSBmcm9tICcuL2NvbmZpZ3VyYXRvci5qcyc7XG5pbXBvcnQgYXBwbHlJbnRlcmNlcHRvcnMgZnJvbSAnLi9hcHBseS1pbnRlcmNlcHRvci5qcyc7XG5cbmV4cG9ydCBjb25zdCBidWlsZFJlcXVlc3QgPSAoaW5wdXQsIGluaXQsIGNvbmZpZykgPT4ge1xuICBsZXQgZGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHMgfHwge307XG4gIGxldCByZXF1ZXN0O1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgcmVxdWVzdENvbnRlbnRUeXBlO1xuXG4gIGxldCBwYXJzZWREZWZhdWx0SGVhZGVycyA9IHBhcnNlSGVhZGVyVmFsdWVzKGRlZmF1bHRzLmhlYWRlcnMpO1xuICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgcmVxdWVzdCA9IGlucHV0O1xuICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3QuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0IHx8IChpbml0ID0ge30pO1xuICAgIGJvZHkgPSBpbml0LmJvZHk7XG4gICAgbGV0IGJvZHlPYmogPSBib2R5ID8geyBib2R5IH0gOiBudWxsO1xuICAgIGxldCByZXF1ZXN0SW5pdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCB7IGhlYWRlcnM6IHt9IH0sIGluaXQsIGJvZHlPYmopO1xuICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3RJbml0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGdldFJlcXVlc3RVcmwoY29uZmlnLmJhc2VVcmwsIGlucHV0KSwgcmVxdWVzdEluaXQpO1xuICB9XG4gIGlmICghcmVxdWVzdENvbnRlbnRUeXBlKSB7XG4gICAgaWYgKG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBuZXcgSGVhZGVycyhwYXJzZWREZWZhdWx0SGVhZGVycykuZ2V0KCdjb250ZW50LXR5cGUnKSk7XG4gICAgfSBlbHNlIGlmIChib2R5ICYmIGlzSlNPTihTdHJpbmcoYm9keSkpKSB7XG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIH1cbiAgfVxuICBzZXREZWZhdWx0SGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMsIHBhcnNlZERlZmF1bHRIZWFkZXJzKTtcbiAgaWYgKGJvZHkgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IgJiYgYm9keS50eXBlKSB7XG4gICAgLy8gd29yayBhcm91bmQgYnVnIGluIElFICYgRWRnZSB3aGVyZSB0aGUgQmxvYiB0eXBlIGlzIGlnbm9yZWQgaW4gdGhlIHJlcXVlc3RcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzIxMzYxNjNcbiAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBib2R5LnR5cGUpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXF1ZXN0ID0gKHJlcXVlc3QsIGNvbmZpZykgPT5cbiAgYXBwbHlJbnRlcmNlcHRvcnMocmVxdWVzdCwgY29uZmlnLmludGVyY2VwdG9ycywgJ3JlcXVlc3QnLCAncmVxdWVzdEVycm9yJywgY29uZmlnKTtcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXNwb25zZSA9IChcbiAgcmVzcG9uc2UsXG4gIHJlcXVlc3QsXG4gIGNvbmZpZ1xuKSA9PiBhcHBseUludGVyY2VwdG9ycyhyZXNwb25zZSwgY29uZmlnLmludGVyY2VwdG9ycywgJ3Jlc3BvbnNlJywgJ3Jlc3BvbnNlRXJyb3InLCByZXF1ZXN0LCBjb25maWcpO1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlclZhbHVlcyhoZWFkZXJzKSB7XG4gIGxldCBwYXJzZWRIZWFkZXJzID0ge307XG4gIGZvciAobGV0IG5hbWUgaW4gaGVhZGVycyB8fCB7fSkge1xuICAgIGlmIChoZWFkZXJzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBwYXJzZWRIZWFkZXJzW25hbWVdID0gdHlwZS5mdW5jdGlvbihoZWFkZXJzW25hbWVdKSA/IGhlYWRlcnNbbmFtZV0oKSA6IGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJzZWRIZWFkZXJzO1xufVxuY29uc3QgYWJzb2x1dGVVcmxSZWdleHAgPSAvXihbYS16XVthLXowLTkrXFwtLl0qOik/XFwvXFwvL2k7XG5cbmZ1bmN0aW9uIGdldFJlcXVlc3RVcmwoYmFzZVVybCwgdXJsKSB7XG4gIGlmIChhYnNvbHV0ZVVybFJlZ2V4cC50ZXN0KHVybCkpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgcmV0dXJuIChiYXNlVXJsIHx8ICcnKSArIHVybDtcbn1cblxuZnVuY3Rpb24gc2V0RGVmYXVsdEhlYWRlcnMoaGVhZGVycywgZGVmYXVsdEhlYWRlcnMpIHtcbiAgZm9yIChsZXQgbmFtZSBpbiBkZWZhdWx0SGVhZGVycyB8fCB7fSkge1xuICAgIGlmIChkZWZhdWx0SGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiAhaGVhZGVycy5oYXMobmFtZSkpIHtcbiAgICAgIGhlYWRlcnMuc2V0KG5hbWUsIGRlZmF1bHRIZWFkZXJzW25hbWVdKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNKU09OKHN0cikge1xuICB0cnkge1xuICAgIEpTT04ucGFyc2Uoc3RyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBjcmVhdGVDb25maWcgfSBmcm9tICcuL2NvbmZpZ3VyYXRvci5qcyc7XG5pbXBvcnQgeyBidWlsZFJlcXVlc3QsIHByb2Nlc3NSZXF1ZXN0LCBwcm9jZXNzUmVzcG9uc2UgfSBmcm9tICcuL3JlcXVlc3QuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IChjb25maWd1cmUpID0+IHtcbiAgaWYgKHR5cGUudW5kZWZpbmVkKGZldGNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIik7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuXG4gIGNvbnN0IGZldGNoQXBpID0gKGlucHV0LCBpbml0ID0ge30pID0+IHtcbiAgICBsZXQgcmVxdWVzdCA9IGJ1aWxkUmVxdWVzdChpbnB1dCwgaW5pdCwgY29uZmlnKTtcblxuICAgIHJldHVybiBwcm9jZXNzUmVxdWVzdChyZXF1ZXN0LCBjb25maWcpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlLCByZXF1ZXN0LCBjb25maWcpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIGZldGNoQXBpKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBmZXRjaEFwaTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBmYWN0b3J5IGZyb20gJy4vaHR0cC1jbGllbnQvY2xpZW50LWZhY3RvcnkuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmYWN0b3J5O1xuIiwiaW1wb3J0IGh0dHBDbGllbnRGYWN0b3J5IGZyb20gJy4uL2xpYi9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCcsICgpID0+IHtcblxuXHRkZXNjcmliZSgnc3RhbmRhcmQgY29uZmlndXJlJywgKCkgPT4ge1xuXHRcdGxldCBmZXRjaDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGZldGNoID0gaHR0cENsaWVudEZhY3RvcnkoY29uZmlnID0+IHtcblx0XHRcdFx0Y29uZmlnLnVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGl0KCdhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCcsIGRvbmUgPT4ge1xuXHRcdFx0ZmV0Y2goJy9odHRwLWNsaWVudC1nZXQtdGVzdCcpXG5cdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcxJyk7XG5cdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHR9KVxuXHRcdH0pO1xuXHR9KTtcbn0pOyJdLCJuYW1lcyI6WyJpc0Jyb3dzZXIiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImluY2x1ZGVzIiwiYnJvd3NlciIsImZuIiwicmFpc2UiLCJFcnJvciIsIm5hbWUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwibWljcm9UYXNrRmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsIm1pY3JvVGFzayIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJwb3AiLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiY3JlYXRlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJpbm5lckhUTUwiLCJpdCIsImFzc2VydCIsImVxdWFsIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiYSIsImRlZXAiLCJib2R5IiwidGVtcGxhdGUiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsImVsIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImFyciIsInNvbWUiLCJldmVyeSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJpcyIsInNldHVwIiwiY2hlY2tzIiwiZ2V0VHlwZSIsIm1hdGNoZXMiLCJjbG9uZSIsInNyYyIsImNpcmN1bGFycyIsImNsb25lcyIsIm9iamVjdCIsImZ1bmN0aW9uIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwia2V5IiwiZmluZEluZGV4IiwianNvbkNsb25lIiwiZSIsImJlIiwibnVsbCIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsInN0cmluZyIsIkNvbmZpZ3VyYXRvciIsImJhc2VVcmwiLCJkZWZhdWx0cyIsImludGVyY2VwdG9ycyIsIndpdGhCYXNlVXJsIiwid2l0aERlZmF1bHRzIiwid2l0aEludGVyY2VwdG9yIiwiaW50ZXJjZXB0b3IiLCJ1c2VTdGFuZGFyZENvbmZpZ3VyYXRvciIsInN0YW5kYXJkQ29uZmlnIiwibW9kZSIsImNyZWRlbnRpYWxzIiwiaGVhZGVycyIsIkFjY2VwdCIsInJlamVjdEVycm9yUmVzcG9uc2VzIiwicmVzcG9uc2UiLCJyZWplY3RPbkVycm9yIiwib2siLCJpbnB1dCIsImludGVyY2VwdG9yQXJncyIsInN1Y2Nlc3NOYW1lIiwiZXJyb3JOYW1lIiwicmVkdWNlIiwiY2hhaW4iLCJzdWNjZXNzSGFuZGxlciIsImVycm9ySGFuZGxlciIsInRoZW4iLCJpZGVudGl0eSIsInJlYXNvbiIsInRocm93ZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsIngiLCJidWlsZFJlcXVlc3QiLCJpbml0IiwicmVxdWVzdCIsInJlcXVlc3RDb250ZW50VHlwZSIsInBhcnNlZERlZmF1bHRIZWFkZXJzIiwicGFyc2VIZWFkZXJWYWx1ZXMiLCJSZXF1ZXN0IiwiSGVhZGVycyIsImJvZHlPYmoiLCJyZXF1ZXN0SW5pdCIsImdldFJlcXVlc3RVcmwiLCJoYXMiLCJpc0pTT04iLCJzZXREZWZhdWx0SGVhZGVycyIsIkJsb2IiLCJwcm9jZXNzUmVxdWVzdCIsImFwcGx5SW50ZXJjZXB0b3JzIiwicHJvY2Vzc1Jlc3BvbnNlIiwicGFyc2VkSGVhZGVycyIsImFic29sdXRlVXJsUmVnZXhwIiwidXJsIiwidGVzdCIsImRlZmF1bHRIZWFkZXJzIiwic3RyIiwiY29uZmlndXJlIiwiZmV0Y2giLCJjcmVhdGVDb25maWciLCJmZXRjaEFwaSIsInJlc3VsdCIsIlJlc3BvbnNlIiwiYmVmb3JlRWFjaCIsImh0dHBDbGllbnRGYWN0b3J5IiwianNvbiIsImZvbyIsImRvbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBO0FBQ0EsRUFBTyxJQUFNQSxZQUFZLENBQUMsUUFBUUMsTUFBUix5Q0FBUUEsTUFBUixVQUF1QkMsUUFBdkIseUNBQXVCQSxRQUF2QixHQUFpQ0MsUUFBakMsQ0FDeEIsV0FEd0IsQ0FBbkI7O0FBSVAsRUFBTyxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsRUFBRDtFQUFBLE1BQUtDLEtBQUwsdUVBQWEsSUFBYjtFQUFBLFNBQXNCLFlBRXhDO0VBQ0gsUUFBSU4sU0FBSixFQUFlO0VBQ2IsYUFBT0ssOEJBQVA7RUFDRDtFQUNE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
