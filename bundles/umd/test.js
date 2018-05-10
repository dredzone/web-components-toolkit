(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

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

  var global$1 = document.defaultView;

  // https://github.com/google/traceur-compiler/issues/1709
  if (typeof global$1.HTMLElement !== 'function') {
    var _HTMLElement = function HTMLElement() {
      // eslint-disable-line func-names
    };
    _HTMLElement.prototype = global$1.HTMLElement.prototype;
    global$1.HTMLElement = _HTMLElement;
  }

  var customElement = (function (baseClass) {
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

  var properties = (function (baseClass) {
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

  var listenEvent = (function (target, type, listener) {
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

  describe('Properties Mixin', function () {
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
  var events = (function (baseClass) {
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
  var stopEvent = (function (evt) {
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

  describe('Events Mixin', function () {
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

  describe('Clone', function () {
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

  describe('Type', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAtY2xpZW50L3VzZS1mZXRjaC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC9odHRwLWNsaWVudC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC1jbGllbnQvaHR0cC1jbGllbnQudGVzdC5qcyIsIi4uLy4uL2xpYi9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLmpzIiwiLi4vLi4vdGVzdC9odHRwLWNsaWVudC91c2UtbWVtLWNhY2hlLnRlc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pXG4pID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cblxubGV0IG1pY3JvVGFza0N1cnJIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0xhc3RIYW5kbGUgPSAwO1xubGV0IG1pY3JvVGFza0NhbGxiYWNrcyA9IFtdO1xubGV0IG1pY3JvVGFza05vZGVDb250ZW50ID0gMDtcbmxldCBtaWNyb1Rhc2tOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIobWljcm9UYXNrRmx1c2gpLm9ic2VydmUobWljcm9UYXNrTm9kZSwge1xuICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG59KTtcblxuXG4vKipcbiAqIEJhc2VkIG9uIFBvbHltZXIuYXN5bmNcbiAqL1xuY29uc3QgbWljcm9UYXNrID0ge1xuICAvKipcbiAgICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgbWljcm9UYXNrIHRpbWluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gICAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gICAqL1xuICBydW4oY2FsbGJhY2spIHtcbiAgICBtaWNyb1Rhc2tOb2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG1pY3JvVGFza05vZGVDb250ZW50KyspO1xuICAgIG1pY3JvVGFza0NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbWljcm9UYXNrQ3VyckhhbmRsZSsrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgbWljcm9UYXNrYCBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAgICovXG4gIGNhbmNlbChoYW5kbGUpIHtcbiAgICBjb25zdCBpZHggPSBoYW5kbGUgLSBtaWNyb1Rhc2tMYXN0SGFuZGxlO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgaWYgKCFtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICAgIH1cbiAgICAgIG1pY3JvVGFza0NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1pY3JvVGFzaztcblxuZnVuY3Rpb24gbWljcm9UYXNrRmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IG1pY3JvVGFza0NhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBtaWNyb1Rhc2tDYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBtaWNyb1Rhc2tDYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIG1pY3JvVGFza0xhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uLy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCAoXG4gIGJhc2VDbGFzc1xuKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKFxuICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgIG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWVcbiAgICApIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBiZWZvcmUgZnJvbSAnLi4vLi4vYWR2aWNlL2JlZm9yZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbWljcm9UYXNrIGZyb20gJy4uL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9XG4gICAgICBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID1cbiAgICAgICAgdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wc1xuICAgICkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT5cbiAgICAgICAgICB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KVxuICAgICAgICApIHx8IFtdXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+XG4gICAgICAgICAgbWF0Y2hbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICApO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2BcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoXG4gICAgICAgICAgYXR0cmlidXRlXG4gICAgICAgICk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XVxuICAgICAgICAudHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc051bWJlcixcbiAgICAgICAgaXNBcnJheSxcbiAgICAgICAgaXNCb29sZWFuLFxuICAgICAgICBpc0RhdGUsXG4gICAgICAgIGlzU3RyaW5nLFxuICAgICAgICBpc09iamVjdFxuICAgICAgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID1cbiAgICAgICAgICB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGlzQXJyYXlcbiAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW1xuICAgICAgICBwcm9wZXJ0eVxuICAgICAgXTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmUgPSBmYWxzZVxuKSA9PiB7XG4gIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoXG4gIHRhcmdldCxcbiAgdHlwZSxcbiAgbGlzdGVuZXIsXG4gIGNhcHR1cmVcbikge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL3Byb3BlcnRpZXMtbWl4aW4uanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNNaXhpblRlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzTWl4aW5UZXN0LmRlZmluZSgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdQcm9wZXJ0aWVzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzTWl4aW5UZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc01peGluVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc01peGluVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNNaXhpblRlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uLy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi8uLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LW1peGluLmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvZXZlbnRzLW1peGluLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvc3RvcC1ldmVudC5qcyc7XG5pbXBvcnQgcmVtb3ZlRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnRXZlbnRzIE1peGluJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gJ01hcCBTZXQgU3ltYm9sIEFycmF5IE9iamVjdCBTdHJpbmcgRGF0ZSBSZWdFeHAgRnVuY3Rpb24gQm9vbGVhbiBOdW1iZXIgTnVsbCBVbmRlZmluZWQgQXJndW1lbnRzIEVycm9yJy5zcGxpdChcbiAgJyAnXG4pO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcbmNvbnN0IGlzID0gc2V0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuXG5jb25zdCBjbG9uZSA9IGZ1bmN0aW9uKFxuICBzcmMsXG4gIGNpcmN1bGFycyA9IFtdLFxuICBjbG9uZXMgPSBbXVxuKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKHR5cGUuZGF0ZShzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHNyYy5nZXRUaW1lKCkpO1xuICB9XG5cbiAgLy8gUmVnRXhwXG4gIGlmICh0eXBlLnJlZ2V4cChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc3JjKTtcbiAgfVxuXG4gIC8vIEFycmF5c1xuICBpZiAodHlwZS5hcnJheShzcmMpKSB7XG4gICAgcmV0dXJuIHNyYy5tYXAoY2xvbmUpO1xuICB9XG5cbiAgLy8gRVM2IE1hcHNcbiAgaWYgKHR5cGUubWFwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHNyYy5lbnRyaWVzKCkpKTtcbiAgfVxuXG4gIC8vIEVTNiBTZXRzXG4gIGlmICh0eXBlLnNldChzcmMpKSB7XG4gICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbShzcmMudmFsdWVzKCkpKTtcbiAgfVxuXG4gIC8vIE9iamVjdFxuICBpZiAodHlwZS5vYmplY3Qoc3JjKSkge1xuICAgIGNpcmN1bGFycy5wdXNoKHNyYyk7XG4gICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShzcmMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHNyYykge1xuICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHNyY1trZXldKTtcbiAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHNyY1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICByZXR1cm4gc3JjO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xvbmU7XG5cbmV4cG9ydCBjb25zdCBqc29uQ2xvbmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn07XG4iLCJpbXBvcnQgY2xvbmUsIHsganNvbkNsb25lIH0gZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdDbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiwgcmV0dXJucyB0aGUgc2FtZSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cbiAgICAgIC8vIFVuZGVmaW5lZFxuICAgICAgZXhwZWN0KGpzb25DbG9uZSgpKS50by5iZS51bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICBjb25zdCBmdW5jID0gKCkgPT4ge307XG4gICAgICBhc3NlcnQuaXNGdW5jdGlvbihqc29uQ2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcbiAgICAgIGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG4gICAgICBhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgnVHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuaW1wb3J0IHsgZ2V0Qm9keUZyb21SZXEgfSBmcm9tICcuL2h0dHAtY2xpZW50LmpzJztcblxuY29uc3QgdXNlRmV0Y2ggPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHJldHVybiBodHRwQ2xpZW50LmFkZFJlc3BvbnNlU3RlcChmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cbiAgICBsZXQgZmV0Y2hPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgIG1vZGU6IHJlcXVlc3QubW9kZSxcbiAgICAgIGNyZWRlbnRpYWxzOiByZXF1ZXN0LmNyZWRlbnRpYWxzLFxuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzXG4gICAgfTtcblxuICAgIGxldCBib2R5ID0gZ2V0Qm9keUZyb21SZXEocmVxdWVzdCk7XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIGZldGNoT3B0aW9ucy5ib2R5ID0gYm9keTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3QudXJsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGh0dHAtY2xpZW50OiB1cmwgb3B0aW9uIGlzIG5vdCBzZXRgKTtcbiAgICB9XG5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgcmV0dXJuIGZldGNoKHJlcXVlc3QudXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IHJlc3BvbnNlO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHVzZUZldGNoO1xuIiwiLyogICovXG5cbi8vIE5vdGU6IGZvciBub3cgbm90IHJlc3RyaWN0aW5nIHRoaXMgdG8gYnJvd3NlciB1c2FnZSBkdWUgdG8gaXQgcG90ZW50aWFsbHlcbi8vIGJlaW5nIHVzZWQgd2l0aCBhbiBucG0gcGFja2FnZSBsaWtlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL25vZGUtZmV0Y2hcblxuaW1wb3J0IHVzZUZldGNoIGZyb20gJy4vdXNlLWZldGNoLmpzJztcbmltcG9ydCBjbG9uZSwgeyBqc29uQ2xvbmUgfSBmcm9tICcuLi9vYmplY3QvY2xvbmUuanMnO1xuXG5cblxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIG1vZGU6ICdjb3JzJyxcbiAgZGF0YTogdW5kZWZpbmVkLFxuICBoZWFkZXJzOiB7XG4gICAgJ1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknLFxuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgfSxcbiAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsIC8vJ2luY2x1ZGUnLFxuICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IGZhbHNlXG59O1xuXG5jb25zdCBodHRwQ2xpZW50RmFjdG9yeSA9IGZ1bmN0aW9uKFxuICBjdXN0b21JbnN0YW5jZU9wdGlvbnMgPSB7fVxuKSB7XG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgZGVmYXVsdE9wdGlvbnMsXG4gICAgY3VzdG9tSW5zdGFuY2VPcHRpb25zXG4gICk7XG4gIGNvbnN0IHJlcXVlc3RTdGVwcyA9IFtdO1xuICBjb25zdCByZXNwb25zZVN0ZXBzID0gW107XG5cbiAgZnVuY3Rpb24gcnVuKG1ldGhvZCwgY3VzdG9tUnVuT3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHJlcXVlc3QgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICBpbnN0YW5jZU9wdGlvbnMsXG4gICAgICBjdXN0b21SdW5PcHRpb25zLFxuICAgICAge1xuICAgICAgICBtZXRob2Q6IG1ldGhvZFxuICAgICAgfVxuICAgICk7XG5cbiAgICBsZXQgcmVzcG9uc2UgPSB1bmRlZmluZWQ7XG5cbiAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh7XG4gICAgICByZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICB9KTtcblxuICAgIHJlcXVlc3RTdGVwcy5mb3JFYWNoKGZ1bmN0aW9uKHsgcHJvbWlzZU1ldGhvZCwgY2FsbGJhY2ssIHJlamVjdENhbGxiYWNrIH0pIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGlmICghcHJvbWlzZVtwcm9taXNlTWV0aG9kXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGh0dHAtY2xpZW50OiByZXF1ZXN0U3RlcCBwcm9taXNlIG1ldGhvZCBpcyBub3QgdmFsaWQ6ICR7cHJvbWlzZU1ldGhvZH1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBwcm9taXNlID0gcHJvbWlzZVtwcm9taXNlTWV0aG9kXShmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgaWYgKHN0ZXBBcmd1bWVudElzTm9ybWFsaXplZChhcmcpKSB7XG4gICAgICAgICAgcmVxdWVzdCA9IGNsb25lKGFyZy5yZXF1ZXN0KTtcbiAgICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcXVlc3QgPSBjbG9uZShhcmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh7XG4gICAgICAgICAgcmVxdWVzdDogY2xvbmUocmVxdWVzdCksXG4gICAgICAgICAgcmVzcG9uc2U6IGpzb25DbG9uZShyZXNwb25zZSlcbiAgICAgICAgfSk7XG4gICAgICB9LCByZWplY3RDYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICAvL2V4dHJhY3QgZmluYWwgcmVxdWVzdCBvYmplY3RcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHN0ZXBBcmd1bWVudElzTm9ybWFsaXplZChhcmcpKSB7XG4gICAgICAgIHJlcXVlc3QgPSBjbG9uZShhcmcucmVxdWVzdCk7XG4gICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZy5yZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gY2xvbmUoYXJnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVlc3Q6IGNsb25lKHJlcXVlc3QpLFxuICAgICAgICByZXNwb25zZToganNvbkNsb25lKHJlc3BvbnNlKVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJlc3BvbnNlU3RlcHMuZm9yRWFjaChmdW5jdGlvbih7XG4gICAgICBwcm9taXNlTWV0aG9kLFxuICAgICAgY2FsbGJhY2ssXG4gICAgICByZWplY3RDYWxsYmFja1xuICAgIH0pIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGlmICghcHJvbWlzZVtwcm9taXNlTWV0aG9kXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGh0dHAtY2xpZW50OiByZXNwb25zZVN0ZXAgbWV0aG9kIGlzIG5vdCB2YWxpZDogJHtwcm9taXNlTWV0aG9kfWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIHByb21pc2UgPSBwcm9taXNlW3Byb21pc2VNZXRob2RdKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICBpZiAoc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykpIHtcbiAgICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3BvbnNlID0ganNvbkNsb25lKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHtcbiAgICAgICAgICByZXF1ZXN0OiBjbG9uZShyZXF1ZXN0KSxcbiAgICAgICAgICByZXNwb25zZToganNvbkNsb25lKHJlc3BvbnNlKVxuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdENhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIC8vIG9uZSBtb3JlIHN0ZXAgdG8gZXh0cmFjdCBmaW5hbCByZXNwb25zZSBhbmQgZGV0ZXJtaW5lIHNoYXBlIG9mIGRhdGEgdG8gcmV0dXJuXG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmIChzdGVwQXJndW1lbnRJc05vcm1hbGl6ZWQoYXJnKSkge1xuICAgICAgICByZXNwb25zZSA9IGpzb25DbG9uZShhcmcucmVzcG9uc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UgPSBqc29uQ2xvbmUoYXJnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcXVlc3QucmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICByZXNwb25zZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH0gLy9lbmQgZG9GZXRjaCgpXG5cbiAgY29uc3QgaHR0cENsaWVudCA9IHtcbiAgICBnZXQ6IHJ1bi5iaW5kKHRoaXMsICdHRVQnKSxcbiAgICBwb3N0OiBydW4uYmluZCh0aGlzLCAnUE9TVCcpLFxuICAgIHB1dDogcnVuLmJpbmQodGhpcywgJ1BVVCcpLFxuICAgIHBhdGNoOiBydW4uYmluZCh0aGlzLCAnUEFUQ0gnKSxcbiAgICBkZWxldGU6IHJ1bi5iaW5kKHRoaXMsICdERUxFVEUnKSxcbiAgICBvcHRpb25zOiAobmV3T3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICByZXR1cm4gY2xvbmUoT2JqZWN0LmFzc2lnbihpbnN0YW5jZU9wdGlvbnMsIG5ld09wdGlvbnMpKTtcbiAgICB9LFxuICAgIGFkZFJlcXVlc3RTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJlcXVlc3RTdGVwcy5wdXNoKG5vcm1hbGl6ZUFkZFN0ZXBBcmd1bWVudHMoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGFkZFJlc3BvbnNlU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICByZXNwb25zZVN0ZXBzLnB1c2gobm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyhhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXNlRmV0Y2goaHR0cENsaWVudCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBodHRwQ2xpZW50RmFjdG9yeTtcblxuZXhwb3J0IGNvbnN0IGdldEJvZHlGcm9tUmVxID0gZnVuY3Rpb24ocmVxKSB7XG4gIGlmIChyZXEuZGF0YSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShyZXEuZGF0YSk7XG4gIH0gZWxzZSBpZiAocmVxLmJvZHkpIHtcbiAgICByZXR1cm4gcmVxLmJvZHk7XG4gIH1cbiAgcmV0dXJuICcnO1xufTtcblxuZnVuY3Rpb24gbm9ybWFsaXplQWRkU3RlcEFyZ3VtZW50cyhhcmdzKSB7XG4gIGxldCBwcm9taXNlTWV0aG9kO1xuICBsZXQgY2FsbGJhY2s7XG4gIGxldCByZWplY3RDYWxsYmFjaztcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJykge1xuICAgIFtwcm9taXNlTWV0aG9kLCBjYWxsYmFjaywgcmVqZWN0Q2FsbGJhY2tdID0gYXJncztcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlTWV0aG9kID0gJ3RoZW4nO1xuICAgIFtjYWxsYmFjaywgcmVqZWN0Q2FsbGJhY2tdID0gYXJncztcbiAgfVxuICBpZiAoXG4gICAgKHByb21pc2VNZXRob2QgIT09ICd0aGVuJyAmJiBwcm9taXNlTWV0aG9kICE9PSAnY2F0Y2gnKSB8fFxuICAgIHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJ1xuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnaHR0cC1jbGllbnQ6IGJhZCBhcmd1bWVudHMgcGFzc2VkIHRvIGFkZChSZXF1ZXN0L1Jlc3BvbnNlKVN0ZXAnXG4gICAgKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHByb21pc2VNZXRob2QsXG4gICAgY2FsbGJhY2ssXG4gICAgcmVqZWN0Q2FsbGJhY2tcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkKGFyZykge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmXG4gICAgT2JqZWN0LmtleXMoYXJnKS5sZW5ndGggPT09IDIgJiZcbiAgICBhcmcuaGFzT3duUHJvcGVydHkoJ3JlcXVlc3QnKSAmJlxuICAgIGFyZy5oYXNPd25Qcm9wZXJ0eSgncmVzcG9uc2UnKVxuICApO1xufVxuIiwiaW1wb3J0IGh0dHBDbGllbnRGYWN0b3J5IGZyb20gJy4uLy4uL2xpYi9odHRwLWNsaWVudC9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCAtIGJhc2ljIHVzYWdlJywgKCkgPT4ge1xuICBpdCgnYWJsZSB0byBtYWtlIGEgR0VUIHJlcXVlc3QnLCBkb25lID0+IHtcbiAgICBsZXQgaHR0cENsaWVudCA9IGh0dHBDbGllbnRGYWN0b3J5KCk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCdcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdCgnYWJsZSB0byBtYWtlIGEgUE9TVCByZXF1ZXN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5wb3N0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LXBvc3QtdGVzdCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICB0ZXN0RGF0YTogJzEnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcyJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBpdChcImRvZXNuJ3QgYmxvdyB1cCB3aGVuIHJlc3BvbnNlIGlzbid0IEpTT05cIiwgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtcmVzcG9uc2Utbm90LWpzb24nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdub3QganNvbicpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ29wdGlvbnMgY2FuIGJlIG92ZXJ3cml0dGVuIGF0IGFueSBsZXZlbCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3Rvcnkoe1xuICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgIH0pO1xuICAgIGNoYWkuZXhwZWN0KGh0dHBDbGllbnQub3B0aW9ucygpLmNyZWRlbnRpYWxzKS50by5lcXVhbCgnaW5jbHVkZScpO1xuXG4gICAgaHR0cENsaWVudC5vcHRpb25zKHtcbiAgICAgIGNyZWRlbnRpYWxzOiAnb21pdCdcbiAgICB9KTtcbiAgICBjaGFpLmV4cGVjdChodHRwQ2xpZW50Lm9wdGlvbnMoKS5jcmVkZW50aWFscykudG8uZXF1YWwoJ29taXQnKTtcblxuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3QuY3JlZGVudGlhbHMpLnRvLmVxdWFsKCdzYW1lLW9yaWdpbicpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3JlcXVlc3Qgc3RlcCBjYW4gbW9kaWZ5IHRoZSByZXF1ZXN0IG9iamVjdCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3RvcnkoKTtcbiAgICBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKCh7IHJlcXVlc3QgfSkgPT4ge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHJlcXVlc3QsIHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LW1vZGlmaWVkLXVybCcsXG4gICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7IHVybDogJy93aWxsLWJlLW92ZXJ3cml0dGVuJyB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3QudXJsKS50by5lcXVhbCgnL2h0dHAtY2xpZW50LW1vZGlmaWVkLXVybCcpO1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZSkudG8uZXF1YWwoJ3Jlc3BvbnNlIGZvciBtb2RpZmllZCB1cmwnKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdyZXF1ZXN0IHN0ZXAgY2FuIGFkZCBhIHJlc3BvbnNlIG9iamVjdCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gaHR0cENsaWVudEZhY3RvcnkoKTtcbiAgICBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKCh7IHJlcXVlc3QgfSkgPT4ge1xuICAgICAgaWYgKHJlcXVlc3QudXJsID09PSAnL2RvZXMtbm90LWV4aXN0Jykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgcmVzcG9uc2U6ICdzaG9ydGNpcmN1aXQgcmVzcG9uc2UnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9KTtcbiAgICBodHRwQ2xpZW50LmdldCh7IHVybDogJy9kb2VzLW5vdC1leGlzdCcgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdzaG9ydGNpcmN1aXQgcmVzcG9uc2UnKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ3Jlc3BvbnNlIHN0ZXAgY2FuIG1vZGlmeSB0aGUgcmVzcG9uc2Ugb2JqZWN0JywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSBodHRwQ2xpZW50RmFjdG9yeSgpO1xuICAgIGh0dHBDbGllbnQuYWRkUmVzcG9uc2VTdGVwKCh7IHJlc3BvbnNlIH0pID0+IHtcbiAgICAgIHJlc3BvbnNlLmZvbyA9ICdhIHJlc3BvbnNlIHN0ZXAgd2FzIGhlcmUnO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UuZm9vKS50by5lcXVhbCgnYSByZXNwb25zZSBzdGVwIHdhcyBoZXJlJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgeyBnZXRCb2R5RnJvbVJlcSB9IGZyb20gJy4vaHR0cC1jbGllbnQuanMnO1xuaW1wb3J0IHsganNvbkNsb25lIH0gZnJvbSAnLi4vb2JqZWN0L2Nsb25lJztcblxuY29uc3QgbWVtQ2FjaGUgPSB7fTtcblxuY29uc3QgdXNlTWVtQ2FjaGUgPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHVzZVNhdmVUb01lbUNhY2hlKGh0dHBDbGllbnQpO1xuICB1c2VHZXRGcm9tQ2FjaGUoaHR0cENsaWVudCk7XG4gIHJldHVybiBodHRwQ2xpZW50O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlTWVtQ2FjaGU7XG5cbmV4cG9ydCBjb25zdCB1c2VHZXRGcm9tQ2FjaGUgPSBmdW5jdGlvbihodHRwQ2xpZW50KSB7XG4gIHJldHVybiBodHRwQ2xpZW50LmFkZFJlcXVlc3RTdGVwKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgIGlmIChcbiAgICAgICFyZXNwb25zZSAmJlxuICAgICAgdHlwZW9mIG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICh0eXBlb2YgcmVxdWVzdC5yZXNwb25zZUlzQ2FjaGFibGUgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VJc0NhY2hhYmxlKHtcbiAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgIHJlc3BvbnNlOiBtZW1DYWNoZVtjYWNoZUtleShyZXF1ZXN0KV1cbiAgICAgICAgfSkpXG4gICAgKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlID0ganNvbkNsb25lKG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSk7XG4gICAgICByZXF1ZXN0LnNlcnZlZEZyb21DYWNoZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VTYXZlVG9NZW1DYWNoZSA9IGZ1bmN0aW9uKGh0dHBDbGllbnQpIHtcbiAgcmV0dXJuIGh0dHBDbGllbnQuYWRkUmVzcG9uc2VTdGVwKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiByZXF1ZXN0LnJlc3BvbnNlSXNDYWNoYWJsZSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VJc0NhY2hhYmxlKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSlcbiAgICApIHtcbiAgICAgIG1lbUNhY2hlW2NhY2hlS2V5KHJlcXVlc3QpXSA9IHJlc3BvbnNlO1xuICAgICAgcmVxdWVzdC5zYXZlZFRvQ2FjaGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1ZXN0LnNhdmVkVG9DYWNoZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGJ1c3RNZW1DYWNoZSA9IGZ1bmN0aW9uKHBhcnRpYWxVcmwgPSAnJykge1xuICBPYmplY3Qua2V5cyhtZW1DYWNoZSkuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgaWYgKGsuaW5jbHVkZXMocGFydGlhbFVybCkpIHtcbiAgICAgIG1lbUNhY2hlW2tdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBjYWNoZUtleShyZXF1ZXN0KSB7XG4gIHJldHVybiBgJHtyZXF1ZXN0LnVybH06OiR7cmVxdWVzdC5tZXRob2R9Ojoke2dldEJvZHlGcm9tUmVxKHJlcXVlc3QpfWA7XG59XG4iLCJpbXBvcnQgaHR0cENsaWVudEZhY3RvcnkgZnJvbSAnLi4vLi4vbGliL2h0dHAtY2xpZW50L2h0dHAtY2xpZW50LmpzJztcbmltcG9ydCB1c2VNZW1DYWNoZSwge1xuICBidXN0TWVtQ2FjaGVcbn0gZnJvbSAnLi4vLi4vbGliL2h0dHAtY2xpZW50L3VzZS1tZW0tY2FjaGUuanMnO1xuXG5kZXNjcmliZSgnaHR0cC1jbGllbnQgdy8gbWVtLWNhY2hlJywgKCkgPT4ge1xuICBpdCgncmVzcG9uc2UgY2FuIGJlIGNhY2hlZCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gdXNlTWVtQ2FjaGUoaHR0cENsaWVudEZhY3RvcnkoKSk7XG4gICAgaHR0cENsaWVudFxuICAgICAgLmdldCh7XG4gICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlKS50by5lcXVhbChmYWxzZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGh0dHBDbGllbnRcbiAgICAgICAgICAuZ2V0KHtcbiAgICAgICAgICAgIHVybDogJy9odHRwLWNsaWVudC1nZXQtdGVzdCcsXG4gICAgICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHsgcmVxdWVzdCwgcmVzcG9uc2UgfSkge1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVzcG9uc2UuZm9vKS50by5lcXVhbCgnMScpO1xuICAgICAgICAgICAgY2hhaS5leHBlY3QocmVxdWVzdC5zZXJ2ZWRGcm9tQ2FjaGUpLnRvLmVxdWFsKHRydWUpO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdjYWNoZSBjYW4gYmUgYnVzdGVkJywgZG9uZSA9PiB7XG4gICAgbGV0IGh0dHBDbGllbnQgPSB1c2VNZW1DYWNoZShodHRwQ2xpZW50RmFjdG9yeSgpKTtcbiAgICBodHRwQ2xpZW50XG4gICAgICAuZ2V0KHtcbiAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGJ1c3RNZW1DYWNoZSgpO1xuICAgICAgICBodHRwQ2xpZW50XG4gICAgICAgICAgLmdldCh7XG4gICAgICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICAgICAgcmV0dXJuUmVxdWVzdEFuZFJlc3BvbnNlOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih7IHJlcXVlc3QsIHJlc3BvbnNlIH0pIHtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlc3BvbnNlLmZvbykudG8uZXF1YWwoJzEnKTtcbiAgICAgICAgICAgIGNoYWkuZXhwZWN0KHJlcXVlc3Quc2VydmVkRnJvbUNhY2hlKS50by5lcXVhbChmYWxzZSk7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgLy9UT0RPOiBGQUlMUyBkdWUgdG8ganNvbkNsb25lIGJlaW5nIHVzZWQgb24gYSBvYmplY3QgdGhhdCBoYXMgYSBwcm9wZXJ0eSB0aGF0IGhhcyBhIGZ1bmN0aW9uIGFzIHRoZSB2YWx1ZVxuICBpdCgncmVzcG9uc2VJc0NhY2hhYmxlIGNhbiBwcmV2ZW50IGNhY2hlZCByZXNwb25zZSBmcm9tIGJlaW5nIGNhY2hlZCcsIGRvbmUgPT4ge1xuICAgIGxldCBodHRwQ2xpZW50ID0gdXNlTWVtQ2FjaGUoXG4gICAgICBodHRwQ2xpZW50RmFjdG9yeSh7XG4gICAgICAgIHJlc3BvbnNlSXNDYWNoYWJsZTogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIGh0dHBDbGllbnRcbiAgICAgIC5nZXQoe1xuICAgICAgICB1cmw6ICcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnLFxuICAgICAgICByZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2U6IHRydWVcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaHR0cENsaWVudFxuICAgICAgICAgIC5nZXQoe1xuICAgICAgICAgICAgdXJsOiAnL2h0dHAtY2xpZW50LWdldC10ZXN0JyxcbiAgICAgICAgICAgIHJldHVyblJlcXVlc3RBbmRSZXNwb25zZTogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oeyByZXF1ZXN0LCByZXNwb25zZSB9KSB7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXNwb25zZS5mb28pLnRvLmVxdWFsKCcxJyk7XG4gICAgICAgICAgICBjaGFpLmV4cGVjdChyZXF1ZXN0LnNlcnZlZEZyb21DYWNoZSkudG8uZXF1YWwoZmFsc2UpO1xuICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xuXG4gIC8vIGl0KCdyZXNwb25zZUlzQ2FjaGFibGUgY2FuIHByZXZlbnQgY2FjaGVkIHJlc3BvbnNlIGZyb20gYmVpbmcgcmV0dXJuZWQnLCBkb25lID0+IHt9KTtcbn0pO1xuIl0sIm5hbWVzIjpbImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsIkVycm9yIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJleHBlY3QiLCJ0byIsImEiLCJkZWVwIiwiYm9keSIsImFyciIsImZuIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsImlzIiwic2V0dXAiLCJjaGVja3MiLCJnZXRUeXBlIiwibWF0Y2hlcyIsImNsb25lIiwic3JjIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwib2JqZWN0IiwiZnVuY3Rpb24iLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJrZXkiLCJmaW5kSW5kZXgiLCJqc29uQ2xvbmUiLCJlIiwiYmUiLCJudWxsIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwiYm9vbGVhbiIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibnVtYmVyIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwic3RyaW5nIiwidXNlRmV0Y2giLCJodHRwQ2xpZW50IiwiYWRkUmVzcG9uc2VTdGVwIiwicmVxdWVzdCIsInJlc3BvbnNlIiwiZmV0Y2hPcHRpb25zIiwibW9kZSIsImNyZWRlbnRpYWxzIiwiaGVhZGVycyIsImdldEJvZHlGcm9tUmVxIiwidXJsIiwiZmV0Y2giLCJ0aGVuIiwib2siLCJ0ZXh0IiwiZGVmYXVsdE9wdGlvbnMiLCJyZXR1cm5SZXF1ZXN0QW5kUmVzcG9uc2UiLCJodHRwQ2xpZW50RmFjdG9yeSIsImN1c3RvbUluc3RhbmNlT3B0aW9ucyIsImluc3RhbmNlT3B0aW9ucyIsInJlcXVlc3RTdGVwcyIsInJlc3BvbnNlU3RlcHMiLCJjdXN0b21SdW5PcHRpb25zIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJvbWlzZU1ldGhvZCIsInJlamVjdENhbGxiYWNrIiwiYXJnIiwic3RlcEFyZ3VtZW50SXNOb3JtYWxpemVkIiwicG9zdCIsInB1dCIsInBhdGNoIiwiZGVsZXRlIiwib3B0aW9ucyIsIm5ld09wdGlvbnMiLCJhZGRSZXF1ZXN0U3RlcCIsIm5vcm1hbGl6ZUFkZFN0ZXBBcmd1bWVudHMiLCJyZXEiLCJmb28iLCJkb25lIiwidGVzdERhdGEiLCJtZW1DYWNoZSIsInVzZU1lbUNhY2hlIiwidXNlU2F2ZVRvTWVtQ2FjaGUiLCJ1c2VHZXRGcm9tQ2FjaGUiLCJjYWNoZUtleSIsInJlc3BvbnNlSXNDYWNoYWJsZSIsInNlcnZlZEZyb21DYWNoZSIsInNhdmVkVG9DYWNoZSIsImJ1c3RNZW1DYWNoZSIsInBhcnRpYWxVcmwiLCJrIiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBO0FBQ0EsdUJBQWUsWUFFVjtFQUFBLE1BREhBLE9BQ0csdUVBRE9DLE9BQU9DLE1BQVAsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixFQUEvQixDQUNQOztFQUNILE1BQUlDLFFBQVEsSUFBSUMsT0FBSixFQUFaO0VBQ0EsU0FBTyxVQUFDQyxHQUFELEVBQVM7RUFDZCxRQUFJQyxRQUFRSCxNQUFNSSxHQUFOLENBQVVGLEdBQVYsQ0FBWjtFQUNBLFFBQUksQ0FBQ0MsS0FBTCxFQUFZO0VBQ1ZILFlBQU1LLEdBQU4sQ0FBVUgsR0FBVixFQUFnQkMsUUFBUVAsUUFBUU0sR0FBUixDQUF4QjtFQUNEO0VBQ0QsV0FBT0MsS0FBUDtFQUNELEdBTkQ7RUFP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
