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

  clone.json = function (value) {
    var reviver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (k, v) {
      return v;
    };
    return JSON.parse(JSON.stringify(value), reviver);
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

    describe('clone.json', function () {
      it('When non-serializable value is passed in it throws', function () {
        expect(function () {
          return clone.json();
        }).to.throw(Error);
        expect(function () {
          return clone.json(function () {});
        }).to.throw(Error);
        expect(function () {
          return clone.json(undefined);
        }).to.throw(Error);

        //console.log(clone.json(null));
        //expect(() => clone.json(null)).to.throw(Error);
        // Null
        //expect(() => clone.json(null)).to.throw('null is not valid JSON');
        //expect(clone.json()).to.throw('undefined is not valid json');
        //expect(clone.json(() => {})).to.throw('is a function, not valid json');
        //expect(clone.json(5)).to.throw();
        //console.log(clone.json({'key':'string'}));
        //expect(clone.json({'key':'string'})).to.throw();
        //expect(clone.json(true)).to.throw();
        //expect(clone.json(false)).to.throw();


        // Undefined
        // expect(clone.json()).to.throw('undefined is not valid json');

        // Function
        // const func = () => {};
        // expect(clone.json(func)).to.throw('is a function, not valid json');

        // Etc: numbers and string
        // assert.equal(clone.json(5), 5);
        // assert.equal(clone.json('string'), 'string');
        // assert.equal(clone.json(false), false);
        // assert.equal(clone.json(true), true);
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

    if (is.undefined(fetch)) {
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
  		if (is.undefined(object[parts[i]])) {
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
  		if (is.undefined(object)) {
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
        if (!is.string(arg1) && is.undefined(arg2)) {
          value = arg1;
        } else {
          value = arg2;
          accessor = arg1;
        }
        var oldState = this._getState();
        var newState = clone.json(oldState);

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
        return clone.json(accessor ? dget(privates[this._stateKey], accessor) : privates[this._stateKey]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkuanMiLCIuLi8uLi9saWIvdHlwZS5qcyIsIi4uLy4uL2xpYi9jbG9uZS5qcyIsIi4uLy4uL3Rlc3QvY2xvbmUuanMiLCIuLi8uLi90ZXN0L3R5cGUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGNvbnN0IGlzQnJvd3NlciA9ICFbdHlwZW9mIHdpbmRvdywgdHlwZW9mIGRvY3VtZW50XS5pbmNsdWRlcyhcbiAgJ3VuZGVmaW5lZCdcbik7XG5cbmV4cG9ydCBjb25zdCBicm93c2VyID0gKGZuLCByYWlzZSA9IHRydWUpID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGlmIChpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbiAgaWYgKHJhaXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2ZuLm5hbWV9IGZvciBicm93c2VyIHVzZSBvbmx5YCk7XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChcbiAgY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSlcbikgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuXG5sZXQgbWljcm9UYXNrQ3VyckhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrTGFzdEhhbmRsZSA9IDA7XG5sZXQgbWljcm9UYXNrQ2FsbGJhY2tzID0gW107XG5sZXQgbWljcm9UYXNrTm9kZUNvbnRlbnQgPSAwO1xubGV0IG1pY3JvVGFza05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihtaWNyb1Rhc2tGbHVzaCkub2JzZXJ2ZShtaWNyb1Rhc2tOb2RlLCB7XG4gIGNoYXJhY3RlckRhdGE6IHRydWVcbn0pO1xuXG5cbi8qKlxuICogQmFzZWQgb24gUG9seW1lci5hc3luY1xuICovXG5jb25zdCBtaWNyb1Rhc2sgPSB7XG4gIC8qKlxuICAgKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCBtaWNyb1Rhc2sgdGltaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAgICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAgICovXG4gIHJ1bihjYWxsYmFjaykge1xuICAgIG1pY3JvVGFza05vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobWljcm9UYXNrTm9kZUNvbnRlbnQrKyk7XG4gICAgbWljcm9UYXNrQ2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIHJldHVybiBtaWNyb1Rhc2tDdXJySGFuZGxlKys7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBtaWNyb1Rhc2tgIGNhbGxiYWNrLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICAgKi9cbiAgY2FuY2VsKGhhbmRsZSkge1xuICAgIGNvbnN0IGlkeCA9IGhhbmRsZSAtIG1pY3JvVGFza0xhc3RIYW5kbGU7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBpZiAoIW1pY3JvVGFza0NhbGxiYWNrc1tpZHhdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgICAgfVxuICAgICAgbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbWljcm9UYXNrO1xuXG5mdW5jdGlvbiBtaWNyb1Rhc2tGbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gbWljcm9UYXNrQ2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IG1pY3JvVGFza0NhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG1pY3JvVGFza0NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbWljcm9UYXNrTGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoXG4gICAgICBhdHRyaWJ1dGVOYW1lLFxuICAgICAgb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZVxuICAgICkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcihcbiAgKFxuICAgIHRhcmdldCxcbiAgICB0eXBlLFxuICAgIGxpc3RlbmVyLFxuICAgIGNhcHR1cmUgPSBmYWxzZVxuICApID0+IHtcbiAgICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gIH1cbik7XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdwcm9wZXJ0aWVzLW1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uLy4uL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCBhZnRlciBmcm9tICcuLi8uLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMnO1xuaW1wb3J0IHJlbW92ZUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2V2ZW50cy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKCh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufSk7XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvYnJvd3Nlci9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBjb25zdCBhbGwgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG5cbmV4cG9ydCBjb25zdCBhbnkgPSAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSAnTWFwIFNldCBTeW1ib2wgQXJyYXkgT2JqZWN0IFN0cmluZyBEYXRlIFJlZ0V4cCBGdW5jdGlvbiBCb29sZWFuIE51bWJlciBOdWxsIFVuZGVmaW5lZCBBcmd1bWVudHMgRXJyb3InLnNwbGl0KFxuICAnICdcbik7XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuY29uc3QgaXMgPSBzZXR1cCgpO1xuXG5leHBvcnQgZGVmYXVsdCBpcztcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGxldCBjaGVja3MgPSB7fTtcbiAgZm9yIChsZXQgaSA9IGxlbjsgaS0tOyApIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaV0udG9Mb3dlckNhc2UoKTtcbiAgICBjaGVja3NbdHlwZV0gPSBvYmogPT4gZ2V0VHlwZShvYmopID09PSB0eXBlO1xuICAgIGNoZWNrc1t0eXBlXS5hbGwgPSBkb0FsbEFwaShjaGVja3NbdHlwZV0pO1xuICAgIGNoZWNrc1t0eXBlXS5hbnkgPSBkb0FueUFwaShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUob2JqKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChvYmopO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi90eXBlLmpzJztcblxuY29uc3QgY2xvbmUgPSBmdW5jdGlvbihzcmMsIGNpcmN1bGFycyA9IFtdLCBjbG9uZXMgPSBbXSkge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmICghc3JjIHx8ICF0eXBlLm9iamVjdChzcmMpIHx8IHR5cGUuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBEYXRlXG4gIGlmICh0eXBlLmRhdGUoc3JjKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShzcmMuZ2V0VGltZSgpKTtcbiAgfVxuXG4gIC8vIFJlZ0V4cFxuICBpZiAodHlwZS5yZWdleHAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNyYyk7XG4gIH1cblxuICAvLyBBcnJheXNcbiAgaWYgKHR5cGUuYXJyYXkoc3JjKSkge1xuICAgIHJldHVybiBzcmMubWFwKGNsb25lKTtcbiAgfVxuXG4gIC8vIEVTNiBNYXBzXG4gIGlmICh0eXBlLm1hcChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbShzcmMuZW50cmllcygpKSk7XG4gIH1cblxuICAvLyBFUzYgU2V0c1xuICBpZiAodHlwZS5zZXQoc3JjKSkge1xuICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20oc3JjLnZhbHVlcygpKSk7XG4gIH1cblxuICAvLyBPYmplY3RcbiAgaWYgKHR5cGUub2JqZWN0KHNyYykpIHtcbiAgICBjaXJjdWxhcnMucHVzaChzcmMpO1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoc3JjKTtcbiAgICBjbG9uZXMucHVzaChvYmopO1xuICAgIGZvciAobGV0IGtleSBpbiBzcmMpIHtcbiAgICAgIGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSBzcmNba2V5XSk7XG4gICAgICBvYmpba2V5XSA9IGlkeCA+IC0xID8gY2xvbmVzW2lkeF0gOiBjbG9uZShzcmNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcmV0dXJuIHNyYztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lO1xuXG5jbG9uZS5qc29uID0gKHZhbHVlLCByZXZpdmVyID0gKGssIHYpID0+IHYpID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCByZXZpdmVyKTsiLCJpbXBvcnQgY2xvbmUgZnJvbSAnLi4vbGliL2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuICBkZXNjcmliZSgncHJpbWl0aXZlcycsICgpID0+IHtcbiAgICBpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuICAgICAgLy8gTnVsbFxuICAgICAgZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChjbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihjbG9uZShmdW5jKSwgJ2lzIGEgZnVuY3Rpb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnY2xvbmUuanNvbicsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiBpdCB0aHJvd3MnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoKCkgPT4gY2xvbmUuanNvbigpKS50by50aHJvdyhFcnJvcik7XG5cdFx0XHRleHBlY3QoKCkgPT4gY2xvbmUuanNvbigoKSA9PiB7fSkpLnRvLnRocm93KEVycm9yKTtcblx0XHRcdGV4cGVjdCgoKSA9PiBjbG9uZS5qc29uKHVuZGVmaW5lZCkpLnRvLnRocm93KEVycm9yKTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhjbG9uZS5qc29uKG51bGwpKTtcblx0XHRcdC8vZXhwZWN0KCgpID0+IGNsb25lLmpzb24obnVsbCkpLnRvLnRocm93KEVycm9yKTtcbiAgICAgIC8vIE51bGxcblx0XHRcdC8vZXhwZWN0KCgpID0+IGNsb25lLmpzb24obnVsbCkpLnRvLnRocm93KCdudWxsIGlzIG5vdCB2YWxpZCBKU09OJyk7XG5cdFx0XHQvL2V4cGVjdChjbG9uZS5qc29uKCkpLnRvLnRocm93KCd1bmRlZmluZWQgaXMgbm90IHZhbGlkIGpzb24nKTtcblx0XHRcdC8vZXhwZWN0KGNsb25lLmpzb24oKCkgPT4ge30pKS50by50aHJvdygnaXMgYSBmdW5jdGlvbiwgbm90IHZhbGlkIGpzb24nKTtcblx0XHRcdC8vZXhwZWN0KGNsb25lLmpzb24oNSkpLnRvLnRocm93KCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGNsb25lLmpzb24oeydrZXknOidzdHJpbmcnfSkpO1xuXHRcdFx0Ly9leHBlY3QoY2xvbmUuanNvbih7J2tleSc6J3N0cmluZyd9KSkudG8udGhyb3coKTtcblx0XHRcdC8vZXhwZWN0KGNsb25lLmpzb24odHJ1ZSkpLnRvLnRocm93KCk7XG5cdFx0XHQvL2V4cGVjdChjbG9uZS5qc29uKGZhbHNlKSkudG8udGhyb3coKTtcblxuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIC8vIGV4cGVjdChjbG9uZS5qc29uKCkpLnRvLnRocm93KCd1bmRlZmluZWQgaXMgbm90IHZhbGlkIGpzb24nKTtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIC8vIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIC8vIGV4cGVjdChjbG9uZS5qc29uKGZ1bmMpKS50by50aHJvdygnaXMgYSBmdW5jdGlvbiwgbm90IHZhbGlkIGpzb24nKTtcblxuICAgICAgLy8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcbiAgICAgIC8vIGFzc2VydC5lcXVhbChjbG9uZS5qc29uKDUpLCA1KTtcbiAgICAgIC8vIGFzc2VydC5lcXVhbChjbG9uZS5qc29uKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgLy8gYXNzZXJ0LmVxdWFsKGNsb25lLmpzb24oZmFsc2UpLCBmYWxzZSk7XG4gICAgICAvLyBhc3NlcnQuZXF1YWwoY2xvbmUuanNvbih0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdHlwZSBmcm9tICcuL3R5cGUuanMnO1xuXG5cblxuLyoqXG4gKiBUaGUgaW5pdCBvYmplY3QgdXNlZCB0byBpbml0aWFsaXplIGEgZmV0Y2ggUmVxdWVzdC5cbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdC9SZXF1ZXN0XG4gKi9cblxuY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgY29uZmlndXJpbmcgSHR0cENsaWVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0b3Ige1xuICBnZXQgYmFzZVVybCgpIHtcbiAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuYmFzZVVybDtcbiAgfVxuXG4gIGdldCBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShwcml2YXRlcyh0aGlzKS5kZWZhdWx0cyk7XG4gIH1cblxuICBnZXQgaW50ZXJjZXB0b3JzKCkge1xuICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbnRlcmNlcHRvcnM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5iYXNlVXJsID0gJyc7XG4gICAgcHJpdmF0ZXModGhpcykuaW50ZXJjZXB0b3JzID0gW107XG4gIH1cblxuICB3aXRoQmFzZVVybChiYXNlVXJsKSB7XG4gICAgcHJpdmF0ZXModGhpcykuYmFzZVVybCA9IGJhc2VVcmw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoRGVmYXVsdHMoZGVmYXVsdHMpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aEludGVyY2VwdG9yKGludGVyY2VwdG9yKSB7XG4gICAgcHJpdmF0ZXModGhpcykuaW50ZXJjZXB0b3JzLnB1c2goaW50ZXJjZXB0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKSB7XG4gICAgbGV0IHN0YW5kYXJkQ29uZmlnID0ge1xuICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSSdcbiAgICAgIH1cbiAgICB9O1xuICAgIHByaXZhdGVzKHRoaXMpLmRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhbmRhcmRDb25maWcpO1xuICAgIHJldHVybiB0aGlzLnJlamVjdEVycm9yUmVzcG9uc2VzKCk7XG4gIH1cblxuICByZWplY3RFcnJvclJlc3BvbnNlcygpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoSW50ZXJjZXB0b3IoeyByZXNwb25zZTogcmVqZWN0T25FcnJvciB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudCB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGFkZEludGVyY2VwdG9yKGludGVyY2VwdG9yKSB7XG4gICAgcHJpdmF0ZXModGhpcykuY29uZmlnLndpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcik7XG4gIH1cblxuICBmZXRjaChpbnB1dCwgaW5pdCA9IHt9KSB7XG4gICAgbGV0IHJlcXVlc3QgPSB0aGlzLl9idWlsZFJlcXVlc3QoaW5wdXQsIGluaXQpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXF1ZXN0KHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0KGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2goaW5wdXQsIGluaXQpO1xuICB9XG5cbiAgcG9zdChpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ1BPU1QnLCBib2R5LCBpbml0KTtcbiAgfVxuXG4gIHB1dChpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ1BVVCcsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgcGF0Y2goaW5wdXQsIGJvZHksIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2goaW5wdXQsICdQQVRDSCcsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgZGVsZXRlKGlucHV0LCBib2R5LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoKGlucHV0LCAnREVMRVRFJywgYm9keSwgaW5pdCk7XG4gIH1cblxuICBfYnVpbGRSZXF1ZXN0KGlucHV0LCBpbml0ID0ge30pIHtcbiAgICBsZXQgZGVmYXVsdHMgPSBwcml2YXRlcyh0aGlzKS5jb25maWcuZGVmYXVsdHMgfHwge307XG4gICAgbGV0IHJlcXVlc3Q7XG4gICAgbGV0IGJvZHkgPSAnJztcbiAgICBsZXQgcmVxdWVzdENvbnRlbnRUeXBlO1xuICAgIGxldCBwYXJzZWREZWZhdWx0SGVhZGVycyA9IHBhcnNlSGVhZGVyVmFsdWVzKGRlZmF1bHRzLmhlYWRlcnMpO1xuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgcmVxdWVzdCA9IGlucHV0O1xuICAgICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKS5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gaW5pdC5ib2R5O1xuICAgICAgbGV0IGJvZHlPYmogPSBib2R5ID8geyBib2R5IH0gOiBudWxsO1xuICAgICAgbGV0IHJlcXVlc3RJbml0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHsgaGVhZGVyczoge30gfSwgaW5pdCwgYm9keU9iaik7XG4gICAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0SW5pdC5oZWFkZXJzKS5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGdldFJlcXVlc3RVcmwocHJpdmF0ZXModGhpcykuY29uZmlnLmJhc2VVcmwsIGlucHV0KSwgcmVxdWVzdEluaXQpO1xuICAgIH1cbiAgICBpZiAoIXJlcXVlc3RDb250ZW50VHlwZSkge1xuICAgICAgaWYgKG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgICAgIH0gZWxzZSBpZiAoYm9keSAmJiBpc0pTT04oU3RyaW5nKGJvZHkpKSkge1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXREZWZhdWx0SGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMsIHBhcnNlZERlZmF1bHRIZWFkZXJzKTtcbiAgICBpZiAoYm9keSAmJiBib2R5IGluc3RhbmNlb2YgQmxvYiAmJiBib2R5LnR5cGUpIHtcbiAgICAgIC8vIHdvcmsgYXJvdW5kIGJ1ZyBpbiBJRSAmIEVkZ2Ugd2hlcmUgdGhlIEJsb2IgdHlwZSBpcyBpZ25vcmVkIGluIHRoZSByZXF1ZXN0XG4gICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzIxMzYxNjNcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGJvZHkudHlwZSk7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9XG5cbiAgX3Byb2Nlc3NSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICByZXR1cm4gYXBwbHlJbnRlcmNlcHRvcnMocmVxdWVzdCwgcHJpdmF0ZXModGhpcykuY29uZmlnLmludGVyY2VwdG9ycywgJ3JlcXVlc3QnLCAncmVxdWVzdEVycm9yJyk7XG4gIH1cblxuICBfcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGFwcGx5SW50ZXJjZXB0b3JzKHJlc3BvbnNlLCBwcml2YXRlcyh0aGlzKS5jb25maWcuaW50ZXJjZXB0b3JzLCAncmVzcG9uc2UnLCAncmVzcG9uc2VFcnJvcicpO1xuICB9XG5cbiAgX2ZldGNoKGlucHV0LCBtZXRob2QsIGJvZHksIGluaXQpIHtcbiAgICBpZiAoIWluaXQpIHtcbiAgICAgIGluaXQgPSB7fTtcbiAgICB9XG4gICAgaW5pdC5tZXRob2QgPSBtZXRob2Q7XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIGluaXQuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZldGNoKGlucHV0LCBpbml0KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoY29uZmlndXJlID0gZGVmYXVsdENvbmZpZykgPT4ge1xuICBpZiAodHlwZS51bmRlZmluZWQoZmV0Y2gpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWlyZXMgRmV0Y2ggQVBJIGltcGxlbWVudGF0aW9uLCBidXQgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgZG9lc24ndCBzdXBwb3J0IGl0LlwiKTtcbiAgfVxuICBjb25zdCBjb25maWcgPSBuZXcgQ29uZmlndXJhdG9yKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuICByZXR1cm4gbmV3IEh0dHBDbGllbnQoY29uZmlnKTtcbn07XG5cbmZ1bmN0aW9uIGFwcGx5SW50ZXJjZXB0b3JzKFxuICBpbnB1dCxcbiAgaW50ZXJjZXB0b3JzID0gW10sXG4gIHN1Y2Nlc3NOYW1lLFxuICBlcnJvck5hbWVcbikge1xuICByZXR1cm4gaW50ZXJjZXB0b3JzLnJlZHVjZSgoY2hhaW4sIGludGVyY2VwdG9yKSA9PiB7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdO1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbnRlcmNlcHRvcltlcnJvck5hbWVdO1xuICAgIHJldHVybiBjaGFpbi50aGVuKFxuICAgICAgKHN1Y2Nlc3NIYW5kbGVyICYmIHN1Y2Nlc3NIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCBpZGVudGl0eSxcbiAgICAgIChlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCB0aHJvd2VyXG4gICAgKTtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKGlucHV0KSk7XG59XG5cbmZ1bmN0aW9uIHJlamVjdE9uRXJyb3IocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHRocm93IHJlc3BvbnNlO1xuICB9XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gdGhyb3dlcih4KSB7XG4gIHRocm93IHg7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyVmFsdWVzKGhlYWRlcnMpIHtcbiAgbGV0IHBhcnNlZEhlYWRlcnMgPSB7fTtcbiAgZm9yIChsZXQgbmFtZSBpbiBoZWFkZXJzIHx8IHt9KSB7XG4gICAgaWYgKGhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIHBhcnNlZEhlYWRlcnNbbmFtZV0gPSB0eXBlLmZ1bmN0aW9uKGhlYWRlcnNbbmFtZV0pID8gaGVhZGVyc1tuYW1lXSgpIDogaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnNlZEhlYWRlcnM7XG59XG5cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0Q29uZmlnKGNvbmZpZykge1xuICBjb25maWcudXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKTtcbn1cbiIsImltcG9ydCBjcmVhdGVIdHRwQ2xpZW50IGZyb20gJy4uL2xpYi9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCcsICgpID0+IHtcblx0aXQoJ2FibGUgdG8gbWFrZSBhIEdFVCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLmdldCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSlcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBPU1QgcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5wb3N0KCcvaHR0cC1jbGllbnQtcG9zdC10ZXN0JywgSlNPTi5zdHJpbmdpZnkoeyB0ZXN0RGF0YTogJzEnIH0pKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEuZm9vKS50by5lcXVhbCgnMicpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBVVCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLnB1dCgnL2h0dHAtY2xpZW50LXB1dC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmNyZWF0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBBVENIIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkucGF0Y2goJy9odHRwLWNsaWVudC1wYXRjaC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLnVwZGF0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIERFTEVURSByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLmRlbGV0ZSgnL2h0dHAtY2xpZW50LWRlbGV0ZS10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmRlbGV0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoXCJhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCBmb3IgYSBURVhUXCIsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5nZXQoJy9odHRwLWNsaWVudC1yZXNwb25zZS1ub3QtanNvbicpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KHJlc3BvbnNlKS50by5lcXVhbCgnbm90IGpzb24nKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHR5cGUgZnJvbSAnLi90eXBlLmpzJztcblxuZXhwb3J0IGNvbnN0IGRzZXQgPSAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG5cdGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuXHRcdG9ialtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG5cdGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcblx0bGV0IG9iamVjdCA9IG9iajtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcblx0XHRpZiAodHlwZS51bmRlZmluZWQob2JqZWN0W3BhcnRzW2ldXSkpIHtcblx0XHRcdG9iamVjdFtwYXJ0c1tpXV0gPSB7fTtcblx0XHR9XG5cdFx0b2JqZWN0ID0gb2JqZWN0W3BhcnRzW2ldXTtcblx0fVxuXHRvYmplY3RbcGFydHNbZGVwdGhdXSA9IHZhbHVlO1xufTtcblxuZXhwb3J0IGNvbnN0IGRnZXQgPSAob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkgPT4ge1xuXHRpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcblx0XHRyZXR1cm4gb2JqW2tleV0gPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcblx0fVxuXHRjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuXHRjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG5cdGxldCBvYmplY3QgPSBvYmo7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG5cdFx0aWYgKHR5cGUudW5kZWZpbmVkKG9iamVjdCkpIHtcblx0XHRcdG9iamVjdCA9IGRlZmF1bHRWYWx1ZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9iamVjdDtcbn07XG5cbmNvbnN0IHtrZXlzfSA9IE9iamVjdDtcblxuZXhwb3J0IGNvbnN0IHRvTWFwID0gKG8pID0+IGtleXMobykucmVkdWNlKFxuXHQobSwgaykgPT4gbS5zZXQoaywgb1trXSksXG5cdG5ldyBNYXAoKVxuKTtcbiIsIi8qICAqL1xuXG5sZXQgcHJldlRpbWVJZCA9IDA7XG5sZXQgcHJldlVuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgKHByZWZpeCkgPT4ge1xuICBsZXQgbmV3VW5pcXVlSWQgPSBEYXRlLm5vdygpO1xuICBpZiAobmV3VW5pcXVlSWQgPT09IHByZXZUaW1lSWQpIHtcbiAgICArK3ByZXZVbmlxdWVJZDtcbiAgfSBlbHNlIHtcbiAgICBwcmV2VGltZUlkID0gbmV3VW5pcXVlSWQ7XG4gICAgcHJldlVuaXF1ZUlkID0gMDtcbiAgfVxuXG4gIGxldCB1bmlxdWVJZCA9IGAke1N0cmluZyhuZXdVbmlxdWVJZCl9JHtTdHJpbmcocHJldlVuaXF1ZUlkKX1gO1xuICBpZiAocHJlZml4KSB7XG4gICAgdW5pcXVlSWQgPSBgJHtwcmVmaXh9XyR7dW5pcXVlSWR9YDtcbiAgfVxuICByZXR1cm4gdW5pcXVlSWQ7XG59O1xuIiwiaW1wb3J0IHtkZ2V0fSBmcm9tICcuL29iamVjdC5qcyc7XG5pbXBvcnQge2RzZXR9IGZyb20gJy4vb2JqZWN0LmpzJztcbmltcG9ydCBjbG9uZSBmcm9tICcuL2Nsb25lLmpzJztcbmltcG9ydCBpcyBmcm9tICcuL3R5cGUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdW5pcXVlSWQgZnJvbSAnLi91bmlxdWUtaWQuanMnO1xuXG5jb25zdCBtb2RlbCA9IChiYXNlQ2xhc3MgPSBjbGFzcyB7fSkgPT4ge1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgcmV0dXJuIGNsYXNzIE1vZGVsIGV4dGVuZHMgYmFzZUNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuX3N0YXRlS2V5ID0gdW5pcXVlSWQoJ19zdGF0ZScpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmRlZmF1bHRTdGF0ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBnZXQoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdGF0ZShhY2Nlc3Nvcik7XG4gICAgfVxuXG4gICAgc2V0KGFyZzEsIGFyZzIpIHtcbiAgICAgIC8vc3VwcG9ydHMgKGFjY2Vzc29yLCBzdGF0ZSkgT1IgKHN0YXRlKSBhcmd1bWVudHMgZm9yIHNldHRpbmcgdGhlIHdob2xlIHRoaW5nXG4gICAgICBsZXQgYWNjZXNzb3IsIHZhbHVlO1xuICAgICAgaWYgKCFpcy5zdHJpbmcoYXJnMSkgJiYgaXMudW5kZWZpbmVkKGFyZzIpKSB7XG4gICAgICAgIHZhbHVlID0gYXJnMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gYXJnMjtcbiAgICAgICAgYWNjZXNzb3IgPSBhcmcxO1xuICAgICAgfVxuICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgICAgIGxldCBuZXdTdGF0ZSA9IGNsb25lLmpzb24ob2xkU3RhdGUpO1xuXG4gICAgICBpZiAoYWNjZXNzb3IpIHtcbiAgICAgICAgZHNldChuZXdTdGF0ZSwgYWNjZXNzb3IsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1N0YXRlID0gdmFsdWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyhhY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZVN1YnNjcmliZXIoKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICAvL1RPRE86IGlzIG9mZigpIG5lZWRlZCBmb3IgaW5kaXZpZHVhbCBzdWJzY3JpcHRpb24/XG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkgLSBjb250ZXh0IG11c3QgYmUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFkZEJpbmRpbmdzOiBmdW5jdGlvbihiaW5kUnVsZXMpIHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmluZFJ1bGVzWzBdKSkge1xuICAgICAgICAgICAgYmluZFJ1bGVzID0gW2JpbmRSdWxlc107XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpbmRSdWxlcy5mb3JFYWNoKGJpbmRSdWxlID0+IHtcbiAgICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCBiaW5kUnVsZVswXSwgdmFsdWUgPT4ge1xuICAgICAgICAgICAgICBkc2V0KGNvbnRleHQsIGJpbmRSdWxlWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBfZ2V0U3RhdGUoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiBjbG9uZS5qc29uKGFjY2Vzc29yID8gZGdldChwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0sIGFjY2Vzc29yKSA6IHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSk7XG4gICAgfVxuXG4gICAgX3NldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0gPSBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBfc3Vic2NyaWJlKGNvbnRleHQsIGFjY2Vzc29yLCBjYikge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmliZXJzLmdldChjb250ZXh0KSB8fCBbXTtcbiAgICAgIHN1YnNjcmlwdGlvbnMucHVzaCh7IGFjY2Vzc29yLCBjYiB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLnNldChjb250ZXh0LCBzdWJzY3JpcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZGVzdHJveVN1YnNjcmliZXIoY29udGV4dCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgIH1cblxuICAgIF9ub3RpZnlTdWJzY3JpYmVycyhzZXRBY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHN1YnNjcmliZXJzKSB7XG4gICAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oeyBhY2Nlc3NvciwgY2IgfSkge1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXonXG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJhei5ibGF6J1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKHNldEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgYWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBhY2Nlc3NvcikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2UuZy4gc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLionXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2YoJyonKSA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBkZWVwQWNjZXNzb3IgPSBhY2Nlc3Nvci5yZXBsYWNlKCcuKicsICcnKS5yZXBsYWNlKCcqJywgJycpO1xuICAgICAgICAgICAgaWYgKHNldEFjY2Vzc29yLmluZGV4T2YoZGVlcEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBkZWVwQWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBkZWVwQWNjZXNzb3IpKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgbW9kZWw7XG4iLCJpbXBvcnQgbW9kZWwgZnJvbSAnLi4vbGliL21vZGVsLmpzJztcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBtb2RlbCgpIHtcblx0Z2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICByZXR1cm4ge2ZvbzoxfTtcbiAgfVxufVxuXG5kZXNjcmliZShcIk1vZGVsIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiZGVmYXVsdFN0YXRlIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cdGl0KFwiZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KCdmb28nLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IDFcblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajInLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMicpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdpdGggYXJyYXlzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbXVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJywnZG9nJyk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnKSkudG8uZXF1YWwoJ2RvZycpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJyx7Zm9vOjF9KTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJywyKTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaXB0aW9ucyB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBURVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cdFx0bGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihURVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0dGhyb3coJ25vIHN1YnNjcmliZXIgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZGVlcE9iajEnKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMS4qJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsLnNldChURVNUX1NFTCwgdHJ1ZSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpYmVycyBjYW4gYmUgZGVzdHJveWVkXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24obXlNb2RlbC5URVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHR0aHJvdyhuZXcgRXJyb3IoJ3Nob3VsZCBub3QgYmUgb2JzZXJ2ZWQnKSk7XG5cdFx0fSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KG15TW9kZWwuVEVTVF9TRUwsIHRydWUpO1xuXHR9KTtcblxuXHRpdChcInByb3BlcnRpZXMgYm91bmQgZnJvbSBtb2RlbCB0byBjdXN0b20gZWxlbWVudFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXG4gICAgbGV0IG15RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAodmFsdWUpID0+IHsgdGhpcy5wcm9wID0gdmFsdWU7IH0pO1xuICAgIG9ic2VydmVyLmRlc3Ryb3koKTtcblxuICAgIGNvbnN0IHByb3BlcnR5QmluZGVyID0gbXlNb2RlbC5jcmVhdGVQcm9wZXJ0eUJpbmRlcihteUVsZW1lbnQpLmFkZEJpbmRpbmdzKFxuICAgICAgWydmb28nLCAncHJvcCddXG4gICAgKTtcblxuICAgIG15TW9kZWwuc2V0KCdmb28nLCAnMycpO1xuICAgIGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuICAgIHByb3BlcnR5QmluZGVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldCgnZm9vJywgJzInKTtcblx0XHRjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcblx0fSk7XG5cbn0pO1xuIiwiLyogICovXG5cblxuXG5jb25zdCBldmVudEh1YkZhY3RvcnkgPSAoKSA9PiB7XG4gIGNvbnN0IHN1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICBsZXQgc3Vic2NyaWJlckNvdW50ID0gMDtcblxuICAvLyRGbG93Rml4TWVcbiAgcmV0dXJuIHtcbiAgICBwdWJsaXNoOiBmdW5jdGlvbihldmVudCwgLi4uYXJncykge1xuICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChzdWJzY3JpcHRpb25zID0+IHtcbiAgICAgICAgKHN1YnNjcmlwdGlvbnMuZ2V0KGV2ZW50KSB8fCBbXSkuZm9yRWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAgICAgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNyZWF0ZVN1YnNjcmliZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXJzLmhhcyhjb250ZXh0KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIG5ldyBNYXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSBzdWJzY3JpYmVycy5nZXQoY29udGV4dCk7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVyLmhhcyhldmVudCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuc2V0KGV2ZW50LCBbXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXIuZ2V0KGV2ZW50KS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgb2ZmOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXJzLmdldChjb250ZXh0KS5kZWxldGUoZXZlbnQpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZXZlbnRIdWJGYWN0b3J5O1xuIiwiaW1wb3J0IGV2ZW50SHViRmFjdG9yeSBmcm9tICcuLi9saWIvZXZlbnQtaHViLmpzJztcblxuZGVzY3JpYmUoXCJFdmVudEh1YiBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImJhc2ljIHB1Yi9zdWIgd29ya3NcIiwgKGRvbmUpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpYmVycyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmlwdGlvbnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMik7XG4gICAgICB9KVxuXG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicsIDIpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJkZXN0cm95KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViU3Vic2NyaWJlci5kZXN0cm95KCk7XG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgwKTtcblx0fSk7XG5cbiAgaXQoXCJvZmYoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCh1bmRlZmluZWQpO1xuICAgICAgfSlcbiAgICAgIC5vZmYoJ2ZvbycpXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJyk7ICAvL3Nob3VsZCBjYWxsZWRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXG59KTtcbiJdLCJuYW1lcyI6WyJpc0Jyb3dzZXIiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImluY2x1ZGVzIiwiYnJvd3NlciIsImZuIiwicmFpc2UiLCJFcnJvciIsIm5hbWUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwibGVuZ3RoIiwiZGVmaW5lUHJvcGVydHkiLCJpIiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsIm1pY3JvVGFza0N1cnJIYW5kbGUiLCJtaWNyb1Rhc2tMYXN0SGFuZGxlIiwibWljcm9UYXNrQ2FsbGJhY2tzIiwibWljcm9UYXNrTm9kZUNvbnRlbnQiLCJtaWNyb1Rhc2tOb2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwibWljcm9UYXNrRmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsIm1pY3JvVGFzayIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2FuY2VsIiwiaGFuZGxlIiwiaWR4IiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJwb3AiLCJQcm9wZXJ0aWVzTWl4aW5UZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiZGVzY3JpYmUiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzTWl4aW5UZXN0IiwiY3JlYXRlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJpbm5lckhUTUwiLCJpdCIsImFzc2VydCIsImVxdWFsIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiYSIsImRlZXAiLCJib2R5IiwidGVtcGxhdGUiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsImVsIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImFsbCIsImFyciIsImV2ZXJ5IiwiYW55Iiwic29tZSIsImRvQWxsQXBpIiwicGFyYW1zIiwiZG9BbnlBcGkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJpcyIsInNldHVwIiwiY2hlY2tzIiwiZ2V0VHlwZSIsIm1hdGNoZXMiLCJjbG9uZSIsInNyYyIsImNpcmN1bGFycyIsImNsb25lcyIsIm9iamVjdCIsImZ1bmN0aW9uIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwia2V5IiwiZmluZEluZGV4IiwianNvbiIsInJldml2ZXIiLCJrIiwidiIsImJlIiwibnVsbCIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwidGhyb3ciLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwic3RyaW5nIiwiQ29uZmlndXJhdG9yIiwiYmFzZVVybCIsImZyZWV6ZSIsImRlZmF1bHRzIiwiaW50ZXJjZXB0b3JzIiwid2l0aEJhc2VVcmwiLCJ3aXRoRGVmYXVsdHMiLCJ3aXRoSW50ZXJjZXB0b3IiLCJpbnRlcmNlcHRvciIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJIdHRwQ2xpZW50IiwiYWRkSW50ZXJjZXB0b3IiLCJmZXRjaCIsImlucHV0IiwiaW5pdCIsInJlcXVlc3QiLCJfYnVpbGRSZXF1ZXN0IiwiX3Byb2Nlc3NSZXF1ZXN0IiwidGhlbiIsInJlc3VsdCIsIlJlc3BvbnNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJSZXF1ZXN0IiwiX3Byb2Nlc3NSZXNwb25zZSIsInBvc3QiLCJfZmV0Y2giLCJwdXQiLCJwYXRjaCIsImRlbGV0ZSIsInJlcXVlc3RDb250ZW50VHlwZSIsInBhcnNlZERlZmF1bHRIZWFkZXJzIiwicGFyc2VIZWFkZXJWYWx1ZXMiLCJIZWFkZXJzIiwiYm9keU9iaiIsInJlcXVlc3RJbml0IiwiZ2V0UmVxdWVzdFVybCIsImhhcyIsImlzSlNPTiIsInNldERlZmF1bHRIZWFkZXJzIiwiQmxvYiIsImFwcGx5SW50ZXJjZXB0b3JzIiwiY29uZmlndXJlIiwiZGVmYXVsdENvbmZpZyIsInN1Y2Nlc3NOYW1lIiwiZXJyb3JOYW1lIiwicmVkdWNlIiwiY2hhaW4iLCJzdWNjZXNzSGFuZGxlciIsImVycm9ySGFuZGxlciIsImlkZW50aXR5IiwidGhyb3dlciIsIm9rIiwieCIsInBhcnNlZEhlYWRlcnMiLCJhYnNvbHV0ZVVybFJlZ2V4cCIsInVybCIsInRlc3QiLCJkZWZhdWx0SGVhZGVycyIsInN0ciIsImNyZWF0ZUh0dHBDbGllbnQiLCJmb28iLCJkb25lIiwidGVzdERhdGEiLCJjcmVhdGVkIiwidXBkYXRlZCIsImRlbGV0ZWQiLCJ0ZXh0IiwiZHNldCIsInBhcnRzIiwiZGVwdGgiLCJkZ2V0IiwiZGVmYXVsdFZhbHVlIiwicHJldlRpbWVJZCIsInByZXZVbmlxdWVJZCIsInByZWZpeCIsIm5ld1VuaXF1ZUlkIiwibm93IiwidW5pcXVlSWQiLCJtb2RlbCIsInN1YnNjcmliZXJDb3VudCIsIl9zdGF0ZUtleSIsIl9zdWJzY3JpYmVycyIsIl9zZXRTdGF0ZSIsImRlZmF1bHRTdGF0ZSIsImFjY2Vzc29yIiwiX2dldFN0YXRlIiwiYXJnMSIsImFyZzIiLCJvbGRTdGF0ZSIsIm5ld1N0YXRlIiwiX25vdGlmeVN1YnNjcmliZXJzIiwiY3JlYXRlU3Vic2NyaWJlciIsInNlbGYiLCJfc3Vic2NyaWJlIiwiZGVzdHJveSIsIl9kZXN0cm95U3Vic2NyaWJlciIsImNyZWF0ZVByb3BlcnR5QmluZGVyIiwiYWRkQmluZGluZ3MiLCJiaW5kUnVsZXMiLCJiaW5kUnVsZSIsInN1YnNjcmlwdGlvbnMiLCJzZXRBY2Nlc3NvciIsInN1YnNjcmliZXJzIiwiZGVlcEFjY2Vzc29yIiwiTW9kZWwiLCJteU1vZGVsIiwiZGVlcE9iajEiLCJkZWVwT2JqMiIsInNlbGVjdGVkIiwiVEVTVF9TRUwiLCJteU1vZGVsU3Vic2NyaWJlciIsIm51bUNhbGxiYWNrc0NhbGxlZCIsIm15RWxlbWVudCIsInByb3BlcnR5QmluZGVyIiwiZXZlbnRIdWJGYWN0b3J5IiwicHVibGlzaCIsInN1YnNjcmliZXIiLCJteUV2ZW50SHViIiwibXlFdmVudEh1YlN1YnNjcmliZXIiLCJteUV2ZW50SHViU3Vic2NyaWJlcjIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBO0FBQ0EsRUFBTyxJQUFNQSxZQUFZLENBQUMsUUFBUUMsTUFBUix5Q0FBUUEsTUFBUixVQUF1QkMsUUFBdkIseUNBQXVCQSxRQUF2QixHQUFpQ0MsUUFBakMsQ0FDeEIsV0FEd0IsQ0FBbkI7O0FBSVAsRUFBTyxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsRUFBRDtFQUFBLE1BQUtDLEtBQUwsdUVBQWEsSUFBYjtFQUFBLFNBQXNCLFlBRXhDO0VBQ0gsUUFBSU4sU0FBSixFQUFlO0VBQ2IsYUFBT0ssOEJBQVA7RUFDRDtFQUNELFFBQUlDLEtBQUosRUFBVztFQUNULFlBQU0sSUFBSUMsS0FBSixDQUFhRixHQUFHRyxJQUFoQiwyQkFBTjtFQUNEO0VBQ0YsR0FUc0I7RUFBQSxDQUFoQjs7RUNMUDtBQUNBLHVCQUFlLFlBRVY7RUFBQSxNQURIQyxPQUNHLHVFQURPQyxPQUFPQyxNQUFQLENBQWNDLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsRUFBL0IsQ0FDUDs7RUFDSCxNQUFJQyxRQUFRLElBQUlDLE9BQUosRUFBWjtFQUNBLFNBQU8sVUFBQ0MsR0FBRCxFQUFTO0VBQ2QsUUFBSUMsUUFBUUgsTUFBTUksR0FBTixDQUFVRixHQUFWLENBQVo7RUFDQSxRQUFJLENBQUNDLEtBQUwsRUFBWTtFQUNWSCxZQUFNSyxHQUFOLENBQVVILEdBQVYsRUFBZ0JDLFFBQVFQLFFBQVFNLEdBQVIsQ0FBeEI7RUFDRDtFQUNELFdBQU9DLEtBQVA7RUFDRCxHQU5EO0VBT0QsQ0FYRDs7RUNEQTtBQUNBLGdCQUFlLFVBQUNHLFNBQUQsRUFBK0I7RUFBQSxvQ0FBaEJDLFdBQWdCO0VBQWhCQSxlQUFnQjtFQUFBOztFQUM1QyxTQUFPLFVBQVNDLEtBQVQs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
