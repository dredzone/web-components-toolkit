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

    var stateKey = '_state'; //TODO uniqueString.get('_state');
    var subscriberCount = 0;

    return function (_baseClass) {
      inherits(Model, _baseClass);

      function Model() {
        classCallCheck(this, Model);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var _this = possibleConstructorReturn(this, _baseClass.call.apply(_baseClass, [this].concat(args)));

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
        return jsonClone(accessor ? dget(this[stateKey], accessor) : this[stateKey]);
      };

      Model.prototype._setState = function _setState(newState) {
        this[stateKey] = newState;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2Vudmlyb25tZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYnJvd3Nlci90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi90ZXN0L2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL3VuaXF1ZS1pZC5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL2NvbW1vbnMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci91bndyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9hcHBseS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL3dyYXAuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWNsYXJlLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIvaXMtYXBwbGljYXRpb24tb2YuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9oYXMuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9kZWR1cGUuanMiLCIuLi8uLi9saWIvY2xhc3MtYnVpbGRlci9jYWNoZS5qcyIsIi4uLy4uL2xpYi9jbGFzcy1idWlsZGVyL21peGluLmpzIiwiLi4vLi4vbGliL2NsYXNzLWJ1aWxkZXIuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQvY29uZmlndXJhdG9yLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2FwcGx5LWludGVyY2VwdG9ycy5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9yZXF1ZXN0LmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L2ZldGNoLWNsaWVudC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9jb25maWd1cmUuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL21vZGVsLmpzIiwiLi4vLi4vdGVzdC9tb2RlbC5qcyIsIi4uLy4uL2xpYi9ldmVudC1odWIuanMiLCIuLi8uLi90ZXN0L2V2ZW50LWh1Yi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBjb25zdCBpc0Jyb3dzZXIgPSAhW3R5cGVvZiB3aW5kb3csIHR5cGVvZiBkb2N1bWVudF0uaW5jbHVkZXMoXG4gICd1bmRlZmluZWQnXG4pO1xuXG5leHBvcnQgY29uc3QgYnJvd3NlciA9IChmbiwgcmFpc2UgPSB0cnVlKSA9PiAoXG4gIC4uLmFyZ3NcbikgPT4ge1xuICBpZiAoaXNCcm93c2VyKSB7XG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xuICB9XG4gIGlmIChyYWlzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtmbi5uYW1lfSBmb3IgYnJvd3NlciB1c2Ugb25seWApO1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pXG4pID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge1xuICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG59KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gICAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gICAqL1xuICBydW4oY2FsbGJhY2spIHtcbiAgICBtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuICAgIG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICBjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgaWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi8uLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWVzXG4gIH07XG4gIF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICBnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKFxuICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgIG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWVcbiAgICApIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi8uLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPVxuICAgICAgY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9XG4gICAgICAgIHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHNcbiAgICApIHtcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgIE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5vdGlmeSxcbiAgICAgICAgICBoYXNPYnNlcnZlcixcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGUsXG4gICAgICAgICAgaXNPYnNlcnZlclN0cmluZyxcbiAgICAgICAgICBvYnNlcnZlclxuICAgICAgICB9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICBpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGAke3Byb3BlcnR5fS1jaGFuZ2VkYCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZTogb2xkUHJvcHNbcHJvcGVydHldXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+XG4gICAgICAgICAgdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSlcbiAgICAgICAgKSB8fCBbXVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PlxuICAgICAgICAgIG1hdGNoWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKFxuICAgICAgICAgIGF0dHJpYnV0ZVxuICAgICAgICApO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV1cbiAgICAgICAgLnR5cGU7XG4gICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNOdW1iZXIsXG4gICAgICAgIGlzQXJyYXksXG4gICAgICAgIGlzQm9vbGVhbixcbiAgICAgICAgaXNEYXRlLFxuICAgICAgICBpc1N0cmluZyxcbiAgICAgICAgaXNPYmplY3RcbiAgICAgIH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9XG4gICAgICAgICAgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBpc0FycmF5XG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHt9XG4gICAgICAgICAgICA6IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc0RhdGUpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlDb25maWcgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1tcbiAgICAgICAgcHJvcGVydHlcbiAgICAgIF07XG4gICAgICBjb25zdCB7IGlzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXkgfSA9IHByb3BlcnR5Q29uZmlnO1xuXG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGxldCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZykge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0ge307XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhT2xkICYmICEocHJvcGVydHkgaW4gcHJpdmF0ZXModGhpcykuZGF0YU9sZCkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZ1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cblxuICAgIF9pbnZhbGlkYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9mbHVzaFByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZztcbiAgICAgIGNvbnN0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFPbGQ7XG5cbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oY2hhbmdlZFByb3BzKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFN0cmljdCBlcXVhbGl0eSBjaGVja1xuICAgICAgICBvbGQgIT09IHZhbHVlICYmXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyAob2xkPT1OYU4sIHZhbHVlPT1OYU4pIGFsd2F5cyByZXR1cm5zIGZhbHNlXG4gICAgICAgIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICApO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoXG4gIChcbiAgICB0YXJnZXQsXG4gICAgdHlwZSxcbiAgICBsaXN0ZW5lcixcbiAgICBjYXB0dXJlID0gZmFsc2VcbiAgKSA9PiB7XG4gICAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICB9XG4pO1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBldmVudCBlbWl0dGVyJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHR5cGUuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICBsZXQgZXZlbnRzID0gdHlwZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gICAgbGV0IGhhbmRsZXMgPSBldmVudHMubWFwKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICBsZXQgaGFuZGxlO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZSA9IGhhbmRsZXMucG9wKCkpKSB7XG4gICAgICAgICAgaGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzTWl4aW5UZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc01peGluVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5kZXNjcmliZSgncHJvcGVydGllcy1taXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzTWl4aW5UZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNNaXhpblRlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNNaXhpblRlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzTWl4aW5UZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudC5qcyc7XG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyczogW11cbiAgICB9O1xuICB9KTtcbiAgY29uc3QgZXZlbnREZWZhdWx0UGFyYW1zID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEV2ZW50cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGFmdGVyKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IGBvbiR7ZXZlbnQudHlwZX1gO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW2hhbmRsZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICB0aGlzW2hhbmRsZV0oZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB0aGlzLm93bihsaXN0ZW5FdmVudCh0aGlzLCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpXG4gICAgICApO1xuICAgIH1cblxuICAgIG9mZigpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgaGFuZGxlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG93biguLi5oYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGNvbnRleHQub2ZmKCk7XG4gICAgfTtcbiAgfVxufSk7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICcuLi9lbnZpcm9ubWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGJyb3dzZXIoKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChlbGVtZW50KSA9PiB7XG4gIGlmIChlbGVtZW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICBlbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn0pO1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3JlbW92ZS1lbGVtZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdldmVudHMtbWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJy4uL2Vudmlyb25tZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlcigodGVtcGxhdGUpID0+IHtcbiAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBjaGlsZHJlbiA9IHRlbXBsYXRlLmNoaWxkTm9kZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnLi4vZW52aXJvbm1lbnQuanMnO1xuaW1wb3J0IHRlbXBsYXRlQ29udGVudCBmcm9tICcuL3RlbXBsYXRlLWNvbnRlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBicm93c2VyKChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn0pO1xuIiwiaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2Jyb3dzZXIvY3JlYXRlLWVsZW1lbnQuanMnO1xuXG5kZXNjcmliZSgnY3JlYXRlLWVsZW1lbnQnLCAoKSA9PiB7XG4gIGl0KCdjcmVhdGUgZWxlbWVudCcsICgpID0+IHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQoYFxuXHRcdFx0PGRpdiBjbGFzcz1cIm15LWNsYXNzXCI+SGVsbG8gV29ybGQ8L2Rpdj5cblx0XHRgKTtcbiAgICBleHBlY3QoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdteS1jbGFzcycpKS50by5lcXVhbCh0cnVlKTtcbiAgICBhc3NlcnQuaW5zdGFuY2VPZihlbCwgTm9kZSwgJ2VsZW1lbnQgaXMgaW5zdGFuY2Ugb2Ygbm9kZScpO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoXG4gIC4uLnBhcmFtc1xuKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9ICdNYXAgU2V0IFN5bWJvbCBBcnJheSBPYmplY3QgU3RyaW5nIERhdGUgUmVnRXhwIEZ1bmN0aW9uIEJvb2xlYW4gTnVtYmVyIE51bGwgVW5kZWZpbmVkIEFyZ3VtZW50cyBFcnJvcicuc3BsaXQoXG4gICcgJ1xuKTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5jb25zdCBpcyA9IHNldHVwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzO1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IG9iaiA9PiBnZXRUeXBlKG9iaikgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZShvYmopIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKG9iaik7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcblxuY29uc3QgY2xvbmUgPSBmdW5jdGlvbihcbiAgc3JjLFxuICBjaXJjdWxhcnMgPSBbXSxcbiAgY2xvbmVzID0gW11cbikge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmICghc3JjIHx8ICF0eXBlLm9iamVjdChzcmMpIHx8IHR5cGUuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cblxuICAvLyBEYXRlXG4gIGlmICh0eXBlLmRhdGUoc3JjKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShzcmMuZ2V0VGltZSgpKTtcbiAgfVxuXG4gIC8vIFJlZ0V4cFxuICBpZiAodHlwZS5yZWdleHAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKHNyYyk7XG4gIH1cblxuICAvLyBBcnJheXNcbiAgaWYgKHR5cGUuYXJyYXkoc3JjKSkge1xuICAgIHJldHVybiBzcmMubWFwKGNsb25lKTtcbiAgfVxuXG4gIC8vIEVTNiBNYXBzXG4gIGlmICh0eXBlLm1hcChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbShzcmMuZW50cmllcygpKSk7XG4gIH1cblxuICAvLyBFUzYgU2V0c1xuICBpZiAodHlwZS5zZXQoc3JjKSkge1xuICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20oc3JjLnZhbHVlcygpKSk7XG4gIH1cblxuICAvLyBPYmplY3RcbiAgaWYgKHR5cGUub2JqZWN0KHNyYykpIHtcbiAgICBjaXJjdWxhcnMucHVzaChzcmMpO1xuICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoc3JjKTtcbiAgICBjbG9uZXMucHVzaChvYmopO1xuICAgIGZvciAobGV0IGtleSBpbiBzcmMpIHtcbiAgICAgIGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSBzcmNba2V5XSk7XG4gICAgICBvYmpba2V5XSA9IGlkeCA+IC0xID8gY2xvbmVzW2lkeF0gOiBjbG9uZShzcmNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcmV0dXJuIHNyYztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lO1xuXG5leHBvcnQgY29uc3QganNvbkNsb25lID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59O1xuIiwiaW1wb3J0IGNsb25lLCB7IGpzb25DbG9uZSB9IGZyb20gJy4uLy4uL2xpYi9vYmplY3QvY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnY2xvbmUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdwcmltaXRpdmVzJywgKCkgPT4ge1xuICAgIGl0KCdSZXR1cm5zIGVxdWFsIGRhdGEgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuICAgICAgLy8gRnVuY3Rpb25cbiAgICAgIGNvbnN0IGZ1bmMgPSAoKSA9PiB7fTtcbiAgICAgIGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChjbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdqc29uQ2xvbmUnLCAoKSA9PiB7XG4gICAgaXQoJ1doZW4gbm9uLXNlcmlhbGl6YWJsZSB2YWx1ZSBpcyBwYXNzZWQgaW4sIHJldHVybnMgdGhlIHNhbWUgZm9yIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGMnLCAoKSA9PiB7XG4gICAgICAvLyBOdWxsXG4gICAgICBleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG4gICAgICAvLyBVbmRlZmluZWRcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oanNvbkNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG4gICAgICAvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSg1KSwgNSk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUodHJ1ZSksIHRydWUpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0IGlzIGZyb20gJy4uL2xpYi90eXBlLmpzJztcblxuZGVzY3JpYmUoJ3R5cGUnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgY29uc3Qgbm90QXJncyA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhub3RBcmdzKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYWxsIHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFsbChhcmdzLCBhcmdzLCBhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbnkgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYW55KGFyZ3MsICd0ZXN0JywgJ3Rlc3QyJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdhcnJheScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBhcnJheSA9IFsndGVzdCddO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KGFycmF5KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEFycmF5ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmFycmF5KG5vdEFycmF5KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbGwgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYWxsKFsndGVzdDEnXSwgWyd0ZXN0MiddLCBbJ3Rlc3QzJ10pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYW55IGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFueShbJ3Rlc3QxJ10sICd0ZXN0MicsICd0ZXN0MycpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYm9vbGVhbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IGJvb2wgPSB0cnVlO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4oYm9vbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBib29sZWFuJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEJvb2wgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihub3RCb29sKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKGVycm9yKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEVycm9yID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmVycm9yKG5vdEVycm9yKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdmdW5jdGlvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihpcy5mdW5jdGlvbikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBmdW5jdGlvbicsICgpID0+IHtcbiAgICAgIGxldCBub3RGdW5jdGlvbiA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5mdW5jdGlvbihub3RGdW5jdGlvbikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVsbCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudWxsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bGwobnVsbCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudWxsJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bGwgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVsbChub3ROdWxsKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudW1iZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm51bWJlcigxKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bWJlcicsICgpID0+IHtcbiAgICAgIGxldCBub3ROdW1iZXIgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKG5vdE51bWJlcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnb2JqZWN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG9iamVjdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qoe30pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE9iamVjdCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5vYmplY3Qobm90T2JqZWN0KSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdyZWdleHAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoKTtcbiAgICAgIGV4cGVjdChpcy5yZWdleHAocmVnZXhwKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCBub3RSZWdleHAgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKG5vdFJlZ2V4cCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc3RyaW5nJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoJ3Rlc3QnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHN0cmluZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zdHJpbmcoMSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgndW5kZWZpbmVkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQodW5kZWZpbmVkKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IHVuZGVmaW5lZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCgndGVzdCcpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ21hcCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG5ldyBNYXAoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBNYXAnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubWFwKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5tYXAoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobmV3IFNldCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IFNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5zZXQobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLnNldChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cblxubGV0IHByZXZUaW1lSWQgPSAwO1xubGV0IHByZXZVbmlxdWVJZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IChwcmVmaXgpID0+IHtcbiAgbGV0IG5ld1VuaXF1ZUlkID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5ld1VuaXF1ZUlkID09PSBwcmV2VGltZUlkKSB7XG4gICAgKytwcmV2VW5pcXVlSWQ7XG4gIH0gZWxzZSB7XG4gICAgcHJldlRpbWVJZCA9IG5ld1VuaXF1ZUlkO1xuICAgIHByZXZVbmlxdWVJZCA9IDA7XG4gIH1cblxuICBsZXQgdW5pcXVlSWQgPSBgJHtTdHJpbmcobmV3VW5pcXVlSWQpfSR7U3RyaW5nKHByZXZVbmlxdWVJZCl9YDtcbiAgaWYgKHByZWZpeCkge1xuICAgIHVuaXF1ZUlkID0gYCR7cHJlZml4fV8ke3VuaXF1ZUlkfWA7XG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUlkO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4uL3VuaXF1ZS1pZC5qcyc7XG5cbi8vIHVzZWQgYnkgd3JhcCgpIGFuZCB1bndyYXAoKVxuZXhwb3J0IGNvbnN0IHdyYXBwZWRNaXhpbktleSA9IHVuaXF1ZUlkKCdfd3JhcHBlZE1peGluJyk7XG5cbi8vIHVzZWQgYnkgYXBwbHkoKSBhbmQgaXNBcHBsaWNhdGlvbk9mKClcbmV4cG9ydCBjb25zdCBhcHBsaWVkTWl4aW5LZXkgPSB1bmlxdWVJZCgnX2FwcGxpZWRNaXhpbicpO1xuIiwiLyogICovXG5pbXBvcnQgeyB3cmFwcGVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuXG4vKipcbiAqIFVud3JhcHMgdGhlIGZ1bmN0aW9uIGB3cmFwcGVyYCB0byByZXR1cm4gdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdyYXBwZWQgYnlcbiAqIG9uZSBvciBtb3JlIGNhbGxzIHRvIGB3cmFwYC4gUmV0dXJucyBgd3JhcHBlcmAgaWYgaXQncyBub3QgYSB3cmFwcGVkXG4gKiBmdW5jdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHdyYXBwZXIgQSB3cmFwcGVkIG1peGluIHByb2R1Y2VkIGJ5IHtAbGluayB3cmFwfVxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBvcmlnaW5hbGx5IHdyYXBwZWQgbWl4aW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKHdyYXBwZXIpID0+XG4gIHdyYXBwZXJbd3JhcHBlZE1peGluS2V5XSB8fCB3cmFwcGVyO1xuIiwiLyogICovXG5pbXBvcnQgeyBhcHBsaWVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbi8qKlxuICogQXBwbGllcyBgbWl4aW5gIHRvIGBzdXBlcmNsYXNzYC5cbiAqXG4gKiBgYXBwbHlgIHN0b3JlcyBhIHJlZmVyZW5jZSBmcm9tIHRoZSBtaXhpbiBhcHBsaWNhdGlvbiB0byB0aGUgdW53cmFwcGVkIG1peGluXG4gKiB0byBtYWtlIGBpc0FwcGxpY2F0aW9uT2ZgIGFuZCBgaGFzTWl4aW5gIHdvcmsuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VmdWxsIGZvciBtaXhpbiB3cmFwcGVycyB0aGF0IHdhbnQgdG8gYXV0b21hdGljYWxseSBlbmFibGVcbiAqIHtAbGluayBoYXNNaXhpbn0gc3VwcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN1cGVyQ2xhc3MgQSBjbGFzcyBvciBjb25zdHJ1Y3RvciBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIGFwcGx5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBzdWJjbGFzcyBvZiBgc3VwZXJjbGFzc2AgcHJvZHVjZWQgYnkgYG1peGluYFxuICovXG5leHBvcnQgZGVmYXVsdCAoc3VwZXJDbGFzcywgbWl4aW4pID0+IHtcbiAgbGV0IGFwcGxpY2F0aW9uID0gbWl4aW4oc3VwZXJDbGFzcyk7XG4gIGNvbnN0IHByb3RvID0gYXBwbGljYXRpb24ucHJvdG90eXBlO1xuICBwcm90b1thcHBsaWVkTWl4aW5LZXldID0gdW53cmFwKG1peGluKTtcbiAgcmV0dXJuIGFwcGxpY2F0aW9uO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgd3JhcHBlZE1peGluS2V5IH0gZnJvbSAnLi9jb21tb25zLmpzJztcblxuY29uc3QgeyBzZXRQcm90b3R5cGVPZiB9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIGZ1bmN0aW9uIGBtaXhpbmAgdG8gYmUgd3JhcHBlZCBieSB0aGUgZnVuY3Rpb24gYHdyYXBwZXJgLCB3aGlsZVxuICogYWxsb3dpbmcgcHJvcGVydGllcyBvbiBgbWl4aW5gIHRvIGJlIGF2YWlsYWJsZSB2aWEgYHdyYXBwZXJgLCBhbmQgYWxsb3dpbmdcbiAqIGB3cmFwcGVyYCB0byBiZSB1bndyYXBwZWQgdG8gZ2V0IHRvIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAqXG4gKiBgd3JhcGAgZG9lcyB0d28gdGhpbmdzOlxuICogICAxLiBTZXRzIHRoZSBwcm90b3R5cGUgb2YgYG1peGluYCB0byBgd3JhcHBlcmAgc28gdGhhdCBwcm9wZXJ0aWVzIHNldCBvblxuICogICAgICBgbWl4aW5gIGluaGVyaXRlZCBieSBgd3JhcHBlcmAuXG4gKiAgIDIuIFNldHMgYSBzcGVjaWFsIHByb3BlcnR5IG9uIGBtaXhpbmAgdGhhdCBwb2ludHMgYmFjayB0byBgbWl4aW5gIHNvIHRoYXRcbiAqICAgICAgaXQgY2FuIGJlIHJldHJlaXZlZCBmcm9tIGB3cmFwcGVyYFxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gQSBtaXhpbiBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBBIGZ1bmN0aW9uIHRoYXQgd3JhcHMge0BsaW5rIG1peGlufVxuICogQHJldHVybiB7RnVuY3Rpb259IGB3cmFwcGVyYFxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4sIHdyYXBwZXIpID0+IHtcbiAgc2V0UHJvdG90eXBlT2Yod3JhcHBlciwgbWl4aW4pO1xuICBpZiAoIW1peGluW3dyYXBwZWRNaXhpbktleV0pIHtcbiAgICBtaXhpblt3cmFwcGVkTWl4aW5LZXldID0gbWl4aW47XG4gIH1cbiAgcmV0dXJuIHdyYXBwZXI7XG59O1xuIiwiLyogICovXG5pbXBvcnQgYXBwbHkgZnJvbSAnLi9hcHBseS5qcyc7XG5pbXBvcnQgd3JhcCBmcm9tICcuL3dyYXAuanMnO1xuXG4vKipcbiAqIEEgYmFzaWMgbWl4aW4gZGVjb3JhdG9yIHRoYXQgYXBwbGllcyB0aGUgbWl4aW4gd2l0aCB7QGxpbmsgYXBwbHlNaXhpbn0gc28gdGhhdCBpdFxuICogY2FuIGJlIHVzZWQgd2l0aCB7QGxpbmsgaXNBcHBsaWNhdGlvbk9mfSwge0BsaW5rIGhhc01peGlufSBhbmQgdGhlIG90aGVyXG4gKiBtaXhpbiBkZWNvcmF0b3IgZnVuY3Rpb25zLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIHdyYXBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBhIG5ldyBtaXhpbiBmdW5jdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+XG4gIHdyYXAobWl4aW4sIChzdXBlckNsYXNzKSA9PiBhcHBseShzdXBlckNsYXNzLCBtaXhpbikpO1xuIiwiLyogICovXG5pbXBvcnQgeyBhcHBsaWVkTWl4aW5LZXkgfSBmcm9tICcuL2NvbW1vbnMuanMnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuL3Vud3JhcC5qcyc7XG5cbmNvbnN0IHsgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcblxuLyoqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZmYgYHByb3RvYCBpcyBhIHByb3RvdHlwZSBjcmVhdGVkIGJ5IHRoZSBhcHBsaWNhdGlvbiBvZlxuICogYG1peGluYCB0byBhIHN1cGVyY2xhc3MuXG4gKlxuICogYGlzQXBwbGljYXRpb25PZmAgd29ya3MgYnkgY2hlY2tpbmcgdGhhdCBgcHJvdG9gIGhhcyBhIHJlZmVyZW5jZSB0byBgbWl4aW5gXG4gKiBhcyBjcmVhdGVkIGJ5IGBhcHBseWAuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gQSBwcm90b3R5cGUgb2JqZWN0IGNyZWF0ZWQgYnkge0BsaW5rIGFwcGx5fS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1peGluIEEgbWl4aW4gZnVuY3Rpb24gdXNlZCB3aXRoIHtAbGluayBhcHBseX0uXG4gKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIGBwcm90b2AgaXMgYSBwcm90b3R5cGUgY3JlYXRlZCBieSB0aGUgYXBwbGljYXRpb24gb2ZcbiAqIGBtaXhpbmAgdG8gYSBzdXBlcmNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChwcm90bywgbWl4aW4pID0+IHtcbiAgcmV0dXJuIChcbiAgICBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBhcHBsaWVkTWl4aW5LZXkpICYmXG4gICAgcHJvdG9bYXBwbGllZE1peGluS2V5XSA9PT0gdW53cmFwKG1peGluKVxuICApO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGlzQXBwbGljYXRpb25PZiBmcm9tICcuL2lzLWFwcGxpY2F0aW9uLW9mLmpzJztcblxuY29uc3QgeyBnZXRQcm90b3R5cGVPZiB9ID0gT2JqZWN0O1xuXG4vKipcbiAqIFJldHVybnMgYHRydWVgIGlmZiBgb2AgaGFzIGFuIGFwcGxpY2F0aW9uIG9mIGBtaXhpbmAgb24gaXRzIHByb3RvdHlwZVxuICogY2hhaW4uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gbyBBbiBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1peGluIEEgbWl4aW4gYXBwbGllZCB3aXRoIHtAbGluayBhcHBseX1cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgYG9gIGhhcyBhbiBhcHBsaWNhdGlvbiBvZiBgbWl4aW5gIG9uIGl0cyBwcm90b3R5cGVcbiAqIGNoYWluXG4gKi9cbmV4cG9ydCBkZWZhdWx0IChvLCBtaXhpbikgPT4ge1xuICB3aGlsZSAobyAhPT0gbnVsbCkge1xuICAgIGlmIChpc0FwcGxpY2F0aW9uT2YobywgbWl4aW4pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgbyA9IGdldFByb3RvdHlwZU9mKG8pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBoYXMgZnJvbSAnLi9oYXMuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuLyoqXG4gKiBEZWNvcmF0ZXMgYG1peGluYCBzbyB0aGF0IGl0IG9ubHkgYXBwbGllcyBpZiBpdCdzIG5vdCBhbHJlYWR5IG9uIHRoZVxuICogcHJvdG90eXBlIGNoYWluLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW4gVGhlIG1peGluIHRvIHdyYXAgd2l0aCBkZWR1cGxpY2F0aW9uIGJlaGF2aW9yXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gYSBuZXcgbWl4aW4gZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG4gIHJldHVybiB3cmFwKFxuICAgIG1peGluLFxuICAgIChzdXBlckNsYXNzKSA9PlxuICAgICAgaGFzKHN1cGVyQ2xhc3MucHJvdG90eXBlLCBtaXhpbikgPyBzdXBlckNsYXNzIDogbWl4aW4oc3VwZXJDbGFzcylcbiAgKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuLi91bmlxdWUtaWQuanMnO1xuaW1wb3J0IHdyYXAgZnJvbSAnLi93cmFwLmpzJztcblxuY29uc3QgY2FjaGVkQXBwbGljYXRpb25LZXkgPSB1bmlxdWVJZCgnX2NhY2hlZEFwcGxpY2F0aW9uJyk7XG5cbi8qKlxuICogRGVjb3JhdGUgdGhlIGdpdmVuIG1peGluIGNsYXNzIHdpdGggYSBcImNhY2hlZCBkZWNvcmF0b3JcIi5cbiAqXG4gKiBNZXRob2Qgd2lsbCBlbnN1cmUgdGhhdCBpZiB0aGUgZ2l2ZW4gbWl4aW4gaGFzIGFscmVhZHkgYmVlbiBhcHBsaWVkLFxuICogdGhlbiBpdCB3aWxsIGJlIHJldHVybmVkIC8gYXBwbGllZCBhIHNpbmdsZSB0aW1lLCByYXRoZXIgdGhhbiBtdWx0aXBsZVxuICogdGltZXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWl4aW5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG1peGluKSA9PiB7XG4gIHJldHVybiB3cmFwKG1peGluLCAoc3VwZXJDbGFzcykgPT4ge1xuICAgIGxldCBjYWNoZWRBcHBsaWNhdGlvbiA9IHN1cGVyQ2xhc3NbY2FjaGVkQXBwbGljYXRpb25LZXldO1xuICAgIGlmICghY2FjaGVkQXBwbGljYXRpb24pIHtcbiAgICAgIGNhY2hlZEFwcGxpY2F0aW9uID0gc3VwZXJDbGFzc1tjYWNoZWRBcHBsaWNhdGlvbktleV0gPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGxldCBhcHBsaWNhdGlvbiA9IGNhY2hlZEFwcGxpY2F0aW9uLmdldChtaXhpbik7XG4gICAgaWYgKCFhcHBsaWNhdGlvbikge1xuICAgICAgYXBwbGljYXRpb24gPSBtaXhpbihzdXBlckNsYXNzKTtcbiAgICAgIGNhY2hlZEFwcGxpY2F0aW9uLnNldChtaXhpbiwgYXBwbGljYXRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYXBwbGljYXRpb247XG4gIH0pO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGRlY2xhcmUgZnJvbSAnLi9kZWNsYXJlLmpzJztcbmltcG9ydCBkZWR1cGUgZnJvbSAnLi9kZWR1cGUuanMnO1xuaW1wb3J0IGNhY2hlIGZyb20gJy4vY2FjaGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAobWl4aW4pID0+IGRlZHVwZShjYWNoZShkZWNsYXJlKG1peGluKSkpO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlTWl4aW4gZnJvbSAnLi9jbGFzcy1idWlsZGVyL21peGluLmpzJztcblxuY29uc3QgeyBmcmVlemUgfSA9IE9iamVjdDtcblxuXG5leHBvcnQgZGVmYXVsdCAoa2xhc3MgPSBjbGFzcyB7fSkgPT5cbiAgZnJlZXplKHtcbiAgICB3aXRoKC4uLm1peGlucykge1xuICAgICAgcmV0dXJuIG1peGluc1xuICAgICAgICAubWFwKChtaXhpbikgPT4gY3JlYXRlTWl4aW4obWl4aW4pKVxuICAgICAgICAucmVkdWNlKChrLCBtKSA9PiBtKGspLCBrbGFzcyk7XG4gICAgfVxuICB9KTtcbiIsIi8qICAqL1xuXG5cbi8qKlxuICogVGhlIGluaXQgb2JqZWN0IHVzZWQgdG8gaW5pdGlhbGl6ZSBhIGZldGNoIFJlcXVlc3QuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1JlcXVlc3QvUmVxdWVzdFxuICovXG5cbi8qKlxuICogQSBjbGFzcyBmb3IgY29uZmlndXJpbmcgSHR0cENsaWVudHMuXG4gKi9cbmNsYXNzIENvbmZpZ3VyYXRvciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gJyc7XG4gICAgdGhpcy5kZWZhdWx0cyA9IHt9O1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzID0gW107XG4gIH1cblxuICB3aXRoQmFzZVVybChiYXNlVXJsKSB7XG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhEZWZhdWx0cyhkZWZhdWx0cykge1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHRoaXMuaW50ZXJjZXB0b3JzLnB1c2goaW50ZXJjZXB0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aE1peGlucyguLi5taXhpbnMpIHtcbiAgICB0aGlzLm1peGlucyA9IG1peGlucztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVzZVN0YW5kYXJkQ29uZmlndXJhdG9yKCkge1xuICAgIGxldCBzdGFuZGFyZENvbmZpZyA9IHtcbiAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknXG4gICAgICB9XG4gICAgfTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGVmYXVsdHMsIHN0YW5kYXJkQ29uZmlnLCB0aGlzLmRlZmF1bHRzKTtcbiAgICByZXR1cm4gdGhpcy5yZWplY3RFcnJvclJlc3BvbnNlcygpO1xuICB9XG5cbiAgcmVqZWN0RXJyb3JSZXNwb25zZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMud2l0aEludGVyY2VwdG9yKHsgcmVzcG9uc2U6IHJlamVjdE9uRXJyb3IgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IENvbmZpZ3VyYXRvcigpO1xuXG5mdW5jdGlvbiByZWplY3RPbkVycm9yKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICB0aHJvdyByZXNwb25zZTtcbiAgfVxuXG4gIHJldHVybiByZXNwb25zZTtcbn1cbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAoXG4gIGlucHV0LFxuICBpbnRlcmNlcHRvcnMgPSBbXSxcbiAgc3VjY2Vzc05hbWUsXG4gIGVycm9yTmFtZVxuKSA9PlxuICBpbnRlcmNlcHRvcnMucmVkdWNlKChjaGFpbiwgaW50ZXJjZXB0b3IpID0+IHtcbiAgICBjb25zdCBzdWNjZXNzSGFuZGxlciA9IGludGVyY2VwdG9yW3N1Y2Nlc3NOYW1lXTtcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbnRlcmNlcHRvcltlcnJvck5hbWVdO1xuICAgIHJldHVybiBjaGFpbi50aGVuKFxuICAgICAgKHN1Y2Nlc3NIYW5kbGVyICYmIHN1Y2Nlc3NIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCBpZGVudGl0eSxcbiAgICAgIChlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCB0aHJvd2VyXG4gICAgKTtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKGlucHV0KSk7XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgcmV0dXJuIHg7XG59XG5cbmZ1bmN0aW9uIHRocm93ZXIoeCkge1xuICB0aHJvdyB4O1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCB7IH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuaW1wb3J0IGFwcGx5SW50ZXJjZXB0b3JzIGZyb20gJy4vYXBwbHktaW50ZXJjZXB0b3JzLmpzJztcblxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVxdWVzdCA9IChcbiAgaW5wdXQsXG4gIGluaXQgPSB7fSxcbiAgY29uZmlnXG4pID0+IHtcbiAgbGV0IGRlZmF1bHRzID0gY29uZmlnLmRlZmF1bHRzIHx8IHt9O1xuICBsZXQgcmVxdWVzdDtcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IHJlcXVlc3RDb250ZW50VHlwZTtcbiAgbGV0IHBhcnNlZERlZmF1bHRIZWFkZXJzID0gcGFyc2VIZWFkZXJWYWx1ZXMoZGVmYXVsdHMuaGVhZGVycyk7XG5cbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIHJlcXVlc3QgPSBpbnB1dDtcbiAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLmdldCgnQ29udGVudC1UeXBlJyk7XG4gIH0gZWxzZSB7XG4gICAgYm9keSA9IGluaXQuYm9keTtcbiAgICBsZXQgYm9keU9iaiA9IGJvZHkgPyB7IGJvZHkgfSA6IG51bGw7XG4gICAgbGV0IHJlcXVlc3RJbml0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHsgaGVhZGVyczoge30gfSwgaW5pdCwgYm9keU9iaik7XG4gICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdEluaXQuaGVhZGVycykuZ2V0KCdDb250ZW50LVR5cGUnKTtcbiAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoZ2V0UmVxdWVzdFVybChjb25maWcuYmFzZVVybCwgaW5wdXQpLCByZXF1ZXN0SW5pdCk7XG4gIH1cbiAgaWYgKCFyZXF1ZXN0Q29udGVudFR5cGUpIHtcbiAgICBpZiAobmV3IEhlYWRlcnMocGFyc2VkRGVmYXVsdEhlYWRlcnMpLmhhcygnY29udGVudC10eXBlJykpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgICB9IGVsc2UgaWYgKGJvZHkgJiYgaXNKU09OKFN0cmluZyhib2R5KSkpIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfVxuICB9XG4gIHNldERlZmF1bHRIZWFkZXJzKHJlcXVlc3QuaGVhZGVycywgcGFyc2VkRGVmYXVsdEhlYWRlcnMpO1xuICBpZiAoYm9keSAmJiBib2R5IGluc3RhbmNlb2YgQmxvYiAmJiBib2R5LnR5cGUpIHtcbiAgICAvLyB3b3JrIGFyb3VuZCBidWcgaW4gSUUgJiBFZGdlIHdoZXJlIHRoZSBCbG9iIHR5cGUgaXMgaWdub3JlZCBpbiB0aGUgcmVxdWVzdFxuICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvMjEzNjE2M1xuICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGJvZHkudHlwZSk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1JlcXVlc3QgPSAocmVxdWVzdCwgY29uZmlnKSA9PlxuICBhcHBseUludGVyY2VwdG9ycyhyZXF1ZXN0LCBjb25maWcuaW50ZXJjZXB0b3JzLCAncmVxdWVzdCcsICdyZXF1ZXN0RXJyb3InKTtcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3NSZXNwb25zZSA9IChcbiAgcmVzcG9uc2UsXG4gIGNvbmZpZ1xuKSA9PiBhcHBseUludGVyY2VwdG9ycyhyZXNwb25zZSwgY29uZmlnLmludGVyY2VwdG9ycywgJ3Jlc3BvbnNlJywgJ3Jlc3BvbnNlRXJyb3InKTtcblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJWYWx1ZXMoaGVhZGVycykge1xuICBsZXQgcGFyc2VkSGVhZGVycyA9IHt9O1xuICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgcGFyc2VkSGVhZGVyc1tuYW1lXSA9IHR5cGUuZnVuY3Rpb24oaGVhZGVyc1tuYW1lXSkgPyBoZWFkZXJzW25hbWVdKCkgOiBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyc2VkSGVhZGVycztcbn1cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgeyBidWlsZFJlcXVlc3QsIHByb2Nlc3NSZXF1ZXN0LCBwcm9jZXNzUmVzcG9uc2UgfSBmcm9tICcuL3JlcXVlc3QuanMnO1xuXG5cbmNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5leHBvcnQgY2xhc3MgRmV0Y2hDbGllbnQge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBhZGRJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZy53aXRoSW50ZXJjZXB0b3IoaW50ZXJjZXB0b3IpO1xuICB9XG5cbiAgZmV0Y2goaW5wdXQsIGluaXQgPSB7fSkge1xuICAgIGxldCByZXF1ZXN0ID0gYnVpbGRSZXF1ZXN0KGlucHV0LCBpbml0LCBwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuXG4gICAgcmV0dXJuIHByb2Nlc3NSZXF1ZXN0KHJlcXVlc3QsIHByaXZhdGVzKHRoaXMpLmNvbmZpZy5pbnRlcmNlcHRvcnMpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2Nlc3NSZXNwb25zZShyZXNwb25zZSwgcHJpdmF0ZXModGhpcykuY29uZmlnLmludGVyY2VwdG9ycyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IGNsYXNzQnVpbGRlciBmcm9tICcuLi9jbGFzcy1idWlsZGVyLmpzJztcbmltcG9ydCB7IGRlZmF1bHQgYXMgY3JlYXRlQ29uZmlnIH0gZnJvbSAnLi9jb25maWd1cmF0b3IuanMnO1xuaW1wb3J0IHsgRmV0Y2hDbGllbnQgfSBmcm9tICcuL2ZldGNoLWNsaWVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChjb25maWd1cmUpID0+IHtcbiAgaWYgKHR5cGUudW5kZWZpbmVkKGZldGNoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVpcmVzIEZldGNoIEFQSSBpbXBsZW1lbnRhdGlvbiwgYnV0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGRvZXNuJ3Qgc3VwcG9ydCBpdC5cIik7XG4gIH1cbiAgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuXG4gIGlmIChjb25maWcubWl4aW5zICYmIGNvbmZpZy5taXhpbnMubGVuZ3RoID4gMCkge1xuICAgIGxldCBGZXRjaFdpdGhNaXhpbnMgPSBjbGFzc0J1aWxkZXIoRmV0Y2hDbGllbnQpLndpdGguYXBwbHkobnVsbCwgY29uZmlnLm1peGlucyk7XG4gICAgcmV0dXJuIG5ldyBGZXRjaFdpdGhNaXhpbnMoY29uZmlnKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRmV0Y2hDbGllbnQoY29uZmlnKTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBjb25maWd1cmUgZnJvbSAnLi9odHRwLWNsaWVudC9jb25maWd1cmUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWd1cmU7XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vbGliL2h0dHAtY2xpZW50LmpzJztcblxuZGVzY3JpYmUoJ2h0dHAtY2xpZW50JywgKCkgPT4ge1xuXG5cdGRlc2NyaWJlKCdzdGFuZGFyZCBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy51c2VTdGFuZGFyZENvbmZpZ3VyYXRvcigpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QnLCBkb25lID0+IHtcblx0XHRcdGNsaWVudC5mZXRjaCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdH0pXG5cdFx0fSk7XG5cblx0XHRpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0JywgZG9uZSA9PiB7XG5cdFx0XHRjbGllbnQuZmV0Y2goJy9odHRwLWNsaWVudC1wb3N0LXRlc3QnLCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IHRlc3REYXRhOiAnMScgfSlcblx0XHRcdH0pXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y2hhaS5leHBlY3QoZGF0YS5mb28pLnRvLmVxdWFsKCcyJyk7XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0pO1xuXG5cdGRlc2NyaWJlKCdtaXhpbiBjb25maWd1cmUnLCAoKSA9PiB7XG5cdFx0bGV0IGNsaWVudDtcblx0XHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRcdGNsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KGNvbmZpZyA9PiB7XG5cdFx0XHRcdGNvbmZpZy53aXRoTWl4aW5zKG1peGluKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0aXQoJ2NhbGwgbWl4aW4gbWV0aG9kJywgKCkgPT4ge1xuXHRcdFx0Y2hhaS5leHBlY3QoY2xpZW50LnRlc3RNZXRob2QoKSkuZXF1YWwoJ3Rlc3QnKTtcblx0XHR9KTtcblx0fSk7XG59KTtcblxuY29uc3QgbWl4aW4gPSAoYmFzZSkgPT4gY2xhc3MgZXh0ZW5kcyBiYXNlIHtcblx0dGVzdE1ldGhvZCgpIHtcblx0XHRyZXR1cm4gJ3Rlc3QnO1xuXHR9XG59OyIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBvYmosXG4gIGtleSxcbiAgZGVmYXVsdFZhbHVlID0gdW5kZWZpbmVkXG4pID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIG9ialtrZXldID8gb2JqW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgbGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0ID0gZGVmYXVsdFZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBkZXB0aCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3RbcGFydHNbaV1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0W3BhcnRzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICB9XG4gIG9iamVjdFtwYXJ0c1tkZXB0aF1dID0gdmFsdWU7XG59O1xuIiwiaW1wb3J0IGRnZXQgZnJvbSAnLi9vYmplY3QvZGdldC5qcyc7XG5pbXBvcnQgZHNldCBmcm9tICcuL29iamVjdC9kc2V0LmpzJztcbmltcG9ydCB7IGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLmpzJztcbmltcG9ydCBpcyBmcm9tICcuL3R5cGUuanMnO1xuXG5jb25zdCBtb2RlbCA9IChiYXNlQ2xhc3MgPSBjbGFzcyB7fSkgPT4ge1xuICBjb25zdCBzdGF0ZUtleSA9ICdfc3RhdGUnOyAvL1RPRE8gdW5pcXVlU3RyaW5nLmdldCgnX3N0YXRlJyk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIHJldHVybiBjbGFzcyBNb2RlbCBleHRlbmRzIGJhc2VDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHRoaXMuZGVmYXVsdFN0YXRlKTtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGdldChhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFN0YXRlKGFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICBzZXQoYXJnMSwgYXJnMikge1xuICAgICAgLy9zdXBwb3J0cyAoYWNjZXNzb3IsIHN0YXRlKSBPUiAoc3RhdGUpIGFyZ3VtZW50cyBmb3Igc2V0dGluZyB0aGUgd2hvbGUgdGhpbmdcbiAgICAgIGxldCBhY2Nlc3NvciwgdmFsdWU7XG4gICAgICBpZiAoIWlzLnN0cmluZyhhcmcxKSAmJiBpcy51bmRlZmluZWQoYXJnMikpIHtcbiAgICAgICAgdmFsdWUgPSBhcmcxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBhcmcyO1xuICAgICAgICBhY2Nlc3NvciA9IGFyZzE7XG4gICAgICB9XG4gICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLl9nZXRTdGF0ZSgpO1xuICAgICAgbGV0IG5ld1N0YXRlID0ganNvbkNsb25lKG9sZFN0YXRlKTtcblxuICAgICAgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAgIGRzZXQobmV3U3RhdGUsIGFjY2Vzc29yLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTdGF0ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoYWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcmVhdGVTdWJzY3JpYmVyKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCAuLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgLy9UT0RPOiBpcyBvZmYoKSBuZWVkZWQgZm9yIGluZGl2aWR1YWwgc3Vic2NyaXB0aW9uP1xuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIHtcbiAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ2NyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIC0gY29udGV4dCBtdXN0IGJlIG9iamVjdCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uKGJpbmRSdWxlcykge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiaW5kUnVsZXNbMF0pKSB7XG4gICAgICAgICAgICBiaW5kUnVsZXMgPSBbYmluZFJ1bGVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmluZFJ1bGVzLmZvckVhY2goYmluZFJ1bGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIGJpbmRSdWxlWzBdLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgIGRzZXQoY29udGV4dCwgYmluZFJ1bGVbMV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRTdGF0ZShhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIGpzb25DbG9uZShhY2Nlc3NvciA/IGRnZXQodGhpc1tzdGF0ZUtleV0sIGFjY2Vzc29yKSA6IHRoaXNbc3RhdGVLZXldKTtcbiAgICB9XG5cbiAgICBfc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgIHRoaXNbc3RhdGVLZXldID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgX3N1YnNjcmliZShjb250ZXh0LCBhY2Nlc3NvciwgY2IpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpYmVycy5nZXQoY29udGV4dCkgfHwgW107XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goeyBhY2Nlc3NvciwgY2IgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5zZXQoY29udGV4dCwgc3Vic2NyaXB0aW9ucyk7XG4gICAgfVxuXG4gICAgX2Rlc3Ryb3lTdWJzY3JpYmVyKGNvbnRleHQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICB9XG5cbiAgICBfbm90aWZ5U3Vic2NyaWJlcnMoc2V0QWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbihzdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHsgYWNjZXNzb3IsIGNiIH0pIHtcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6J1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXouYmxheidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZihzZXRBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgYWNjZXNzb3IpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9lLmcuIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby4qJ1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKCcqJykgPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZGVlcEFjY2Vzc29yID0gYWNjZXNzb3IucmVwbGFjZSgnLionLCAnJykucmVwbGFjZSgnKicsICcnKTtcbiAgICAgICAgICAgIGlmIChzZXRBY2Nlc3Nvci5pbmRleE9mKGRlZXBBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgZGVlcEFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgZGVlcEFjY2Vzc29yKSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IG1vZGVsO1xuIiwiaW1wb3J0IG1vZGVsIGZyb20gJy4uL2xpYi9tb2RlbC5qcyc7XG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgbW9kZWwoKSB7XG5cdGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtmb286MX07XG4gIH1cbn1cblxuZGVzY3JpYmUoXCJNb2RlbCBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImRlZmF1bHRTdGF0ZSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXHRpdChcImdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCgnZm9vJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiAxXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajInKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3aXRoIGFycmF5cyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW11cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcsJ2RvZycpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJykpLnRvLmVxdWFsKCdkb2cnKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcse2ZvbzoxfSk7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDEpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycsMik7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcInN1YnNjcmlwdGlvbnMgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXHRcdGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZSkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZSkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdHRocm93KCdubyBzdWJzY3JpYmVyIHNob3VsZCBiZSBjYWxsZWQgZm9yIGRlZXBPYmoxJyk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEuKicsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbC5zZXQoVEVTVF9TRUwsIHRydWUpO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaWJlcnMgY2FuIGJlIGRlc3Ryb3llZFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLlRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKG15TW9kZWwuVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0dGhyb3cobmV3IEVycm9yKCdzaG91bGQgbm90IGJlIG9ic2VydmVkJykpO1xuXHRcdH0pO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldChteU1vZGVsLlRFU1RfU0VMLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzIGJvdW5kIGZyb20gbW9kZWwgdG8gY3VzdG9tIGVsZW1lbnRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblxuICAgIGxldCBteUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKHZhbHVlKSA9PiB7IHRoaXMucHJvcCA9IHZhbHVlOyB9KTtcbiAgICBvYnNlcnZlci5kZXN0cm95KCk7XG5cbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRlciA9IG15TW9kZWwuY3JlYXRlUHJvcGVydHlCaW5kZXIobXlFbGVtZW50KS5hZGRCaW5kaW5ncyhcbiAgICAgIFsnZm9vJywgJ3Byb3AnXVxuICAgICk7XG5cbiAgICBteU1vZGVsLnNldCgnZm9vJywgJzMnKTtcbiAgICBjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcbiAgICBwcm9wZXJ0eUJpbmRlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQoJ2ZvbycsICcyJyk7XG5cdFx0Y2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuXG5cblxuY29uc3QgZXZlbnRIdWJGYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgLy8kRmxvd0ZpeE1lXG4gIHJldHVybiB7XG4gICAgcHVibGlzaDogZnVuY3Rpb24oZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goKHN1YnNjcmlwdGlvbnMpID0+IHtcbiAgICAgICAgKHN1YnNjcmlwdGlvbnMuZ2V0KGV2ZW50KSB8fCBbXSkuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgICBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjcmVhdGVTdWJzY3JpYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVycy5oYXMoY29udGV4dCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnNldChjb250ZXh0LCBuZXcgTWFwKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpO1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlci5oYXMoZXZlbnQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLnNldChldmVudCwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVyLmdldChldmVudCkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgICAgc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpLmRlbGV0ZShldmVudCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50SHViRmFjdG9yeTtcbiIsImltcG9ydCBldmVudEh1YkZhY3RvcnkgZnJvbSAnLi4vbGliL2V2ZW50LWh1Yi5qcyc7XG5cbmRlc2NyaWJlKFwiRXZlbnRIdWIgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJiYXNpYyBwdWIvc3ViIHdvcmtzXCIsIChkb25lKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaWJlcnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyMiA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpcHRpb25zIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDIpO1xuICAgICAgfSlcblxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInLCAyKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwiZGVzdHJveSgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1YlN1YnNjcmliZXIuZGVzdHJveSgpO1xuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMCk7XG5cdH0pO1xuXG4gIGl0KFwib2ZmKCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwodW5kZWZpbmVkKTtcbiAgICAgIH0pXG4gICAgICAub2ZmKCdmb28nKVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicpOyAgLy9zaG91bGQgY2FsbGVkXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblxufSk7XG4iXSwibmFtZXMiOlsiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJpbmNsdWRlcyIsImJyb3dzZXIiLCJmbiIsInJhaXNlIiwiRXJyb3IiLCJuYW1lIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImxlbmd0aCIsImRlZmluZVByb3BlcnR5IiwiaSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJtaWNyb1Rhc2tDdXJySGFuZGxlIiwibWljcm9UYXNrTGFzdEhhbmRsZSIsIm1pY3JvVGFza0NhbGxiYWNrcyIsIm1pY3JvVGFza05vZGVDb250ZW50IiwibWljcm9UYXNrTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImEiLCJkZWVwIiwiYm9keSIsInRlbXBsYXRlIiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJlbCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJhcnIiLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwiaXMiLCJzZXR1cCIsImNoZWNrcyIsImdldFR5cGUiLCJtYXRjaGVzIiwiY2xvbmUiLCJzcmMiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJvYmplY3QiLCJmdW5jdGlvbiIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsImtleSIsImZpbmRJbmRleCIsImpzb25DbG9uZSIsImUiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJzdHJpbmciLCJwcmV2VGltZUlkIiwicHJldlVuaXF1ZUlkIiwicHJlZml4IiwibmV3VW5pcXVlSWQiLCJub3ciLCJ1bmlxdWVJZCIsIndyYXBwZWRNaXhpbktleSIsImFwcGxpZWRNaXhpbktleSIsIndyYXBwZXIiLCJzdXBlckNsYXNzIiwibWl4aW4iLCJhcHBsaWNhdGlvbiIsInVud3JhcCIsInNldFByb3RvdHlwZU9mIiwid3JhcCIsIm8iLCJpc0FwcGxpY2F0aW9uT2YiLCJoYXMiLCJjYWNoZWRBcHBsaWNhdGlvbktleSIsImNhY2hlZEFwcGxpY2F0aW9uIiwiZGVkdXBlIiwiY2FjaGUiLCJkZWNsYXJlIiwiZnJlZXplIiwid2l0aCIsIm1peGlucyIsImNyZWF0ZU1peGluIiwicmVkdWNlIiwiayIsIm0iLCJDb25maWd1cmF0b3IiLCJiYXNlVXJsIiwiZGVmYXVsdHMiLCJpbnRlcmNlcHRvcnMiLCJ3aXRoQmFzZVVybCIsIndpdGhEZWZhdWx0cyIsIndpdGhJbnRlcmNlcHRvciIsImludGVyY2VwdG9yIiwid2l0aE1peGlucyIsInVzZVN0YW5kYXJkQ29uZmlndXJhdG9yIiwic3RhbmRhcmRDb25maWciLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJoZWFkZXJzIiwiQWNjZXB0IiwicmVqZWN0RXJyb3JSZXNwb25zZXMiLCJyZXNwb25zZSIsInJlamVjdE9uRXJyb3IiLCJvayIsImlucHV0Iiwic3VjY2Vzc05hbWUiLCJlcnJvck5hbWUiLCJjaGFpbiIsInN1Y2Nlc3NIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwidGhlbiIsImlkZW50aXR5IiwidGhyb3dlciIsIlByb21pc2UiLCJyZXNvbHZlIiwieCIsImJ1aWxkUmVxdWVzdCIsImluaXQiLCJyZXF1ZXN0IiwicmVxdWVzdENvbnRlbnRUeXBlIiwicGFyc2VkRGVmYXVsdEhlYWRlcnMiLCJwYXJzZUhlYWRlclZhbHVlcyIsIlJlcXVlc3QiLCJIZWFkZXJzIiwiYm9keU9iaiIsInJlcXVlc3RJbml0IiwiZ2V0UmVxdWVzdFVybCIsImlzSlNPTiIsInNldERlZmF1bHRIZWFkZXJzIiwiQmxvYiIsInByb2Nlc3NSZXF1ZXN0IiwiYXBwbHlJbnRlcmNlcHRvcnMiLCJwcm9jZXNzUmVzcG9uc2UiLCJwYXJzZWRIZWFkZXJzIiwiYWJzb2x1dGVVcmxSZWdleHAiLCJ1cmwiLCJ0ZXN0IiwiZGVmYXVsdEhlYWRlcnMiLCJzdHIiLCJGZXRjaENsaWVudCIsImFkZEludGVyY2VwdG9yIiwiZmV0Y2giLCJyZXN1bHQiLCJSZXNwb25zZSIsImNvbmZpZ3VyZSIsImNyZWF0ZUNvbmZpZyIsIkZldGNoV2l0aE1peGlucyIsImNsYXNzQnVpbGRlciIsImNsaWVudCIsImJlZm9yZUVhY2giLCJodHRwQ2xpZW50RmFjdG9yeSIsImpzb24iLCJmb28iLCJkb25lIiwidGVzdERhdGEiLCJ0ZXN0TWV0aG9kIiwiYmFzZSIsImRlZmF1bHRWYWx1ZSIsInBhcnRzIiwiZGVwdGgiLCJtb2RlbCIsInN0YXRlS2V5Iiwic3Vic2NyaWJlckNvdW50IiwiX3N1YnNjcmliZXJzIiwiX3NldFN0YXRlIiwiZGVmYXVsdFN0YXRlIiwiYWNjZXNzb3IiLCJfZ2V0U3RhdGUiLCJhcmcxIiwiYXJnMiIsIm9sZFN0YXRlIiwibmV3U3RhdGUiLCJkc2V0IiwiX25vdGlmeVN1YnNjcmliZXJzIiwiY3JlYXRlU3Vic2NyaWJlciIsInNlbGYiLCJfc3Vic2NyaWJlIiwiZGVzdHJveSIsIl9kZXN0cm95U3Vic2NyaWJlciIsImNyZWF0ZVByb3BlcnR5QmluZGVyIiwiYWRkQmluZGluZ3MiLCJiaW5kUnVsZXMiLCJiaW5kUnVsZSIsImRnZXQiLCJzdWJzY3JpcHRpb25zIiwiZGVsZXRlIiwic2V0QWNjZXNzb3IiLCJzdWJzY3JpYmVycyIsImRlZXBBY2Nlc3NvciIsIk1vZGVsIiwibXlNb2RlbCIsImRlZXBPYmoxIiwiZGVlcE9iajIiLCJzZWxlY3RlZCIsIlRFU1RfU0VMIiwibXlNb2RlbFN1YnNjcmliZXIiLCJudW1DYWxsYmFja3NDYWxsZWQiLCJteUVsZW1lbnQiLCJwcm9wZXJ0eUJpbmRlciIsImV2ZW50SHViRmFjdG9yeSIsInB1Ymxpc2giLCJzdWJzY3JpYmVyIiwibXlFdmVudEh1YiIsIm15RXZlbnRIdWJTdWJzY3JpYmVyIiwibXlFdmVudEh1YlN1YnNjcmliZXIyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTtBQUNBLEVBQU8sSUFBTUEsWUFBWSxDQUFDLFFBQVFDLE1BQVIseUNBQVFBLE1BQVIsVUFBdUJDLFFBQXZCLHlDQUF1QkEsUUFBdkIsR0FBaUNDLFFBQWpDLENBQ3hCLFdBRHdCLENBQW5COztBQUlQLEVBQU8sSUFBTUMsVUFBVSxTQUFWQSxPQUFVLENBQUNDLEVBQUQ7RUFBQSxNQUFLQyxLQUFMLHVFQUFhLElBQWI7RUFBQSxTQUFzQixZQUV4QztFQUNILFFBQUlOLFNBQUosRUFBZTtFQUNiLGFBQU9LLDhCQUFQO0VBQ0Q7RUFDRCxRQUFJQyxLQUFKLEVBQVc7RUFDVCxZQUFNLElBQUlDLEtBQUosQ0FBYUYsR0FBR0csSUFBaEIsMkJBQU47RUFDRDtFQUNGLEdBVHNCO0VBQUEsQ0FBaEI7O0VDTFA7QUFDQSx1QkFBZSxZQUVWO0VBQUEsTUFESEMsT0FDRyx1RUFET0MsT0FBT0MsTUFBUCxDQUFjQyxJQUFkLENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLEVBQS9CLENBQ1A7O0VBQ0gsTUFBSUMsUUFBUSxJQUFJQyxPQUFKLEVBQVo7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
