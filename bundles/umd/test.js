(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  /*  */
  var templateContent = (function (template) {
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

  var createElement = (function (html) {
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
  var currHandle = 0;
  var callbacks = [];
  var nodeContent = 0;
  var node = document.createTextNode('');
  new MutationObserver(flush).observe(node, { characterData: true });

  /**
   * Enqueues a function called at  timing.
   *
   * @param {Function} callback Callback to run
   * @return {number} Handle used for canceling task
   */
  var run = function run(callback) {
    node.textContent = String(nodeContent++);
    callbacks.push(callback);
    return currHandle++;
  };

  function flush() {
    var len = callbacks.length;
    for (var i = 0; i < len; i++) {
      var cb = callbacks[i];
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
    callbacks.splice(0, len);
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
          run(function () {
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
        run(function () {
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
          run(function () {
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

  var PropertiesTest = function (_properties) {
    inherits(PropertiesTest, _properties);

    function PropertiesTest() {
      classCallCheck(this, PropertiesTest);
      return possibleConstructorReturn(this, _properties.apply(this, arguments));
    }

    createClass(PropertiesTest, null, [{
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
    return PropertiesTest;
  }(properties(customElement()));

  PropertiesTest.define('properties-test');

  describe('custom-element-properties', function () {
    var container = void 0;
    var propertiesTest = document.createElement('properties-test');

    before(function () {
      container = document.getElementById('container');
      container.append(propertiesTest);
    });

    after(function () {
      container.innerHTML = '';
    });

    it('properties', function () {
      assert.equal(propertiesTest.prop, 'prop');
    });

    it('reflecting properties', function () {
      propertiesTest.prop = 'propValue';
      propertiesTest._flushProperties();
      assert.equal(propertiesTest.getAttribute('prop'), 'propValue');
    });

    it('notify property change', function () {
      listenEvent(propertiesTest, 'prop-changed', function (evt) {
        assert.isOk(evt.type === 'prop-changed', 'event dispatched');
      });

      propertiesTest.prop = 'propValue';
    });

    it('value as a function', function () {
      assert.isOk(Array.isArray(propertiesTest.fnValueProp), 'function executed');
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

  describe('custom-element-events', function () {
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
  var types = ['Map', 'Set', 'Symbol', 'Array', 'Object', 'String', 'Date', 'RegExp', 'Function', 'Boolean', 'Number', 'Null', 'Undefined', 'Arguments', 'Error', 'Request', 'Response', 'Headers', 'Blob'];
  var len = types.length;
  var typeCache = {};
  var typeRegexp = /\s([a-zA-Z]+)/;

  var is = setup();

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

  function clone$1(src) {
    var circulars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var clones = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    // Null/undefined/functions/etc
    if (is.undefined(src) || is.null(src) || isPrimitive(src) || is.function(src)) {
      return src;
    }
    return cloner(getType(src), src, circulars, clones);
  }

  function isPrimitive(src) {
    return is.boolean(src) || is.number(src) || is.string(src);
  }

  function cloner(type, context) {
    var handlers = {
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
      request: function request() {
        return this.clone();
      },
      response: function response() {
        return this.clone();
      },
      headers: function headers() {
        var headers = new Headers();
        for (var _iterator = this.entries, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref2;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref2 = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref2 = _i.value;
          }

          var _ref = _ref2;
          var name = _ref[0];
          var value = _ref[1];

          headers.append(name, value);
        }
        return headers;
      },
      blob: function blob() {
        return new Blob([this], { type: this.type });
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
    };
    if (type in handlers) {
      var fn = handlers[type];

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return fn.apply(context, args);
    }
    return context;
  }

  describe('clone', function () {
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

  /*  */
  var jsonClone = (function (value) {
    var reviver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (k, v) {
      return v;
    };
    return JSON.parse(JSON.stringify(value), reviver);
  });

  describe('json-clone', function () {
  	it('non-serializable values throw', function () {
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

  	it('primitive serializable values', function () {
  		expect(jsonClone(null)).to.be.null;
  		assert.equal(jsonClone(5), 5);
  		assert.equal(jsonClone('string'), 'string');
  		assert.equal(jsonClone(false), false);
  		assert.equal(jsonClone(true), true);
  	});

  	it('object cloned', function () {
  		var obj = { 'a': 'b' };
  		expect(jsonClone(obj)).not.to.be.equal(obj);
  	});

  	it('reviver function', function () {
  		var obj = { 'a': '2' };
  		var cloned = jsonClone(obj, function (k, v) {
  			return k !== '' ? Number(v) * 2 : v;
  		});
  		expect(cloned.a).equal(4);
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

  /*  */

  var arrayReplaceStrategy = function arrayReplaceStrategy(source, target) {
    return clone(target);
  };

  var factory = function factory() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { arrayMerge: arrayReplaceStrategy };
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = void 0;

      for (var i = args.length; i > 0; --i) {
        result = merge$1(args.pop(), result, opts);
      }

      return result;
    };
  };

  var merge = factory();

  function merge$1(source, target, opts) {
    if (is.undefined(target)) {
      return clone(source);
    }

    var type = getType(source);
    if (type === getType(target)) {
      return merger(type, source, target, opts);
    }
    return clone(target);
  }

  function merger(type, source, target, opts) {
    var handlers = {
      object: function object() {
        var result = {};

        var keys = {
          source: Object.keys(source),
          target: Object.keys(target)
        };

        keys.source.concat(keys.target).forEach(function (key) {
          result[key] = merge$1(source[key], target[key], opts);
        });

        return result;
      },
      array: function array() {
        return opts.arrayMerge.apply(null, [source, target]);
      }
    };

    if (type in handlers) {
      return handlers[type]();
    }
    return clone(target);
  }

  /*  */

  /*  */

  /*  */

  var HttpMethods = Object.freeze({
  	Get: 'GET',
  	Post: 'POST',
  	Put: 'PUT',
  	Patch: 'PATCH',
  	Delete: 'DELETE'
  });

  var http = (function () {
  	return new Http(createConfig());
  });

  var privates = createStorage();

  var HttpError = function (_Error) {
  	inherits(HttpError, _Error);

  	function HttpError(response) {
  		classCallCheck(this, HttpError);

  		var _this = possibleConstructorReturn(this, _Error.call(this, response.status + ' for ' + response.url));

  		_this.name = 'HttpError';
  		_this.response = response;
  		return _this;
  	}

  	return HttpError;
  }(Error);

  var Http = function () {
  	function Http(config) {
  		classCallCheck(this, Http);

  		privates(this).config = config;
  	}

  	Http.prototype.catcher = function catcher(errorId, _catcher) {
  		var config = clone(privates(this).config);
  		config.catchers.set(errorId, _catcher);
  		return new Http(config);
  	};

  	Http.prototype.middleware = function middleware(_middleware) {
  		var clear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  		var config = clone(privates(this).config);
  		config.middleware = clear ? _middleware : config.middleware.concat(_middleware);
  		return new Http(config);
  	};

  	Http.prototype.url = function url(_url) {
  		var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  		var config = clone(privates(this).config);
  		config.url = replace ? _url : config.url + _url;
  		return new Http(config);
  	};

  	Http.prototype.options = function options(_options) {
  		var mixin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  		var config = clone(privates(this).config);
  		config.options = mixin ? merge(config.options, _options) : Object.assign({}, _options);
  		return new Http(config);
  	};

  	Http.prototype.headers = function headers(headerValues) {
  		var config = clone(privates(this).config);
  		config.options.headers = merge(config.options.headers, headerValues);
  		return new Http(config);
  	};

  	Http.prototype.accept = function accept(headerValue) {
  		return this.headers({ Accept: headerValue });
  	};

  	Http.prototype.content = function content(headerValue) {
  		return this.headers({ 'Content-Type': headerValue });
  	};

  	Http.prototype.mode = function mode(value) {
  		return this.options({ mode: value });
  	};

  	Http.prototype.credentials = function credentials(value) {
  		return this.options({ credentials: value });
  	};

  	Http.prototype.cache = function cache(value) {
  		return this.options({ cache: value });
  	};

  	Http.prototype.integrity = function integrity(value) {
  		return this.options({ integrity: value });
  	};

  	Http.prototype.keepalive = function keepalive() {
  		var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  		return this.options({ keepalive: value });
  	};

  	Http.prototype.redirect = function redirect(value) {
  		return this.options({ redirect: value });
  	};

  	Http.prototype.body = function body(contents) {
  		var config = clone(privates(this).config);
  		config.options.body = contents;
  		return new Http(config);
  	};

  	Http.prototype.auth = function auth(headerValue) {
  		return this.headers({ Authorization: headerValue });
  	};

  	Http.prototype.json = function json(value) {
  		return this.content("application/json").body(JSON.stringify(value));
  	};

  	Http.prototype.form = function form(value) {
  		return this.body(convertFormUrl(value)).content("application/x-www-form-urlencoded");
  	};

  	Http.prototype.method = function method() {
  		var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : HttpMethods.Get;

  		return this.options({ method: value });
  	};

  	Http.prototype.get = function get$$1() {
  		return this.method(HttpMethods.Get).send();
  	};

  	Http.prototype.post = function post() {
  		return this.method(HttpMethods.Post).send();
  	};

  	Http.prototype.insert = function insert() {
  		return this.method(HttpMethods.Put).send();
  	};

  	Http.prototype.update = function update() {
  		return this.method(HttpMethods.Patch).send();
  	};

  	Http.prototype.delete = function _delete() {
  		return this.method(HttpMethods.Delete).send();
  	};

  	Http.prototype.send = function send() {
  		var _this2 = this;

  		var _privates$config = privates(this).config,
  		    url = _privates$config.url,
  		    options = _privates$config.options,
  		    middleware = _privates$config.middleware,
  		    resolvers = _privates$config.resolvers,
  		    catchers = _privates$config.catchers;

  		var request = applyMiddleware(middleware)(fetch);
  		var wrapper = request(url, options).then(function (response) {
  			if (!response.ok) {
  				throw new HttpError(response);
  			}
  			return response;
  		});

  		var doCatch = function doCatch(promise) {
  			return promise.catch(function (err) {
  				if (catchers.has(err.status)) {
  					return catchers.get(err.status)(err, _this2);
  				}
  				if (catchers.has(err.name)) {
  					return catchers.get(err.name)(err, _this2);
  				}
  				throw err;
  			});
  		};

  		var wrapTypeParser = function wrapTypeParser(funName) {
  			return function (cb) {
  				return funName ? doCatch(wrapper
  				// $FlowFixMe
  				.then(function (response) {
  					return response && response[funName]();
  				}).then(function (response) {
  					return response && cb && cb(response) || response;
  				})) : doCatch(wrapper.then(function (response) {
  					return response && cb && cb(response) || response;
  				}));
  			};
  		};

  		var responseChain = {
  			res: wrapTypeParser(null),
  			json: wrapTypeParser('json')
  		};

  		return resolvers.reduce(function (chain, r) {
  			return r(chain, options);
  		}, responseChain);
  	};

  	return Http;
  }();

  function applyMiddleware(middlewares) {
  	return function (fetchFunction) {
  		if (middlewares.length === 0) {
  			return fetchFunction;
  		}

  		if (middlewares.length === 1) {
  			return middlewares[0](fetchFunction);
  		}

  		return middlewares.reduceRight(function (acc, curr, idx) {
  			return idx === middlewares.length - 2 ? curr(acc(fetchFunction)) : curr(acc);
  		});
  	};
  }

  function createConfig() {
  	return Object.assign({}, {
  		url: '',
  		options: {},
  		catchers: new Map(),
  		resolvers: [],
  		middleware: []
  	});
  }

  function convertFormUrl(formObject) {
  	return Object.keys(formObject).map(function (key) {
  		return encodeURIComponent(key) + "=" + ('' + encodeURIComponent(_typeof(formObject[key]) === "object" ? JSON.stringify(formObject[key]) : formObject[key]));
  	}).join("&");
  }

  describe('http', function () {
  	it('create http', function () {
  		var delayMiddleware = function delayMiddleware(delay) {
  			return function (next) {
  				return function (url, opts) {
  					return new Promise(function (res) {
  						return setTimeout(function () {
  							return res(next(url, opts));
  						}, delay);
  					});
  				};
  			};
  		};

  		/* Logs all requests passing through. */
  		var logMiddleware = function logMiddleware() {
  			return function (next) {
  				return function (url, opts) {
  					console.log(opts.method + "@" + url);
  					return next(url, opts);
  				};
  			};
  		};

  		var jsonApi = http().json().mode('cors').middleware([delayMiddleware(3000), logMiddleware()]).credentials('same-origin').headers({ 'X-Requested-By': 'DEEP-UI' });

  		jsonApi.url('/http-client-get-test').get().json(function (data) {
  			return console.log(data);
  		});
  		// assert.instanceOf(http(), 'http is instance of Http');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9tZXJnZS5qcyIsIi4uLy4uL2xpYi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaHR0cC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHRlbXBsYXRlKSA9PiB7XG4gIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBsZXQgY2hpbGRyZW4gPSB0ZW1wbGF0ZS5jaGlsZE5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGRyZW5baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuIiwiLyogICovXG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn07XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvZG9tL2NyZWF0ZS1lbGVtZW50LmpzJztcblxuZGVzY3JpYmUoJ2NyZWF0ZS1lbGVtZW50JywgKCkgPT4ge1xuICBpdCgnY3JlYXRlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KGBcblx0XHRcdDxkaXYgY2xhc3M9XCJteS1jbGFzc1wiPkhlbGxvIFdvcmxkPC9kaXY+XG5cdFx0YCk7XG4gICAgZXhwZWN0KGVsLmNsYXNzTGlzdC5jb250YWlucygnbXktY2xhc3MnKSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgYXNzZXJ0Lmluc3RhbmNlT2YoZWwsIE5vZGUsICdlbGVtZW50IGlzIGluc3RhbmNlIG9mIG5vZGUnKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5sZXQgY3VyckhhbmRsZSA9IDA7XG5sZXQgbGFzdEhhbmRsZSA9IDA7XG5sZXQgY2FsbGJhY2tzID0gW107XG5sZXQgbm9kZUNvbnRlbnQgPSAwO1xubGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbi8qKlxuICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgIHRpbWluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSAoY2FsbGJhY2spID0+IHtcbiAgbm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhub2RlQ29udGVudCsrKTtcbiAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gY3VyckhhbmRsZSsrO1xufTtcblxuLyoqXG4gKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgYCBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICovXG5leHBvcnQgY29uc3QgY2FuY2VsID0gKGhhbmRsZSkgPT4ge1xuICBjb25zdCBpZHggPSBoYW5kbGUgLSBsYXN0SGFuZGxlO1xuICBpZiAoaWR4ID49IDApIHtcbiAgICBpZiAoIWNhbGxiYWNrc1tpZHhdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICB9XG4gICAgY2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICB9XG59O1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgKiBhcyBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0ICogYXMgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID0gdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGlzTnVtYmVyLCBpc0FycmF5LCBpc0Jvb2xlYW4sIGlzRGF0ZSwgaXNTdHJpbmcsIGlzT2JqZWN0IH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAoaXNBcnJheSA/IG51bGwgOiB7fSkgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0ICh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlID0gZmFsc2UpID0+IHtcbiAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNUZXN0LmRlZmluZSgncHJvcGVydGllcy10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdjdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNUZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNUZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc1Rlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc1Rlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc1Rlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9kb20tZXZlbnRzL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2N1c3RvbS1lbGVtZW50LWV2ZW50cycsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gW1xuICAnTWFwJyxcbiAgJ1NldCcsXG4gICdTeW1ib2wnLFxuICAnQXJyYXknLFxuICAnT2JqZWN0JyxcbiAgJ1N0cmluZycsXG4gICdEYXRlJyxcbiAgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsXG4gICdCb29sZWFuJyxcbiAgJ051bWJlcicsXG4gICdOdWxsJyxcbiAgJ1VuZGVmaW5lZCcsXG4gICdBcmd1bWVudHMnLFxuICAnRXJyb3InLFxuICAnUmVxdWVzdCcsXG4gICdSZXNwb25zZScsXG4gICdIZWFkZXJzJyxcbiAgJ0Jsb2InXG5dO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcblxuZXhwb3J0IGRlZmF1bHQgKHNldHVwKCkpO1xuXG5leHBvcnQgY29uc3QgZ2V0VHlwZSA9IChzcmMpID0+IGdldFNyY1R5cGUoc3JjKTtcblxuZnVuY3Rpb24gZ2V0U3JjVHlwZShzcmMpIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKHNyYyk7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IHNyYyA9PiBnZXRTcmNUeXBlKHNyYykgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGlzLCB7IGdldFR5cGUgfSBmcm9tICcuLi90eXBlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKHNyYykgPT4gY2xvbmUoc3JjLCBbXSwgW10pO1xuXG5mdW5jdGlvbiBjbG9uZShzcmMsIGNpcmN1bGFycyA9IFtdLCBjbG9uZXMgPSBbXSkge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmIChpcy51bmRlZmluZWQoc3JjKSB8fCBpcy5udWxsKHNyYykgfHwgaXNQcmltaXRpdmUoc3JjKSB8fCBpcy5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuICByZXR1cm4gY2xvbmVyKGdldFR5cGUoc3JjKSwgc3JjLCBjaXJjdWxhcnMsIGNsb25lcyk7XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHNyYykge1xuICByZXR1cm4gaXMuYm9vbGVhbihzcmMpIHx8IGlzLm51bWJlcihzcmMpIHx8IGlzLnN0cmluZyhzcmMpO1xufVxuXG5mdW5jdGlvbiBjbG9uZXIodHlwZSwgY29udGV4dCwgLi4uYXJncykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBkYXRlKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZ2V0VGltZSgpKTtcbiAgICB9LFxuICAgIHJlZ2V4cCgpIHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRoaXMpO1xuICAgIH0sXG4gICAgYXJyYXkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoY2xvbmUpO1xuICAgIH0sXG4gICAgbWFwKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbSh0aGlzLmVudHJpZXMoKSkpO1xuICAgIH0sXG4gICAgc2V0KCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbSh0aGlzLnZhbHVlcygpKSk7XG4gICAgfSxcbiAgICByZXF1ZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIHJlc3BvbnNlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIGhlYWRlcnMoKSB7XG4gICAgICBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgICBmb3IgKGxldCBbbmFtZSwgdmFsdWVdIG9mIHRoaXMuZW50cmllcykge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9LFxuICAgIGJsb2IoKSB7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW3RoaXNdLCB7IHR5cGU6IHRoaXMudHlwZSB9KTtcbiAgICB9LFxuICAgIG9iamVjdChjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgICAgIGNpcmN1bGFycy5wdXNoKHRoaXMpO1xuICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gdGhpc1trZXldKTtcbiAgICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfTtcbiAgaWYgKHR5cGUgaW4gaGFuZGxlcnMpIHtcbiAgICBjb25zdCBmbiA9IGhhbmRsZXJzW3R5cGVdO1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfVxuICByZXR1cm4gY29udGV4dDtcbn1cbiIsImltcG9ydCBjbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuXHRpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuXHRcdC8vIE51bGxcblx0XHRleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cblx0XHQvLyBVbmRlZmluZWRcblx0XHRleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG5cdFx0Ly8gRnVuY3Rpb25cblx0XHRjb25zdCBmdW5jID0gKCkgPT4ge307XG5cdFx0YXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cblx0XHQvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuXHR9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAodmFsdWUsIHJldml2ZXIgPSAoaywgdikgPT4gdikgPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSksIHJldml2ZXIpO1xuIiwiaW1wb3J0IGpzb25DbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnanNvbi1jbG9uZScsICgpID0+IHtcblx0aXQoJ25vbi1zZXJpYWxpemFibGUgdmFsdWVzIHRocm93JywgKCkgPT4ge1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0ZXhwZWN0KCgpID0+IGpzb25DbG9uZSh1bmRlZmluZWQpKS50by50aHJvdyhFcnJvcik7XG5cdH0pO1xuXG5cdGl0KCdwcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoJ29iamVjdCBjbG9uZWQnLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRleHBlY3QoanNvbkNsb25lKG9iaikpLm5vdC50by5iZS5lcXVhbChvYmopO1xuXHR9KTtcblxuXHRpdCgncmV2aXZlciBmdW5jdGlvbicsICgpID0+IHtcblx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdGNvbnN0IGNsb25lZCA9IGpzb25DbG9uZShvYmosIChrLCB2KSA9PiBrICE9PSAnJyA/IE51bWJlcih2KSAqIDIgOiB2KTtcblx0XHRleHBlY3QoY2xvbmVkLmEpLmVxdWFsKDQpO1xuXHR9KTtcbn0pOyIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gb2JqW2tleV0gPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG4gIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdFtwYXJ0c1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3RbcGFydHNbaV1dID0ge307XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gIH1cbiAgb2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBpcywgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5pbXBvcnQgY2xvbmUgZnJvbSAnLi9jbG9uZS5qcyc7XG5cblxuZXhwb3J0IGNvbnN0IGFycmF5UmVwbGFjZVN0cmF0ZWd5ID0gKHNvdXJjZSwgdGFyZ2V0KSA9PiBjbG9uZSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgZmFjdG9yeSA9IChcbiAgb3B0cyA9IHsgYXJyYXlNZXJnZTogYXJyYXlSZXBsYWNlU3RyYXRlZ3kgfVxuKSA9PiAoLi4uYXJncykgPT4ge1xuICBsZXQgcmVzdWx0O1xuXG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aDsgaSA+IDA7IC0taSkge1xuICAgIHJlc3VsdCA9IG1lcmdlKGFyZ3MucG9wKCksIHJlc3VsdCwgb3B0cyk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZmFjdG9yeSgpO1xuXG5mdW5jdGlvbiBtZXJnZShzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBpZiAoaXMudW5kZWZpbmVkKHRhcmdldCkpIHtcbiAgICByZXR1cm4gY2xvbmUoc291cmNlKTtcbiAgfVxuXG4gIGxldCB0eXBlID0gZ2V0VHlwZShzb3VyY2UpO1xuICBpZiAodHlwZSA9PT0gZ2V0VHlwZSh0YXJnZXQpKSB7XG4gICAgcmV0dXJuIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cyk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBvYmplY3QoKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7fTtcblxuICAgICAgY29uc3Qga2V5cyA9IHtcbiAgICAgICAgc291cmNlOiBPYmplY3Qua2V5cyhzb3VyY2UpLFxuICAgICAgICB0YXJnZXQ6IE9iamVjdC5rZXlzKHRhcmdldClcbiAgICAgIH07XG5cbiAgICAgIGtleXMuc291cmNlLmNvbmNhdChrZXlzLnRhcmdldCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoc291cmNlW2tleV0sIHRhcmdldFtrZXldLCBvcHRzKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhcnJheSgpIHtcbiAgICAgIHJldHVybiBvcHRzLmFycmF5TWVyZ2UuYXBwbHkobnVsbCwgW3NvdXJjZSwgdGFyZ2V0XSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlIGluIGhhbmRsZXJzKSB7XG4gICAgcmV0dXJuIGhhbmRsZXJzW3R5cGVdKCk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChvKSA9PlxuICBPYmplY3Qua2V5cyhvKS5yZWR1Y2UoKG0sIGspID0+IG0uc2V0KGssIG9ba10pLCBuZXcgTWFwKCkpO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGRnZXQgfSBmcm9tICcuL29iamVjdC9kZ2V0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgZHNldCB9IGZyb20gJy4vb2JqZWN0L2RzZXQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBjbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgbWVyZ2UgfSBmcm9tICcuL29iamVjdC9tZXJnZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBvYmplY3RUb01hcCB9IGZyb20gJy4vb2JqZWN0L29iamVjdC10by1tYXAuanMnO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB7Y2xvbmUsIG1lcmdlfSBmcm9tICcuL29iamVjdC5qcyc7XG5cblxuXG5cblxuXG5cbmV4cG9ydCBjb25zdCBIdHRwTWV0aG9kcyA9IE9iamVjdC5mcmVlemUoe1xuXHRHZXQ6ICdHRVQnLFxuXHRQb3N0OiAnUE9TVCcsXG5cdFB1dDogJ1BVVCcsXG5cdFBhdGNoOiAnUEFUQ0gnLFxuXHREZWxldGU6ICdERUxFVEUnXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IEh0dHAoY3JlYXRlQ29uZmlnKCkpO1xuXG5jb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuY2xhc3MgSHR0cEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3RvcihyZXNwb25zZSkge1xuXHRcdHN1cGVyKGAke3Jlc3BvbnNlLnN0YXR1c30gZm9yICR7cmVzcG9uc2UudXJsfWApO1xuXHRcdHRoaXMubmFtZSA9ICdIdHRwRXJyb3InO1xuXHRcdHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcblx0fVxufVxuXG5jbGFzcyBIdHRwIHtcblx0Y29uc3RydWN0b3IoY29uZmlnKSB7XG5cdFx0cHJpdmF0ZXModGhpcykuY29uZmlnID0gY29uZmlnO1xuXHR9XG5cblx0Y2F0Y2hlcihlcnJvcklkLCBjYXRjaGVyKSB7XG5cdFx0Y29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcblx0XHRjb25maWcuY2F0Y2hlcnMuc2V0KGVycm9ySWQsIGNhdGNoZXIpO1xuXHRcdHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuXHR9XG5cblx0bWlkZGxld2FyZShtaWRkbGV3YXJlLCBjbGVhciA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcblx0XHRjb25maWcubWlkZGxld2FyZSA9IGNsZWFyID8gbWlkZGxld2FyZSA6IGNvbmZpZy5taWRkbGV3YXJlLmNvbmNhdChtaWRkbGV3YXJlKTtcblx0XHRyZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcblx0fVxuXG5cdHVybCh1cmwsIHJlcGxhY2UgPSBmYWxzZSkge1xuXHRcdGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG5cdFx0Y29uZmlnLnVybCA9IHJlcGxhY2UgPyB1cmwgOiBjb25maWcudXJsICsgdXJsO1xuXHRcdHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuXHR9XG5cblx0b3B0aW9ucyhvcHRpb25zLCBtaXhpbiA9IHRydWUpIHtcblx0XHRjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuXHRcdGNvbmZpZy5vcHRpb25zID0gbWl4aW4gPyBtZXJnZShjb25maWcub3B0aW9ucywgb3B0aW9ucykgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcblx0XHRyZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcblx0fVxuXG5cdGhlYWRlcnMoaGVhZGVyVmFsdWVzKSB7XG5cdFx0Y29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcblx0XHRjb25maWcub3B0aW9ucy5oZWFkZXJzID0gbWVyZ2UoY29uZmlnLm9wdGlvbnMuaGVhZGVycywgaGVhZGVyVmFsdWVzKTtcblx0XHRyZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcblx0fVxuXG5cdGFjY2VwdChoZWFkZXJWYWx1ZSkge1xuXHRcdHJldHVybiB0aGlzLmhlYWRlcnMoe0FjY2VwdDogaGVhZGVyVmFsdWV9KTtcblx0fVxuXG5cdGNvbnRlbnQoaGVhZGVyVmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFkZXJzKHsnQ29udGVudC1UeXBlJzogaGVhZGVyVmFsdWV9KTtcblx0fVxuXG5cdG1vZGUodmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zKHttb2RlOiB2YWx1ZX0pO1xuXHR9XG5cblx0Y3JlZGVudGlhbHModmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zKHtjcmVkZW50aWFsczogdmFsdWV9KTtcblx0fVxuXG5cdGNhY2hlKHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucyh7Y2FjaGU6IHZhbHVlfSk7XG5cdH1cblxuXHRpbnRlZ3JpdHkodmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zKHtpbnRlZ3JpdHk6IHZhbHVlfSk7XG5cdH1cblxuXHRrZWVwYWxpdmUodmFsdWUgPSB0cnVlKSB7XG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucyh7a2VlcGFsaXZlOiB2YWx1ZX0pO1xuXHR9XG5cblx0cmVkaXJlY3QodmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zKHtyZWRpcmVjdDogdmFsdWV9KTtcblx0fVxuXG5cdGJvZHkoY29udGVudHMpIHtcblx0XHRjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuXHRcdGNvbmZpZy5vcHRpb25zLmJvZHkgPSBjb250ZW50cztcblx0XHRyZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcblx0fVxuXG5cdGF1dGgoaGVhZGVyVmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFkZXJzKHtBdXRob3JpemF0aW9uOiBoZWFkZXJWYWx1ZX0pO1xuXHR9XG5cblx0anNvbih2YWx1ZSkge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQoXCJhcHBsaWNhdGlvbi9qc29uXCIpLmJvZHkoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcblx0fVxuXG5cdGZvcm0odmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0LmJvZHkoY29udmVydEZvcm1VcmwodmFsdWUpKVxuXHRcdFx0LmNvbnRlbnQoXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIilcblx0fVxuXG5cdG1ldGhvZCh2YWx1ZSA9IEh0dHBNZXRob2RzLkdldCkge1xuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMoe21ldGhvZDogdmFsdWV9KTtcblx0fVxuXG5cdGdldCgpIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0Lm1ldGhvZChIdHRwTWV0aG9kcy5HZXQpXG5cdFx0XHQuc2VuZCgpO1xuXHR9XG5cblx0cG9zdCgpIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0Lm1ldGhvZChIdHRwTWV0aG9kcy5Qb3N0KVxuXHRcdFx0LnNlbmQoKTtcblx0fVxuXG5cdGluc2VydCgpIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0Lm1ldGhvZChIdHRwTWV0aG9kcy5QdXQpXG5cdFx0XHQuc2VuZCgpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHJldHVybiB0aGlzXG5cdFx0XHQubWV0aG9kKEh0dHBNZXRob2RzLlBhdGNoKVxuXHRcdFx0LnNlbmQoKTtcblx0fVxuXG5cdGRlbGV0ZSgpIHtcblx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0Lm1ldGhvZChIdHRwTWV0aG9kcy5EZWxldGUpXG5cdFx0XHQuc2VuZCgpO1xuXHR9XG5cblx0c2VuZCgpIHtcblx0XHRjb25zdCB7dXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlLCByZXNvbHZlcnMsIGNhdGNoZXJzfSA9IHByaXZhdGVzKHRoaXMpLmNvbmZpZztcblx0XHRjb25zdCByZXF1ZXN0ID0gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmUpKGZldGNoKTtcblx0XHRjb25zdCB3cmFwcGVyID0gcmVxdWVzdCh1cmwsIG9wdGlvbnMpXG5cdFx0XHQudGhlbigocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0XHRcdHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXNwb25zZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGRvQ2F0Y2ggPSAocHJvbWlzZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHByb21pc2UuY2F0Y2goZXJyID0+IHtcblx0XHRcdFx0aWYoY2F0Y2hlcnMuaGFzKGVyci5zdGF0dXMpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNhdGNoZXJzLmdldChlcnIuc3RhdHVzKShlcnIsIHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGNhdGNoZXJzLmhhcyhlcnIubmFtZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gY2F0Y2hlcnMuZ2V0KGVyci5uYW1lKShlcnIsIHRoaXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRocm93IGVycjtcblx0XHRcdH0pXG5cdFx0fTtcblxuXHRcdGNvbnN0IHdyYXBUeXBlUGFyc2VyID0gKGZ1bk5hbWUpID0+IChjYikgPT4gZnVuTmFtZSA/XG5cdFx0XHRkb0NhdGNoKFxuXHRcdFx0XHR3cmFwcGVyXG5cdFx0XHRcdFx0Ly8gJEZsb3dGaXhNZVxuXHRcdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlICYmIHJlc3BvbnNlW2Z1bk5hbWVdKCkpXG5cdFx0XHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UgJiYgY2IgJiYgY2IocmVzcG9uc2UpIHx8IHJlc3BvbnNlKSkgOlxuXHRcdFx0ZG9DYXRjaChcblx0XHRcdFx0d3JhcHBlclxuXHRcdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlICYmIGNiICYmIGNiKHJlc3BvbnNlKSB8fCByZXNwb25zZSkpO1xuXG5cdFx0Y29uc3QgcmVzcG9uc2VDaGFpbiA9IHtcblx0XHRcdHJlczogd3JhcFR5cGVQYXJzZXIobnVsbCksXG5cdFx0XHRqc29uOiB3cmFwVHlwZVBhcnNlcignanNvbicpXG5cdFx0fTtcblxuXHRcdHJldHVybiByZXNvbHZlcnMucmVkdWNlKChjaGFpbiwgcikgPT4gcihjaGFpbiwgb3B0aW9ucyksIHJlc3BvbnNlQ2hhaW4pO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmVzKSB7XG5cdHJldHVybiAoZmV0Y2hGdW5jdGlvbikgPT4ge1xuXHRcdGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBmZXRjaEZ1bmN0aW9uO1xuXHRcdH1cblxuXHRcdGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybiBtaWRkbGV3YXJlc1swXShmZXRjaEZ1bmN0aW9uKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKG1pZGRsZXdhcmVzLnJlZHVjZVJpZ2h0KFxuXHRcdFx0KGFjYywgY3VyciwgaWR4KSA9PiAoaWR4ID09PSBtaWRkbGV3YXJlcy5sZW5ndGggLSAyKSA/IGN1cnIoYWNjKGZldGNoRnVuY3Rpb24pKSA6IGN1cnIoKGFjYykpKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29uZmlnKCkge1xuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwge1xuXHRcdHVybDogJycsXG5cdFx0b3B0aW9uczoge30sXG5cdFx0Y2F0Y2hlcnM6IG5ldyBNYXAoKSxcblx0XHRyZXNvbHZlcnM6IFtdLFxuXHRcdG1pZGRsZXdhcmU6IFtdXG5cdH0pO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0Rm9ybVVybChmb3JtT2JqZWN0KSB7XG5cdHJldHVybiBPYmplY3Qua2V5cyhmb3JtT2JqZWN0KS5tYXAoa2V5ID0+XG5cdFx0ZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArXG5cdFx0YCR7IGVuY29kZVVSSUNvbXBvbmVudCh0eXBlb2YgZm9ybU9iamVjdFtrZXldID09PSBcIm9iamVjdFwiID9cblx0XHRcdEpTT04uc3RyaW5naWZ5KGZvcm1PYmplY3Rba2V5XSkgOiBmb3JtT2JqZWN0W2tleV0pIH1gKS5qb2luKFwiJlwiKVxufSIsImltcG9ydCBodHRwIGZyb20gJy4uL2xpYi9odHRwLmpzJztcblxuZGVzY3JpYmUoJ2h0dHAnLCAoKSA9PiB7XG5cdGl0KCdjcmVhdGUgaHR0cCcsICgpID0+IHtcblx0XHRjb25zdCBkZWxheU1pZGRsZXdhcmUgPSBkZWxheSA9PiBuZXh0ID0+ICh1cmwsIG9wdHMpID0+IHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dCgoKSA9PiByZXMobmV4dCh1cmwsIG9wdHMpKSwgZGVsYXkpKTtcblx0XHR9O1xuXG5cdFx0LyogTG9ncyBhbGwgcmVxdWVzdHMgcGFzc2luZyB0aHJvdWdoLiAqL1xuXHRcdGNvbnN0IGxvZ01pZGRsZXdhcmUgPSAoKSA9PiBuZXh0ID0+ICh1cmwsIG9wdHMpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKG9wdHMubWV0aG9kICsgXCJAXCIgKyB1cmwpO1xuXHRcdFx0cmV0dXJuIG5leHQodXJsLCBvcHRzKVxuXHRcdH07XG5cblx0XHRsZXQganNvbkFwaSA9IGh0dHAoKVxuXHRcdFx0Lmpzb24oKVxuXHRcdFx0Lm1vZGUoJ2NvcnMnKVxuXHRcdFx0Lm1pZGRsZXdhcmUoW2RlbGF5TWlkZGxld2FyZSgzMDAwKSwgbG9nTWlkZGxld2FyZSgpXSlcblx0XHRcdC5jcmVkZW50aWFscygnc2FtZS1vcmlnaW4nKVxuXHRcdFx0LmhlYWRlcnMoeydYLVJlcXVlc3RlZC1CeSc6ICdERUVQLVVJJ30pO1xuXG5cdFx0anNvbkFwaVxuXHRcdFx0LnVybCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdC5nZXQoKVxuXHRcdFx0Lmpzb24oZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG5cdFx0Ly8gYXNzZXJ0Lmluc3RhbmNlT2YoaHR0cCgpLCAnaHR0cCBpcyBpbnN0YW5jZSBvZiBIdHRwJyk7XG5cdH0pO1xufSk7XG4iLCIvKiAgKi9cblxubGV0IHByZXZUaW1lSWQgPSAwO1xubGV0IHByZXZVbmlxdWVJZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IChwcmVmaXgpID0+IHtcbiAgbGV0IG5ld1VuaXF1ZUlkID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5ld1VuaXF1ZUlkID09PSBwcmV2VGltZUlkKSB7XG4gICAgKytwcmV2VW5pcXVlSWQ7XG4gIH0gZWxzZSB7XG4gICAgcHJldlRpbWVJZCA9IG5ld1VuaXF1ZUlkO1xuICAgIHByZXZVbmlxdWVJZCA9IDA7XG4gIH1cblxuICBsZXQgdW5pcXVlSWQgPSBgJHtTdHJpbmcobmV3VW5pcXVlSWQpfSR7U3RyaW5nKHByZXZVbmlxdWVJZCl9YDtcbiAgaWYgKHByZWZpeCkge1xuICAgIHVuaXF1ZUlkID0gYCR7cHJlZml4fV8ke3VuaXF1ZUlkfWA7XG4gIH1cbiAgcmV0dXJuIHVuaXF1ZUlkO1xufTtcbiIsImltcG9ydCB7IGRnZXQsIGRzZXQsIGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0LmpzJztcbmltcG9ydCBpcyBmcm9tICcuL3R5cGUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdW5pcXVlSWQgZnJvbSAnLi91bmlxdWUtaWQuanMnO1xuXG5jb25zdCBtb2RlbCA9IChiYXNlQ2xhc3MgPSBjbGFzcyB7fSkgPT4ge1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgcmV0dXJuIGNsYXNzIE1vZGVsIGV4dGVuZHMgYmFzZUNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuX3N0YXRlS2V5ID0gdW5pcXVlSWQoJ19zdGF0ZScpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLl9zZXRTdGF0ZSh0aGlzLmRlZmF1bHRTdGF0ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBnZXQoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRTdGF0ZShhY2Nlc3Nvcik7XG4gICAgfVxuXG4gICAgc2V0KGFyZzEsIGFyZzIpIHtcbiAgICAgIC8vc3VwcG9ydHMgKGFjY2Vzc29yLCBzdGF0ZSkgT1IgKHN0YXRlKSBhcmd1bWVudHMgZm9yIHNldHRpbmcgdGhlIHdob2xlIHRoaW5nXG4gICAgICBsZXQgYWNjZXNzb3IsIHZhbHVlO1xuICAgICAgaWYgKCFpcy5zdHJpbmcoYXJnMSkgJiYgaXMudW5kZWZpbmVkKGFyZzIpKSB7XG4gICAgICAgIHZhbHVlID0gYXJnMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gYXJnMjtcbiAgICAgICAgYWNjZXNzb3IgPSBhcmcxO1xuICAgICAgfVxuICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgICAgIGxldCBuZXdTdGF0ZSA9IGpzb25DbG9uZShvbGRTdGF0ZSk7XG5cbiAgICAgIGlmIChhY2Nlc3Nvcikge1xuICAgICAgICBkc2V0KG5ld1N0YXRlLCBhY2Nlc3NvciwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U3RhdGUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKGFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY3JlYXRlU3Vic2NyaWJlcigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBzZWxmLl9zdWJzY3JpYmUoY29udGV4dCwgLi4uYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIC8vVE9ETzogaXMgb2ZmKCkgbmVlZGVkIGZvciBpbmRpdmlkdWFsIHN1YnNjcmlwdGlvbj9cbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcmVhdGVQcm9wZXJ0eUJpbmRlcihjb250ZXh0KSAtIGNvbnRleHQgbXVzdCBiZSBvYmplY3QnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uKGJpbmRSdWxlcykge1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiaW5kUnVsZXNbMF0pKSB7XG4gICAgICAgICAgICBiaW5kUnVsZXMgPSBbYmluZFJ1bGVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmluZFJ1bGVzLmZvckVhY2goYmluZFJ1bGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIGJpbmRSdWxlWzBdLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgIGRzZXQoY29udGV4dCwgYmluZFJ1bGVbMV0sIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRTdGF0ZShhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIGpzb25DbG9uZShhY2Nlc3NvciA/IGRnZXQocHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldLCBhY2Nlc3NvcikgOiBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0pO1xuICAgIH1cblxuICAgIF9zZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldID0gbmV3U3RhdGU7XG4gICAgfVxuXG4gICAgX3N1YnNjcmliZShjb250ZXh0LCBhY2Nlc3NvciwgY2IpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpYmVycy5nZXQoY29udGV4dCkgfHwgW107XG4gICAgICBzdWJzY3JpcHRpb25zLnB1c2goeyBhY2Nlc3NvciwgY2IgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5zZXQoY29udGV4dCwgc3Vic2NyaXB0aW9ucyk7XG4gICAgfVxuXG4gICAgX2Rlc3Ryb3lTdWJzY3JpYmVyKGNvbnRleHQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICB9XG5cbiAgICBfbm90aWZ5U3Vic2NyaWJlcnMoc2V0QWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbihzdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHsgYWNjZXNzb3IsIGNiIH0pIHtcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6J1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXouYmxheidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZihzZXRBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgYWNjZXNzb3IpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9lLmcuIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby4qJ1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKCcqJykgPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgZGVlcEFjY2Vzc29yID0gYWNjZXNzb3IucmVwbGFjZSgnLionLCAnJykucmVwbGFjZSgnKicsICcnKTtcbiAgICAgICAgICAgIGlmIChzZXRBY2Nlc3Nvci5pbmRleE9mKGRlZXBBY2Nlc3NvcikgPT09IDApIHtcbiAgICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgZGVlcEFjY2Vzc29yKSwgZGdldChvbGRTdGF0ZSwgZGVlcEFjY2Vzc29yKSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IG1vZGVsO1xuIiwiaW1wb3J0IG1vZGVsIGZyb20gJy4uL2xpYi9tb2RlbC5qcyc7XG5cbmNsYXNzIE1vZGVsIGV4dGVuZHMgbW9kZWwoKSB7XG5cdGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtmb286MX07XG4gIH1cbn1cblxuZGVzY3JpYmUoXCJNb2RlbCBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImRlZmF1bHRTdGF0ZSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXHRpdChcImdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCgnZm9vJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiAxXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJywyKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajInKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3aXRoIGFycmF5cyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW11cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcsJ2RvZycpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJykpLnRvLmVxdWFsKCdkb2cnKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMCcse2ZvbzoxfSk7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDEpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycsMik7XG5cdFx0Y2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcInN1YnNjcmlwdGlvbnMgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXHRcdGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZSkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZSkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdHRocm93KCdubyBzdWJzY3JpYmVyIHNob3VsZCBiZSBjYWxsZWQgZm9yIGRlZXBPYmoxJyk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEuKicsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHRjaGFpLmV4cGVjdChuZXdWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwodHJ1ZSk7XG5cdFx0XHRjaGFpLmV4cGVjdChvbGRWYWx1ZS5kZWVwT2JqMlswXS5zZWxlY3RlZCkudG8uZXF1YWwoZmFsc2UpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbC5zZXQoVEVTVF9TRUwsIHRydWUpO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaWJlcnMgY2FuIGJlIGRlc3Ryb3llZFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLlRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKG15TW9kZWwuVEVTVF9TRUwsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0dGhyb3cobmV3IEVycm9yKCdzaG91bGQgbm90IGJlIG9ic2VydmVkJykpO1xuXHRcdH0pO1xuXHRcdG15TW9kZWxTdWJzY3JpYmVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldChteU1vZGVsLlRFU1RfU0VMLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoXCJwcm9wZXJ0aWVzIGJvdW5kIGZyb20gbW9kZWwgdG8gY3VzdG9tIGVsZW1lbnRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblxuICAgIGxldCBteUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLW1peGluLXRlc3QnKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKHZhbHVlKSA9PiB7IHRoaXMucHJvcCA9IHZhbHVlOyB9KTtcbiAgICBvYnNlcnZlci5kZXN0cm95KCk7XG5cbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRlciA9IG15TW9kZWwuY3JlYXRlUHJvcGVydHlCaW5kZXIobXlFbGVtZW50KS5hZGRCaW5kaW5ncyhcbiAgICAgIFsnZm9vJywgJ3Byb3AnXVxuICAgICk7XG5cbiAgICBteU1vZGVsLnNldCgnZm9vJywgJzMnKTtcbiAgICBjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcbiAgICBwcm9wZXJ0eUJpbmRlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQoJ2ZvbycsICcyJyk7XG5cdFx0Y2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuXG5cblxuY29uc3QgZXZlbnRIdWJGYWN0b3J5ID0gKCkgPT4ge1xuICBjb25zdCBzdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN1YnNjcmliZXJDb3VudCA9IDA7XG5cbiAgLy8kRmxvd0ZpeE1lXG4gIHJldHVybiB7XG4gICAgcHVibGlzaDogZnVuY3Rpb24oZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goc3Vic2NyaXB0aW9ucyA9PiB7XG4gICAgICAgIChzdWJzY3JpcHRpb25zLmdldChldmVudCkgfHwgW10pLmZvckVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjcmVhdGVTdWJzY3JpYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVycy5oYXMoY29udGV4dCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnNldChjb250ZXh0LCBuZXcgTWFwKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpO1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlci5oYXMoZXZlbnQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLnNldChldmVudCwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVyLmdldChldmVudCkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAvLyRGbG93Rml4TWVcbiAgICAgICAgICBzdWJzY3JpYmVycy5nZXQoY29udGV4dCkuZGVsZXRlKGV2ZW50KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50SHViRmFjdG9yeTtcbiIsImltcG9ydCBldmVudEh1YkZhY3RvcnkgZnJvbSAnLi4vbGliL2V2ZW50LWh1Yi5qcyc7XG5cbmRlc2NyaWJlKFwiRXZlbnRIdWIgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJiYXNpYyBwdWIvc3ViIHdvcmtzXCIsIChkb25lKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaWJlcnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyMiA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpcHRpb25zIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDIpO1xuICAgICAgfSlcblxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInLCAyKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwiZGVzdHJveSgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1YlN1YnNjcmliZXIuZGVzdHJveSgpO1xuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMCk7XG5cdH0pO1xuXG4gIGl0KFwib2ZmKCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwodW5kZWZpbmVkKTtcbiAgICAgIH0pXG4gICAgICAub2ZmKCdmb28nKVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicpOyAgLy9zaG91bGQgY2FsbGVkXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblxufSk7XG4iXSwibmFtZXMiOlsidGVtcGxhdGUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImkiLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJpbm5lckhUTUwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJFcnJvciIsImRlc2NyaWJlIiwiaXQiLCJlbCIsImV4cGVjdCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwidG8iLCJlcXVhbCIsImFzc2VydCIsImluc3RhbmNlT2YiLCJOb2RlIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImRlZmluZVByb3BlcnR5IiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsImN1cnJIYW5kbGUiLCJjYWxsYmFja3MiLCJub2RlQ29udGVudCIsIm5vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJmbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJsYXN0SGFuZGxlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJtaWNyb1Rhc2siLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwiaGFuZGxlIiwicG9wIiwiUHJvcGVydGllc1Rlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsImN1c3RvbUVsZW1lbnQiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzVGVzdCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJsaXN0ZW5FdmVudCIsImlzT2siLCJldnQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJkaXNwYXRjaCIsIm9mZiIsImhhbmRsZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJzdG9wRXZlbnQiLCJjaGFpIiwiYSIsImRlZXAiLCJib2R5IiwiYXJyIiwiZm4iLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwic2V0dXAiLCJnZXRUeXBlIiwic3JjIiwiZ2V0U3JjVHlwZSIsIm1hdGNoZXMiLCJjaGVja3MiLCJjbG9uZSIsImNpcmN1bGFycyIsImNsb25lcyIsImlzIiwibnVsbCIsImlzUHJpbWl0aXZlIiwiZnVuY3Rpb24iLCJjbG9uZXIiLCJib29sZWFuIiwibnVtYmVyIiwic3RyaW5nIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwicmVxdWVzdCIsInJlc3BvbnNlIiwiaGVhZGVycyIsIkhlYWRlcnMiLCJibG9iIiwiQmxvYiIsIm9iamVjdCIsImtleSIsImlkeCIsImZpbmRJbmRleCIsImJlIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJyZXZpdmVyIiwiayIsInYiLCJqc29uQ2xvbmUiLCJ0aHJvdyIsIm5vdCIsImNsb25lZCIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsImRlZmF1bHRWYWx1ZSIsInBhcnRzIiwiZGVwdGgiLCJhcnJheVJlcGxhY2VTdHJhdGVneSIsInNvdXJjZSIsImZhY3RvcnkiLCJvcHRzIiwiYXJyYXlNZXJnZSIsInJlc3VsdCIsIm1lcmdlIiwibWVyZ2VyIiwiY29uY2F0IiwiSHR0cE1ldGhvZHMiLCJmcmVlemUiLCJHZXQiLCJQb3N0IiwiUHV0IiwiUGF0Y2giLCJEZWxldGUiLCJIdHRwIiwiY3JlYXRlQ29uZmlnIiwiSHR0cEVycm9yIiwic3RhdHVzIiwidXJsIiwiY2F0Y2hlciIsImVycm9ySWQiLCJjYXRjaGVycyIsIm1pZGRsZXdhcmUiLCJjbGVhciIsIm9wdGlvbnMiLCJtaXhpbiIsImhlYWRlclZhbHVlcyIsImFjY2VwdCIsImhlYWRlclZhbHVlIiwiQWNjZXB0IiwibW9kZSIsImNyZWRlbnRpYWxzIiwiY2FjaGUiLCJpbnRlZ3JpdHkiLCJrZWVwYWxpdmUiLCJyZWRpcmVjdCIsImNvbnRlbnRzIiwiYXV0aCIsIkF1dGhvcml6YXRpb24iLCJqc29uIiwiZm9ybSIsImNvbnZlcnRGb3JtVXJsIiwic2VuZCIsInBvc3QiLCJpbnNlcnQiLCJ1cGRhdGUiLCJkZWxldGUiLCJyZXNvbHZlcnMiLCJhcHBseU1pZGRsZXdhcmUiLCJmZXRjaCIsIndyYXBwZXIiLCJ0aGVuIiwib2siLCJkb0NhdGNoIiwicHJvbWlzZSIsImNhdGNoIiwiaGFzIiwid3JhcFR5cGVQYXJzZXIiLCJmdW5OYW1lIiwicmVzcG9uc2VDaGFpbiIsInJlcyIsInJlZHVjZSIsImNoYWluIiwiciIsIm1pZGRsZXdhcmVzIiwiZmV0Y2hGdW5jdGlvbiIsInJlZHVjZVJpZ2h0IiwiYWNjIiwiY3VyciIsImZvcm1PYmplY3QiLCJlbmNvZGVVUklDb21wb25lbnQiLCJiYWJlbEhlbHBlcnMudHlwZW9mIiwiam9pbiIsImRlbGF5TWlkZGxld2FyZSIsIlByb21pc2UiLCJuZXh0IiwiZGVsYXkiLCJsb2dNaWRkbGV3YXJlIiwianNvbkFwaSIsImh0dHAiLCJwcmV2VGltZUlkIiwicHJldlVuaXF1ZUlkIiwicHJlZml4IiwibmV3VW5pcXVlSWQiLCJub3ciLCJ1bmlxdWVJZCIsIm1vZGVsIiwic3Vic2NyaWJlckNvdW50IiwiX3N0YXRlS2V5IiwiX3N1YnNjcmliZXJzIiwiX3NldFN0YXRlIiwiZGVmYXVsdFN0YXRlIiwiYWNjZXNzb3IiLCJfZ2V0U3RhdGUiLCJhcmcxIiwiYXJnMiIsIm9sZFN0YXRlIiwibmV3U3RhdGUiLCJkc2V0IiwiX25vdGlmeVN1YnNjcmliZXJzIiwiY3JlYXRlU3Vic2NyaWJlciIsInNlbGYiLCJfc3Vic2NyaWJlIiwiZGVzdHJveSIsIl9kZXN0cm95U3Vic2NyaWJlciIsImNyZWF0ZVByb3BlcnR5QmluZGVyIiwiYWRkQmluZGluZ3MiLCJiaW5kUnVsZXMiLCJiaW5kUnVsZSIsImRnZXQiLCJzdWJzY3JpcHRpb25zIiwic2V0QWNjZXNzb3IiLCJzdWJzY3JpYmVycyIsImRlZXBBY2Nlc3NvciIsIk1vZGVsIiwiZm9vIiwibXlNb2RlbCIsImRlZXBPYmoxIiwiZGVlcE9iajIiLCJzZWxlY3RlZCIsIlRFU1RfU0VMIiwibXlNb2RlbFN1YnNjcmliZXIiLCJudW1DYWxsYmFja3NDYWxsZWQiLCJteUVsZW1lbnQiLCJwcm9wZXJ0eUJpbmRlciIsImV2ZW50SHViRmFjdG9yeSIsInB1Ymxpc2giLCJzdWJzY3JpYmVyIiwiZG9uZSIsIm15RXZlbnRIdWIiLCJteUV2ZW50SHViU3Vic2NyaWJlciIsIm15RXZlbnRIdWJTdWJzY3JpYmVyMiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0VBQUE7QUFDQSx5QkFBZSxVQUFDQSxRQUFELEVBQWM7RUFDM0IsTUFBSSxhQUFhQyxTQUFTQyxhQUFULENBQXVCLFVBQXZCLENBQWpCLEVBQXFEO0VBQ25ELFdBQU9ELFNBQVNFLFVBQVQsQ0FBb0JILFNBQVNJLE9BQTdCLEVBQXNDLElBQXRDLENBQVA7RUFDRDs7RUFFRCxNQUFJQyxXQUFXSixTQUFT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
