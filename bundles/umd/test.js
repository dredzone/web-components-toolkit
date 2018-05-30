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
      return typeof obj[key] !== 'undefined' ? obj[key] : defaultValue;
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
      return this.content('application/json').body(JSON.stringify(value));
    };

    Http.prototype.form = function form(value) {
      return this.body(convertFormUrl(value)).content('application/x-www-form-urlencoded');
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
      return encodeURIComponent(key) + '=' + ('' + encodeURIComponent(_typeof(formObject[key]) === 'object' ? JSON.stringify(formObject[key]) : formObject[key]));
    }).join('&');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9tZXJnZS5qcyIsIi4uLy4uL2xpYi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaHR0cC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHRlbXBsYXRlKSA9PiB7XG4gIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBsZXQgY2hpbGRyZW4gPSB0ZW1wbGF0ZS5jaGlsZE5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGRyZW5baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuIiwiLyogICovXG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn07XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvZG9tL2NyZWF0ZS1lbGVtZW50LmpzJztcblxuZGVzY3JpYmUoJ2NyZWF0ZS1lbGVtZW50JywgKCkgPT4ge1xuICBpdCgnY3JlYXRlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KGBcblx0XHRcdDxkaXYgY2xhc3M9XCJteS1jbGFzc1wiPkhlbGxvIFdvcmxkPC9kaXY+XG5cdFx0YCk7XG4gICAgZXhwZWN0KGVsLmNsYXNzTGlzdC5jb250YWlucygnbXktY2xhc3MnKSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgYXNzZXJ0Lmluc3RhbmNlT2YoZWwsIE5vZGUsICdlbGVtZW50IGlzIGluc3RhbmNlIG9mIG5vZGUnKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5sZXQgY3VyckhhbmRsZSA9IDA7XG5sZXQgbGFzdEhhbmRsZSA9IDA7XG5sZXQgY2FsbGJhY2tzID0gW107XG5sZXQgbm9kZUNvbnRlbnQgPSAwO1xubGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbi8qKlxuICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgIHRpbWluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSAoY2FsbGJhY2spID0+IHtcbiAgbm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhub2RlQ29udGVudCsrKTtcbiAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gY3VyckhhbmRsZSsrO1xufTtcblxuLyoqXG4gKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgYCBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICovXG5leHBvcnQgY29uc3QgY2FuY2VsID0gKGhhbmRsZSkgPT4ge1xuICBjb25zdCBpZHggPSBoYW5kbGUgLSBsYXN0SGFuZGxlO1xuICBpZiAoaWR4ID49IDApIHtcbiAgICBpZiAoIWNhbGxiYWNrc1tpZHhdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICB9XG4gICAgY2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICB9XG59O1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgKiBhcyBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0ICogYXMgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID0gdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGlzTnVtYmVyLCBpc0FycmF5LCBpc0Jvb2xlYW4sIGlzRGF0ZSwgaXNTdHJpbmcsIGlzT2JqZWN0IH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAoaXNBcnJheSA/IG51bGwgOiB7fSkgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0ICh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlID0gZmFsc2UpID0+IHtcbiAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNUZXN0LmRlZmluZSgncHJvcGVydGllcy10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdjdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNUZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNUZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc1Rlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc1Rlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc1Rlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9kb20tZXZlbnRzL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2N1c3RvbS1lbGVtZW50LWV2ZW50cycsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gW1xuICAnTWFwJyxcbiAgJ1NldCcsXG4gICdTeW1ib2wnLFxuICAnQXJyYXknLFxuICAnT2JqZWN0JyxcbiAgJ1N0cmluZycsXG4gICdEYXRlJyxcbiAgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsXG4gICdCb29sZWFuJyxcbiAgJ051bWJlcicsXG4gICdOdWxsJyxcbiAgJ1VuZGVmaW5lZCcsXG4gICdBcmd1bWVudHMnLFxuICAnRXJyb3InLFxuICAnUmVxdWVzdCcsXG4gICdSZXNwb25zZScsXG4gICdIZWFkZXJzJyxcbiAgJ0Jsb2InXG5dO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcblxuZXhwb3J0IGRlZmF1bHQgKHNldHVwKCkpO1xuXG5leHBvcnQgY29uc3QgZ2V0VHlwZSA9IChzcmMpID0+IGdldFNyY1R5cGUoc3JjKTtcblxuZnVuY3Rpb24gZ2V0U3JjVHlwZShzcmMpIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKHNyYyk7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IHNyYyA9PiBnZXRTcmNUeXBlKHNyYykgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGlzLCB7IGdldFR5cGUgfSBmcm9tICcuLi90eXBlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKHNyYykgPT4gY2xvbmUoc3JjLCBbXSwgW10pO1xuXG5mdW5jdGlvbiBjbG9uZShzcmMsIGNpcmN1bGFycyA9IFtdLCBjbG9uZXMgPSBbXSkge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmIChpcy51bmRlZmluZWQoc3JjKSB8fCBpcy5udWxsKHNyYykgfHwgaXNQcmltaXRpdmUoc3JjKSB8fCBpcy5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuICByZXR1cm4gY2xvbmVyKGdldFR5cGUoc3JjKSwgc3JjLCBjaXJjdWxhcnMsIGNsb25lcyk7XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHNyYykge1xuICByZXR1cm4gaXMuYm9vbGVhbihzcmMpIHx8IGlzLm51bWJlcihzcmMpIHx8IGlzLnN0cmluZyhzcmMpO1xufVxuXG5mdW5jdGlvbiBjbG9uZXIodHlwZSwgY29udGV4dCwgLi4uYXJncykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBkYXRlKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZ2V0VGltZSgpKTtcbiAgICB9LFxuICAgIHJlZ2V4cCgpIHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRoaXMpO1xuICAgIH0sXG4gICAgYXJyYXkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoY2xvbmUpO1xuICAgIH0sXG4gICAgbWFwKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbSh0aGlzLmVudHJpZXMoKSkpO1xuICAgIH0sXG4gICAgc2V0KCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbSh0aGlzLnZhbHVlcygpKSk7XG4gICAgfSxcbiAgICByZXF1ZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIHJlc3BvbnNlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIGhlYWRlcnMoKSB7XG4gICAgICBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgICBmb3IgKGxldCBbbmFtZSwgdmFsdWVdIG9mIHRoaXMuZW50cmllcykge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9LFxuICAgIGJsb2IoKSB7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW3RoaXNdLCB7IHR5cGU6IHRoaXMudHlwZSB9KTtcbiAgICB9LFxuICAgIG9iamVjdChjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgICAgIGNpcmN1bGFycy5wdXNoKHRoaXMpO1xuICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gdGhpc1trZXldKTtcbiAgICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfTtcbiAgaWYgKHR5cGUgaW4gaGFuZGxlcnMpIHtcbiAgICBjb25zdCBmbiA9IGhhbmRsZXJzW3R5cGVdO1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfVxuICByZXR1cm4gY29udGV4dDtcbn1cbiIsImltcG9ydCBjbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuXHRpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuXHRcdC8vIE51bGxcblx0XHRleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cblx0XHQvLyBVbmRlZmluZWRcblx0XHRleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG5cdFx0Ly8gRnVuY3Rpb25cblx0XHRjb25zdCBmdW5jID0gKCkgPT4ge307XG5cdFx0YXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cblx0XHQvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuXHR9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAodmFsdWUsIHJldml2ZXIgPSAoaywgdikgPT4gdikgPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSksIHJldml2ZXIpO1xuIiwiaW1wb3J0IGpzb25DbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnanNvbi1jbG9uZScsICgpID0+IHtcblx0aXQoJ25vbi1zZXJpYWxpemFibGUgdmFsdWVzIHRocm93JywgKCkgPT4ge1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0ZXhwZWN0KCgpID0+IGpzb25DbG9uZSh1bmRlZmluZWQpKS50by50aHJvdyhFcnJvcik7XG5cdH0pO1xuXG5cdGl0KCdwcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoJ29iamVjdCBjbG9uZWQnLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRleHBlY3QoanNvbkNsb25lKG9iaikpLm5vdC50by5iZS5lcXVhbChvYmopO1xuXHR9KTtcblxuXHRpdCgncmV2aXZlciBmdW5jdGlvbicsICgpID0+IHtcblx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdGNvbnN0IGNsb25lZCA9IGpzb25DbG9uZShvYmosIChrLCB2KSA9PiBrICE9PSAnJyA/IE51bWJlcih2KSAqIDIgOiB2KTtcblx0XHRleHBlY3QoY2xvbmVkLmEpLmVxdWFsKDQpO1xuXHR9KTtcbn0pOyIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9ialtrZXldICE9PSAndW5kZWZpbmVkJyA/IG9ialtrZXldIDogZGVmYXVsdFZhbHVlO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGxlbmd0aCA9IHBhcnRzLmxlbmd0aDtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0W3BhcnRzW2ldXTtcbiAgICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG9iamVjdCA9IGRlZmF1bHRWYWx1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChvYmosIGtleSwgdmFsdWUpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgZGVwdGggPSBwYXJ0cy5sZW5ndGggLSAxO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGVwdGg7IGkrKykge1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0W3BhcnRzW2ldXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG9iamVjdFtwYXJ0c1tpXV0gPSB7fTtcbiAgICB9XG4gICAgb2JqZWN0ID0gb2JqZWN0W3BhcnRzW2ldXTtcbiAgfVxuICBvYmplY3RbcGFydHNbZGVwdGhdXSA9IHZhbHVlO1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGlzLCB7IGdldFR5cGUgfSBmcm9tICcuLi90eXBlLmpzJztcbmltcG9ydCBjbG9uZSBmcm9tICcuL2Nsb25lLmpzJztcblxuXG5leHBvcnQgY29uc3QgYXJyYXlSZXBsYWNlU3RyYXRlZ3kgPSAoc291cmNlLCB0YXJnZXQpID0+IGNsb25lKHRhcmdldCk7XG5cbmV4cG9ydCBjb25zdCBmYWN0b3J5ID0gKG9wdHMgPSB7IGFycmF5TWVyZ2U6IGFycmF5UmVwbGFjZVN0cmF0ZWd5IH0pID0+IChcbiAgLi4uYXJnc1xuKSA9PiB7XG4gIGxldCByZXN1bHQ7XG5cbiAgZm9yIChsZXQgaSA9IGFyZ3MubGVuZ3RoOyBpID4gMDsgLS1pKSB7XG4gICAgcmVzdWx0ID0gbWVyZ2UoYXJncy5wb3AoKSwgcmVzdWx0LCBvcHRzKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmYWN0b3J5KCk7XG5cbmZ1bmN0aW9uIG1lcmdlKHNvdXJjZSwgdGFyZ2V0LCBvcHRzKSB7XG4gIGlmIChpcy51bmRlZmluZWQodGFyZ2V0KSkge1xuICAgIHJldHVybiBjbG9uZShzb3VyY2UpO1xuICB9XG5cbiAgbGV0IHR5cGUgPSBnZXRUeXBlKHNvdXJjZSk7XG4gIGlmICh0eXBlID09PSBnZXRUeXBlKHRhcmdldCkpIHtcbiAgICByZXR1cm4gbWVyZ2VyKHR5cGUsIHNvdXJjZSwgdGFyZ2V0LCBvcHRzKTtcbiAgfVxuICByZXR1cm4gY2xvbmUodGFyZ2V0KTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VyKHR5cGUsIHNvdXJjZSwgdGFyZ2V0LCBvcHRzKSB7XG4gIGNvbnN0IGhhbmRsZXJzID0ge1xuICAgIG9iamVjdCgpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuXG4gICAgICBjb25zdCBrZXlzID0ge1xuICAgICAgICBzb3VyY2U6IE9iamVjdC5rZXlzKHNvdXJjZSksXG4gICAgICAgIHRhcmdldDogT2JqZWN0LmtleXModGFyZ2V0KVxuICAgICAgfTtcblxuICAgICAga2V5cy5zb3VyY2UuY29uY2F0KGtleXMudGFyZ2V0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShzb3VyY2Vba2V5XSwgdGFyZ2V0W2tleV0sIG9wdHMpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGFycmF5KCkge1xuICAgICAgcmV0dXJuIG9wdHMuYXJyYXlNZXJnZS5hcHBseShudWxsLCBbc291cmNlLCB0YXJnZXRdKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGUgaW4gaGFuZGxlcnMpIHtcbiAgICByZXR1cm4gaGFuZGxlcnNbdHlwZV0oKTtcbiAgfVxuICByZXR1cm4gY2xvbmUodGFyZ2V0KTtcbn1cbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG8pID0+XG4gIE9iamVjdC5rZXlzKG8pLnJlZHVjZSgobSwgaykgPT4gbS5zZXQoaywgb1trXSksIG5ldyBNYXAoKSk7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgZGdldCB9IGZyb20gJy4vb2JqZWN0L2RnZXQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkc2V0IH0gZnJvbSAnLi9vYmplY3QvZHNldC5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGNsb25lIH0gZnJvbSAnLi9vYmplY3QvY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBtZXJnZSB9IGZyb20gJy4vb2JqZWN0L21lcmdlLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMganNvbkNsb25lIH0gZnJvbSAnLi9vYmplY3QvanNvbi1jbG9uZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIG9iamVjdFRvTWFwIH0gZnJvbSAnLi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IHsgY2xvbmUsIG1lcmdlIH0gZnJvbSAnLi9vYmplY3QuanMnO1xuXG5cblxuXG5cblxuXG5leHBvcnQgY29uc3QgSHR0cE1ldGhvZHMgPSBPYmplY3QuZnJlZXplKHtcbiAgR2V0OiAnR0VUJyxcbiAgUG9zdDogJ1BPU1QnLFxuICBQdXQ6ICdQVVQnLFxuICBQYXRjaDogJ1BBVENIJyxcbiAgRGVsZXRlOiAnREVMRVRFJ1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IG5ldyBIdHRwKGNyZWF0ZUNvbmZpZygpKTtcblxuY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbmNsYXNzIEh0dHBFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocmVzcG9uc2UpIHtcbiAgICBzdXBlcihgJHtyZXNwb25zZS5zdGF0dXN9IGZvciAke3Jlc3BvbnNlLnVybH1gKTtcbiAgICB0aGlzLm5hbWUgPSAnSHR0cEVycm9yJztcbiAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIH1cbn1cblxuY2xhc3MgSHR0cCB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGNhdGNoZXIoZXJyb3JJZCwgY2F0Y2hlcikge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLmNhdGNoZXJzLnNldChlcnJvcklkLCBjYXRjaGVyKTtcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIG1pZGRsZXdhcmUobWlkZGxld2FyZSwgY2xlYXIgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLm1pZGRsZXdhcmUgPSBjbGVhciA/IG1pZGRsZXdhcmUgOiBjb25maWcubWlkZGxld2FyZS5jb25jYXQobWlkZGxld2FyZSk7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICB1cmwodXJsLCByZXBsYWNlID0gZmFsc2UpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy51cmwgPSByZXBsYWNlID8gdXJsIDogY29uZmlnLnVybCArIHVybDtcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIG9wdGlvbnMob3B0aW9ucywgbWl4aW4gPSB0cnVlKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcub3B0aW9ucyA9IG1peGluID8gbWVyZ2UoY29uZmlnLm9wdGlvbnMsIG9wdGlvbnMpIDogT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBoZWFkZXJzKGhlYWRlclZhbHVlcykge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLm9wdGlvbnMuaGVhZGVycyA9IG1lcmdlKGNvbmZpZy5vcHRpb25zLmhlYWRlcnMsIGhlYWRlclZhbHVlcyk7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBhY2NlcHQoaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzKHsgQWNjZXB0OiBoZWFkZXJWYWx1ZSB9KTtcbiAgfVxuXG4gIGNvbnRlbnQoaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzKHsgJ0NvbnRlbnQtVHlwZSc6IGhlYWRlclZhbHVlIH0pO1xuICB9XG5cbiAgbW9kZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBtb2RlOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGNyZWRlbnRpYWxzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IGNyZWRlbnRpYWxzOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGNhY2hlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IGNhY2hlOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGludGVncml0eSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBpbnRlZ3JpdHk6IHZhbHVlIH0pO1xuICB9XG5cbiAga2VlcGFsaXZlKHZhbHVlID0gdHJ1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBrZWVwYWxpdmU6IHZhbHVlIH0pO1xuICB9XG5cbiAgcmVkaXJlY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgcmVkaXJlY3Q6IHZhbHVlIH0pO1xuICB9XG5cbiAgYm9keShjb250ZW50cykge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLm9wdGlvbnMuYm9keSA9IGNvbnRlbnRzO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgYXV0aChoZWFkZXJWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhlYWRlcnMoeyBBdXRob3JpemF0aW9uOiBoZWFkZXJWYWx1ZSB9KTtcbiAgfVxuXG4gIGpzb24odmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZW50KCdhcHBsaWNhdGlvbi9qc29uJykuYm9keShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9XG5cbiAgZm9ybSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmJvZHkoY29udmVydEZvcm1VcmwodmFsdWUpKS5jb250ZW50KCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgfVxuXG4gIG1ldGhvZCh2YWx1ZSA9IEh0dHBNZXRob2RzLkdldCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBtZXRob2Q6IHZhbHVlIH0pO1xuICB9XG5cbiAgZ2V0KCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5HZXQpLnNlbmQoKTtcbiAgfVxuXG4gIHBvc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLlBvc3QpLnNlbmQoKTtcbiAgfVxuXG4gIGluc2VydCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuUHV0KS5zZW5kKCk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLlBhdGNoKS5zZW5kKCk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLkRlbGV0ZSkuc2VuZCgpO1xuICB9XG5cbiAgc2VuZCgpIHtcbiAgICBjb25zdCB7IHVybCwgb3B0aW9ucywgbWlkZGxld2FyZSwgcmVzb2x2ZXJzLCBjYXRjaGVycyB9ID0gcHJpdmF0ZXModGhpcykuY29uZmlnO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBhcHBseU1pZGRsZXdhcmUobWlkZGxld2FyZSkoZmV0Y2gpO1xuICAgIGNvbnN0IHdyYXBwZXIgPSByZXF1ZXN0KHVybCwgb3B0aW9ucykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEh0dHBFcnJvcihyZXNwb25zZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSk7XG5cbiAgICBjb25zdCBkb0NhdGNoID0gKHByb21pc2UpID0+IHtcbiAgICAgIHJldHVybiBwcm9taXNlLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChjYXRjaGVycy5oYXMoZXJyLnN0YXR1cykpIHtcbiAgICAgICAgICByZXR1cm4gY2F0Y2hlcnMuZ2V0KGVyci5zdGF0dXMpKGVyciwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhdGNoZXJzLmhhcyhlcnIubmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gY2F0Y2hlcnMuZ2V0KGVyci5uYW1lKShlcnIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCB3cmFwVHlwZVBhcnNlciA9IChmdW5OYW1lKSA9PiAoY2IpID0+XG4gICAgICBmdW5OYW1lXG4gICAgICAgID8gZG9DYXRjaChcbiAgICAgICAgICAgIHdyYXBwZXJcbiAgICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZSAmJiByZXNwb25zZVtmdW5OYW1lXSgpKVxuICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiAocmVzcG9uc2UgJiYgY2IgJiYgY2IocmVzcG9uc2UpKSB8fCByZXNwb25zZSlcbiAgICAgICAgICApXG4gICAgICAgIDogZG9DYXRjaCh3cmFwcGVyLnRoZW4ocmVzcG9uc2UgPT4gKHJlc3BvbnNlICYmIGNiICYmIGNiKHJlc3BvbnNlKSkgfHwgcmVzcG9uc2UpKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlQ2hhaW4gPSB7XG4gICAgICByZXM6IHdyYXBUeXBlUGFyc2VyKG51bGwpLFxuICAgICAganNvbjogd3JhcFR5cGVQYXJzZXIoJ2pzb24nKVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVzb2x2ZXJzLnJlZHVjZSgoY2hhaW4sIHIpID0+IHIoY2hhaW4sIG9wdGlvbnMpLCByZXNwb25zZUNoYWluKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUobWlkZGxld2FyZXMpIHtcbiAgcmV0dXJuIChmZXRjaEZ1bmN0aW9uKSA9PiB7XG4gICAgaWYgKG1pZGRsZXdhcmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZldGNoRnVuY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKG1pZGRsZXdhcmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG1pZGRsZXdhcmVzWzBdKGZldGNoRnVuY3Rpb24pO1xuICAgIH1cblxuICAgIHJldHVybiAobWlkZGxld2FyZXMucmVkdWNlUmlnaHQoXG4gICAgICAoYWNjLCBjdXJyLCBpZHgpID0+IChpZHggPT09IG1pZGRsZXdhcmVzLmxlbmd0aCAtIDIgPyBjdXJyKGFjYyhmZXRjaEZ1bmN0aW9uKSkgOiBjdXJyKChhY2MpKSlcbiAgICApKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29uZmlnKCkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICB7XG4gICAgICB1cmw6ICcnLFxuICAgICAgb3B0aW9uczoge30sXG4gICAgICBjYXRjaGVyczogbmV3IE1hcCgpLFxuICAgICAgcmVzb2x2ZXJzOiBbXSxcbiAgICAgIG1pZGRsZXdhcmU6IFtdXG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0Rm9ybVVybChmb3JtT2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhmb3JtT2JqZWN0KVxuICAgIC5tYXAoXG4gICAgICBrZXkgPT5cbiAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgK1xuICAgICAgICAnPScgK1xuICAgICAgICBgJHtlbmNvZGVVUklDb21wb25lbnQodHlwZW9mIGZvcm1PYmplY3Rba2V5XSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShmb3JtT2JqZWN0W2tleV0pIDogZm9ybU9iamVjdFtrZXldKX1gXG4gICAgKVxuICAgIC5qb2luKCcmJyk7XG59XG4iLCJpbXBvcnQgaHR0cCBmcm9tICcuLi9saWIvaHR0cC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwJywgKCkgPT4ge1xuXHRpdCgnY3JlYXRlIGh0dHAnLCAoKSA9PiB7XG5cdFx0Y29uc3QgZGVsYXlNaWRkbGV3YXJlID0gZGVsYXkgPT4gbmV4dCA9PiAodXJsLCBvcHRzKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQoKCkgPT4gcmVzKG5leHQodXJsLCBvcHRzKSksIGRlbGF5KSk7XG5cdFx0fTtcblxuXHRcdC8qIExvZ3MgYWxsIHJlcXVlc3RzIHBhc3NpbmcgdGhyb3VnaC4gKi9cblx0XHRjb25zdCBsb2dNaWRkbGV3YXJlID0gKCkgPT4gbmV4dCA9PiAodXJsLCBvcHRzKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhvcHRzLm1ldGhvZCArIFwiQFwiICsgdXJsKTtcblx0XHRcdHJldHVybiBuZXh0KHVybCwgb3B0cylcblx0XHR9O1xuXG5cdFx0bGV0IGpzb25BcGkgPSBodHRwKClcblx0XHRcdC5qc29uKClcblx0XHRcdC5tb2RlKCdjb3JzJylcblx0XHRcdC5taWRkbGV3YXJlKFtkZWxheU1pZGRsZXdhcmUoMzAwMCksIGxvZ01pZGRsZXdhcmUoKV0pXG5cdFx0XHQuY3JlZGVudGlhbHMoJ3NhbWUtb3JpZ2luJylcblx0XHRcdC5oZWFkZXJzKHsnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSSd9KTtcblxuXHRcdGpzb25BcGlcblx0XHRcdC51cmwoJy9odHRwLWNsaWVudC1nZXQtdGVzdCcpXG5cdFx0XHQuZ2V0KClcblx0XHRcdC5qc29uKGRhdGEgPT4gY29uc29sZS5sb2coZGF0YSkpO1xuXHRcdC8vIGFzc2VydC5pbnN0YW5jZU9mKGh0dHAoKSwgJ2h0dHAgaXMgaW5zdGFuY2Ugb2YgSHR0cCcpO1xuXHR9KTtcbn0pO1xuIiwiLyogICovXG5cbmxldCBwcmV2VGltZUlkID0gMDtcbmxldCBwcmV2VW5pcXVlSWQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCAocHJlZml4KSA9PiB7XG4gIGxldCBuZXdVbmlxdWVJZCA9IERhdGUubm93KCk7XG4gIGlmIChuZXdVbmlxdWVJZCA9PT0gcHJldlRpbWVJZCkge1xuICAgICsrcHJldlVuaXF1ZUlkO1xuICB9IGVsc2Uge1xuICAgIHByZXZUaW1lSWQgPSBuZXdVbmlxdWVJZDtcbiAgICBwcmV2VW5pcXVlSWQgPSAwO1xuICB9XG5cbiAgbGV0IHVuaXF1ZUlkID0gYCR7U3RyaW5nKG5ld1VuaXF1ZUlkKX0ke1N0cmluZyhwcmV2VW5pcXVlSWQpfWA7XG4gIGlmIChwcmVmaXgpIHtcbiAgICB1bmlxdWVJZCA9IGAke3ByZWZpeH1fJHt1bmlxdWVJZH1gO1xuICB9XG4gIHJldHVybiB1bmlxdWVJZDtcbn07XG4iLCJpbXBvcnQgeyBkZ2V0LCBkc2V0LCBqc29uQ2xvbmUgfSBmcm9tICcuL29iamVjdC5qcyc7XG5pbXBvcnQgaXMgZnJvbSAnLi90eXBlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4vdW5pcXVlLWlkLmpzJztcblxuY29uc3QgbW9kZWwgPSAoYmFzZUNsYXNzID0gY2xhc3Mge30pID0+IHtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIHJldHVybiBjbGFzcyBNb2RlbCBleHRlbmRzIGJhc2VDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLl9zdGF0ZUtleSA9IHVuaXF1ZUlkKCdfc3RhdGUnKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fc2V0U3RhdGUodGhpcy5kZWZhdWx0U3RhdGUpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgZ2V0KGFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdGUoYWNjZXNzb3IpO1xuICAgIH1cblxuICAgIHNldChhcmcxLCBhcmcyKSB7XG4gICAgICAvL3N1cHBvcnRzIChhY2Nlc3Nvciwgc3RhdGUpIE9SIChzdGF0ZSkgYXJndW1lbnRzIGZvciBzZXR0aW5nIHRoZSB3aG9sZSB0aGluZ1xuICAgICAgbGV0IGFjY2Vzc29yLCB2YWx1ZTtcbiAgICAgIGlmICghaXMuc3RyaW5nKGFyZzEpICYmIGlzLnVuZGVmaW5lZChhcmcyKSkge1xuICAgICAgICB2YWx1ZSA9IGFyZzE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFyZzI7XG4gICAgICAgIGFjY2Vzc29yID0gYXJnMTtcbiAgICAgIH1cbiAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMuX2dldFN0YXRlKCk7XG4gICAgICBsZXQgbmV3U3RhdGUgPSBqc29uQ2xvbmUob2xkU3RhdGUpO1xuXG4gICAgICBpZiAoYWNjZXNzb3IpIHtcbiAgICAgICAgZHNldChuZXdTdGF0ZSwgYWNjZXNzb3IsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1N0YXRlID0gdmFsdWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyhhY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZVN1YnNjcmliZXIoKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICAvL1RPRE86IGlzIG9mZigpIG5lZWRlZCBmb3IgaW5kaXZpZHVhbCBzdWJzY3JpcHRpb24/XG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkgLSBjb250ZXh0IG11c3QgYmUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFkZEJpbmRpbmdzOiBmdW5jdGlvbihiaW5kUnVsZXMpIHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmluZFJ1bGVzWzBdKSkge1xuICAgICAgICAgICAgYmluZFJ1bGVzID0gW2JpbmRSdWxlc107XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpbmRSdWxlcy5mb3JFYWNoKGJpbmRSdWxlID0+IHtcbiAgICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCBiaW5kUnVsZVswXSwgdmFsdWUgPT4ge1xuICAgICAgICAgICAgICBkc2V0KGNvbnRleHQsIGJpbmRSdWxlWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBfZ2V0U3RhdGUoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiBqc29uQ2xvbmUoYWNjZXNzb3IgPyBkZ2V0KHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSwgYWNjZXNzb3IpIDogcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldKTtcbiAgICB9XG5cbiAgICBfc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgIHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSA9IG5ld1N0YXRlO1xuICAgIH1cblxuICAgIF9zdWJzY3JpYmUoY29udGV4dCwgYWNjZXNzb3IsIGNiKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpIHx8IFtdO1xuICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHsgYWNjZXNzb3IsIGNiIH0pO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIHN1YnNjcmlwdGlvbnMpO1xuICAgIH1cblxuICAgIF9kZXN0cm95U3Vic2NyaWJlcihjb250ZXh0KSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgfVxuXG4gICAgX25vdGlmeVN1YnNjcmliZXJzKHNldEFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oc3Vic2NyaWJlcnMpIHtcbiAgICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbih7IGFjY2Vzc29yLCBjYiB9KSB7XG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJheidcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6LmJsYXonXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2Yoc2V0QWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBhY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGFjY2Vzc29yKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vZS5nLiBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uKidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZignKicpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZXBBY2Nlc3NvciA9IGFjY2Vzc29yLnJlcGxhY2UoJy4qJywgJycpLnJlcGxhY2UoJyonLCAnJyk7XG4gICAgICAgICAgICBpZiAoc2V0QWNjZXNzb3IuaW5kZXhPZihkZWVwQWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGRlZXBBY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGRlZXBBY2Nlc3NvcikpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCBtb2RlbDtcbiIsImltcG9ydCBtb2RlbCBmcm9tICcuLi9saWIvbW9kZWwuanMnO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIG1vZGVsKCkge1xuXHRnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgIHJldHVybiB7Zm9vOjF9O1xuICB9XG59XG5cbmRlc2NyaWJlKFwiTW9kZWwgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJkZWZhdWx0U3RhdGUgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblx0aXQoXCJnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoJ2ZvbycsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogMVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMicsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd2l0aCBhcnJheXMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFtdXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLCdkb2cnKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMCcpKS50by5lcXVhbCgnZG9nJyk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLHtmb286MX0pO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgxKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nLDIpO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpcHRpb25zIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNvbnN0IFRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblx0XHRsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKFRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMScsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHR0aHJvdygnbm8gc3Vic2NyaWJlciBzaG91bGQgYmUgY2FsbGVkIGZvciBkZWVwT2JqMScpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxLionLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWwuc2V0KFRFU1RfU0VMLCB0cnVlKTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0Y2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblxuXHR9KTtcblxuXHRpdChcInN1YnNjcmliZXJzIGNhbiBiZSBkZXN0cm95ZWRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5URVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihteU1vZGVsLlRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdHRocm93KG5ldyBFcnJvcignc2hvdWxkIG5vdCBiZSBvYnNlcnZlZCcpKTtcblx0XHR9KTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQobXlNb2RlbC5URVNUX1NFTCwgdHJ1ZSk7XG5cdH0pO1xuXG5cdGl0KFwicHJvcGVydGllcyBib3VuZCBmcm9tIG1vZGVsIHRvIGN1c3RvbSBlbGVtZW50XCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cbiAgICBsZXQgbXlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsICh2YWx1ZSkgPT4geyB0aGlzLnByb3AgPSB2YWx1ZTsgfSk7XG4gICAgb2JzZXJ2ZXIuZGVzdHJveSgpO1xuXG4gICAgY29uc3QgcHJvcGVydHlCaW5kZXIgPSBteU1vZGVsLmNyZWF0ZVByb3BlcnR5QmluZGVyKG15RWxlbWVudCkuYWRkQmluZGluZ3MoXG4gICAgICBbJ2ZvbycsICdwcm9wJ11cbiAgICApO1xuXG4gICAgbXlNb2RlbC5zZXQoJ2ZvbycsICczJyk7XG4gICAgY2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG4gICAgcHJvcGVydHlCaW5kZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KCdmb28nLCAnMicpO1xuXHRcdGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuXHR9KTtcblxufSk7XG4iLCIvKiAgKi9cblxuXG5cbmNvbnN0IGV2ZW50SHViRmFjdG9yeSA9ICgpID0+IHtcbiAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIC8vJEZsb3dGaXhNZVxuICByZXR1cm4ge1xuICAgIHB1Ymxpc2g6IGZ1bmN0aW9uKGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKHN1YnNjcmlwdGlvbnMgPT4ge1xuICAgICAgICAoc3Vic2NyaXB0aW9ucy5nZXQoZXZlbnQpIHx8IFtdKS5mb3JFYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY3JlYXRlU3Vic2NyaWJlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlcnMuaGFzKGNvbnRleHQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5zZXQoY29udGV4dCwgbmV3IE1hcCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgY29uc3Qgc3Vic2NyaWJlciA9IHN1YnNjcmliZXJzLmdldChjb250ZXh0KTtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXIuaGFzKGV2ZW50KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5zZXQoZXZlbnQsIFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlci5nZXQoZXZlbnQpLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpLmRlbGV0ZShldmVudCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBldmVudEh1YkZhY3Rvcnk7XG4iLCJpbXBvcnQgZXZlbnRIdWJGYWN0b3J5IGZyb20gJy4uL2xpYi9ldmVudC1odWIuanMnO1xuXG5kZXNjcmliZShcIkV2ZW50SHViIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiYmFzaWMgcHViL3N1YiB3b3Jrc1wiLCAoZG9uZSkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmliZXJzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlcjIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaXB0aW9ucyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgyKTtcbiAgICAgIH0pXG5cbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJywgMik7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcImRlc3Ryb3koKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWJTdWJzY3JpYmVyLmRlc3Ryb3koKTtcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDApO1xuXHR9KTtcblxuICBpdChcIm9mZigpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKHVuZGVmaW5lZCk7XG4gICAgICB9KVxuICAgICAgLm9mZignZm9vJylcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInKTsgIC8vc2hvdWxkIGNhbGxlZFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cbn0pO1xuIl0sIm5hbWVzIjpbInRlbXBsYXRlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJpIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJodG1sIiwiaW5uZXJIVE1MIiwidHJpbSIsImZyYWciLCJ0ZW1wbGF0ZUNvbnRlbnQiLCJmaXJzdENoaWxkIiwiRXJyb3IiLCJkZXNjcmliZSIsIml0IiwiZWwiLCJleHBlY3QiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInRvIiwiZXF1YWwiLCJhc3NlcnQiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJkZWZpbmVQcm9wZXJ0eSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJjdXJySGFuZGxlIiwiY2FsbGJhY2tzIiwibm9kZUNvbnRlbnQiLCJub2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwiZmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwibGFzdEhhbmRsZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwibWljcm9UYXNrIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJuYW1lIiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYmVmb3JlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwiZGF0YSIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwibWFwIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsImhhbmRsZSIsInBvcCIsIlByb3BlcnRpZXNUZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiY29udGFpbmVyIiwicHJvcGVydGllc1Rlc3QiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImEiLCJkZWVwIiwiYm9keSIsImFyciIsImZuIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsInNldHVwIiwiZ2V0VHlwZSIsInNyYyIsImdldFNyY1R5cGUiLCJtYXRjaGVzIiwiY2hlY2tzIiwiY2xvbmUiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJpcyIsIm51bGwiLCJpc1ByaW1pdGl2ZSIsImZ1bmN0aW9uIiwiY2xvbmVyIiwiYm9vbGVhbiIsIm51bWJlciIsInN0cmluZyIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsInJlcXVlc3QiLCJyZXNwb25zZSIsImhlYWRlcnMiLCJIZWFkZXJzIiwiYmxvYiIsIkJsb2IiLCJvYmplY3QiLCJrZXkiLCJpZHgiLCJmaW5kSW5kZXgiLCJiZSIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwicmV2aXZlciIsImsiLCJ2IiwianNvbkNsb25lIiwidGhyb3ciLCJub3QiLCJjbG9uZWQiLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJkZWZhdWx0VmFsdWUiLCJwYXJ0cyIsImRlcHRoIiwiYXJyYXlSZXBsYWNlU3RyYXRlZ3kiLCJzb3VyY2UiLCJmYWN0b3J5Iiwib3B0cyIsImFycmF5TWVyZ2UiLCJyZXN1bHQiLCJtZXJnZSIsIm1lcmdlciIsImNvbmNhdCIsIkh0dHBNZXRob2RzIiwiZnJlZXplIiwiR2V0IiwiUG9zdCIsIlB1dCIsIlBhdGNoIiwiRGVsZXRlIiwiSHR0cCIsImNyZWF0ZUNvbmZpZyIsIkh0dHBFcnJvciIsInN0YXR1cyIsInVybCIsImNhdGNoZXIiLCJlcnJvcklkIiwiY2F0Y2hlcnMiLCJtaWRkbGV3YXJlIiwiY2xlYXIiLCJvcHRpb25zIiwibWl4aW4iLCJoZWFkZXJWYWx1ZXMiLCJhY2NlcHQiLCJoZWFkZXJWYWx1ZSIsIkFjY2VwdCIsIm1vZGUiLCJjcmVkZW50aWFscyIsImNhY2hlIiwiaW50ZWdyaXR5Iiwia2VlcGFsaXZlIiwicmVkaXJlY3QiLCJjb250ZW50cyIsImF1dGgiLCJBdXRob3JpemF0aW9uIiwianNvbiIsImZvcm0iLCJjb252ZXJ0Rm9ybVVybCIsInNlbmQiLCJwb3N0IiwiaW5zZXJ0IiwidXBkYXRlIiwiZGVsZXRlIiwicmVzb2x2ZXJzIiwiYXBwbHlNaWRkbGV3YXJlIiwiZmV0Y2giLCJ3cmFwcGVyIiwidGhlbiIsIm9rIiwiZG9DYXRjaCIsInByb21pc2UiLCJjYXRjaCIsImhhcyIsIndyYXBUeXBlUGFyc2VyIiwiZnVuTmFtZSIsInJlc3BvbnNlQ2hhaW4iLCJyZXMiLCJyZWR1Y2UiLCJjaGFpbiIsInIiLCJtaWRkbGV3YXJlcyIsImZldGNoRnVuY3Rpb24iLCJyZWR1Y2VSaWdodCIsImFjYyIsImN1cnIiLCJmb3JtT2JqZWN0IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYmFiZWxIZWxwZXJzLnR5cGVvZiIsImpvaW4iLCJkZWxheU1pZGRsZXdhcmUiLCJQcm9taXNlIiwibmV4dCIsImRlbGF5IiwibG9nTWlkZGxld2FyZSIsImpzb25BcGkiLCJodHRwIiwicHJldlRpbWVJZCIsInByZXZVbmlxdWVJZCIsInByZWZpeCIsIm5ld1VuaXF1ZUlkIiwibm93IiwidW5pcXVlSWQiLCJtb2RlbCIsInN1YnNjcmliZXJDb3VudCIsIl9zdGF0ZUtleSIsIl9zdWJzY3JpYmVycyIsIl9zZXRTdGF0ZSIsImRlZmF1bHRTdGF0ZSIsImFjY2Vzc29yIiwiX2dldFN0YXRlIiwiYXJnMSIsImFyZzIiLCJvbGRTdGF0ZSIsIm5ld1N0YXRlIiwiZHNldCIsIl9ub3RpZnlTdWJzY3JpYmVycyIsImNyZWF0ZVN1YnNjcmliZXIiLCJzZWxmIiwiX3N1YnNjcmliZSIsImRlc3Ryb3kiLCJfZGVzdHJveVN1YnNjcmliZXIiLCJjcmVhdGVQcm9wZXJ0eUJpbmRlciIsImFkZEJpbmRpbmdzIiwiYmluZFJ1bGVzIiwiYmluZFJ1bGUiLCJkZ2V0Iiwic3Vic2NyaXB0aW9ucyIsInNldEFjY2Vzc29yIiwic3Vic2NyaWJlcnMiLCJkZWVwQWNjZXNzb3IiLCJNb2RlbCIsImZvbyIsIm15TW9kZWwiLCJkZWVwT2JqMSIsImRlZXBPYmoyIiwic2VsZWN0ZWQiLCJURVNUX1NFTCIsIm15TW9kZWxTdWJzY3JpYmVyIiwibnVtQ2FsbGJhY2tzQ2FsbGVkIiwibXlFbGVtZW50IiwicHJvcGVydHlCaW5kZXIiLCJldmVudEh1YkZhY3RvcnkiLCJwdWJsaXNoIiwic3Vic2NyaWJlciIsImRvbmUiLCJteUV2ZW50SHViIiwibXlFdmVudEh1YlN1YnNjcmliZXIiLCJteUV2ZW50SHViU3Vic2NyaWJlcjIiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBO0FBQ0EseUJBQWUsVUFBQ0EsUUFBRCxFQUFjO0VBQzNCLE1BQUksYUFBYUMsU0FBU0MsYUFBVCxDQUF1QixVQUF2QixDQUFqQixFQUFxRDtFQUNuRCxXQUFPRCxTQUFTRSxVQUFULENBQW9CSCxTQUFTSSxPQUE3QixFQUFzQyxJQUF0QyxDQUFQO0VBQ0Q7O0VB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
