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
    date: function date() {
      return new Date(this.getTime());
    },
    regexp: function regexp() {
      return new RegExp(this);
    },
    array: function array() {
      return this.map(clone$1);
    },
    map: function map() {
      return new Map(Array.from(this.entries()));
    },
    set: function set() {
      return new Set(Array.from(this.values()));
    },
    object: function object() {
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

  var dSet = function dSet(obj, key, value) {
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

  var dGet = function dGet(obj, key) {
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
          dSet(newState, accessor, value);
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
                dSet(context, bindRule[1], value);
              });
            });
            return this;
          },
          destroy: this._destroySubscriber.bind(this, context)
        };
      };

      Model.prototype._getState = function _getState(accessor) {
        return jsonClone(accessor ? dGet(privates[this._stateKey], accessor) : privates[this._stateKey]);
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
              cb(dGet(newState, accessor), dGet(oldState, accessor));
              return;
            }
            //e.g. sa='foo.bar.baz', a='foo.*'
            if (accessor.indexOf('*') > -1) {
              var deepAccessor = accessor.replace('.*', '').replace('*', '');
              if (setAccessor.indexOf(deepAccessor) === 0) {
                cb(dGet(newState, deepAccessor), dGet(oldState, deepAccessor));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkuanMiLCIuLi8uLi9saWIvdHlwZS5qcyIsIi4uLy4uL2xpYi9jbG9uZS5qcyIsIi4uLy4uL3Rlc3QvY2xvbmUuanMiLCIuLi8uLi90ZXN0L3R5cGUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9ICFbdHlwZW9mIHdpbmRvdywgdHlwZW9mIGRvY3VtZW50XS5pbmNsdWRlcyhcbiAgJ3VuZGVmaW5lZCdcbik7XG5cbmV4cG9ydCBjb25zdCBicm93c2VyID0gKGZuLCByYWlzZSA9IHRydWUpID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbiAgaWYgKHJhaXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2ZuLm5hbWV9IGZvciBicm93c2VyIHVzZSBvbmx5YCk7XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcihcbiAgKFxuICAgIHRhcmdldCxcbiAgICB0eXBlLFxuICAgIGxpc3RlbmVyLFxuICAgIGNhcHR1cmUgPSBmYWxzZVxuICApID0+IHtcbiAgICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdwcm9wZXJ0aWVzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2V2ZW50cy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBjb25zdCBhbGwgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG5cbmV4cG9ydCBjb25zdCBhbnkgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnTWFwIFNldCBTeW1ib2wgQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuICAnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuXG5leHBvcnQgZGVmYXVsdCAoc2V0dXAoKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUeXBlID0gKHNyYykgPT4gZ2V0U3JjVHlwZShzcmMpO1xuXG5mdW5jdGlvbiBnZXRTcmNUeXBlKHNyYykge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwoc3JjKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gc3JjID0+IGdldFNyY1R5cGUoc3JjKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSwgeyBnZXRUeXBlIH0gZnJvbSAnLi90eXBlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKHNyYykgPT4gY2xvbmUoc3JjLCBbXSwgW10pO1xuXG5leHBvcnQgY29uc3QganNvbkNsb25lID0gKHZhbHVlLCByZXZpdmVyID0gKGssIHYpID0+IHYpID0+XG4gIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCByZXZpdmVyKTtcblxuZnVuY3Rpb24gY2xvbmUoc3JjLCBjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoIXNyYyB8fCAhdHlwZS5vYmplY3Qoc3JjKSB8fCB0eXBlLmZ1bmN0aW9uKHNyYykpIHtcbiAgICByZXR1cm4gc3JjO1xuICB9XG4gIGNvbnN0IHQgPSBnZXRUeXBlKHNyYyk7XG4gIGlmICh0IGluIGNsb25lVHlwZXMpIHtcbiAgICByZXR1cm4gY2xvbmVUeXBlc1t0XS5hcHBseShzcmMsIFtjaXJjdWxhcnMsIGNsb25lc10pO1xuICB9XG4gIHJldHVybiBzcmM7XG59XG5cbmNvbnN0IGNsb25lVHlwZXMgPSBPYmplY3QuZnJlZXplKHtcbiAgZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZ2V0VGltZSgpKTtcbiAgfSxcbiAgcmVnZXhwOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzKTtcbiAgfSxcbiAgYXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChjbG9uZSk7XG4gIH0sXG4gIG1hcDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbSh0aGlzLmVudHJpZXMoKSkpO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20odGhpcy52YWx1ZXMoKSkpO1xuICB9LFxuICBvYmplY3Q6IGZ1bmN0aW9uKGNpcmN1bGFycyA9IFtdLCBjbG9uZXMgPSBbXSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHRoaXMpO1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG4gICAgY2xvbmVzLnB1c2gob2JqKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHRoaXNba2V5XSk7XG4gICAgICBvYmpba2V5XSA9IGlkeCA+IC0xID8gY2xvbmVzW2lkeF0gOiBjbG9uZSh0aGlzW2tleV0sIGNpcmN1bGFycywgY2xvbmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY2xvbmUsIHtqc29uQ2xvbmV9IGZyb20gJy4uL2xpYi9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiBpdCB0aHJvd3MnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCkpLnRvLnRocm93KEVycm9yKTtcblx0XHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKHVuZGVmaW5lZCkpLnRvLnRocm93KEVycm9yKTtcbiAgICB9KTtcblxuXHRcdGl0KCdQcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRcdGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cdFx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcblx0XHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuXHRcdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG5cdFx0fSk7XG5cblx0XHRpdCgnT2JqZWN0IGlzIG5vdCBzYW1lJywgKCkgPT4ge1xuXHRcdCAgY29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRcdGV4cGVjdChqc29uQ2xvbmUob2JqKSkubm90LnRvLmJlLmVxdWFsKG9iaik7XG5cdFx0fSk7XG5cblx0XHRpdCgnT2JqZWN0IHJldml2ZXIgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdFx0Y29uc3QgY2xvbmVkID0ganNvbkNsb25lKG9iaiwgKGssIHYpID0+IGsgIT09ICcnID8gTnVtYmVyKHYpICogMiA6IHYpO1xuXHRcdFx0ZXhwZWN0KGNsb25lZC5hKS5lcXVhbCg0KTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB0eXBlIGZyb20gJy4vdHlwZS5qcyc7XG5cblxuXG4vKipcbiAqIFRoZSBpbml0IG9iamVjdCB1c2VkIHRvIGluaXRpYWxpemUgYSBmZXRjaCBSZXF1ZXN0LlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SZXF1ZXN0L1JlcXVlc3RcbiAqL1xuXG5jb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBjb25maWd1cmluZyBIdHRwQ2xpZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRvciB7XG4gIGdldCBiYXNlVXJsKCkge1xuICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5iYXNlVXJsO1xuICB9XG5cbiAgZ2V0IGRlZmF1bHRzKCkge1xuICAgIHJldHVybiBPYmplY3QuZnJlZXplKHByaXZhdGVzKHRoaXMpLmRlZmF1bHRzKTtcbiAgfVxuXG4gIGdldCBpbnRlcmNlcHRvcnMoKSB7XG4gICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmludGVyY2VwdG9ycztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHByaXZhdGVzKHRoaXMpLmJhc2VVcmwgPSAnJztcbiAgICBwcml2YXRlcyh0aGlzKS5pbnRlcmNlcHRvcnMgPSBbXTtcbiAgfVxuXG4gIHdpdGhCYXNlVXJsKGJhc2VVcmwpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5iYXNlVXJsID0gYmFzZVVybDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhEZWZhdWx0cyhkZWZhdWx0cykge1xuICAgIHByaXZhdGVzKHRoaXMpLmRlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5pbnRlcmNlcHRvcnMucHVzaChpbnRlcmNlcHRvcik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1c2VTdGFuZGFyZENvbmZpZ3VyYXRvcigpIHtcbiAgICBsZXQgc3RhbmRhcmRDb25maWcgPSB7XG4gICAgICBtb2RlOiAnY29ycycsXG4gICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdYLVJlcXVlc3RlZC1CeSc6ICdERUVQLVVJJ1xuICAgICAgfVxuICAgIH07XG4gICAgcHJpdmF0ZXModGhpcykuZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHt9LCBzdGFuZGFyZENvbmZpZyk7XG4gICAgcmV0dXJuIHRoaXMucmVqZWN0RXJyb3JSZXNwb25zZXMoKTtcbiAgfVxuXG4gIHJlamVjdEVycm9yUmVzcG9uc2VzKCkge1xuICAgIHJldHVybiB0aGlzLndpdGhJbnRlcmNlcHRvcih7IHJlc3BvbnNlOiByZWplY3RPbkVycm9yIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdHRwQ2xpZW50IHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgcHJpdmF0ZXModGhpcykuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgYWRkSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcud2l0aEludGVyY2VwdG9yKGludGVyY2VwdG9yKTtcbiAgfVxuXG4gIGZldGNoKGlucHV0LCBpbml0ID0ge30pIHtcbiAgICBsZXQgcmVxdWVzdCA9IHRoaXMuX2J1aWxkUmVxdWVzdChpbnB1dCwgaW5pdCk7XG5cbiAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc1JlcXVlc3QocmVxdWVzdClcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xuICAgICAgICAgIHJlc3BvbnNlID0gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJlcXVlc3QgPSByZXN1bHQ7XG4gICAgICAgICAgcmVzcG9uc2UgPSBmZXRjaChyZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBBbiBpbnZhbGlkIHJlc3VsdCB3YXMgcmV0dXJuZWQgYnkgdGhlIGludGVyY2VwdG9yIGNoYWluLiBFeHBlY3RlZCBhIFJlcXVlc3Qgb3IgUmVzcG9uc2UgaW5zdGFuY2VgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgIH0pXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gIH1cblxuICBnZXQoaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5mZXRjaChpbnB1dCwgaW5pdCk7XG4gIH1cblxuICBwb3N0KGlucHV0LCBib2R5LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoKGlucHV0LCAnUE9TVCcsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgcHV0KGlucHV0LCBib2R5LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoKGlucHV0LCAnUFVUJywgYm9keSwgaW5pdCk7XG4gIH1cblxuICBwYXRjaChpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ1BBVENIJywgYm9keSwgaW5pdCk7XG4gIH1cblxuICBkZWxldGUoaW5wdXQsIGJvZHksIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2goaW5wdXQsICdERUxFVEUnLCBib2R5LCBpbml0KTtcbiAgfVxuXG4gIF9idWlsZFJlcXVlc3QoaW5wdXQsIGluaXQgPSB7fSkge1xuICAgIGxldCBkZWZhdWx0cyA9IHByaXZhdGVzKHRoaXMpLmNvbmZpZy5kZWZhdWx0cyB8fCB7fTtcbiAgICBsZXQgcmVxdWVzdDtcbiAgICBsZXQgYm9keSA9ICcnO1xuICAgIGxldCByZXF1ZXN0Q29udGVudFR5cGU7XG4gICAgbGV0IHBhcnNlZERlZmF1bHRIZWFkZXJzID0gcGFyc2VIZWFkZXJWYWx1ZXMoZGVmYXVsdHMuaGVhZGVycyk7XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICByZXF1ZXN0ID0gaW5wdXQ7XG4gICAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSBpbml0LmJvZHk7XG4gICAgICBsZXQgYm9keU9iaiA9IGJvZHkgPyB7IGJvZHkgfSA6IG51bGw7XG4gICAgICBsZXQgcmVxdWVzdEluaXQgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgeyBoZWFkZXJzOiB7fSB9LCBpbml0LCBib2R5T2JqKTtcbiAgICAgIHJlcXVlc3RDb250ZW50VHlwZSA9IG5ldyBIZWFkZXJzKHJlcXVlc3RJbml0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoZ2V0UmVxdWVzdFVybChwcml2YXRlcyh0aGlzKS5jb25maWcuYmFzZVVybCwgaW5wdXQpLCByZXF1ZXN0SW5pdCk7XG4gICAgfVxuICAgIGlmICghcmVxdWVzdENvbnRlbnRUeXBlKSB7XG4gICAgICBpZiAobmV3IEhlYWRlcnMocGFyc2VkRGVmYXVsdEhlYWRlcnMpLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgbmV3IEhlYWRlcnMocGFyc2VkRGVmYXVsdEhlYWRlcnMpLmdldCgnY29udGVudC10eXBlJykpO1xuICAgICAgfSBlbHNlIGlmIChib2R5ICYmIGlzSlNPTihTdHJpbmcoYm9keSkpKSB7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHNldERlZmF1bHRIZWFkZXJzKHJlcXVlc3QuaGVhZGVycywgcGFyc2VkRGVmYXVsdEhlYWRlcnMpO1xuICAgIGlmIChib2R5ICYmIGJvZHkgaW5zdGFuY2VvZiBCbG9iICYmIGJvZHkudHlwZSkge1xuICAgICAgLy8gd29yayBhcm91bmQgYnVnIGluIElFICYgRWRnZSB3aGVyZSB0aGUgQmxvYiB0eXBlIGlzIGlnbm9yZWQgaW4gdGhlIHJlcXVlc3RcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvMjEzNjE2M1xuICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgYm9keS50eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3Q7XG4gIH1cblxuICBfcHJvY2Vzc1JlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBhcHBseUludGVyY2VwdG9ycyhyZXF1ZXN0LCBwcml2YXRlcyh0aGlzKS5jb25maWcuaW50ZXJjZXB0b3JzLCAncmVxdWVzdCcsICdyZXF1ZXN0RXJyb3InKTtcbiAgfVxuXG4gIF9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpIHtcbiAgICByZXR1cm4gYXBwbHlJbnRlcmNlcHRvcnMocmVzcG9uc2UsIHByaXZhdGVzKHRoaXMpLmNvbmZpZy5pbnRlcmNlcHRvcnMsICdyZXNwb25zZScsICdyZXNwb25zZUVycm9yJyk7XG4gIH1cblxuICBfZmV0Y2goaW5wdXQsIG1ldGhvZCwgYm9keSwgaW5pdCkge1xuICAgIGlmICghaW5pdCkge1xuICAgICAgaW5pdCA9IHt9O1xuICAgIH1cbiAgICBpbml0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICBpZiAoYm9keSkge1xuICAgICAgaW5pdC5ib2R5ID0gYm9keTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2goaW5wdXQsIGluaXQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IChjb25maWd1cmUgPSBkZWZhdWx0Q29uZmlnKSA9PiB7XG4gIGlmICh0eXBlLnVuZGVmaW5lZChmZXRjaCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXF1aXJlcyBGZXRjaCBBUEkgaW1wbGVtZW50YXRpb24sIGJ1dCB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBkb2Vzbid0IHN1cHBvcnQgaXQuXCIpO1xuICB9XG4gIGNvbnN0IGNvbmZpZyA9IG5ldyBDb25maWd1cmF0b3IoKTtcbiAgY29uZmlndXJlKGNvbmZpZyk7XG4gIHJldHVybiBuZXcgSHR0cENsaWVudChjb25maWcpO1xufTtcblxuZnVuY3Rpb24gYXBwbHlJbnRlcmNlcHRvcnMoXG4gIGlucHV0LFxuICBpbnRlcmNlcHRvcnMgPSBbXSxcbiAgc3VjY2Vzc05hbWUsXG4gIGVycm9yTmFtZVxuKSB7XG4gIHJldHVybiBpbnRlcmNlcHRvcnMucmVkdWNlKChjaGFpbiwgaW50ZXJjZXB0b3IpID0+IHtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3Qgc3VjY2Vzc0hhbmRsZXIgPSBpbnRlcmNlcHRvcltzdWNjZXNzTmFtZV07XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGNvbnN0IGVycm9ySGFuZGxlciA9IGludGVyY2VwdG9yW2Vycm9yTmFtZV07XG4gICAgcmV0dXJuIGNoYWluLnRoZW4oXG4gICAgICAoc3VjY2Vzc0hhbmRsZXIgJiYgc3VjY2Vzc0hhbmRsZXIuYmluZChpbnRlcmNlcHRvcikpIHx8IGlkZW50aXR5LFxuICAgICAgKGVycm9ySGFuZGxlciAmJiBlcnJvckhhbmRsZXIuYmluZChpbnRlcmNlcHRvcikpIHx8IHRocm93ZXJcbiAgICApO1xuICB9LCBQcm9taXNlLnJlc29sdmUoaW5wdXQpKTtcbn1cblxuZnVuY3Rpb24gcmVqZWN0T25FcnJvcihyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgdGhyb3cgcmVzcG9uc2U7XG4gIH1cbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5mdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gIHJldHVybiB4O1xufVxuXG5mdW5jdGlvbiB0aHJvd2VyKHgpIHtcbiAgdGhyb3cgeDtcbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJWYWx1ZXMoaGVhZGVycykge1xuICBsZXQgcGFyc2VkSGVhZGVycyA9IHt9O1xuICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcGFyc2VkSGVhZGVyc1tuYW1lXSA9IHR5cGUuZnVuY3Rpb24oaGVhZGVyc1tuYW1lXSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cblxuY29uc3QgYWJzb2x1dGVVcmxSZWdleHAgPSAvXihbYS16XVthLXowLTkrXFwtLl0qOik/XFwvXFwvL2k7XG5cbmZ1bmN0aW9uIGdldFJlcXVlc3RVcmwoYmFzZVVybCwgdXJsKSB7XG4gIGlmIChhYnNvbHV0ZVVybFJlZ2V4cC50ZXN0KHVybCkpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgcmV0dXJuIChiYXNlVXJsIHx8ICcnKSArIHVybDtcbn1cblxuZnVuY3Rpb24gc2V0RGVmYXVsdEhlYWRlcnMoaGVhZGVycywgZGVmYXVsdEhlYWRlcnMpIHtcbiAgZm9yIChsZXQgbmFtZSBpbiBkZWZhdWx0SGVhZGVycyB8fCB7fSkge1xuICAgIGlmIChkZWZhdWx0SGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSAmJiAhaGVhZGVycy5oYXMobmFtZSkpIHtcbiAgICAgIGhlYWRlcnMuc2V0KG5hbWUsIGRlZmF1bHRIZWFkZXJzW25hbWVdKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNKU09OKHN0cikge1xuICB0cnkge1xuICAgIEpTT04ucGFyc2Uoc3RyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRDb25maWcoY29uZmlnKSB7XG4gIGNvbmZpZy51c2VTdGFuZGFyZENvbmZpZ3VyYXRvcigpO1xufVxuIiwiaW1wb3J0IGNyZWF0ZUh0dHBDbGllbnQgZnJvbSAnLi4vbGliL2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50JywgKCkgPT4ge1xuXHRpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkuZ2V0KCcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEuZm9vKS50by5lcXVhbCgnMScpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KVxuXHR9KTtcblxuXHRpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLnBvc3QoJy9odHRwLWNsaWVudC1wb3N0LXRlc3QnLCBKU09OLnN0cmluZ2lmeSh7IHRlc3REYXRhOiAnMScgfSkpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcyJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHRpdCgnYWJsZSB0byBtYWtlIGEgUFVUIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkucHV0KCcvaHR0cC1jbGllbnQtcHV0LXRlc3QnKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEuY3JlYXRlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHRpdCgnYWJsZSB0byBtYWtlIGEgUEFUQ0ggcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5wYXRjaCgnL2h0dHAtY2xpZW50LXBhdGNoLXRlc3QnKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEudXBkYXRlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHRpdCgnYWJsZSB0byBtYWtlIGEgREVMRVRFIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkuZGVsZXRlKCcvaHR0cC1jbGllbnQtZGVsZXRlLXRlc3QnKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEuZGVsZXRlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pO1xuXHR9KTtcblxuXHRpdChcImFibGUgdG8gbWFrZSBhIEdFVCByZXF1ZXN0IGZvciBhIFRFWFRcIiwgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLmdldCgnL2h0dHAtY2xpZW50LXJlc3BvbnNlLW5vdC1qc29uJylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRleHQoKSlcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdub3QganNvbicpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cbn0pO1xuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuL3R5cGUuanMnO1xuXG5leHBvcnQgY29uc3QgZFNldCA9IChvYmosIGtleSwgdmFsdWUpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgZGVwdGggPSBwYXJ0cy5sZW5ndGggLSAxO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVwdGg7IGkrKykge1xuICAgIGlmICh0eXBlLnVuZGVmaW5lZChvYmplY3RbcGFydHNbaV1dKSkge1xuICAgICAgb2JqZWN0W3BhcnRzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICB9XG4gIG9iamVjdFtwYXJ0c1tkZXB0aF1dID0gdmFsdWU7XG59O1xuXG5leHBvcnQgY29uc3QgZEdldCA9IChvYmosIGtleSwgZGVmYXVsdFZhbHVlID0gdW5kZWZpbmVkKSA9PiB7XG4gIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIHJldHVybiBvYmpba2V5XSA/IG9ialtrZXldIDogZGVmYXVsdFZhbHVlO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGxlbmd0aCA9IHBhcnRzLmxlbmd0aDtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0W3BhcnRzW2ldXTtcbiAgICBpZiAodHlwZS51bmRlZmluZWQob2JqZWN0KSkge1xuICAgICAgb2JqZWN0ID0gZGVmYXVsdFZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufTtcblxuY29uc3QgeyBrZXlzIH0gPSBPYmplY3Q7XG5cbmV4cG9ydCBjb25zdCBvYmplY3RUb01hcCA9IChvKSA9PlxuICBrZXlzKG8pLnJlZHVjZSgobSwgaykgPT4gbS5zZXQoaywgb1trXSksIG5ldyBNYXAoKSk7XG4iLCIvKiAgKi9cblxubGV0IHByZXZUaW1lSWQgPSAwO1xubGV0IHByZXZVbmlxdWVJZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IChwcmVmaXgpID0+IHtcbiAgbGV0IG5ld1VuaXF1ZUlkID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5ld1VuaXF1ZUlkID09PSBwcmV2VGltZUlkKSB7XG4gICAgKytwcmV2VW5pcXVlSWQ7XG4gIH0gZWxzZSB7XG4gICAgcHJldlRpbWVJZCA9IG5ld1VuaXF1ZUlkO1xuICAgIHByZXZVbmlxdWVJZCA9IDA7XG4gIH1cblxuICBsZXQgdW5pcXVlSWQgPSBgJHtTdHJpbmcobmV3VW5pcXVlSWQpfSR7U3RyaW5nKHByZXZVbmlxdWVJZCl9YDtcbiAgaWYgKHByZWZpeCkge1xuICAgIHVuaXF1ZUlkID0gYCR7cHJlZml4fV8ke3VuaXF1ZUlkfWA7XG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUlkO1xufTtcbiIsImltcG9ydCB7IGRHZXQsIGRTZXQgfSBmcm9tICcuL29iamVjdC5qcyc7XG5pbXBvcnQgeyBqc29uQ2xvbmUgfSBmcm9tICcuL2Nsb25lLmpzJztcbmltcG9ydCBpcyBmcm9tICcuL3R5cGUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdW5pcXVlSWQgZnJvbSAnLi91bmlxdWUtaWQuanMnO1xuXG5jb25zdCBtb2RlbCA9IChiYXNlQ2xhc3MgPSBjbGFzcyB7fSkgPT4ge1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgcmV0dXJuIGNsYXNzIE1vZGVsIGV4dGVuZHMgYmFzZUNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuX3N0YXRlS2V5ID0gdW5pcXVlSWQoJ19zdGF0ZScpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmRlZmF1bHRTdGF0ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBnZXQoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdGF0ZShhY2Nlc3Nvcik7XG4gICAgfVxuXG4gICAgc2V0KGFyZzEsIGFyZzIpIHtcbiAgICAgIC8vc3VwcG9ydHMgKGFjY2Vzc29yLCBzdGF0ZSkgT1IgKHN0YXRlKSBhcmd1bWVudHMgZm9yIHNldHRpbmcgdGhlIHdob2xlIHRoaW5nXG4gICAgICBsZXQgYWNjZXNzb3IsIHZhbHVlO1xuICAgICAgaWYgKCFpcy5zdHJpbmcoYXJnMSkgJiYgaXMudW5kZWZpbmVkKGFyZzIpKSB7XG4gICAgICAgIHZhbHVlID0gYXJnMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gYXJnMjtcbiAgICAgICAgYWNjZXNzb3IgPSBhcmcxO1xuICAgICAgfVxuICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgICAgIGxldCBuZXdTdGF0ZSA9IGpzb25DbG9uZShvbGRTdGF0ZSk7XG5cbiAgICAgIGlmIChhY2Nlc3Nvcikge1xuICAgICAgICBkU2V0KG5ld1N0YXRlLCBhY2Nlc3NvciwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U3RhdGUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKGFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3Vic2NyaWJlcigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBzZWxmLl9zdWJzY3JpYmUoY29udGV4dCwgLi4uYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vVE9ETzogaXMgb2ZmKCkgbmVlZGVkIGZvciBpbmRpdmlkdWFsIHN1YnNjcmlwdGlvbj9cbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSAtIGNvbnRleHQgbXVzdCBiZSBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uKGJpbmRSdWxlcykge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiaW5kUnVsZXNbMF0pKSB7XG4gICAgICAgICAgICBiaW5kUnVsZXMgPSBbYmluZFJ1bGVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmluZFJ1bGVzLmZvckVhY2goYmluZFJ1bGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIGJpbmRSdWxlWzBdLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgIGRTZXQoY29udGV4dCwgYmluZFJ1bGVbMV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRTdGF0ZShhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIGpzb25DbG9uZShhY2Nlc3NvciA/IGRHZXQocHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldLCBhY2Nlc3NvcikgOiBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0pO1xuICAgIH1cblxuICAgIF9zZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgX3N1YnNjcmliZShjb250ZXh0LCBhY2Nlc3NvciwgY2IpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpYmVycy5nZXQoY29udGV4dCkgfHwgW107XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goeyBhY2Nlc3NvciwgY2IgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5zZXQoY29udGV4dCwgc3Vic2NyaXB0aW9ucyk7XG4gICAgfVxuXG4gICAgX2Rlc3Ryb3lTdWJzY3JpYmVyKGNvbnRleHQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICB9XG5cbiAgICBfbm90aWZ5U3Vic2NyaWJlcnMoc2V0QWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbihzdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHsgYWNjZXNzb3IsIGNiIH0pIHtcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6J1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXouYmxheidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZihzZXRBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgIGNiKGRHZXQobmV3U3RhdGUsIGFjY2Vzc29yKSwgZEdldChvbGRTdGF0ZSwgYWNjZXNzb3IpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9lLmcuIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby4qJ1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKCcqJykgPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZGVlcEFjY2Vzc29yID0gYWNjZXNzb3IucmVwbGFjZSgnLionLCAnJykucmVwbGFjZSgnKicsICcnKTtcbiAgICAgICAgICAgIGlmIChzZXRBY2Nlc3Nvci5pbmRleE9mKGRlZXBBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgICAgY2IoZEdldChuZXdTdGF0ZSwgZGVlcEFjY2Vzc29yKSwgZEdldChvbGRTdGF0ZSwgZGVlcEFjY2Vzc29yKSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IG1vZGVsO1xuIiwiaW1wb3J0IG1vZGVsIGZyb20gJy4uL2xpYi9tb2RlbC5qcyc7XG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgbW9kZWwoKSB7XG5cdGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtmb286MX07XG4gIH1cbn1cblxuZGVzY3JpYmUoXCJNb2RlbCBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImRlZmF1bHRTdGF0ZSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXHRpdChcImdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCgnZm9vJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiAxXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajInKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3aXRoIGFycmF5cyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW11cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcsJ2RvZycpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJykpLnRvLmVxdWFsKCdkb2cnKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcse2ZvbzoxfSk7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDEpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycsMik7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcInN1YnNjcmlwdGlvbnMgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXHRcdGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZSkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZSkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdHRocm93KCdubyBzdWJzY3JpYmVyIHNob3VsZCBiZSBjYWxsZWQgZm9yIGRlZXBPYmoxJyk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEuKicsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbC5zZXQoVEVTVF9TRUwsIHRydWUpO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaWJlcnMgY2FuIGJlIGRlc3Ryb3llZFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLlRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKG15TW9kZWwuVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0dGhyb3cobmV3IEVycm9yKCdzaG91bGQgbm90IGJlIG9ic2VydmVkJykpO1xuXHRcdH0pO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldChteU1vZGVsLlRFU1RfU0VMLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzIGJvdW5kIGZyb20gbW9kZWwgdG8gY3VzdG9tIGVsZW1lbnRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblxuICAgIGxldCBteUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKHZhbHVlKSA9PiB7IHRoaXMucHJvcCA9IHZhbHVlOyB9KTtcbiAgICBvYnNlcnZlci5kZXN0cm95KCk7XG5cbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRlciA9IG15TW9kZWwuY3JlYXRlUHJvcGVydHlCaW5kZXIobXlFbGVtZW50KS5hZGRCaW5kaW5ncyhcbiAgICAgIFsnZm9vJywgJ3Byb3AnXVxuICAgICk7XG5cbiAgICBteU1vZGVsLnNldCgnZm9vJywgJzMnKTtcbiAgICBjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcbiAgICBwcm9wZXJ0eUJpbmRlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQoJ2ZvbycsICcyJyk7XG5cdFx0Y2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuXG5cblxuY29uc3QgZXZlbnRIdWJGYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgLy8kRmxvd0ZpeE1lXG4gIHJldHVybiB7XG4gICAgcHVibGlzaDogZnVuY3Rpb24oZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goc3Vic2NyaXB0aW9ucyA9PiB7XG4gICAgICAgIChzdWJzY3JpcHRpb25zLmdldChldmVudCkgfHwgW10pLmZvckVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjcmVhdGVTdWJzY3JpYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVycy5oYXMoY29udGV4dCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnNldChjb250ZXh0LCBuZXcgTWFwKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpO1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlci5oYXMoZXZlbnQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLnNldChldmVudCwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVyLmdldChldmVudCkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVycy5nZXQoY29udGV4dCkuZGVsZXRlKGV2ZW50KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50SHViRmFjdG9yeTtcbiIsImltcG9ydCBldmVudEh1YkZhY3RvcnkgZnJvbSAnLi4vbGliL2V2ZW50LWh1Yi5qcyc7XG5cbmRlc2NyaWJlKFwiRXZlbnRIdWIgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJiYXNpYyBwdWIvc3ViIHdvcmtzXCIsIChkb25lKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaWJlcnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyMiA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpcHRpb25zIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDIpO1xuICAgICAgfSlcblxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInLCAyKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwiZGVzdHJveSgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1YlN1YnNjcmliZXIuZGVzdHJveSgpO1xuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMCk7XG5cdH0pO1xuXG4gIGl0KFwib2ZmKCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwodW5kZWZpbmVkKTtcbiAgICAgIH0pXG4gICAgICAub2ZmKCdmb28nKVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicpOyAgLy9zaG91bGQgY2FsbGVkXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblxufSk7XG4iXSwibmFtZXMiOlsiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJpbmNsdWRlcyIsImJyb3dzZXIiLCJmbiIsInJhaXNlIiwiRXJyb3IiLCJuYW1lIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImxlbmd0aCIsImRlZmluZVByb3BlcnR5IiwiaSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImEiLCJkZWVwIiwiYm9keSIsInRlbXBsYXRlIiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJlbCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJhbGwiLCJhcnIiLCJldmVyeSIsImFueSIsInNvbWUiLCJkb0FsbEFwaSIsInBhcmFtcyIsImRvQW55QXBpIiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwic2V0dXAiLCJnZXRUeXBlIiwic3JjIiwiZ2V0U3JjVHlwZSIsIm1hdGNoZXMiLCJjaGVja3MiLCJjbG9uZSIsImpzb25DbG9uZSIsInJldml2ZXIiLCJrIiwidiIsImNpcmN1bGFycyIsImNsb25lcyIsIm9iamVjdCIsImZ1bmN0aW9uIiwidCIsImNsb25lVHlwZXMiLCJmcmVlemUiLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJrZXkiLCJmaW5kSW5kZXgiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsInRocm93Iiwibm90IiwiY2xvbmVkIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwiaXMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwic3RyaW5nIiwiQ29uZmlndXJhdG9yIiwiYmFzZVVybCIsImRlZmF1bHRzIiwiaW50ZXJjZXB0b3JzIiwid2l0aEJhc2VVcmwiLCJ3aXRoRGVmYXVsdHMiLCJ3aXRoSW50ZXJjZXB0b3IiLCJpbnRlcmNlcHRvciIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJIdHRwQ2xpZW50IiwiYWRkSW50ZXJjZXB0b3IiLCJmZXRjaCIsImlucHV0IiwiaW5pdCIsInJlcXVlc3QiLCJfYnVpbGRSZXF1ZXN0IiwiX3Byb2Nlc3NSZXF1ZXN0IiwidGhlbiIsInJlc3VsdCIsIlJlc3BvbnNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJSZXF1ZXN0IiwiX3Byb2Nlc3NSZXNwb25zZSIsInBvc3QiLCJfZmV0Y2giLCJwdXQiLCJwYXRjaCIsImRlbGV0ZSIsInJlcXVlc3RDb250ZW50VHlwZSIsInBhcnNlZERlZmF1bHRIZWFkZXJzIiwicGFyc2VIZWFkZXJWYWx1ZXMiLCJIZWFkZXJzIiwiYm9keU9iaiIsInJlcXVlc3RJbml0IiwiZ2V0UmVxdWVzdFVybCIsImhhcyIsImlzSlNPTiIsInNldERlZmF1bHRIZWFkZXJzIiwiQmxvYiIsImFwcGx5SW50ZXJjZXB0b3JzIiwiY29uZmlndXJlIiwiZGVmYXVsdENvbmZpZyIsInN1Y2Nlc3NOYW1lIiwiZXJyb3JOYW1lIiwicmVkdWNlIiwiY2hhaW4iLCJzdWNjZXNzSGFuZGxlciIsImVycm9ySGFuZGxlciIsImlkZW50aXR5IiwidGhyb3dlciIsIm9rIiwieCIsInBhcnNlZEhlYWRlcnMiLCJhYnNvbHV0ZVVybFJlZ2V4cCIsInVybCIsInRlc3QiLCJkZWZhdWx0SGVhZGVycyIsInN0ciIsImNyZWF0ZUh0dHBDbGllbnQiLCJqc29uIiwiZm9vIiwiZG9uZSIsInRlc3REYXRhIiwiY3JlYXRlZCIsInVwZGF0ZWQiLCJkZWxldGVkIiwidGV4dCIsImRTZXQiLCJwYXJ0cyIsImRlcHRoIiwiZEdldCIsImRlZmF1bHRWYWx1ZSIsInByZXZUaW1lSWQiLCJwcmV2VW5pcXVlSWQiLCJwcmVmaXgiLCJuZXdVbmlxdWVJZCIsIm5vdyIsInVuaXF1ZUlkIiwibW9kZWwiLCJzdWJzY3JpYmVyQ291bnQiLCJfc3RhdGVLZXkiLCJfc3Vic2NyaWJlcnMiLCJfc2V0U3RhdGUiLCJkZWZhdWx0U3RhdGUiLCJhY2Nlc3NvciIsIl9nZXRTdGF0ZSIsImFyZzEiLCJhcmcyIiwib2xkU3RhdGUiLCJuZXdTdGF0ZSIsIl9ub3RpZnlTdWJzY3JpYmVycyIsImNyZWF0ZVN1YnNjcmliZXIiLCJzZWxmIiwiX3N1YnNjcmliZSIsImRlc3Ryb3kiLCJfZGVzdHJveVN1YnNjcmliZXIiLCJjcmVhdGVQcm9wZXJ0eUJpbmRlciIsImFkZEJpbmRpbmdzIiwiYmluZFJ1bGVzIiwiYmluZFJ1bGUiLCJzdWJzY3JpcHRpb25zIiwic2V0QWNjZXNzb3IiLCJzdWJzY3JpYmVycyIsImRlZXBBY2Nlc3NvciIsIk1vZGVsIiwibXlNb2RlbCIsImRlZXBPYmoxIiwiZGVlcE9iajIiLCJzZWxlY3RlZCIsIlRFU1RfU0VMIiwibXlNb2RlbFN1YnNjcmliZXIiLCJudW1DYWxsYmFja3NDYWxsZWQiLCJteUVsZW1lbnQiLCJwcm9wZXJ0eUJpbmRlciIsImV2ZW50SHViRmFjdG9yeSIsInB1Ymxpc2giLCJzdWJzY3JpYmVyIiwibXlFdmVudEh1YiIsIm15RXZlbnRIdWJTdWJzY3JpYmVyIiwibXlFdmVudEh1YlN1YnNjcmliZXIyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEVBQU8sSUFBTUEsWUFBWSxDQUFDLFFBQVFDLE1BQVIseUNBQVFBLE1BQVIsVUFBdUJDLFFBQXZCLHlDQUF1QkEsUUFBdkIsR0FBaUNDLFFB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
