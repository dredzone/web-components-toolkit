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

  function processRequest(request, config) {
    return applyInterceptors(request, config.interceptors, 'request', 'requestError', config);
  }

  function processResponse(response, request, config) {
    return applyInterceptors(response, config.interceptors, 'response', 'responseError', request, config);
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2NvbmZpZ3VyYXRvci5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9yZXF1ZXN0LWJ1aWxkZXIuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQvaW50ZXJjZXB0b3IuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQvY2xpZW50LWZhY3RvcnkuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9ICFbdHlwZW9mIHdpbmRvdywgdHlwZW9mIGRvY3VtZW50XS5pbmNsdWRlcyhcbiAgJ3VuZGVmaW5lZCdcbik7XG5cbmV4cG9ydCBjb25zdCBicm93c2VyID0gKGZuLCByYWlzZSA9IHRydWUpID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbiAgaWYgKHJhaXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2ZuLm5hbWV9IGZvciBicm93c2VyIHVzZSBvbmx5YCk7XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcihcbiAgKFxuICAgIHRhcmdldCxcbiAgICB0eXBlLFxuICAgIGxpc3RlbmVyLFxuICAgIGNhcHR1cmUgPSBmYWxzZVxuICApID0+IHtcbiAgICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdwcm9wZXJ0aWVzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2V2ZW50cy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gJ01hcCBTZXQgU3ltYm9sIEFycmF5IE9iamVjdCBTdHJpbmcgRGF0ZSBSZWdFeHAgRnVuY3Rpb24gQm9vbGVhbiBOdW1iZXIgTnVsbCBVbmRlZmluZWQgQXJndW1lbnRzIEVycm9yJy5zcGxpdChcbiAgJyAnXG4pO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcbmNvbnN0IGlzID0gc2V0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuXG5jb25zdCBjbG9uZSA9IGZ1bmN0aW9uKFxuICBzcmMsXG4gIGNpcmN1bGFycyA9IFtdLFxuICBjbG9uZXMgPSBbXVxuKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKHR5cGUuZGF0ZShzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNyYy5nZXRUaW1lKCkpO1xuICB9XG5cbiAgLy8gUmVnRXhwXG4gIGlmICh0eXBlLnJlZ2V4cChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc3JjKTtcbiAgfVxuXG4gIC8vIEFycmF5c1xuICBpZiAodHlwZS5hcnJheShzcmMpKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAoY2xvbmUpO1xuICB9XG5cbiAgLy8gRVM2IE1hcHNcbiAgaWYgKHR5cGUubWFwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHNyYy5lbnRyaWVzKCkpKTtcbiAgfVxuXG4gIC8vIEVTNiBTZXRzXG4gIGlmICh0eXBlLnNldChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbShzcmMudmFsdWVzKCkpKTtcbiAgfVxuXG4gIC8vIE9iamVjdFxuICBpZiAodHlwZS5vYmplY3Qoc3JjKSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHNyYyk7XG4gICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShzcmMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHNyYykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHNyY1trZXldKTtcbiAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHNyY1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xvbmU7XG5cbmV4cG9ydCBjb25zdCBqc29uQ2xvbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn07XG4iLCJpbXBvcnQgY2xvbmUsIHsganNvbkNsb25lIH0gZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiwgcmV0dXJucyB0aGUgc2FtZSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGpzb25DbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihqc29uQ2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuXG5cbi8qKlxuICogVGhlIGluaXQgb2JqZWN0IHVzZWQgdG8gaW5pdGlhbGl6ZSBhIGZldGNoIFJlcXVlc3QuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QvUmVxdWVzdFxuICovXG5cbi8qKlxuICogQSBjbGFzcyBmb3IgY29uZmlndXJpbmcgSHR0cENsaWVudHMuXG4gKi9cbmNsYXNzIENvbmZpZ3VyYXRvciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gJyc7XG4gICAgdGhpcy5kZWZhdWx0cyA9IHt9O1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzID0gW107XG4gIH1cblxuICB3aXRoQmFzZVVybChiYXNlVXJsKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhEZWZhdWx0cyhkZWZhdWx0cykge1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzLnB1c2goaW50ZXJjZXB0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKSB7XG4gICAgbGV0IHN0YW5kYXJkQ29uZmlnID0ge1xuICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSSdcbiAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5kZWZhdWx0cywgc3RhbmRhcmRDb25maWcsIHRoaXMuZGVmYXVsdHMpO1xuICAgIHJldHVybiB0aGlzLnJlamVjdEVycm9yUmVzcG9uc2VzKCk7XG4gIH1cblxuICByZWplY3RFcnJvclJlc3BvbnNlcygpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoSW50ZXJjZXB0b3IoeyByZXNwb25zZTogcmVqZWN0T25FcnJvciB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBuZXcgQ29uZmlndXJhdG9yKCk7XG5cbmZ1bmN0aW9uIHJlamVjdE9uRXJyb3IocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHRocm93IHJlc3BvbnNlO1xuICB9XG5cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCB7IH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoaW5wdXQsIGluaXQsIGNvbmZpZykgPT4ge1xuICBsZXQgZGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHMgfHwge307XG4gIGxldCByZXF1ZXN0O1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgcmVxdWVzdENvbnRlbnRUeXBlO1xuXG4gIGxldCBwYXJzZWREZWZhdWx0SGVhZGVycyA9IHBhcnNlSGVhZGVyVmFsdWVzKGRlZmF1bHRzLmhlYWRlcnMpO1xuICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgcmVxdWVzdCA9IGlucHV0O1xuICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3QuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgfSBlbHNlIHtcbiAgICBpbml0IHx8IChpbml0ID0ge30pO1xuICAgIGJvZHkgPSBpbml0LmJvZHk7XG4gICAgbGV0IGJvZHlPYmogPSBib2R5ID8geyBib2R5IH0gOiBudWxsO1xuICAgIGxldCByZXF1ZXN0SW5pdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCB7IGhlYWRlcnM6IHt9IH0sIGluaXQsIGJvZHlPYmopO1xuICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3RJbml0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGdldFJlcXVlc3RVcmwoY29uZmlnLmJhc2VVcmwsIGlucHV0KSwgcmVxdWVzdEluaXQpO1xuICB9XG4gIGlmICghcmVxdWVzdENvbnRlbnRUeXBlKSB7XG4gICAgaWYgKG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBuZXcgSGVhZGVycyhwYXJzZWREZWZhdWx0SGVhZGVycykuZ2V0KCdjb250ZW50LXR5cGUnKSk7XG4gICAgfSBlbHNlIGlmIChib2R5ICYmIGlzSlNPTihTdHJpbmcoYm9keSkpKSB7XG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIH1cbiAgfVxuICBzZXREZWZhdWx0SGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMsIHBhcnNlZERlZmF1bHRIZWFkZXJzKTtcbiAgaWYgKGJvZHkgJiYgYm9keSBpbnN0YW5jZW9mIEJsb2IgJiYgYm9keS50eXBlKSB7XG4gICAgLy8gd29yayBhcm91bmQgYnVnIGluIElFICYgRWRnZSB3aGVyZSB0aGUgQmxvYiB0eXBlIGlzIGlnbm9yZWQgaW4gdGhlIHJlcXVlc3RcbiAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzIxMzYxNjNcbiAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBib2R5LnR5cGUpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJWYWx1ZXMoaGVhZGVycykge1xuICBsZXQgcGFyc2VkSGVhZGVycyA9IHt9O1xuICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcGFyc2VkSGVhZGVyc1tuYW1lXSA9IHR5cGUuZnVuY3Rpb24oaGVhZGVyc1tuYW1lXSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyogICovXG5cblxuZXhwb3J0IGRlZmF1bHQgKFxuICBpbnB1dCxcbiAgaW50ZXJjZXB0b3JzID0gW10sXG4gIHN1Y2Nlc3NOYW1lLFxuICBlcnJvck5hbWUsXG4gIC4uLmludGVyY2VwdG9yQXJnc1xuKSA9PlxuICBpbnRlcmNlcHRvcnMucmVkdWNlKChjaGFpbiwgaW50ZXJjZXB0b3IpID0+IHtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3Qgc3VjY2Vzc0hhbmRsZXIgPSBpbnRlcmNlcHRvcltzdWNjZXNzTmFtZV0gJiYgaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdLmJpbmQoaW50ZXJjZXB0b3IpO1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbnRlcmNlcHRvcltlcnJvck5hbWVdICYmIGludGVyY2VwdG9yW2Vycm9yTmFtZV0uYmluZChpbnRlcmNlcHRvcik7XG5cbiAgICByZXR1cm4gY2hhaW4udGhlbihcbiAgICAgIChzdWNjZXNzSGFuZGxlciAmJiAodmFsdWUgPT4gc3VjY2Vzc0hhbmRsZXIodmFsdWUsIC4uLmludGVyY2VwdG9yQXJncykpKSB8fCBpZGVudGl0eSxcbiAgICAgIChlcnJvckhhbmRsZXIgJiYgKHJlYXNvbiA9PiBlcnJvckhhbmRsZXIocmVhc29uLCAuLi5pbnRlcmNlcHRvckFyZ3MpKSkgfHwgdGhyb3dlclxuICAgICk7XG4gIH0sIFByb21pc2UucmVzb2x2ZShpbnB1dCkpO1xuXG5mdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gIHJldHVybiB4O1xufVxuXG5mdW5jdGlvbiB0aHJvd2VyKHgpIHtcbiAgdGhyb3cgeDtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi4vdHlwZS5qcyc7XG5pbXBvcnQge1xuICBkZWZhdWx0IGFzIGNyZWF0ZUNvbmZpZ1xufSBmcm9tICcuL2NvbmZpZ3VyYXRvci5qcyc7XG5pbXBvcnQgYnVpbGRSZXF1ZXN0IGZyb20gJy4vcmVxdWVzdC1idWlsZGVyLmpzJztcbmltcG9ydCBhcHBseUludGVyY2VwdG9ycyBmcm9tICcuL2ludGVyY2VwdG9yLmpzJztcblxuXG5leHBvcnQgZGVmYXVsdCAoY29uZmlndXJlKSA9PiB7XG4gIGlmICh0eXBlLnVuZGVmaW5lZChmZXRjaCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIlxuICAgICk7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuXG4gIGNvbnN0IGZldGNoQXBpID0gKFxuICAgIGlucHV0LFxuICAgIGluaXQgPSB7fVxuICApID0+IHtcbiAgICBsZXQgcmVxdWVzdCA9IGJ1aWxkUmVxdWVzdChpbnB1dCwgaW5pdCwgY29uZmlnKTtcblxuICAgIHJldHVybiBwcm9jZXNzUmVxdWVzdChyZXF1ZXN0LCBjb25maWcpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlLCByZXF1ZXN0LCBjb25maWcpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIGZldGNoQXBpKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBmZXRjaEFwaTtcbn07XG5cbmZ1bmN0aW9uIHByb2Nlc3NSZXF1ZXN0KFxuICByZXF1ZXN0LFxuICBjb25maWdcbikge1xuICByZXR1cm4gYXBwbHlJbnRlcmNlcHRvcnMoXG4gICAgcmVxdWVzdCxcbiAgICBjb25maWcuaW50ZXJjZXB0b3JzLFxuICAgICdyZXF1ZXN0JyxcbiAgICAncmVxdWVzdEVycm9yJyxcbiAgICBjb25maWdcbiAgKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1Jlc3BvbnNlKFxuICByZXNwb25zZSxcbiAgcmVxdWVzdCxcbiAgY29uZmlnXG4pIHtcbiAgcmV0dXJuIGFwcGx5SW50ZXJjZXB0b3JzKFxuICAgIHJlc3BvbnNlLFxuICAgIGNvbmZpZy5pbnRlcmNlcHRvcnMsXG4gICAgJ3Jlc3BvbnNlJyxcbiAgICAncmVzcG9uc2VFcnJvcicsXG4gICAgcmVxdWVzdCxcbiAgICBjb25maWdcbiAgKTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGZhY3RvcnkgZnJvbSAnLi9odHRwLWNsaWVudC9jbGllbnQtZmFjdG9yeS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZhY3Rvcnk7XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vbGliL2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50JywgKCkgPT4ge1xuXG5cdGRlc2NyaWJlKCdzdGFuZGFyZCBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGZldGNoO1xuXHRcdGJlZm9yZUVhY2goKCkgPT4ge1xuXHRcdFx0ZmV0Y2ggPSBodHRwQ2xpZW50RmFjdG9yeShjb25maWcgPT4ge1xuXHRcdFx0XHRjb25maWcudXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0aXQoJ2FibGUgdG8gbWFrZSBhIEdFVCByZXF1ZXN0JywgZG9uZSA9PiB7XG5cdFx0XHRmZXRjaCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdH0pXG5cdFx0fSk7XG5cdH0pO1xufSk7Il0sIm5hbWVzIjpbImlzQnJvd3NlciIsIndpbmRvdyIsImRvY3VtZW50IiwiaW5jbHVkZXMiLCJicm93c2VyIiwiZm4iLCJyYWlzZSIsIkVycm9yIiwibmFtZSIsImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtaWNyb1Rhc2tGbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwibWljcm9UYXNrIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYW5jZWwiLCJoYW5kbGUiLCJpZHgiLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwia2V5cyIsImFzc2lnbiIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsInR5cGUiLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYmVmb3JlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwiZGF0YSIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwibWFwIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsInBvcCIsIlByb3BlcnRpZXNNaXhpblRlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsImN1c3RvbUVsZW1lbnQiLCJkZXNjcmliZSIsImNvbnRhaW5lciIsInByb3BlcnRpZXNNaXhpblRlc3QiLCJjcmVhdGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlciIsImlubmVySFRNTCIsIml0IiwiYXNzZXJ0IiwiZXF1YWwiLCJsaXN0ZW5FdmVudCIsImlzT2siLCJldnQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJkaXNwYXRjaCIsIm9mZiIsImhhbmRsZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJzdG9wRXZlbnQiLCJjaGFpIiwiZXhwZWN0IiwidG8iLCJhIiwiZGVlcCIsImJvZHkiLCJ0ZW1wbGF0ZSIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJodG1sIiwidHJpbSIsImZyYWciLCJ0ZW1wbGF0ZUNvbnRlbnQiLCJmaXJzdENoaWxkIiwiZWwiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImluc3RhbmNlT2YiLCJOb2RlIiwiYXJyIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsImlzIiwic2V0dXAiLCJjaGVja3MiLCJnZXRUeXBlIiwibWF0Y2hlcyIsImNsb25lIiwic3JjIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwib2JqZWN0IiwiZnVuY3Rpb24iLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJrZXkiLCJmaW5kSW5kZXgiLCJqc29uQ2xvbmUiLCJlIiwiYmUiLCJudWxsIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwic3RyaW5nIiwiQ29uZmlndXJhdG9yIiwiYmFzZVVybCIsImRlZmF1bHRzIiwiaW50ZXJjZXB0b3JzIiwid2l0aEJhc2VVcmwiLCJ3aXRoRGVmYXVsdHMiLCJ3aXRoSW50ZXJjZXB0b3IiLCJpbnRlcmNlcHRvciIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJvayIsImlucHV0IiwiaW5pdCIsInJlcXVlc3QiLCJyZXF1ZXN0Q29udGVudFR5cGUiLCJwYXJzZWREZWZhdWx0SGVhZGVycyIsInBhcnNlSGVhZGVyVmFsdWVzIiwiUmVxdWVzdCIsIkhlYWRlcnMiLCJib2R5T2JqIiwicmVxdWVzdEluaXQiLCJnZXRSZXF1ZXN0VXJsIiwiaGFzIiwiaXNKU09OIiwic2V0RGVmYXVsdEhlYWRlcnMiLCJCbG9iIiwicGFyc2VkSGVhZGVycyIsImFic29sdXRlVXJsUmVnZXhwIiwidXJsIiwidGVzdCIsImRlZmF1bHRIZWFkZXJzIiwic3RyIiwiaW50ZXJjZXB0b3JBcmdzIiwic3VjY2Vzc05hbWUiLCJlcnJvck5hbWUiLCJyZWR1Y2UiLCJjaGFpbiIsInN1Y2Nlc3NIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwidGhlbiIsImlkZW50aXR5IiwicmVhc29uIiwidGhyb3dlciIsIlByb21pc2UiLCJyZXNvbHZlIiwieCIsImNvbmZpZ3VyZSIsImZldGNoIiwiY3JlYXRlQ29uZmlnIiwiZmV0Y2hBcGkiLCJidWlsZFJlcXVlc3QiLCJwcm9jZXNzUmVxdWVzdCIsInJlc3VsdCIsIlJlc3BvbnNlIiwicHJvY2Vzc1Jlc3BvbnNlIiwiYXBwbHlJbnRlcmNlcHRvcnMiLCJiZWZvcmVFYWNoIiwiaHR0cENsaWVudEZhY3RvcnkiLCJqc29uIiwiZm9vIiwiZG9uZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQUE7QUFDQSxFQUFPLElBQU1BLFlBQVksQ0FBQyxRQUFRQyxNQUFSLHlDQUFRQSxNQUFSLFVBQXVCQyxRQUF2Qix5Q0FBdUJBLFFBQXZCLEdBQWlDQyxRQUFqQyxDQUN4QixXQUR3QixDQUFuQjs7QUFJUCxFQUFPLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxFQUFEO0VBQUEsTUFBS0MsS0FBTCx1RUFBYSxJ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
