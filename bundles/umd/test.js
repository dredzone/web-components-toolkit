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
      container.remove(propertiesMixinTest);
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
  var removeElement = (function (element) {
    if (element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

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

    afterEach(function () {
      removeElement(emmiter);
      removeElement(listener);
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

  var clone = (function (src) {
    return clone$1(src, [], []);
  });

  function clone$1(src, circulars, clones) {
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
      return src.map(clone$1);
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
        obj[key] = idx > -1 ? clones[idx] : clone$1(src[key], circulars, clones);
      };

      for (var key in src) {
        _loop(key);
      }
      return obj;
    }

    return src;
  }

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

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9taWNyb3Rhc2suanMiLCIuLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvcHJvcGVydGllcy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hZnRlci5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3dlYi1jb21wb25lbnRzL2V2ZW50cy1taXhpbi5qcyIsIi4uLy4uL2xpYi9icm93c2VyL3N0b3AtZXZlbnQuanMiLCIuLi8uLi9saWIvYnJvd3Nlci9yZW1vdmUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMuanMiLCIuLi8uLi9saWIvYXJyYXkvYW55LmpzIiwiLi4vLi4vbGliL2FycmF5L2FsbC5qcyIsIi4uLy4uL2xpYi9hcnJheS5qcyIsIi4uLy4uL2xpYi90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyIsIi4uLy4uL3Rlc3Qvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKFxuICBjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KVxuKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5cbmxldCBtaWNyb1Rhc2tDdXJySGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tMYXN0SGFuZGxlID0gMDtcbmxldCBtaWNyb1Rhc2tDYWxsYmFja3MgPSBbXTtcbmxldCBtaWNyb1Rhc2tOb2RlQ29udGVudCA9IDA7XG5sZXQgbWljcm9UYXNrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKG1pY3JvVGFza0ZsdXNoKS5vYnNlcnZlKG1pY3JvVGFza05vZGUsIHtcbiAgY2hhcmFjdGVyRGF0YTogdHJ1ZVxufSk7XG5cblxuLyoqXG4gKiBCYXNlZCBvbiBQb2x5bWVyLmFzeW5jXG4gKi9cbmNvbnN0IG1pY3JvVGFzayA9IHtcbiAgLyoqXG4gICAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0IG1pY3JvVGFzayB0aW1pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICAgKi9cbiAgcnVuKGNhbGxiYWNrKSB7XG4gICAgbWljcm9UYXNrTm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhtaWNyb1Rhc2tOb2RlQ29udGVudCsrKTtcbiAgICBtaWNyb1Rhc2tDYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIG1pY3JvVGFza0N1cnJIYW5kbGUrKztcbiAgfSxcblxuICAvKipcbiAgICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYG1pY3JvVGFza2AgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gICAqL1xuICBjYW5jZWwoaGFuZGxlKSB7XG4gICAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbWljcm9UYXNrTGFzdEhhbmRsZTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGlmICghbWljcm9UYXNrQ2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgICB9XG4gICAgICBtaWNyb1Rhc2tDYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtaWNyb1Rhc2s7XG5cbmZ1bmN0aW9uIG1pY3JvVGFza0ZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBtaWNyb1Rhc2tDYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gbWljcm9UYXNrQ2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbWljcm9UYXNrQ2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBtaWNyb1Rhc2tMYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi8uLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCBtaWNyb1Rhc2sgZnJvbSAnLi4vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWVzXG4gIH07XG4gIF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICBnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKFxuICBiYXNlQ2xhc3NcbikgPT4ge1xuICBjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuICAgICdjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnYWRvcHRlZENhbGxiYWNrJyxcbiAgICAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuICBdO1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBpZiAoIWJhc2VDbGFzcykge1xuICAgIGJhc2VDbGFzcyA9IGNsYXNzIGV4dGVuZHMgZ2xvYmFsLkhUTUxFbGVtZW50IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7fVxuXG4gICAgc3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuICAgICAgaWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7fSxcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjYWxsYmFja01ldGhvZE5hbWUubGVuZ3RoIC0gJ2NhbGxiYWNrJy5sZW5ndGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gcHJvdG9bY2FsbGJhY2tNZXRob2ROYW1lXTtcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcbiAgICAgICAgcmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuY29uc3RydWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge31cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZChcbiAgICAgIGF0dHJpYnV0ZU5hbWUsXG4gICAgICBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlXG4gICAgKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uLy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IG1pY3JvVGFzayBmcm9tICcuLi9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPVxuICAgICAgY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9XG4gICAgICAgIHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHNcbiAgICApIHtcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgIE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5vdGlmeSxcbiAgICAgICAgICBoYXNPYnNlcnZlcixcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGUsXG4gICAgICAgICAgaXNPYnNlcnZlclN0cmluZyxcbiAgICAgICAgICBvYnNlcnZlclxuICAgICAgICB9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICBpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGAke3Byb3BlcnR5fS1jaGFuZ2VkYCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZTogb2xkUHJvcHNbcHJvcGVydHldXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+XG4gICAgICAgICAgdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSlcbiAgICAgICAgKSB8fCBbXVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PlxuICAgICAgICAgIG1hdGNoWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKFxuICAgICAgICAgIGF0dHJpYnV0ZVxuICAgICAgICApO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV1cbiAgICAgICAgLnR5cGU7XG4gICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNOdW1iZXIsXG4gICAgICAgIGlzQXJyYXksXG4gICAgICAgIGlzQm9vbGVhbixcbiAgICAgICAgaXNEYXRlLFxuICAgICAgICBpc1N0cmluZyxcbiAgICAgICAgaXNPYmplY3RcbiAgICAgIH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9XG4gICAgICAgICAgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBpc0FycmF5XG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHt9XG4gICAgICAgICAgICA6IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc0RhdGUpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlDb25maWcgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1tcbiAgICAgICAgcHJvcGVydHlcbiAgICAgIF07XG4gICAgICBjb25zdCB7IGlzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXkgfSA9IHByb3BlcnR5Q29uZmlnO1xuXG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGxldCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZykge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0ge307XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhT2xkICYmICEocHJvcGVydHkgaW4gcHJpdmF0ZXModGhpcykuZGF0YU9sZCkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZ1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cblxuICAgIF9pbnZhbGlkYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9mbHVzaFByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZztcbiAgICAgIGNvbnN0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFPbGQ7XG5cbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oY2hhbmdlZFByb3BzKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFN0cmljdCBlcXVhbGl0eSBjaGVja1xuICAgICAgICBvbGQgIT09IHZhbHVlICYmXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyAob2xkPT1OYU4sIHZhbHVlPT1OYU4pIGFsd2F5cyByZXR1cm5zIGZhbHNlXG4gICAgICAgIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICApO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvKiAgKi9cblxuZXhwb3J0IGRlZmF1bHQgKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlID0gZmFsc2VcbikgPT4ge1xuICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59O1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihcbiAgdGFyZ2V0LFxuICB0eXBlLFxuICBsaXN0ZW5lcixcbiAgY2FwdHVyZVxuKSB7XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBldmVudCBlbWl0dGVyJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKFxuICB0YXJnZXQsXG4gIHR5cGUsXG4gIGxpc3RlbmVyLFxuICBjYXB0dXJlXG4pIHtcbiAgaWYgKHR5cGUuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICBsZXQgZXZlbnRzID0gdHlwZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gICAgbGV0IGhhbmRsZXMgPSBldmVudHMubWFwKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICBsZXQgaGFuZGxlO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZSA9IGhhbmRsZXMucG9wKCkpKSB7XG4gICAgICAgICAgaGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1taXhpbi5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9wcm9wZXJ0aWVzLW1peGluLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzTWl4aW5UZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc01peGluVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG5kZXNjcmliZSgnUHJvcGVydGllcyBNaXhpbicsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc01peGluVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc01peGluVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIucmVtb3ZlKHByb3BlcnRpZXNNaXhpblRlc3QpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzTWl4aW5UZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc01peGluVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzTWl4aW5UZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNNaXhpblRlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc01peGluVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uLy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50KHR5cGUsIGFzc2lnbihldmVudERlZmF1bHRQYXJhbXMsIHsgZGV0YWlsOiBkYXRhIH0pKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCkgPT4ge1xuICBpZiAoZWxlbWVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgZWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICB9XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vbGliL2Jyb3dzZXIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtbWl4aW4uanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci93ZWItY29tcG9uZW50cy9ldmVudHMtbWl4aW4uanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi8uLi9saWIvYnJvd3Nlci9zdG9wLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4uLy4uLy4uL2xpYi9icm93c2VyL3JlbW92ZS1lbGVtZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdFdmVudHMgTWl4aW4nLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICByZW1vdmVFbGVtZW50KGVtbWl0ZXIpO1xuICAgIHJlbW92ZUVsZW1lbnQobGlzdGVuZXIpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKFxuICAuLi5wYXJhbXNcbikgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+IChcbiAgLi4ucGFyYW1zXG4pID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gJ01hcCBTZXQgU3ltYm9sIEFycmF5IE9iamVjdCBTdHJpbmcgRGF0ZSBSZWdFeHAgRnVuY3Rpb24gQm9vbGVhbiBOdW1iZXIgTnVsbCBVbmRlZmluZWQgQXJndW1lbnRzIEVycm9yJy5zcGxpdChcbiAgJyAnXG4pO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcbmNvbnN0IGlzID0gc2V0dXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgaXM7XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gb2JqID0+IGdldFR5cGUob2JqKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKG9iaikge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwob2JqKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG4iLCIvKiAgKi9cbmltcG9ydCB0eXBlIGZyb20gJy4uL3R5cGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoc3JjKSA9PiBjbG9uZShzcmMsIFtdLCBbXSk7XG5cbmZ1bmN0aW9uIGNsb25lKHNyYywgY2lyY3VsYXJzLCBjbG9uZXMpIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoIXNyYyB8fCAhdHlwZS5vYmplY3Qoc3JjKSB8fCB0eXBlLmZ1bmN0aW9uKHNyYykpIHtcbiAgICByZXR1cm4gc3JjO1xuICB9XG5cbiAgLy8gRGF0ZVxuICBpZiAodHlwZS5kYXRlKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoc3JjLmdldFRpbWUoKSk7XG4gIH1cblxuICAvLyBSZWdFeHBcbiAgaWYgKHR5cGUucmVnZXhwKHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzcmMpO1xuICB9XG5cbiAgLy8gQXJyYXlzXG4gIGlmICh0eXBlLmFycmF5KHNyYykpIHtcbiAgICByZXR1cm4gc3JjLm1hcChjbG9uZSk7XG4gIH1cblxuICAvLyBFUzYgTWFwc1xuICBpZiAodHlwZS5tYXAoc3JjKSkge1xuICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20oc3JjLmVudHJpZXMoKSkpO1xuICB9XG5cbiAgLy8gRVM2IFNldHNcbiAgaWYgKHR5cGUuc2V0KHNyYykpIHtcbiAgICByZXR1cm4gbmV3IFNldChBcnJheS5mcm9tKHNyYy52YWx1ZXMoKSkpO1xuICB9XG5cbiAgLy8gT2JqZWN0XG4gIGlmICh0eXBlLm9iamVjdChzcmMpKSB7XG4gICAgY2lyY3VsYXJzLnB1c2goc3JjKTtcbiAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKHNyYyk7XG4gICAgY2xvbmVzLnB1c2gob2JqKTtcbiAgICBmb3IgKGxldCBrZXkgaW4gc3JjKSB7XG4gICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gc3JjW2tleV0pO1xuICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUoc3JjW2tleV0sIGNpcmN1bGFycywgY2xvbmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHJldHVybiBzcmM7XG59XG4iLCJpbXBvcnQgY2xvbmUgZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdDbG9uZScsICgpID0+IHtcblx0ZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG5cdFx0aXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcblx0XHRcdC8vIE51bGxcblx0XHRcdGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuXHRcdFx0Ly8gVW5kZWZpbmVkXG5cdFx0XHRleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG5cdFx0XHQvLyBGdW5jdGlvblxuXHRcdFx0Y29uc3QgZnVuYyA9ICgpID0+IHsgfTtcblx0XHRcdGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG5cdFx0XHQvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuXHRcdFx0YXNzZXJ0LmVxdWFsKGNsb25lKDUpLCA1KTtcblx0XHRcdGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcblx0XHRcdGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRcdGFzc2VydC5lcXVhbChjbG9uZSh0cnVlKSwgdHJ1ZSk7XG5cdFx0fSk7XG5cdH0pO1xufSk7XG4iLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgnVHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuXHRkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5tYXAobmV3IE1hcCkpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBNYXAnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoaXMubWFwKG51bGwpKS50by5iZS5mYWxzZTtcblx0XHRcdGV4cGVjdChpcy5tYXAoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRkZXNjcmliZSgnc2V0JywgKCkgPT4ge1xuXHRcdGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIFNldCcsICgpID0+IHtcblx0XHRcdGV4cGVjdChpcy5zZXQobmV3IFNldCkpLnRvLmJlLnRydWU7XG5cdFx0fSk7XG5cdFx0aXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcblx0XHRcdGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcbn0pO1xuIl0sIm5hbWVzIjpbImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJsZW5ndGgiLCJkZWZpbmVQcm9wZXJ0eSIsImkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwibWljcm9UYXNrQ3VyckhhbmRsZSIsIm1pY3JvVGFza0xhc3RIYW5kbGUiLCJtaWNyb1Rhc2tDYWxsYmFja3MiLCJtaWNyb1Rhc2tOb2RlQ29udGVudCIsIm1pY3JvVGFza05vZGUiLCJkb2N1bWVudCIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsIm1pY3JvVGFza0ZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJtaWNyb1Rhc2siLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNhbmNlbCIsImhhbmRsZSIsImlkeCIsIkVycm9yIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwicG9wIiwiUHJvcGVydGllc01peGluVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImRlc2NyaWJlIiwiY29udGFpbmVyIiwicHJvcGVydGllc01peGluVGVzdCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwiaW5uZXJIVE1MIiwiaXQiLCJhc3NlcnQiLCJlcXVhbCIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJhZnRlckVhY2giLCJyZW1vdmVFbGVtZW50Iiwic3RvcEV2ZW50IiwiY2hhaSIsImV4cGVjdCIsInRvIiwiYSIsImRlZXAiLCJib2R5IiwiYXJyIiwiZm4iLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwiaXMiLCJzZXR1cCIsImNoZWNrcyIsImdldFR5cGUiLCJtYXRjaGVzIiwic3JjIiwiY2xvbmUiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJvYmplY3QiLCJmdW5jdGlvbiIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsImtleSIsImZpbmRJbmRleCIsImJlIiwibnVsbCIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsImJvb2xlYW4iLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm51bWJlciIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsInN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0VBQUE7QUFDQSx1QkFBZSxZQUVWO0VB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
