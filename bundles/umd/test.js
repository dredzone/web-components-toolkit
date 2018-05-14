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

  /*  */
  var dget = (function (obj, key) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    if (key.indexOf('.') === -1) {
      return obj[key] ? obj[key] : defaultValue;
    }
    var parts = key.split('.');
    var length = parts.length;
    var object = obj;

    for (var i = 0; i < length; i++) {
      object = object[parts[i]];
      if (typeof object === 'undefined') {
        object = defaultValue;
        return;
      }
    }
    return object;
  });

  /*  */
  var dset = (function (obj, key, value) {
    if (key.indexOf('.') === -1) {
      obj[key] = value;
      return;
    }
    var parts = key.split('.');
    var depth = parts.length - 1;
    var object = obj;

    for (var i = 0; i < depth; i++) {
      if (typeof object[parts[i]] === 'undefined') {
        object[parts[i]] = {};
      }
      object = object[parts[i]];
    }
    object[parts[depth]] = value;
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
        if (!is.string(arg1) && is.undefined(arg2)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL3VuaXF1ZS1pZC5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL2NvbW1vbnMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci91bndyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9hcHBseS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL3dyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWNsYXJlLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvaXMtYXBwbGljYXRpb24tb2YuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9oYXMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWR1cGUuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9jYWNoZS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL21peGluLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQvY29uZmlndXJhdG9yLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2FwcGx5LWludGVyY2VwdG9ycy5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9yZXF1ZXN0LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2ZldGNoLWNsaWVudC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9jb25maWd1cmUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL21vZGVsLmpzIiwiLi4vLi4vdGVzdC9tb2RlbC5qcyIsIi4uLy4uL2xpYi9ldmVudC1odWIuanMiLCIuLi8uLi90ZXN0L2V2ZW50LWh1Yi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBjb25zdCBpc0Jyb3dzZXIgPSAhW3R5cGVvZiB3aW5kb3csIHR5cGVvZiBkb2N1bWVudF0uaW5jbHVkZXMoXG4gICd1bmRlZmluZWQnXG4pO1xuXG5leHBvcnQgY29uc3QgYnJvd3NlciA9IChmbiwgcmFpc2UgPSB0cnVlKSA9PiAoXG4gIC4uLmFyZ3NcbikgPT4ge1xuICBpZiAoaXNCcm93c2VyKSB7XG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xuICB9XG4gIGlmIChyYWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtmbi5uYW1lfSBmb3IgYnJvd3NlciB1c2Ugb25seWApO1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pXG4pID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge1xuICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG59KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gICAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gICAqL1xuICBydW4oY2FsbGJhY2spIHtcbiAgICBtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuICAgIG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICBjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgaWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi8uLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWVzXG4gIH07XG4gIF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICBnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKFxuICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgIG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWVcbiAgICApIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi8uLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPVxuICAgICAgY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9XG4gICAgICAgIHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHNcbiAgICApIHtcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgIE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5vdGlmeSxcbiAgICAgICAgICBoYXNPYnNlcnZlcixcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGUsXG4gICAgICAgICAgaXNPYnNlcnZlclN0cmluZyxcbiAgICAgICAgICBvYnNlcnZlclxuICAgICAgICB9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICBpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGAke3Byb3BlcnR5fS1jaGFuZ2VkYCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZTogb2xkUHJvcHNbcHJvcGVydHldXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+XG4gICAgICAgICAgdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSlcbiAgICAgICAgKSB8fCBbXVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PlxuICAgICAgICAgIG1hdGNoWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKFxuICAgICAgICAgIGF0dHJpYnV0ZVxuICAgICAgICApO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV1cbiAgICAgICAgLnR5cGU7XG4gICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNOdW1iZXIsXG4gICAgICAgIGlzQXJyYXksXG4gICAgICAgIGlzQm9vbGVhbixcbiAgICAgICAgaXNEYXRlLFxuICAgICAgICBpc1N0cmluZyxcbiAgICAgICAgaXNPYmplY3RcbiAgICAgIH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9XG4gICAgICAgICAgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBpc0FycmF5XG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHt9XG4gICAgICAgICAgICA6IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc0RhdGUpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlDb25maWcgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1tcbiAgICAgICAgcHJvcGVydHlcbiAgICAgIF07XG4gICAgICBjb25zdCB7IGlzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXkgfSA9IHByb3BlcnR5Q29uZmlnO1xuXG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGxldCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZykge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0ge307XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhT2xkICYmICEocHJvcGVydHkgaW4gcHJpdmF0ZXModGhpcykuZGF0YU9sZCkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZ1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cblxuICAgIF9pbnZhbGlkYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9mbHVzaFByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZztcbiAgICAgIGNvbnN0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFPbGQ7XG5cbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oY2hhbmdlZFByb3BzKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFN0cmljdCBlcXVhbGl0eSBjaGVja1xuICAgICAgICBvbGQgIT09IHZhbHVlICYmXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyAob2xkPT1OYU4sIHZhbHVlPT1OYU4pIGFsd2F5cyByZXR1cm5zIGZhbHNlXG4gICAgICAgIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICApO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoXG4gIChcbiAgICB0YXJnZXQsXG4gICAgdHlwZSxcbiAgICBsaXN0ZW5lcixcbiAgICBjYXB0dXJlID0gZmFsc2VcbiAgKSA9PiB7XG4gICAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICB9XG4pO1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBldmVudCBlbWl0dGVyJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHR5cGUuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICBsZXQgZXZlbnRzID0gdHlwZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gICAgbGV0IGhhbmRsZXMgPSBldmVudHMubWFwKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICBsZXQgaGFuZGxlO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZSA9IGhhbmRsZXMucG9wKCkpKSB7XG4gICAgICAgICAgaGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzTWl4aW5UZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc01peGluVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5kZXNjcmliZSgncHJvcGVydGllcy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzTWl4aW5UZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyczogW11cbiAgICB9O1xuICB9KTtcbiAgY29uc3QgZXZlbnREZWZhdWx0UGFyYW1zID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEV2ZW50cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGFmdGVyKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IGBvbiR7ZXZlbnQudHlwZX1gO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW2hhbmRsZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICB0aGlzW2hhbmRsZV0oZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB0aGlzLm93bihsaXN0ZW5FdmVudCh0aGlzLCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIG9mZigpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgaGFuZGxlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG93biguLi5oYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGNvbnRleHQub2ZmKCk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChlbGVtZW50KSA9PiB7XG4gIGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn0pO1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3JlbW92ZS1lbGVtZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdldmVudHMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigodGVtcGxhdGUpID0+IHtcbiAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBjaGlsZHJlbiA9IHRlbXBsYXRlLmNoaWxkTm9kZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHRlbXBsYXRlQ29udGVudCBmcm9tICcuL3RlbXBsYXRlLWNvbnRlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn0pO1xuIiwiaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMnO1xuXG5kZXNjcmliZSgnY3JlYXRlLWVsZW1lbnQnLCAoKSA9PiB7XG4gIGl0KCdjcmVhdGUgZWxlbWVudCcsICgpID0+IHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQoYFxuXHRcdFx0PGRpdiBjbGFzcz1cIm15LWNsYXNzXCI+SGVsbG8gV29ybGQ8L2Rpdj5cblx0XHRgKTtcbiAgICBleHBlY3QoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdteS1jbGFzcycpKS50by5lcXVhbCh0cnVlKTtcbiAgICBhc3NlcnQuaW5zdGFuY2VPZihlbCwgTm9kZSwgJ2VsZW1lbnQgaXMgaW5zdGFuY2Ugb2Ygbm9kZScpO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdNYXAgU2V0IFN5bWJvbCBBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoXG4gICcgJ1xuKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IG9iaiA9PiBnZXRUeXBlKG9iaikgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZShvYmopIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKG9iaik7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcblxuY29uc3QgY2xvbmUgPSBmdW5jdGlvbihcbiAgc3JjLFxuICBjaXJjdWxhcnMgPSBbXSxcbiAgY2xvbmVzID0gW11cbikge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmICghc3JjIHx8ICF0eXBlLm9iamVjdChzcmMpIHx8IHR5cGUuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBEYXRlXG4gIGlmICh0eXBlLmRhdGUoc3JjKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShzcmMuZ2V0VGltZSgpKTtcbiAgfVxuXG4gIC8vIFJlZ0V4cFxuICBpZiAodHlwZS5yZWdleHAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNyYyk7XG4gIH1cblxuICAvLyBBcnJheXNcbiAgaWYgKHR5cGUuYXJyYXkoc3JjKSkge1xuICAgIHJldHVybiBzcmMubWFwKGNsb25lKTtcbiAgfVxuXG4gIC8vIEVTNiBNYXBzXG4gIGlmICh0eXBlLm1hcChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbShzcmMuZW50cmllcygpKSk7XG4gIH1cblxuICAvLyBFUzYgU2V0c1xuICBpZiAodHlwZS5zZXQoc3JjKSkge1xuICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20oc3JjLnZhbHVlcygpKSk7XG4gIH1cblxuICAvLyBPYmplY3RcbiAgaWYgKHR5cGUub2JqZWN0KHNyYykpIHtcbiAgICBjaXJjdWxhcnMucHVzaChzcmMpO1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoc3JjKTtcbiAgICBjbG9uZXMucHVzaChvYmopO1xuICAgIGZvciAobGV0IGtleSBpbiBzcmMpIHtcbiAgICAgIGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSBzcmNba2V5XSk7XG4gICAgICBvYmpba2V5XSA9IGlkeCA+IC0xID8gY2xvbmVzW2lkeF0gOiBjbG9uZShzcmNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcmV0dXJuIHNyYztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lO1xuXG5leHBvcnQgY29uc3QganNvbkNsb25lID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59O1xuIiwiaW1wb3J0IGNsb25lLCB7IGpzb25DbG9uZSB9IGZyb20gJy4uLy4uL2xpYi9vYmplY3QvY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnY2xvbmUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdwcmltaXRpdmVzJywgKCkgPT4ge1xuICAgIGl0KCdSZXR1cm5zIGVxdWFsIGRhdGEgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdqc29uQ2xvbmUnLCAoKSA9PiB7XG4gICAgaXQoJ1doZW4gbm9uLXNlcmlhbGl6YWJsZSB2YWx1ZSBpcyBwYXNzZWQgaW4sIHJldHVybnMgdGhlIHNhbWUgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oanNvbkNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi90eXBlLmpzJztcblxuZGVzY3JpYmUoJ3R5cGUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3Qgbm90QXJncyA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhub3RBcmdzKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYWxsIHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFsbChhcmdzLCBhcmdzLCBhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbnkgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBhcnJheSA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IGJvb2wgPSB0cnVlO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEJvb2wgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bGwgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcbiAgICAgIGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE9iamVjdCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcbiAgICAgIGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCBub3RSZWdleHAgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG5ldyBNYXAoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5tYXAoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobmV3IFNldCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnNldChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cblxubGV0IHByZXZUaW1lSWQgPSAwO1xubGV0IHByZXZVbmlxdWVJZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IChwcmVmaXgpID0+IHtcbiAgbGV0IG5ld1VuaXF1ZUlkID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5ld1VuaXF1ZUlkID09PSBwcmV2VGltZUlkKSB7XG4gICAgKytwcmV2VW5pcXVlSWQ7XG4gIH0gZWxzZSB7XG4gICAgcHJldlRpbWVJZCA9IG5ld1VuaXF1ZUlkO1xuICAgIHByZXZVbmlxdWVJZCA9IDA7XG4gIH1cblxuICBsZXQgdW5pcXVlSWQgPSBgJHtTdHJpbmcobmV3VW5pcXVlSWQpfSR7U3RyaW5nKHByZXZVbmlxdWVJZCl9YDtcbiAgaWYgKHByZWZpeCkge1xuICAgIHVuaXF1ZUlkID0gYCR7cHJlZml4fV8ke3VuaXF1ZUlkfWA7XG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUlkO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4uL3VuaXF1ZS1pZC5qcyc7XG5cbi8vIHVzZWQgYnkgd3JhcCgpIGFuZCB1bndyYXAoKVxuZXhwb3J0IGNvbnN0IHdyYXBwZWRNaXhpbktleSA9IHVuaXF1ZUlkKCdfd3JhcHBlZE1peGluJyk7XG5cbi8vIHVzZWQgYnkgYXBwbHkoKSBhbmQgaXNBcHBsaWNhdGlvbk9mKClcbmV4cG9ydCBjb25zdCBhcHBsaWVkTWl4aW5LZXkgPSB1bmlxdWVJZCgnX2FwcGxpZWRNaXhpbicpO1xuIiwiLyogICovXG5pbXBvcnQgeyB3cmFwcGVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuXG4vKipcbiAqIFVud3JhcHMgdGhlIGZ1bmN0aW9uIGB3cmFwcGVyYCB0byByZXR1cm4gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdyYXBwZWQgYnlcbiAqIG9uZSBvciBtb3JlIGNhbGxzIHRvIGB3cmFwYC4gUmV0dXJucyBgd3JhcHBlcmAgaWYgaXQncyBub3QgYSB3cmFwcGVkXG4gKiBmdW5jdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHdyYXBwZXIgQSB3cmFwcGVkIG1peGluIHByb2R1Y2VkIGJ5IHtAbGluayB3cmFwfVxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBvcmlnaW5hbGx5IHdyYXBwZWQgbWl4aW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKHdyYXBwZXIpID0+XG4gIHdyYXBwZXJbd3JhcHBlZE1peGluS2V5XSB8fCB3cmFwcGVyO1xuIiwiLyogICovXG5pbXBvcnQgeyBhcHBsaWVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbi8qKlxuICogQXBwbGllcyBgbWl4aW5gIHRvIGBzdXBlcmNsYXNzYC5cbiAqXG4gKiBgYXBwbHlgIHN0b3JlcyBhIHJlZmVyZW5jZSBmcm9tIHRoZSBtaXhpbiBhcHBsaWNhdGlvbiB0byB0aGUgdW53cmFwcGVkIG1peGluXG4gKiB0byBtYWtlIGBpc0FwcGxpY2F0aW9uT2ZgIGFuZCBgaGFzTWl4aW5gIHdvcmsuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VmdWxsIGZvciBtaXhpbiB3cmFwcGVycyB0aGF0IHdhbnQgdG8gYXV0b21hdGljYWxseSBlbmFibGVcbiAqIHtAbGluayBoYXNNaXhpbn0gc3VwcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN1cGVyQ2xhc3MgQSBjbGFzcyBvciBjb25zdHJ1Y3RvciBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIGFwcGx5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBzdWJjbGFzcyBvZiBgc3VwZXJjbGFzc2AgcHJvZHVjZWQgYnkgYG1peGluYFxuICovXG5leHBvcnQgZGVmYXVsdCAoc3VwZXJDbGFzcywgbWl4aW4pID0+IHtcbiAgbGV0IGFwcGxpY2F0aW9uID0gbWl4aW4oc3VwZXJDbGFzcyk7XG4gIGNvbnN0IHByb3RvID0gYXBwbGljYXRpb24ucHJvdG90eXBlO1xuICBwcm90b1thcHBsaWVkTWl4aW5LZXldID0gdW53cmFwKG1peGluKTtcbiAgcmV0dXJuIGFwcGxpY2F0aW9uO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgd3JhcHBlZE1peGluS2V5IH0gZnJvbSAnLi9jb21tb25zLmpzJztcblxuY29uc3QgeyBzZXRQcm90b3R5cGVPZiB9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIGZ1bmN0aW9uIGBtaXhpbmAgdG8gYmUgd3JhcHBlZCBieSB0aGUgZnVuY3Rpb24gYHdyYXBwZXJgLCB3aGlsZVxuICogYWxsb3dpbmcgcHJvcGVydGllcyBvbiBgbWl4aW5gIHRvIGJlIGF2YWlsYWJsZSB2aWEgYHdyYXBwZXJgLCBhbmQgYWxsb3dpbmdcbiAqIGB3cmFwcGVyYCB0byBiZSB1bndyYXBwZWQgdG8gZ2V0IHRvIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAqXG4gKiBgd3JhcGAgZG9lcyB0d28gdGhpbmdzOlxuICogICAxLiBTZXRzIHRoZSBwcm90b3R5cGUgb2YgYG1peGluYCB0byBgd3JhcHBlcmAgc28gdGhhdCBwcm9wZXJ0aWVzIHNldCBvblxuICogICAgICBgbWl4aW5gIGluaGVyaXRlZCBieSBgd3JhcHBlcmAuXG4gKiAgIDIuIFNldHMgYSBzcGVjaWFsIHByb3BlcnR5IG9uIGBtaXhpbmAgdGhhdCBwb2ludHMgYmFjayB0byBgbWl4aW5gIHNvIHRoYXRcbiAqICAgICAgaXQgY2FuIGJlIHJldHJlaXZlZCBmcm9tIGB3cmFwcGVyYFxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gQSBtaXhpbiBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBBIGZ1bmN0aW9uIHRoYXQgd3JhcHMge0BsaW5rIG1peGlufVxuICogQHJldHVybiB7RnVuY3Rpb259IGB3cmFwcGVyYFxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4sIHdyYXBwZXIpID0+IHtcbiAgc2V0UHJvdG90eXBlT2Yod3JhcHBlciwgbWl4aW4pO1xuICBpZiAoIW1peGluW3dyYXBwZWRNaXhpbktleV0pIHtcbiAgICBtaXhpblt3cmFwcGVkTWl4aW5LZXldID0gbWl4aW47XG4gIH1cbiAgcmV0dXJuIHdyYXBwZXI7XG59O1xuIiwiLyogICovXG5pbXBvcnQgYXBwbHkgZnJvbSAnLi9hcHBseS5qcyc7XG5pbXBvcnQgd3JhcCBmcm9tICcuL3dyYXAuanMnO1xuXG4vKipcbiAqIEEgYmFzaWMgbWl4aW4gZGVjb3JhdG9yIHRoYXQgYXBwbGllcyB0aGUgbWl4aW4gd2l0aCB7QGxpbmsgYXBwbHlNaXhpbn0gc28gdGhhdCBpdFxuICogY2FuIGJlIHVzZWQgd2l0aCB7QGxpbmsgaXNBcHBsaWNhdGlvbk9mfSwge0BsaW5rIGhhc01peGlufSBhbmQgdGhlIG90aGVyXG4gKiBtaXhpbiBkZWNvcmF0b3IgZnVuY3Rpb25zLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIHdyYXBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhIG5ldyBtaXhpbiBmdW5jdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+XG4gIHdyYXAobWl4aW4sIChzdXBlckNsYXNzKSA9PiBhcHBseShzdXBlckNsYXNzLCBtaXhpbikpO1xuIiwiLyogICovXG5pbXBvcnQgeyBhcHBsaWVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbmNvbnN0IHsgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZmYgYHByb3RvYCBpcyBhIHByb3RvdHlwZSBjcmVhdGVkIGJ5IHRoZSBhcHBsaWNhdGlvbiBvZlxuICogYG1peGluYCB0byBhIHN1cGVyY2xhc3MuXG4gKlxuICogYGlzQXBwbGljYXRpb25PZmAgd29ya3MgYnkgY2hlY2tpbmcgdGhhdCBgcHJvdG9gIGhhcyBhIHJlZmVyZW5jZSB0byBgbWl4aW5gXG4gKiBhcyBjcmVhdGVkIGJ5IGBhcHBseWAuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gQSBwcm90b3R5cGUgb2JqZWN0IGNyZWF0ZWQgYnkge0BsaW5rIGFwcGx5fS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1peGluIEEgbWl4aW4gZnVuY3Rpb24gdXNlZCB3aXRoIHtAbGluayBhcHBseX0uXG4gKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGBwcm90b2AgaXMgYSBwcm90b3R5cGUgY3JlYXRlZCBieSB0aGUgYXBwbGljYXRpb24gb2ZcbiAqIGBtaXhpbmAgdG8gYSBzdXBlcmNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChwcm90bywgbWl4aW4pID0+IHtcbiAgcmV0dXJuIChcbiAgICBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBhcHBsaWVkTWl4aW5LZXkpICYmXG4gICAgcHJvdG9bYXBwbGllZE1peGluS2V5XSA9PT0gdW53cmFwKG1peGluKVxuICApO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGlzQXBwbGljYXRpb25PZiBmcm9tICcuL2lzLWFwcGxpY2F0aW9uLW9mLmpzJztcblxuY29uc3QgeyBnZXRQcm90b3R5cGVPZiB9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmZiBgb2AgaGFzIGFuIGFwcGxpY2F0aW9uIG9mIGBtaXhpbmAgb24gaXRzIHByb3RvdHlwZVxuICogY2hhaW4uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gbyBBbiBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1peGluIEEgbWl4aW4gYXBwbGllZCB3aXRoIHtAbGluayBhcHBseX1cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgYG9gIGhhcyBhbiBhcHBsaWNhdGlvbiBvZiBgbWl4aW5gIG9uIGl0cyBwcm90b3R5cGVcbiAqIGNoYWluXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChvLCBtaXhpbikgPT4ge1xuICB3aGlsZSAobyAhPT0gbnVsbCkge1xuICAgIGlmIChpc0FwcGxpY2F0aW9uT2YobywgbWl4aW4pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbyA9IGdldFByb3RvdHlwZU9mKG8pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBoYXMgZnJvbSAnLi9oYXMuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYG1peGluYCBzbyB0aGF0IGl0IG9ubHkgYXBwbGllcyBpZiBpdCdzIG5vdCBhbHJlYWR5IG9uIHRoZVxuICogcHJvdG90eXBlIGNoYWluLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIHdyYXAgd2l0aCBkZWR1cGxpY2F0aW9uIGJlaGF2aW9yXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBuZXcgbWl4aW4gZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG4gIHJldHVybiB3cmFwKFxuICAgIG1peGluLFxuICAgIChzdXBlckNsYXNzKSA9PlxuICAgICAgaGFzKHN1cGVyQ2xhc3MucHJvdG90eXBlLCBtaXhpbikgPyBzdXBlckNsYXNzIDogbWl4aW4oc3VwZXJDbGFzcylcbiAgKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuLi91bmlxdWUtaWQuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuY29uc3QgY2FjaGVkQXBwbGljYXRpb25LZXkgPSB1bmlxdWVJZCgnX2NhY2hlZEFwcGxpY2F0aW9uJyk7XG5cbi8qKlxuICogRGVjb3JhdGUgdGhlIGdpdmVuIG1peGluIGNsYXNzIHdpdGggYSBcImNhY2hlZCBkZWNvcmF0b3JcIi5cbiAqXG4gKiBNZXRob2Qgd2lsbCBlbnN1cmUgdGhhdCBpZiB0aGUgZ2l2ZW4gbWl4aW4gaGFzIGFscmVhZHkgYmVlbiBhcHBsaWVkLFxuICogdGhlbiBpdCB3aWxsIGJlIHJldHVybmVkIC8gYXBwbGllZCBhIHNpbmdsZSB0aW1lLCByYXRoZXIgdGhhbiBtdWx0aXBsZVxuICogdGltZXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG4gIHJldHVybiB3cmFwKG1peGluLCAoc3VwZXJDbGFzcykgPT4ge1xuICAgIGxldCBjYWNoZWRBcHBsaWNhdGlvbiA9IHN1cGVyQ2xhc3NbY2FjaGVkQXBwbGljYXRpb25LZXldO1xuICAgIGlmICghY2FjaGVkQXBwbGljYXRpb24pIHtcbiAgICAgIGNhY2hlZEFwcGxpY2F0aW9uID0gc3VwZXJDbGFzc1tjYWNoZWRBcHBsaWNhdGlvbktleV0gPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGxldCBhcHBsaWNhdGlvbiA9IGNhY2hlZEFwcGxpY2F0aW9uLmdldChtaXhpbik7XG4gICAgaWYgKCFhcHBsaWNhdGlvbikge1xuICAgICAgYXBwbGljYXRpb24gPSBtaXhpbihzdXBlckNsYXNzKTtcbiAgICAgIGNhY2hlZEFwcGxpY2F0aW9uLnNldChtaXhpbiwgYXBwbGljYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYXBwbGljYXRpb247XG4gIH0pO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGRlY2xhcmUgZnJvbSAnLi9kZWNsYXJlLmpzJztcbmltcG9ydCBkZWR1cGUgZnJvbSAnLi9kZWR1cGUuanMnO1xuaW1wb3J0IGNhY2hlIGZyb20gJy4vY2FjaGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+IGRlZHVwZShjYWNoZShkZWNsYXJlKG1peGluKSkpO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlTWl4aW4gZnJvbSAnLi9jbGFzcy1idWlsZGVyL21peGluLmpzJztcblxuY29uc3QgeyBmcmVlemUgfSA9IE9iamVjdDtcblxuXG5leHBvcnQgZGVmYXVsdCAoa2xhc3MgPSBjbGFzcyB7fSkgPT5cbiAgZnJlZXplKHtcbiAgICB3aXRoKC4uLm1peGlucykge1xuICAgICAgcmV0dXJuIG1peGluc1xuICAgICAgICAubWFwKChtaXhpbikgPT4gY3JlYXRlTWl4aW4obWl4aW4pKVxuICAgICAgICAucmVkdWNlKChrLCBtKSA9PiBtKGspLCBrbGFzcyk7XG4gICAgfVxuICB9KTtcbiIsIi8qICAqL1xuXG5cbi8qKlxuICogVGhlIGluaXQgb2JqZWN0IHVzZWQgdG8gaW5pdGlhbGl6ZSBhIGZldGNoIFJlcXVlc3QuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QvUmVxdWVzdFxuICovXG5cbi8qKlxuICogQSBjbGFzcyBmb3IgY29uZmlndXJpbmcgSHR0cENsaWVudHMuXG4gKi9cbmNsYXNzIENvbmZpZ3VyYXRvciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gJyc7XG4gICAgdGhpcy5kZWZhdWx0cyA9IHt9O1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzID0gW107XG4gIH1cblxuICB3aXRoQmFzZVVybChiYXNlVXJsKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhEZWZhdWx0cyhkZWZhdWx0cykge1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzLnB1c2goaW50ZXJjZXB0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aE1peGlucyguLi5taXhpbnMpIHtcbiAgICB0aGlzLm1peGlucyA9IG1peGlucztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCkge1xuICAgIGxldCBzdGFuZGFyZENvbmZpZyA9IHtcbiAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknXG4gICAgICB9XG4gICAgfTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdHMsIHN0YW5kYXJkQ29uZmlnLCB0aGlzLmRlZmF1bHRzKTtcbiAgICByZXR1cm4gdGhpcy5yZWplY3RFcnJvclJlc3BvbnNlcygpO1xuICB9XG5cbiAgcmVqZWN0RXJyb3JSZXNwb25zZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aEludGVyY2VwdG9yKHsgcmVzcG9uc2U6IHJlamVjdE9uRXJyb3IgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IENvbmZpZ3VyYXRvcigpO1xuXG5mdW5jdGlvbiByZWplY3RPbkVycm9yKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyByZXNwb25zZTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAoXG4gIGlucHV0LFxuICBpbnRlcmNlcHRvcnMgPSBbXSxcbiAgc3VjY2Vzc05hbWUsXG4gIGVycm9yTmFtZVxuKSA9PlxuICBpbnRlcmNlcHRvcnMucmVkdWNlKChjaGFpbiwgaW50ZXJjZXB0b3IpID0+IHtcbiAgICBjb25zdCBzdWNjZXNzSGFuZGxlciA9IGludGVyY2VwdG9yW3N1Y2Nlc3NOYW1lXTtcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbnRlcmNlcHRvcltlcnJvck5hbWVdO1xuICAgIHJldHVybiBjaGFpbi50aGVuKFxuICAgICAgKHN1Y2Nlc3NIYW5kbGVyICYmIHN1Y2Nlc3NIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCBpZGVudGl0eSxcbiAgICAgIChlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCB0aHJvd2VyXG4gICAgKTtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKGlucHV0KSk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbmZ1bmN0aW9uIHRocm93ZXIoeCkge1xuICB0aHJvdyB4O1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCB7IH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuaW1wb3J0IGFwcGx5SW50ZXJjZXB0b3JzIGZyb20gJy4vYXBwbHktaW50ZXJjZXB0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVxdWVzdCA9IChcbiAgaW5wdXQsXG4gIGluaXQgPSB7fSxcbiAgY29uZmlnXG4pID0+IHtcbiAgbGV0IGRlZmF1bHRzID0gY29uZmlnLmRlZmF1bHRzIHx8IHt9O1xuICBsZXQgcmVxdWVzdDtcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IHJlcXVlc3RDb250ZW50VHlwZTtcbiAgbGV0IHBhcnNlZERlZmF1bHRIZWFkZXJzID0gcGFyc2VIZWFkZXJWYWx1ZXMoZGVmYXVsdHMuaGVhZGVycyk7XG5cbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gIH0gZWxzZSB7XG4gICAgYm9keSA9IGluaXQuYm9keTtcbiAgICBsZXQgYm9keU9iaiA9IGJvZHkgPyB7IGJvZHkgfSA6IG51bGw7XG4gICAgbGV0IHJlcXVlc3RJbml0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHsgaGVhZGVyczoge30gfSwgaW5pdCwgYm9keU9iaik7XG4gICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdEluaXQuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoZ2V0UmVxdWVzdFVybChjb25maWcuYmFzZVVybCwgaW5wdXQpLCByZXF1ZXN0SW5pdCk7XG4gIH1cbiAgaWYgKCFyZXF1ZXN0Q29udGVudFR5cGUpIHtcbiAgICBpZiAobmV3IEhlYWRlcnMocGFyc2VkRGVmYXVsdEhlYWRlcnMpLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgICB9IGVsc2UgaWYgKGJvZHkgJiYgaXNKU09OKFN0cmluZyhib2R5KSkpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfVxuICB9XG4gIHNldERlZmF1bHRIZWFkZXJzKHJlcXVlc3QuaGVhZGVycywgcGFyc2VkRGVmYXVsdEhlYWRlcnMpO1xuICBpZiAoYm9keSAmJiBib2R5IGluc3RhbmNlb2YgQmxvYiAmJiBib2R5LnR5cGUpIHtcbiAgICAvLyB3b3JrIGFyb3VuZCBidWcgaW4gSUUgJiBFZGdlIHdoZXJlIHRoZSBCbG9iIHR5cGUgaXMgaWdub3JlZCBpbiB0aGUgcmVxdWVzdFxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvMjEzNjE2M1xuICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGJvZHkudHlwZSk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1JlcXVlc3QgPSAocmVxdWVzdCwgY29uZmlnKSA9PlxuICBhcHBseUludGVyY2VwdG9ycyhyZXF1ZXN0LCBjb25maWcuaW50ZXJjZXB0b3JzLCAncmVxdWVzdCcsICdyZXF1ZXN0RXJyb3InKTtcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXNwb25zZSA9IChcbiAgcmVzcG9uc2UsXG4gIGNvbmZpZ1xuKSA9PiBhcHBseUludGVyY2VwdG9ycyhyZXNwb25zZSwgY29uZmlnLmludGVyY2VwdG9ycywgJ3Jlc3BvbnNlJywgJ3Jlc3BvbnNlRXJyb3InKTtcblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJWYWx1ZXMoaGVhZGVycykge1xuICBsZXQgcGFyc2VkSGVhZGVycyA9IHt9O1xuICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcGFyc2VkSGVhZGVyc1tuYW1lXSA9IHR5cGUuZnVuY3Rpb24oaGVhZGVyc1tuYW1lXSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgeyBidWlsZFJlcXVlc3QsIHByb2Nlc3NSZXF1ZXN0LCBwcm9jZXNzUmVzcG9uc2UgfSBmcm9tICcuL3JlcXVlc3QuanMnO1xuXG5cbmNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5leHBvcnQgY2xhc3MgRmV0Y2hDbGllbnQge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBhZGRJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZy53aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpO1xuICB9XG5cbiAgZmV0Y2goaW5wdXQsIGluaXQgPSB7fSkge1xuICAgIGxldCByZXF1ZXN0ID0gYnVpbGRSZXF1ZXN0KGlucHV0LCBpbml0LCBwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuXG4gICAgcmV0dXJuIHByb2Nlc3NSZXF1ZXN0KHJlcXVlc3QsIHByaXZhdGVzKHRoaXMpLmNvbmZpZy5pbnRlcmNlcHRvcnMpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2Nlc3NSZXNwb25zZShyZXNwb25zZSwgcHJpdmF0ZXModGhpcykuY29uZmlnLmludGVyY2VwdG9ycyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IGNsYXNzQnVpbGRlciBmcm9tICcuLi9jbGFzcy1idWlsZGVyLmpzJztcbmltcG9ydCB7IGRlZmF1bHQgYXMgY3JlYXRlQ29uZmlnIH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuaW1wb3J0IHsgRmV0Y2hDbGllbnQgfSBmcm9tICcuL2ZldGNoLWNsaWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChjb25maWd1cmUpID0+IHtcbiAgaWYgKHR5cGUudW5kZWZpbmVkKGZldGNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIik7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuXG4gIGlmIChjb25maWcubWl4aW5zICYmIGNvbmZpZy5taXhpbnMubGVuZ3RoID4gMCkge1xuICAgIGxldCBGZXRjaFdpdGhNaXhpbnMgPSBjbGFzc0J1aWxkZXIoRmV0Y2hDbGllbnQpLndpdGguYXBwbHkobnVsbCwgY29uZmlnLm1peGlucyk7XG4gICAgcmV0dXJuIG5ldyBGZXRjaFdpdGhNaXhpbnMoY29uZmlnKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRmV0Y2hDbGllbnQoY29uZmlnKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBjb25maWd1cmUgZnJvbSAnLi9odHRwLWNsaWVudC9jb25maWd1cmUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWd1cmU7XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vbGliL2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50JywgKCkgPT4ge1xuXG5cdGRlc2NyaWJlKCdzdGFuZGFyZCBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy51c2VTdGFuZGFyZENvbmZpZ3VyYXRvcigpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QnLCBkb25lID0+IHtcblx0XHRcdGNsaWVudC5mZXRjaCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdH0pXG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0JywgZG9uZSA9PiB7XG5cdFx0XHRjbGllbnQuZmV0Y2goJy9odHRwLWNsaWVudC1wb3N0LXRlc3QnLCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IHRlc3REYXRhOiAnMScgfSlcblx0XHRcdH0pXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcyJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdtaXhpbiBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy53aXRoTWl4aW5zKG1peGluKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0aXQoJ2NhbGwgbWl4aW4gbWV0aG9kJywgKCkgPT4ge1xuXHRcdFx0Y2hhaS5leHBlY3QoY2xpZW50LnRlc3RNZXRob2QoKSkuZXF1YWwoJ3Rlc3QnKTtcblx0XHR9KTtcblx0fSk7XG59KTtcblxuY29uc3QgbWl4aW4gPSAoYmFzZSkgPT4gY2xhc3MgZXh0ZW5kcyBiYXNlIHtcblx0dGVzdE1ldGhvZCgpIHtcblx0XHRyZXR1cm4gJ3Rlc3QnO1xuXHR9XG59OyIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBvYmosXG4gIGtleSxcbiAgZGVmYXVsdFZhbHVlID0gdW5kZWZpbmVkXG4pID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIG9ialtrZXldID8gb2JqW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgbGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0ID0gZGVmYXVsdFZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBkZXB0aCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3RbcGFydHNbaV1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0W3BhcnRzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICB9XG4gIG9iamVjdFtwYXJ0c1tkZXB0aF1dID0gdmFsdWU7XG59O1xuIiwiaW1wb3J0IGRnZXQgZnJvbSAnLi9vYmplY3QvZGdldC5qcyc7XG5pbXBvcnQgZHNldCBmcm9tICcuL29iamVjdC9kc2V0LmpzJztcbmltcG9ydCB7IGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLmpzJztcbmltcG9ydCBpcyBmcm9tICcuL3R5cGUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdW5pcXVlSWQgZnJvbSAnLi91bmlxdWUtaWQuanMnO1xuXG5jb25zdCBtb2RlbCA9IChiYXNlQ2xhc3MgPSBjbGFzcyB7fSkgPT4ge1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgcmV0dXJuIGNsYXNzIE1vZGVsIGV4dGVuZHMgYmFzZUNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuX3N0YXRlS2V5ID0gdW5pcXVlSWQoJ19zdGF0ZScpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmRlZmF1bHRTdGF0ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBnZXQoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdGF0ZShhY2Nlc3Nvcik7XG4gICAgfVxuXG4gICAgc2V0KGFyZzEsIGFyZzIpIHtcbiAgICAgIC8vc3VwcG9ydHMgKGFjY2Vzc29yLCBzdGF0ZSkgT1IgKHN0YXRlKSBhcmd1bWVudHMgZm9yIHNldHRpbmcgdGhlIHdob2xlIHRoaW5nXG4gICAgICBsZXQgYWNjZXNzb3IsIHZhbHVlO1xuICAgICAgaWYgKCFpcy5zdHJpbmcoYXJnMSkgJiYgaXMudW5kZWZpbmVkKGFyZzIpKSB7XG4gICAgICAgIHZhbHVlID0gYXJnMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gYXJnMjtcbiAgICAgICAgYWNjZXNzb3IgPSBhcmcxO1xuICAgICAgfVxuICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgICAgIGxldCBuZXdTdGF0ZSA9IGpzb25DbG9uZShvbGRTdGF0ZSk7XG5cbiAgICAgIGlmIChhY2Nlc3Nvcikge1xuICAgICAgICBkc2V0KG5ld1N0YXRlLCBhY2Nlc3NvciwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U3RhdGUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKGFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3Vic2NyaWJlcigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBzZWxmLl9zdWJzY3JpYmUoY29udGV4dCwgLi4uYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vVE9ETzogaXMgb2ZmKCkgbmVlZGVkIGZvciBpbmRpdmlkdWFsIHN1YnNjcmlwdGlvbj9cbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSAtIGNvbnRleHQgbXVzdCBiZSBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uKGJpbmRSdWxlcykge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiaW5kUnVsZXNbMF0pKSB7XG4gICAgICAgICAgICBiaW5kUnVsZXMgPSBbYmluZFJ1bGVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmluZFJ1bGVzLmZvckVhY2goYmluZFJ1bGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIGJpbmRSdWxlWzBdLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgIGRzZXQoY29udGV4dCwgYmluZFJ1bGVbMV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRTdGF0ZShhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIGpzb25DbG9uZShhY2Nlc3NvciA/IGRnZXQocHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldLCBhY2Nlc3NvcikgOiBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0pO1xuICAgIH1cblxuICAgIF9zZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgX3N1YnNjcmliZShjb250ZXh0LCBhY2Nlc3NvciwgY2IpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpYmVycy5nZXQoY29udGV4dCkgfHwgW107XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goeyBhY2Nlc3NvciwgY2IgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5zZXQoY29udGV4dCwgc3Vic2NyaXB0aW9ucyk7XG4gICAgfVxuXG4gICAgX2Rlc3Ryb3lTdWJzY3JpYmVyKGNvbnRleHQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICB9XG5cbiAgICBfbm90aWZ5U3Vic2NyaWJlcnMoc2V0QWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbihzdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHsgYWNjZXNzb3IsIGNiIH0pIHtcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6J1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXouYmxheidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZihzZXRBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgYWNjZXNzb3IpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9lLmcuIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby4qJ1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKCcqJykgPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZGVlcEFjY2Vzc29yID0gYWNjZXNzb3IucmVwbGFjZSgnLionLCAnJykucmVwbGFjZSgnKicsICcnKTtcbiAgICAgICAgICAgIGlmIChzZXRBY2Nlc3Nvci5pbmRleE9mKGRlZXBBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgZGVlcEFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgZGVlcEFjY2Vzc29yKSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IG1vZGVsO1xuIiwiaW1wb3J0IG1vZGVsIGZyb20gJy4uL2xpYi9tb2RlbC5qcyc7XG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgbW9kZWwoKSB7XG5cdGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtmb286MX07XG4gIH1cbn1cblxuZGVzY3JpYmUoXCJNb2RlbCBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImRlZmF1bHRTdGF0ZSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXHRpdChcImdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCgnZm9vJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiAxXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajInKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3aXRoIGFycmF5cyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW11cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcsJ2RvZycpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJykpLnRvLmVxdWFsKCdkb2cnKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcse2ZvbzoxfSk7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDEpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycsMik7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcInN1YnNjcmlwdGlvbnMgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXHRcdGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZSkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZSkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdHRocm93KCdubyBzdWJzY3JpYmVyIHNob3VsZCBiZSBjYWxsZWQgZm9yIGRlZXBPYmoxJyk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEuKicsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbC5zZXQoVEVTVF9TRUwsIHRydWUpO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaWJlcnMgY2FuIGJlIGRlc3Ryb3llZFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLlRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKG15TW9kZWwuVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0dGhyb3cobmV3IEVycm9yKCdzaG91bGQgbm90IGJlIG9ic2VydmVkJykpO1xuXHRcdH0pO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldChteU1vZGVsLlRFU1RfU0VMLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzIGJvdW5kIGZyb20gbW9kZWwgdG8gY3VzdG9tIGVsZW1lbnRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblxuICAgIGxldCBteUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKHZhbHVlKSA9PiB7IHRoaXMucHJvcCA9IHZhbHVlOyB9KTtcbiAgICBvYnNlcnZlci5kZXN0cm95KCk7XG5cbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRlciA9IG15TW9kZWwuY3JlYXRlUHJvcGVydHlCaW5kZXIobXlFbGVtZW50KS5hZGRCaW5kaW5ncyhcbiAgICAgIFsnZm9vJywgJ3Byb3AnXVxuICAgICk7XG5cbiAgICBteU1vZGVsLnNldCgnZm9vJywgJzMnKTtcbiAgICBjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcbiAgICBwcm9wZXJ0eUJpbmRlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQoJ2ZvbycsICcyJyk7XG5cdFx0Y2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuXG5cblxuY29uc3QgZXZlbnRIdWJGYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgLy8kRmxvd0ZpeE1lXG4gIHJldHVybiB7XG4gICAgcHVibGlzaDogZnVuY3Rpb24oZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goc3Vic2NyaXB0aW9ucyA9PiB7XG4gICAgICAgIChzdWJzY3JpcHRpb25zLmdldChldmVudCkgfHwgW10pLmZvckVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjcmVhdGVTdWJzY3JpYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVycy5oYXMoY29udGV4dCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnNldChjb250ZXh0LCBuZXcgTWFwKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpO1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlci5oYXMoZXZlbnQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLnNldChldmVudCwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVyLmdldChldmVudCkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVycy5nZXQoY29udGV4dCkuZGVsZXRlKGV2ZW50KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50SHViRmFjdG9yeTtcbiIsImltcG9ydCBldmVudEh1YkZhY3RvcnkgZnJvbSAnLi4vbGliL2V2ZW50LWh1Yi5qcyc7XG5cbmRlc2NyaWJlKFwiRXZlbnRIdWIgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJiYXNpYyBwdWIvc3ViIHdvcmtzXCIsIChkb25lKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaWJlcnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyMiA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpcHRpb25zIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDIpO1xuICAgICAgfSlcblxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInLCAyKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwiZGVzdHJveSgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1YlN1YnNjcmliZXIuZGVzdHJveSgpO1xuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMCk7XG5cdH0pO1xuXG4gIGl0KFwib2ZmKCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwodW5kZWZpbmVkKTtcbiAgICAgIH0pXG4gICAgICAub2ZmKCdmb28nKVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicpOyAgLy9zaG91bGQgY2FsbGVkXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblxufSk7XG4iXSwibmFtZXMiOlsiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJpbmNsdWRlcyIsImJyb3dzZXIiLCJmbiIsInJhaXNlIiwiRXJyb3IiLCJuYW1lIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImxlbmd0aCIsImRlZmluZVByb3BlcnR5IiwiaSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImEiLCJkZWVwIiwiYm9keSIsInRlbXBsYXRlIiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJlbCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJhcnIiLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwiaXMiLCJzZXR1cCIsImNoZWNrcyIsImdldFR5cGUiLCJtYXRjaGVzIiwiY2xvbmUiLCJzcmMiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJvYmplY3QiLCJmdW5jdGlvbiIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsImtleSIsImZpbmRJbmRleCIsImpzb25DbG9uZSIsImUiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJzdHJpbmciLCJwcmV2VGltZUlkIiwicHJldlVuaXF1ZUlkIiwicHJlZml4IiwibmV3VW5pcXVlSWQiLCJub3ciLCJ1bmlxdWVJZCIsIndyYXBwZWRNaXhpbktleSIsImFwcGxpZWRNaXhpbktleSIsIndyYXBwZXIiLCJzdXBlckNsYXNzIiwibWl4aW4iLCJhcHBsaWNhdGlvbiIsInVud3JhcCIsInNldFByb3RvdHlwZU9mIiwid3JhcCIsIm8iLCJpc0FwcGxpY2F0aW9uT2YiLCJoYXMiLCJjYWNoZWRBcHBsaWNhdGlvbktleSIsImNhY2hlZEFwcGxpY2F0aW9uIiwiZGVkdXBlIiwiY2FjaGUiLCJkZWNsYXJlIiwiZnJlZXplIiwid2l0aCIsIm1peGlucyIsImNyZWF0ZU1peGluIiwicmVkdWNlIiwiayIsIm0iLCJDb25maWd1cmF0b3IiLCJiYXNlVXJsIiwiZGVmYXVsdHMiLCJpbnRlcmNlcHRvcnMiLCJ3aXRoQmFzZVVybCIsIndpdGhEZWZhdWx0cyIsIndpdGhJbnRlcmNlcHRvciIsImludGVyY2VwdG9yIiwid2l0aE1peGlucyIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJvayIsImlucHV0Iiwic3VjY2Vzc05hbWUiLCJlcnJvck5hbWUiLCJjaGFpbiIsInN1Y2Nlc3NIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwidGhlbiIsImlkZW50aXR5IiwidGhyb3dlciIsIlByb21pc2UiLCJyZXNvbHZlIiwieCIsImJ1aWxkUmVxdWVzdCIsImluaXQiLCJyZXF1ZXN0IiwicmVxdWVzdENvbnRlbnRUeXBlIiwicGFyc2VkRGVmYXVsdEhlYWRlcnMiLCJwYXJzZUhlYWRlclZhbHVlcyIsIlJlcXVlc3QiLCJIZWFkZXJzIiwiYm9keU9iaiIsInJlcXVlc3RJbml0IiwiZ2V0UmVxdWVzdFVybCIsImlzSlNPTiIsInNldERlZmF1bHRIZWFkZXJzIiwiQmxvYiIsInByb2Nlc3NSZXF1ZXN0IiwiYXBwbHlJbnRlcmNlcHRvcnMiLCJwcm9jZXNzUmVzcG9uc2UiLCJwYXJzZWRIZWFkZXJzIiwiYWJzb2x1dGVVcmxSZWdleHAiLCJ1cmwiLCJ0ZXN0IiwiZGVmYXVsdEhlYWRlcnMiLCJzdHIiLCJGZXRjaENsaWVudCIsImFkZEludGVyY2VwdG9yIiwiZmV0Y2giLCJyZXN1bHQiLCJSZXNwb25zZSIsImNvbmZpZ3VyZSIsImNyZWF0ZUNvbmZpZyIsIkZldGNoV2l0aE1peGlucyIsImNsYXNzQnVpbGRlciIsImNsaWVudCIsImJlZm9yZUVhY2giLCJodHRwQ2xpZW50RmFjdG9yeSIsImpzb24iLCJmb28iLCJkb25lIiwidGVzdERhdGEiLCJ0ZXN0TWV0aG9kIiwiYmFzZSIsImRlZmF1bHRWYWx1ZSIsInBhcnRzIiwiZGVwdGgiLCJtb2RlbCIsInN1YnNjcmliZXJDb3VudCIsIl9zdGF0ZUtleSIsIl9zdWJzY3JpYmVycyIsIl9zZXRTdGF0ZSIsImRlZmF1bHRTdGF0ZSIsImFjY2Vzc29yIiwiX2dldFN0YXRlIiwiYXJnMSIsImFyZzIiLCJvbGRTdGF0ZSIsIm5ld1N0YXRlIiwiZHNldCIsIl9ub3RpZnlTdWJzY3JpYmVycyIsImNyZWF0ZVN1YnNjcmliZXIiLCJzZWxmIiwiX3N1YnNjcmliZSIsImRlc3Ryb3kiLCJfZGVzdHJveVN1YnNjcmliZXIiLCJjcmVhdGVQcm9wZXJ0eUJpbmRlciIsImFkZEJpbmRpbmdzIiwiYmluZFJ1bGVzIiwiYmluZFJ1bGUiLCJkZ2V0Iiwic3Vic2NyaXB0aW9ucyIsImRlbGV0ZSIsInNldEFjY2Vzc29yIiwic3Vic2NyaWJlcnMiLCJkZWVwQWNjZXNzb3IiLCJNb2RlbCIsIm15TW9kZWwiLCJkZWVwT2JqMSIsImRlZXBPYmoyIiwic2VsZWN0ZWQiLCJURVNUX1NFTCIsIm15TW9kZWxTdWJzY3JpYmVyIiwibnVtQ2FsbGJhY2tzQ2FsbGVkIiwibXlFbGVtZW50IiwicHJvcGVydHlCaW5kZXIiLCJldmVudEh1YkZhY3RvcnkiLCJwdWJsaXNoIiwic3Vic2NyaWJlciIsIm15RXZlbnRIdWIiLCJteUV2ZW50SHViU3Vic2NyaWJlciIsIm15RXZlbnRIdWJTdWJzY3JpYmVyMiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBQUE7QUFDQSxFQUFPLElBQU1BLFlBQVksQ0FBQyxRQUFRQyxNQUFSLHlDQUFRQSxNQUFSLFVBQXVCQyxRQUF2Qix5Q0FBdUJBLFFBQXZCLEdBQWlDQyxRQUFqQyxDQUN4QixXQUR3QixDQUFuQjs7QUFJUCxFQUFPLElBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxFQUFEO0VBQUEsTUFBS0MsS0FBTCx1RUFBYSxJQUFiO0VBQUEsU0FBc0IsWUFFeEM7RUFDSCxRQUFJTixTQUFKLEVBQWU7RUFDYixhQUFPSyw4QkFBUDtFQUNEO0VBQ0QsUUFBSUMsS0FBSixFQUFXO0VBQ1QsWUFBTSxJQUFJQyxLQUFKLENBQWFGLEdBQUdHLElBQWhCLDJCQUFOO0VBQ0Q7RUFDRixHQVRzQjtFQUFBLENBQWhCOztFQ0xQO0FBQ0EsdUJBQWUsWUFFVjtFQUFBLE1BREhDLE9B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
