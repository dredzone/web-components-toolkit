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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9tZXJnZS5qcyIsIi4uLy4uL2xpYi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaHR0cC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC5qcyIsIi4uLy4uL2xpYi91bmlxdWUtaWQuanMiLCIuLi8uLi9saWIvbW9kZWwuanMiLCIuLi8uLi90ZXN0L21vZGVsLmpzIiwiLi4vLi4vbGliL2V2ZW50LWh1Yi5qcyIsIi4uLy4uL3Rlc3QvZXZlbnQtaHViLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHRlbXBsYXRlKSA9PiB7XG4gIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICB9XG5cbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBsZXQgY2hpbGRyZW4gPSB0ZW1wbGF0ZS5jaGlsZE5vZGVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2hpbGRyZW5baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICByZXR1cm4gZnJhZ21lbnQ7XG59O1xuIiwiLyogICovXG5pbXBvcnQgdGVtcGxhdGVDb250ZW50IGZyb20gJy4vdGVtcGxhdGUtY29udGVudC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChodG1sKSA9PiB7XG4gIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbC50cmltKCk7XG4gIGNvbnN0IGZyYWcgPSB0ZW1wbGF0ZUNvbnRlbnQodGVtcGxhdGUpO1xuICBpZiAoZnJhZyAmJiBmcmFnLmZpcnN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZnJhZy5maXJzdENoaWxkO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNyZWF0ZUVsZW1lbnQgZm9yICR7aHRtbH1gKTtcbn07XG4iLCJpbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuLi8uLi9saWIvZG9tL2NyZWF0ZS1lbGVtZW50LmpzJztcblxuZGVzY3JpYmUoJ2NyZWF0ZS1lbGVtZW50JywgKCkgPT4ge1xuICBpdCgnY3JlYXRlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgZWwgPSBjcmVhdGVFbGVtZW50KGBcblx0XHRcdDxkaXYgY2xhc3M9XCJteS1jbGFzc1wiPkhlbGxvIFdvcmxkPC9kaXY+XG5cdFx0YCk7XG4gICAgZXhwZWN0KGVsLmNsYXNzTGlzdC5jb250YWlucygnbXktY2xhc3MnKSkudG8uZXF1YWwodHJ1ZSk7XG4gICAgYXNzZXJ0Lmluc3RhbmNlT2YoZWwsIE5vZGUsICdlbGVtZW50IGlzIGluc3RhbmNlIG9mIG5vZGUnKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGNyZWF0b3IgPSBPYmplY3QuY3JlYXRlLmJpbmQobnVsbCwgbnVsbCwge30pKSA9PiB7XG4gIGxldCBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHJldHVybiAob2JqKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3RvcmUuZ2V0KG9iaik7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgc3RvcmUuc2V0KG9iaiwgKHZhbHVlID0gY3JlYXRvcihvYmopKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGFyZ3MudW5zaGlmdChtZXRob2QpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5sZXQgY3VyckhhbmRsZSA9IDA7XG5sZXQgbGFzdEhhbmRsZSA9IDA7XG5sZXQgY2FsbGJhY2tzID0gW107XG5sZXQgbm9kZUNvbnRlbnQgPSAwO1xubGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5uZXcgTXV0YXRpb25PYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbi8qKlxuICogRW5xdWV1ZXMgYSBmdW5jdGlvbiBjYWxsZWQgYXQgIHRpbWluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBydW5cbiAqIEByZXR1cm4ge251bWJlcn0gSGFuZGxlIHVzZWQgZm9yIGNhbmNlbGluZyB0YXNrXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSAoY2FsbGJhY2spID0+IHtcbiAgbm9kZS50ZXh0Q29udGVudCA9IFN0cmluZyhub2RlQ29udGVudCsrKTtcbiAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gY3VyckhhbmRsZSsrO1xufTtcblxuLyoqXG4gKiBDYW5jZWxzIGEgcHJldmlvdXNseSBlbnF1ZXVlZCBgYCBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gaGFuZGxlIEhhbmRsZSByZXR1cm5lZCBmcm9tIGBydW5gIG9mIGNhbGxiYWNrIHRvIGNhbmNlbFxuICovXG5leHBvcnQgY29uc3QgY2FuY2VsID0gKGhhbmRsZSkgPT4ge1xuICBjb25zdCBpZHggPSBoYW5kbGUgLSBsYXN0SGFuZGxlO1xuICBpZiAoaWR4ID49IDApIHtcbiAgICBpZiAoIWNhbGxiYWNrc1tpZHhdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlKTtcbiAgICB9XG4gICAgY2FsbGJhY2tzW2lkeF0gPSBudWxsO1xuICB9XG59O1xuXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgY29uc3QgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjYigpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbiAgbGFzdEhhbmRsZSArPSBsZW47XG59XG4iLCIvKiAgKi9cbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBhcm91bmQgZnJvbSAnLi4vYWR2aWNlL2Fyb3VuZC5qcyc7XG5pbXBvcnQgKiBhcyBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cbmNvbnN0IGdsb2JhbCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3RyYWNldXItY29tcGlsZXIvaXNzdWVzLzE3MDlcbmlmICh0eXBlb2YgZ2xvYmFsLkhUTUxFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnN0IF9IVE1MRWxlbWVudCA9IGZ1bmN0aW9uIEhUTUxFbGVtZW50KCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lc1xuICB9O1xuICBfSFRNTEVsZW1lbnQucHJvdG90eXBlID0gZ2xvYmFsLkhUTUxFbGVtZW50LnByb3RvdHlwZTtcbiAgZ2xvYmFsLkhUTUxFbGVtZW50ID0gX0hUTUxFbGVtZW50O1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyA9IFtcbiAgICAnY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdkaXNjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Fkb3B0ZWRDYWxsYmFjaycsXG4gICAgJ2F0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjaydcbiAgXTtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwgaGFzT3duUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgaWYgKCFiYXNlQ2xhc3MpIHtcbiAgICBiYXNlQ2xhc3MgPSBjbGFzcyBleHRlbmRzIGdsb2JhbC5IVE1MRWxlbWVudCB7fTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBDdXN0b21FbGVtZW50IGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge31cblxuICAgIHN0YXRpYyBkZWZpbmUodGFnTmFtZSkge1xuICAgICAgY29uc3QgcmVnaXN0cnkgPSBjdXN0b21FbGVtZW50cztcbiAgICAgIGlmICghcmVnaXN0cnkuZ2V0KHRhZ05hbWUpKSB7XG4gICAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICAgIGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2tNZXRob2ROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUpKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICAgIHZhbHVlKCkge30sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld0NhbGxiYWNrTmFtZSA9IGNhbGxiYWNrTWV0aG9kTmFtZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY2FsbGJhY2tNZXRob2ROYW1lLmxlbmd0aCAtICdjYWxsYmFjaycubGVuZ3RoXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbE1ldGhvZCA9IHByb3RvW2NhbGxiYWNrTWV0aG9kTmFtZV07XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgdGhpc1tuZXdDYWxsYmFja05hbWVdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZVJlbmRlckFkdmljZSgpLCAncmVuZGVyJykodGhpcyk7XG4gICAgICAgIHJlZ2lzdHJ5LmRlZmluZSh0YWdOYW1lLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgaW5pdGlhbGl6ZWQoKSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZWQgPT09IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLmNvbnN0cnVjdCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHt9XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWQoYXR0cmlidXRlTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7fVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuICAgIGNvbm5lY3RlZCgpIHt9XG5cbiAgICBkaXNjb25uZWN0ZWQoKSB7fVxuXG4gICAgYWRvcHRlZCgpIHt9XG5cbiAgICByZW5kZXIoKSB7fVxuXG4gICAgX29uUmVuZGVyKCkge31cblxuICAgIF9wb3N0UmVuZGVyKCkge31cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgY29udGV4dC5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyZW5kZXJDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICBjb25zdCBmaXJzdFJlbmRlciA9IHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnRleHQuX29uUmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICAgIHJlbmRlckNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgICAgICBjb250ZXh0Ll9wb3N0UmVuZGVyKGZpcnN0UmVuZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRpc2Nvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIHByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkICYmIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYmVmb3JlIGZyb20gJy4uL2FkdmljZS9iZWZvcmUuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0ICogYXMgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSwga2V5cywgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyA9IHt9O1xuICBjb25zdCBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzID0ge307XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGxldCBwcm9wZXJ0aWVzQ29uZmlnO1xuICBsZXQgZGF0YUhhc0FjY2Vzc29yID0ge307XG4gIGxldCBkYXRhUHJvdG9WYWx1ZXMgPSB7fTtcblxuICBmdW5jdGlvbiBlbmhhbmNlUHJvcGVydHlDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnLmhhc09ic2VydmVyID0gJ29ic2VydmVyJyBpbiBjb25maWc7XG4gICAgY29uZmlnLmlzT2JzZXJ2ZXJTdHJpbmcgPSBjb25maWcuaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIGNvbmZpZy5vYnNlcnZlciA9PT0gJ3N0cmluZyc7XG4gICAgY29uZmlnLmlzU3RyaW5nID0gY29uZmlnLnR5cGUgPT09IFN0cmluZztcbiAgICBjb25maWcuaXNOdW1iZXIgPSBjb25maWcudHlwZSA9PT0gTnVtYmVyO1xuICAgIGNvbmZpZy5pc0Jvb2xlYW4gPSBjb25maWcudHlwZSA9PT0gQm9vbGVhbjtcbiAgICBjb25maWcuaXNPYmplY3QgPSBjb25maWcudHlwZSA9PT0gT2JqZWN0O1xuICAgIGNvbmZpZy5pc0FycmF5ID0gY29uZmlnLnR5cGUgPT09IEFycmF5O1xuICAgIGNvbmZpZy5pc0RhdGUgPSBjb25maWcudHlwZSA9PT0gRGF0ZTtcbiAgICBjb25maWcubm90aWZ5ID0gJ25vdGlmeScgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5yZWFkT25seSA9ICdyZWFkT25seScgaW4gY29uZmlnID8gY29uZmlnLnJlYWRPbmx5IDogZmFsc2U7XG4gICAgY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZSA9XG4gICAgICAncmVmbGVjdFRvQXR0cmlidXRlJyBpbiBjb25maWdcbiAgICAgICAgPyBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlXG4gICAgICAgIDogY29uZmlnLmlzU3RyaW5nIHx8IGNvbmZpZy5pc051bWJlciB8fCBjb25maWcuaXNCb29sZWFuO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChsZXQgbmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAoIU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BlcnRpZXMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgb3V0cHV0W25hbWVdID0gdHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nID8geyB0eXBlOiBwcm9wZXJ0eSB9IDogcHJvcGVydHk7XG4gICAgICBlbmhhbmNlUHJvcGVydHlDb25maWcob3V0cHV0W25hbWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChPYmplY3Qua2V5cyhwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuICAgICAgICBhc3NpZ24oY29udGV4dCwgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpO1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGV4dC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXR0cmlidXRlLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKG9sZFZhbHVlICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBjb250ZXh0Ll9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgbmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY3VycmVudFByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZFByb3BzKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHRoaXM7XG4gICAgICBPYmplY3Qua2V5cyhjaGFuZ2VkUHJvcHMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBub3RpZnksXG4gICAgICAgICAgaGFzT2JzZXJ2ZXIsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlLFxuICAgICAgICAgIGlzT2JzZXJ2ZXJTdHJpbmcsXG4gICAgICAgICAgb2JzZXJ2ZXJcbiAgICAgICAgfSA9IGNvbnRleHQuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKHJlZmxlY3RUb0F0dHJpYnV0ZSkge1xuICAgICAgICAgIGNvbnRleHQuX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPYnNlcnZlciAmJiBpc09ic2VydmVyU3RyaW5nKSB7XG4gICAgICAgICAgdGhpc1tvYnNlcnZlcl0oY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPYnNlcnZlciAmJiB0eXBlb2Ygb2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5hcHBseShjb250ZXh0LCBbY2hhbmdlZFByb3BzW3Byb3BlcnR5XSwgb2xkUHJvcHNbcHJvcGVydHldXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vdGlmeSkge1xuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChgJHtwcm9wZXJ0eX0tY2hhbmdlZGAsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sXG4gICAgICAgICAgICAgICAgb2xkVmFsdWU6IG9sZFByb3BzW3Byb3BlcnR5XVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2xhc3MgUHJvcGVydGllcyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNsYXNzUHJvcGVydGllcykubWFwKChwcm9wZXJ0eSkgPT4gdGhpcy5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkpIHx8IFtdO1xuICAgIH1cblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCksICdhdHRyaWJ1dGVDaGFuZ2VkJykodGhpcyk7XG4gICAgICBiZWZvcmUoY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSwgJ3Byb3BlcnRpZXNDaGFuZ2VkJykodGhpcyk7XG4gICAgICB0aGlzLmNyZWF0ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXTtcbiAgICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgaHlwZW5SZWdFeCA9IC8tKFthLXpdKS9nO1xuICAgICAgICBwcm9wZXJ0eSA9IGF0dHJpYnV0ZS5yZXBsYWNlKGh5cGVuUmVnRXgsIG1hdGNoID0+IG1hdGNoWzFdLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXNbYXR0cmlidXRlXSA9IHByb3BlcnR5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH1cblxuICAgIHN0YXRpYyBwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSkge1xuICAgICAgbGV0IGF0dHJpYnV0ZSA9IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldO1xuICAgICAgaWYgKCFhdHRyaWJ1dGUpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbmQgbWVtb2l6ZS5cbiAgICAgICAgY29uc3QgdXBwZXJjYXNlUmVnRXggPSAvKFtBLVpdKS9nO1xuICAgICAgICBhdHRyaWJ1dGUgPSBwcm9wZXJ0eS5yZXBsYWNlKHVwcGVyY2FzZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV0gPSBhdHRyaWJ1dGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXR0cmlidXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2xhc3NQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGdldFByb3BlcnRpZXNDb25maWcgPSAoKSA9PiBwcm9wZXJ0aWVzQ29uZmlnIHx8IHt9O1xuICAgICAgICBsZXQgY2hlY2tPYmogPSBudWxsO1xuICAgICAgICBsZXQgbG9vcCA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUgKGxvb3ApIHtcbiAgICAgICAgICBjaGVja09iaiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja09iaiA9PT0gbnVsbCA/IHRoaXMgOiBjaGVja09iaik7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWNoZWNrT2JqIHx8XG4gICAgICAgICAgICAhY2hlY2tPYmouY29uc3RydWN0b3IgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBIVE1MRWxlbWVudCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gY2hlY2tPYmouY29uc3RydWN0b3IuY29uc3RydWN0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxvb3AgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoZWNrT2JqLCAncHJvcGVydGllcycpKSB7XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyhjaGVja09iai5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcGVydGllcykge1xuICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICBwcm9wZXJ0aWVzQ29uZmlnID0gYXNzaWduKFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydGllc0NvbmZpZztcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5wcm90b3R5cGU7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy5jbGFzc1Byb3BlcnRpZXM7XG4gICAgICBrZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gc2V0dXAgcHJvcGVydHkgJyR7cHJvcGVydHl9JywgcHJvcGVydHkgYWxyZWFkeSBleGlzdHNgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydGllc1twcm9wZXJ0eV0udmFsdWU7XG4gICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm90by5fY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0ucmVhZE9ubHkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge1xuICAgICAgc3VwZXIuY29uc3RydWN0KCk7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgcHJvcGVydGllc0NoYW5nZWQoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7fVxuXG4gICAgX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHJlYWRPbmx5KSB7XG4gICAgICBpZiAoIWRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0pIHtcbiAgICAgICAgZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgIGRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3BlcnR5KHByb3BlcnR5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogcmVhZE9ubHlcbiAgICAgICAgICAgID8gKCkgPT4ge31cbiAgICAgICAgICAgIDogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgIH1cblxuICAgIF9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIHZhbHVlICR7bmV3VmFsdWV9IGZvciBwcm9wZXJ0eSAke3Byb3BlcnR5fSBvZlxuXHRcdFx0XHRcdHR5cGUgJHt0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZS5uYW1lfWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YVByb3RvVmFsdWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9XG4gICAgICAgICAgdHlwZW9mIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XS5jYWxsKHRoaXMpXG4gICAgICAgICAgICA6IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhSGFzQWNjZXNzb3IpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hdHRyaWJ1dGVUb1Byb3BlcnR5KGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN0cnVjdG9yLmF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSk7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gdGhpcy5fZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pc1ZhbGlkUHJvcGVydHlWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlO1xuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlzVmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHByb3BlcnR5VHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBgJHt0eXBlb2YgdmFsdWV9YCA9PT0gcHJvcGVydHlUeXBlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIF9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSB0cnVlO1xuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5jb25zdHJ1Y3Rvci5wcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZShwcm9wZXJ0eSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGlzTnVtYmVyLCBpc0FycmF5LCBpc0Jvb2xlYW4sIGlzRGF0ZSwgaXNTdHJpbmcsIGlzT2JqZWN0IH0gPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoaXNOdW1iZXIpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gMCA6IE51bWJlcih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAoaXNBcnJheSA/IG51bGwgOiB7fSkgOiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/ICcnIDogbmV3IERhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5Q29uZmlnID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgY29uc3QgeyBpc0Jvb2xlYW4sIGlzT2JqZWN0LCBpc0FycmF5IH0gPSBwcm9wZXJ0eUNvbmZpZztcblxuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlID0gdmFsdWUgPyB2YWx1ZS50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIF9zZXRQZW5kaW5nUHJvcGVydHkocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBsZXQgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgICBsZXQgY2hhbmdlZCA9IHRoaXMuX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IHt9O1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbnN1cmUgb2xkIGlzIGNhcHR1cmVkIGZyb20gdGhlIGxhc3QgdHVyblxuICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YU9sZCAmJiAhKHByb3BlcnR5IGluIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZFtwcm9wZXJ0eV0gPSBvbGQ7XG4gICAgICAgIH1cbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmdbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBfaW52YWxpZGF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkKSB7XG4gICAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZmx1c2hQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhO1xuICAgICAgY29uc3QgY2hhbmdlZFByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmc7XG4gICAgICBjb25zdCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhT2xkO1xuXG4gICAgICBpZiAodGhpcy5fc2hvdWxkUHJvcGVydGllc0NoYW5nZShwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpKSB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0gbnVsbDtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvcGVydGllc0NoYW5nZWQocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydGllc0NoYW5nZShcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHtcbiAgICAgIHJldHVybiBCb29sZWFuKGNoYW5nZWRQcm9wcyk7XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnR5Q2hhbmdlKHByb3BlcnR5LCB2YWx1ZSwgb2xkKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBTdHJpY3QgZXF1YWxpdHkgY2hlY2tcbiAgICAgICAgb2xkICE9PSB2YWx1ZSAmJlxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgKG9sZD09TmFOLCB2YWx1ZT09TmFOKSBhbHdheXMgcmV0dXJucyBmYWxzZVxuICAgICAgICAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLyogICovXG5cbmV4cG9ydCBkZWZhdWx0ICh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlID0gZmFsc2UpID0+IHtcbiAgcmV0dXJuIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufTtcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gZXZlbnQgZW1pdHRlcicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSB7XG4gICAgbGV0IGV2ZW50cyA9IHR5cGUuc3BsaXQoL1xccyosXFxzKi8pO1xuICAgIGxldCBoYW5kbGVzID0gZXZlbnRzLm1hcChmdW5jdGlvbih0eXBlKSB7XG4gICAgICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgbGV0IGhhbmRsZTtcbiAgICAgICAgd2hpbGUgKChoYW5kbGUgPSBoYW5kbGVzLnBvcCgpKSkge1xuICAgICAgICAgIGhhbmRsZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xufVxuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBwcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCBmcm9tICcuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMnO1xuXG5jbGFzcyBQcm9wZXJ0aWVzVGVzdCBleHRlbmRzIHByb3BlcnRpZXMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIHN0YXRpYyBnZXQgcHJvcGVydGllcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAncHJvcCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdEZyb21BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAoKSA9PiB7fSxcbiAgICAgICAgbm90aWZ5OiB0cnVlXG4gICAgICB9LFxuICAgICAgZm5WYWx1ZVByb3A6IHtcbiAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cblByb3BlcnRpZXNUZXN0LmRlZmluZSgncHJvcGVydGllcy10ZXN0Jyk7XG5cbmRlc2NyaWJlKCdjdXN0b20tZWxlbWVudC1wcm9wZXJ0aWVzJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBwcm9wZXJ0aWVzVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtdGVzdCcpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG5cdCAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZChwcm9wZXJ0aWVzVGVzdCk7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ3Byb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNUZXN0LnByb3AsICdwcm9wJyk7XG4gIH0pO1xuXG4gIGl0KCdyZWZsZWN0aW5nIHByb3BlcnRpZXMnLCAoKSA9PiB7XG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICAgIHByb3BlcnRpZXNUZXN0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc1Rlc3QuZ2V0QXR0cmlidXRlKCdwcm9wJyksICdwcm9wVmFsdWUnKTtcbiAgfSk7XG5cbiAgaXQoJ25vdGlmeSBwcm9wZXJ0eSBjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGlzdGVuRXZlbnQocHJvcGVydGllc1Rlc3QsICdwcm9wLWNoYW5nZWQnLCBldnQgPT4ge1xuICAgICAgYXNzZXJ0LmlzT2soZXZ0LnR5cGUgPT09ICdwcm9wLWNoYW5nZWQnLCAnZXZlbnQgZGlzcGF0Y2hlZCcpO1xuICAgIH0pO1xuXG4gICAgcHJvcGVydGllc1Rlc3QucHJvcCA9ICdwcm9wVmFsdWUnO1xuICB9KTtcblxuICBpdCgndmFsdWUgYXMgYSBmdW5jdGlvbicsICgpID0+IHtcbiAgICBhc3NlcnQuaXNPayhcbiAgICAgIEFycmF5LmlzQXJyYXkocHJvcGVydGllc1Rlc3QuZm5WYWx1ZVByb3ApLFxuICAgICAgJ2Z1bmN0aW9uIGV4ZWN1dGVkJ1xuICAgICk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGFmdGVyIGZyb20gJy4uL2FkdmljZS9hZnRlci5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQsIHsgfSBmcm9tICcuLi9kb20tZXZlbnRzL2xpc3Rlbi1ldmVudC5qcyc7XG5cblxuXG4vKipcbiAqIE1peGluIGFkZHMgQ3VzdG9tRXZlbnQgaGFuZGxpbmcgdG8gYW4gZWxlbWVudFxuICovXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgYXNzaWduIH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IFtdXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50RGVmYXVsdFBhcmFtcyA9IHtcbiAgICBidWJibGVzOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZVxuICB9O1xuXG4gIHJldHVybiBjbGFzcyBFdmVudHMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBhZnRlcihjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgICBjb25zdCBoYW5kbGUgPSBgb24ke2V2ZW50LnR5cGV9YDtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1toYW5kbGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgdGhpc1toYW5kbGVdKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdGhpcy5vd24obGlzdGVuRXZlbnQodGhpcywgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgICB9XG5cbiAgICBkaXNwYXRjaCh0eXBlLCBkYXRhID0ge30pIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQodHlwZSwgYXNzaWduKGV2ZW50RGVmYXVsdFBhcmFtcywgeyBkZXRhaWw6IGRhdGEgfSkpKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIGhhbmRsZXIucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBvd24oLi4uaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBjb250ZXh0Lm9mZigpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChldnQpID0+IHtcbiAgaWYgKGV2dC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59O1xuIiwiaW1wb3J0IGN1c3RvbUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LmpzJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyc7XG5pbXBvcnQgc3RvcEV2ZW50IGZyb20gJy4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMnO1xuXG5jbGFzcyBFdmVudHNFbWl0dGVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbmNsYXNzIEV2ZW50c0xpc3RlbmVyIGV4dGVuZHMgZXZlbnRzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBjb25uZWN0ZWQoKSB7fVxuXG4gIGRpc2Nvbm5lY3RlZCgpIHt9XG59XG5cbkV2ZW50c0VtaXR0ZXIuZGVmaW5lKCdldmVudHMtZW1pdHRlcicpO1xuRXZlbnRzTGlzdGVuZXIuZGVmaW5lKCdldmVudHMtbGlzdGVuZXInKTtcblxuZGVzY3JpYmUoJ2N1c3RvbS1lbGVtZW50LWV2ZW50cycsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgZW1taXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1lbWl0dGVyJyk7XG4gIGNvbnN0IGxpc3RlbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgbGlzdGVuZXIuYXBwZW5kKGVtbWl0ZXIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQobGlzdGVuZXIpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgnZXhwZWN0IGVtaXR0ZXIgdG8gZmlyZUV2ZW50IGFuZCBsaXN0ZW5lciB0byBoYW5kbGUgYW4gZXZlbnQnLCAoKSA9PiB7XG4gICAgbGlzdGVuZXIub24oJ2hpJywgZXZ0ID0+IHtcbiAgICAgIHN0b3BFdmVudChldnQpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LnRhcmdldCkudG8uZXF1YWwoZW1taXRlcik7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS5hKCdvYmplY3QnKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLnRvLmRlZXAuZXF1YWwoeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICAgIH0pO1xuICAgIGVtbWl0ZXIuZGlzcGF0Y2goJ2hpJywgeyBib2R5OiAnZ3JlZXRpbmcnIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gW1xuICAnTWFwJyxcbiAgJ1NldCcsXG4gICdTeW1ib2wnLFxuICAnQXJyYXknLFxuICAnT2JqZWN0JyxcbiAgJ1N0cmluZycsXG4gICdEYXRlJyxcbiAgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsXG4gICdCb29sZWFuJyxcbiAgJ051bWJlcicsXG4gICdOdWxsJyxcbiAgJ1VuZGVmaW5lZCcsXG4gICdBcmd1bWVudHMnLFxuICAnRXJyb3InLFxuICAnUmVxdWVzdCcsXG4gICdSZXNwb25zZScsXG4gICdIZWFkZXJzJyxcbiAgJ0Jsb2InXG5dO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcblxuZXhwb3J0IGRlZmF1bHQgKHNldHVwKCkpO1xuXG5leHBvcnQgY29uc3QgZ2V0VHlwZSA9IChzcmMpID0+IGdldFNyY1R5cGUoc3JjKTtcblxuZnVuY3Rpb24gZ2V0U3JjVHlwZShzcmMpIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKHNyYyk7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IHNyYyA9PiBnZXRTcmNUeXBlKHNyYykgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGlzLCB7IGdldFR5cGUgfSBmcm9tICcuLi90eXBlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKHNyYykgPT4gY2xvbmUoc3JjLCBbXSwgW10pO1xuXG5mdW5jdGlvbiBjbG9uZShzcmMsIGNpcmN1bGFycyA9IFtdLCBjbG9uZXMgPSBbXSkge1xuICAvLyBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjXG4gIGlmIChpcy51bmRlZmluZWQoc3JjKSB8fCBpcy5udWxsKHNyYykgfHwgaXNQcmltaXRpdmUoc3JjKSB8fCBpcy5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuICByZXR1cm4gY2xvbmVyKGdldFR5cGUoc3JjKSwgc3JjLCBjaXJjdWxhcnMsIGNsb25lcyk7XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHNyYykge1xuICByZXR1cm4gaXMuYm9vbGVhbihzcmMpIHx8IGlzLm51bWJlcihzcmMpIHx8IGlzLnN0cmluZyhzcmMpO1xufVxuXG5mdW5jdGlvbiBjbG9uZXIodHlwZSwgY29udGV4dCwgLi4uYXJncykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBkYXRlKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuZ2V0VGltZSgpKTtcbiAgICB9LFxuICAgIHJlZ2V4cCgpIHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRoaXMpO1xuICAgIH0sXG4gICAgYXJyYXkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoY2xvbmUpO1xuICAgIH0sXG4gICAgbWFwKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoQXJyYXkuZnJvbSh0aGlzLmVudHJpZXMoKSkpO1xuICAgIH0sXG4gICAgc2V0KCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQoQXJyYXkuZnJvbSh0aGlzLnZhbHVlcygpKSk7XG4gICAgfSxcbiAgICByZXF1ZXN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIHJlc3BvbnNlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICB9LFxuICAgIGhlYWRlcnMoKSB7XG4gICAgICBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgICBmb3IgKGxldCBbbmFtZSwgdmFsdWVdIG9mIHRoaXMuZW50cmllcykge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9LFxuICAgIGJsb2IoKSB7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW3RoaXNdLCB7IHR5cGU6IHRoaXMudHlwZSB9KTtcbiAgICB9LFxuICAgIG9iamVjdChjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgICAgIGNpcmN1bGFycy5wdXNoKHRoaXMpO1xuICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuICAgICAgICBsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gdGhpc1trZXldKTtcbiAgICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfTtcbiAgaWYgKHR5cGUgaW4gaGFuZGxlcnMpIHtcbiAgICBjb25zdCBmbiA9IGhhbmRsZXJzW3R5cGVdO1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfVxuICByZXR1cm4gY29udGV4dDtcbn1cbiIsImltcG9ydCBjbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuXHRpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuXHRcdC8vIE51bGxcblx0XHRleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cblx0XHQvLyBVbmRlZmluZWRcblx0XHRleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG5cdFx0Ly8gRnVuY3Rpb25cblx0XHRjb25zdCBmdW5jID0gKCkgPT4ge307XG5cdFx0YXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cblx0XHQvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuXHR9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAodmFsdWUsIHJldml2ZXIgPSAoaywgdikgPT4gdikgPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSksIHJldml2ZXIpO1xuIiwiaW1wb3J0IGpzb25DbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnanNvbi1jbG9uZScsICgpID0+IHtcblx0aXQoJ25vbi1zZXJpYWxpemFibGUgdmFsdWVzIHRocm93JywgKCkgPT4ge1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0ZXhwZWN0KCgpID0+IGpzb25DbG9uZSh1bmRlZmluZWQpKS50by50aHJvdyhFcnJvcik7XG5cdH0pO1xuXG5cdGl0KCdwcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoJ29iamVjdCBjbG9uZWQnLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRleHBlY3QoanNvbkNsb25lKG9iaikpLm5vdC50by5iZS5lcXVhbChvYmopO1xuXHR9KTtcblxuXHRpdCgncmV2aXZlciBmdW5jdGlvbicsICgpID0+IHtcblx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdGNvbnN0IGNsb25lZCA9IGpzb25DbG9uZShvYmosIChrLCB2KSA9PiBrICE9PSAnJyA/IE51bWJlcih2KSAqIDIgOiB2KTtcblx0XHRleHBlY3QoY2xvbmVkLmEpLmVxdWFsKDQpO1xuXHR9KTtcbn0pOyIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIGRlZmF1bHRWYWx1ZSA9IHVuZGVmaW5lZCkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gb2JqW2tleV0gPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG4gIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdFtwYXJ0c1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3RbcGFydHNbaV1dID0ge307XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gIH1cbiAgb2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBpcywgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5pbXBvcnQgY2xvbmUgZnJvbSAnLi9jbG9uZS5qcyc7XG5cblxuZXhwb3J0IGNvbnN0IGFycmF5UmVwbGFjZVN0cmF0ZWd5ID0gKHNvdXJjZSwgdGFyZ2V0KSA9PiBjbG9uZSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgZmFjdG9yeSA9IChvcHRzID0geyBhcnJheU1lcmdlOiBhcnJheVJlcGxhY2VTdHJhdGVneSB9KSA9PiAoXG4gIC4uLmFyZ3NcbikgPT4ge1xuICBsZXQgcmVzdWx0O1xuXG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aDsgaSA+IDA7IC0taSkge1xuICAgIHJlc3VsdCA9IG1lcmdlKGFyZ3MucG9wKCksIHJlc3VsdCwgb3B0cyk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZmFjdG9yeSgpO1xuXG5mdW5jdGlvbiBtZXJnZShzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBpZiAoaXMudW5kZWZpbmVkKHRhcmdldCkpIHtcbiAgICByZXR1cm4gY2xvbmUoc291cmNlKTtcbiAgfVxuXG4gIGxldCB0eXBlID0gZ2V0VHlwZShzb3VyY2UpO1xuICBpZiAodHlwZSA9PT0gZ2V0VHlwZSh0YXJnZXQpKSB7XG4gICAgcmV0dXJuIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cyk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBvYmplY3QoKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7fTtcblxuICAgICAgY29uc3Qga2V5cyA9IHtcbiAgICAgICAgc291cmNlOiBPYmplY3Qua2V5cyhzb3VyY2UpLFxuICAgICAgICB0YXJnZXQ6IE9iamVjdC5rZXlzKHRhcmdldClcbiAgICAgIH07XG5cbiAgICAgIGtleXMuc291cmNlLmNvbmNhdChrZXlzLnRhcmdldCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoc291cmNlW2tleV0sIHRhcmdldFtrZXldLCBvcHRzKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhcnJheSgpIHtcbiAgICAgIHJldHVybiBvcHRzLmFycmF5TWVyZ2UuYXBwbHkobnVsbCwgW3NvdXJjZSwgdGFyZ2V0XSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlIGluIGhhbmRsZXJzKSB7XG4gICAgcmV0dXJuIGhhbmRsZXJzW3R5cGVdKCk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChvKSA9PlxuICBPYmplY3Qua2V5cyhvKS5yZWR1Y2UoKG0sIGspID0+IG0uc2V0KGssIG9ba10pLCBuZXcgTWFwKCkpO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGRnZXQgfSBmcm9tICcuL29iamVjdC9kZ2V0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgZHNldCB9IGZyb20gJy4vb2JqZWN0L2RzZXQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBjbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgbWVyZ2UgfSBmcm9tICcuL29iamVjdC9tZXJnZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBvYmplY3RUb01hcCB9IGZyb20gJy4vb2JqZWN0L29iamVjdC10by1tYXAuanMnO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB7IGNsb25lLCBtZXJnZSB9IGZyb20gJy4vb2JqZWN0LmpzJztcblxuXG5cblxuXG5cblxuZXhwb3J0IGNvbnN0IEh0dHBNZXRob2RzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIEdldDogJ0dFVCcsXG4gIFBvc3Q6ICdQT1NUJyxcbiAgUHV0OiAnUFVUJyxcbiAgUGF0Y2g6ICdQQVRDSCcsXG4gIERlbGV0ZTogJ0RFTEVURSdcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBuZXcgSHR0cChjcmVhdGVDb25maWcoKSk7XG5cbmNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5jbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHJlc3BvbnNlKSB7XG4gICAgc3VwZXIoYCR7cmVzcG9uc2Uuc3RhdHVzfSBmb3IgJHtyZXNwb25zZS51cmx9YCk7XG4gICAgdGhpcy5uYW1lID0gJ0h0dHBFcnJvcic7XG4gICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICB9XG59XG5cbmNsYXNzIEh0dHAge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBjYXRjaGVyKGVycm9ySWQsIGNhdGNoZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5jYXRjaGVycy5zZXQoZXJyb3JJZCwgY2F0Y2hlcik7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBtaWRkbGV3YXJlKG1pZGRsZXdhcmUsIGNsZWFyID0gZmFsc2UpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5taWRkbGV3YXJlID0gY2xlYXIgPyBtaWRkbGV3YXJlIDogY29uZmlnLm1pZGRsZXdhcmUuY29uY2F0KG1pZGRsZXdhcmUpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgdXJsKHVybCwgcmVwbGFjZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcudXJsID0gcmVwbGFjZSA/IHVybCA6IGNvbmZpZy51cmwgKyB1cmw7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBvcHRpb25zKG9wdGlvbnMsIG1peGluID0gdHJ1ZSkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLm9wdGlvbnMgPSBtaXhpbiA/IG1lcmdlKGNvbmZpZy5vcHRpb25zLCBvcHRpb25zKSA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgaGVhZGVycyhoZWFkZXJWYWx1ZXMpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5vcHRpb25zLmhlYWRlcnMgPSBtZXJnZShjb25maWcub3B0aW9ucy5oZWFkZXJzLCBoZWFkZXJWYWx1ZXMpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgYWNjZXB0KGhlYWRlclZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycyh7IEFjY2VwdDogaGVhZGVyVmFsdWUgfSk7XG4gIH1cblxuICBjb250ZW50KGhlYWRlclZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycyh7ICdDb250ZW50LVR5cGUnOiBoZWFkZXJWYWx1ZSB9KTtcbiAgfVxuXG4gIG1vZGUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgbW9kZTogdmFsdWUgfSk7XG4gIH1cblxuICBjcmVkZW50aWFscyh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBjcmVkZW50aWFsczogdmFsdWUgfSk7XG4gIH1cblxuICBjYWNoZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBjYWNoZTogdmFsdWUgfSk7XG4gIH1cblxuICBpbnRlZ3JpdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgaW50ZWdyaXR5OiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGtlZXBhbGl2ZSh2YWx1ZSA9IHRydWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsga2VlcGFsaXZlOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIHJlZGlyZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IHJlZGlyZWN0OiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGJvZHkoY29udGVudHMpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5vcHRpb25zLmJvZHkgPSBjb250ZW50cztcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIGF1dGgoaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzKHsgQXV0aG9yaXphdGlvbjogaGVhZGVyVmFsdWUgfSk7XG4gIH1cblxuICBqc29uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudCgnYXBwbGljYXRpb24vanNvbicpLmJvZHkoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfVxuXG4gIGZvcm0odmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5ib2R5KGNvbnZlcnRGb3JtVXJsKHZhbHVlKSkuY29udGVudCgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gIH1cblxuICBtZXRob2QodmFsdWUgPSBIdHRwTWV0aG9kcy5HZXQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgbWV0aG9kOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuR2V0KS5zZW5kKCk7XG4gIH1cblxuICBwb3N0KCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5Qb3N0KS5zZW5kKCk7XG4gIH1cblxuICBpbnNlcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLlB1dCkuc2VuZCgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5QYXRjaCkuc2VuZCgpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5EZWxldGUpLnNlbmQoKTtcbiAgfVxuXG4gIHNlbmQoKSB7XG4gICAgY29uc3QgeyB1cmwsIG9wdGlvbnMsIG1pZGRsZXdhcmUsIHJlc29sdmVycywgY2F0Y2hlcnMgfSA9IHByaXZhdGVzKHRoaXMpLmNvbmZpZztcbiAgICBjb25zdCByZXF1ZXN0ID0gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmUpKGZldGNoKTtcbiAgICBjb25zdCB3cmFwcGVyID0gcmVxdWVzdCh1cmwsIG9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZG9DYXRjaCA9IChwcm9taXNlKSA9PiB7XG4gICAgICByZXR1cm4gcHJvbWlzZS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAoY2F0Y2hlcnMuaGFzKGVyci5zdGF0dXMpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhdGNoZXJzLmdldChlcnIuc3RhdHVzKShlcnIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYXRjaGVycy5oYXMoZXJyLm5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhdGNoZXJzLmdldChlcnIubmFtZSkoZXJyLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcFR5cGVQYXJzZXIgPSAoZnVuTmFtZSkgPT4gKGNiKSA9PlxuICAgICAgZnVuTmFtZVxuICAgICAgICA/IGRvQ2F0Y2goXG4gICAgICAgICAgICB3cmFwcGVyXG4gICAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UgJiYgcmVzcG9uc2VbZnVuTmFtZV0oKSlcbiAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gKHJlc3BvbnNlICYmIGNiICYmIGNiKHJlc3BvbnNlKSkgfHwgcmVzcG9uc2UpXG4gICAgICAgICAgKVxuICAgICAgICA6IGRvQ2F0Y2god3JhcHBlci50aGVuKHJlc3BvbnNlID0+IChyZXNwb25zZSAmJiBjYiAmJiBjYihyZXNwb25zZSkpIHx8IHJlc3BvbnNlKSk7XG5cbiAgICBjb25zdCByZXNwb25zZUNoYWluID0ge1xuICAgICAgcmVzOiB3cmFwVHlwZVBhcnNlcihudWxsKSxcbiAgICAgIGpzb246IHdyYXBUeXBlUGFyc2VyKCdqc29uJylcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc29sdmVycy5yZWR1Y2UoKGNoYWluLCByKSA9PiByKGNoYWluLCBvcHRpb25zKSwgcmVzcG9uc2VDaGFpbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmVzKSB7XG4gIHJldHVybiAoZmV0Y2hGdW5jdGlvbikgPT4ge1xuICAgIGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmZXRjaEZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBtaWRkbGV3YXJlc1swXShmZXRjaEZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKG1pZGRsZXdhcmVzLnJlZHVjZVJpZ2h0KFxuICAgICAgKGFjYywgY3VyciwgaWR4KSA9PiAoaWR4ID09PSBtaWRkbGV3YXJlcy5sZW5ndGggLSAyID8gY3VycihhY2MoZmV0Y2hGdW5jdGlvbikpIDogY3VycigoYWNjKSkpXG4gICAgKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbmZpZygpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAge1xuICAgICAgdXJsOiAnJyxcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgICAgY2F0Y2hlcnM6IG5ldyBNYXAoKSxcbiAgICAgIHJlc29sdmVyczogW10sXG4gICAgICBtaWRkbGV3YXJlOiBbXVxuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gY29udmVydEZvcm1VcmwoZm9ybU9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoZm9ybU9iamVjdClcbiAgICAubWFwKFxuICAgICAga2V5ID0+XG4gICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICtcbiAgICAgICAgJz0nICtcbiAgICAgICAgYCR7ZW5jb2RlVVJJQ29tcG9uZW50KHR5cGVvZiBmb3JtT2JqZWN0W2tleV0gPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoZm9ybU9iamVjdFtrZXldKSA6IGZvcm1PYmplY3Rba2V5XSl9YFxuICAgIClcbiAgICAuam9pbignJicpO1xufVxuIiwiaW1wb3J0IGh0dHAgZnJvbSAnLi4vbGliL2h0dHAuanMnO1xuXG5kZXNjcmliZSgnaHR0cCcsICgpID0+IHtcblx0aXQoJ2NyZWF0ZSBodHRwJywgKCkgPT4ge1xuXHRcdGNvbnN0IGRlbGF5TWlkZGxld2FyZSA9IGRlbGF5ID0+IG5leHQgPT4gKHVybCwgb3B0cykgPT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KCgpID0+IHJlcyhuZXh0KHVybCwgb3B0cykpLCBkZWxheSkpO1xuXHRcdH07XG5cblx0XHQvKiBMb2dzIGFsbCByZXF1ZXN0cyBwYXNzaW5nIHRocm91Z2guICovXG5cdFx0Y29uc3QgbG9nTWlkZGxld2FyZSA9ICgpID0+IG5leHQgPT4gKHVybCwgb3B0cykgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2cob3B0cy5tZXRob2QgKyBcIkBcIiArIHVybCk7XG5cdFx0XHRyZXR1cm4gbmV4dCh1cmwsIG9wdHMpXG5cdFx0fTtcblxuXHRcdGxldCBqc29uQXBpID0gaHR0cCgpXG5cdFx0XHQuanNvbigpXG5cdFx0XHQubW9kZSgnY29ycycpXG5cdFx0XHQubWlkZGxld2FyZShbZGVsYXlNaWRkbGV3YXJlKDMwMDApLCBsb2dNaWRkbGV3YXJlKCldKVxuXHRcdFx0LmNyZWRlbnRpYWxzKCdzYW1lLW9yaWdpbicpXG5cdFx0XHQuaGVhZGVycyh7J1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknfSk7XG5cblx0XHRqc29uQXBpXG5cdFx0XHQudXJsKCcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnKVxuXHRcdFx0LmdldCgpXG5cdFx0XHQuanNvbihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKTtcblx0XHQvLyBhc3NlcnQuaW5zdGFuY2VPZihodHRwKCksICdodHRwIGlzIGluc3RhbmNlIG9mIEh0dHAnKTtcblx0fSk7XG59KTtcbiIsIi8qICAqL1xuXG5sZXQgcHJldlRpbWVJZCA9IDA7XG5sZXQgcHJldlVuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgKHByZWZpeCkgPT4ge1xuICBsZXQgbmV3VW5pcXVlSWQgPSBEYXRlLm5vdygpO1xuICBpZiAobmV3VW5pcXVlSWQgPT09IHByZXZUaW1lSWQpIHtcbiAgICArK3ByZXZVbmlxdWVJZDtcbiAgfSBlbHNlIHtcbiAgICBwcmV2VGltZUlkID0gbmV3VW5pcXVlSWQ7XG4gICAgcHJldlVuaXF1ZUlkID0gMDtcbiAgfVxuXG4gIGxldCB1bmlxdWVJZCA9IGAke1N0cmluZyhuZXdVbmlxdWVJZCl9JHtTdHJpbmcocHJldlVuaXF1ZUlkKX1gO1xuICBpZiAocHJlZml4KSB7XG4gICAgdW5pcXVlSWQgPSBgJHtwcmVmaXh9XyR7dW5pcXVlSWR9YDtcbiAgfVxuICByZXR1cm4gdW5pcXVlSWQ7XG59O1xuIiwiaW1wb3J0IHsgZGdldCwgZHNldCwganNvbkNsb25lIH0gZnJvbSAnLi9vYmplY3QuanMnO1xuaW1wb3J0IGlzIGZyb20gJy4vdHlwZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuL3VuaXF1ZS1pZC5qcyc7XG5cbmNvbnN0IG1vZGVsID0gKGJhc2VDbGFzcyA9IGNsYXNzIHt9KSA9PiB7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuICBsZXQgc3Vic2NyaWJlckNvdW50ID0gMDtcblxuICByZXR1cm4gY2xhc3MgTW9kZWwgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5fc3RhdGVLZXkgPSB1bmlxdWVJZCgnX3N0YXRlJyk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHRoaXMuZGVmYXVsdFN0YXRlKTtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGdldChhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFN0YXRlKGFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICBzZXQoYXJnMSwgYXJnMikge1xuICAgICAgLy9zdXBwb3J0cyAoYWNjZXNzb3IsIHN0YXRlKSBPUiAoc3RhdGUpIGFyZ3VtZW50cyBmb3Igc2V0dGluZyB0aGUgd2hvbGUgdGhpbmdcbiAgICAgIGxldCBhY2Nlc3NvciwgdmFsdWU7XG4gICAgICBpZiAoIWlzLnN0cmluZyhhcmcxKSAmJiBpcy51bmRlZmluZWQoYXJnMikpIHtcbiAgICAgICAgdmFsdWUgPSBhcmcxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBhcmcyO1xuICAgICAgICBhY2Nlc3NvciA9IGFyZzE7XG4gICAgICB9XG4gICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLl9nZXRTdGF0ZSgpO1xuICAgICAgbGV0IG5ld1N0YXRlID0ganNvbkNsb25lKG9sZFN0YXRlKTtcblxuICAgICAgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAgIGRzZXQobmV3U3RhdGUsIGFjY2Vzc29yLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTdGF0ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoYWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcmVhdGVTdWJzY3JpYmVyKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCAuLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgLy9UT0RPOiBpcyBvZmYoKSBuZWVkZWQgZm9yIGluZGl2aWR1YWwgc3Vic2NyaXB0aW9uP1xuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIHtcbiAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIC0gY29udGV4dCBtdXN0IGJlIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhZGRCaW5kaW5nczogZnVuY3Rpb24oYmluZFJ1bGVzKSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGJpbmRSdWxlc1swXSkpIHtcbiAgICAgICAgICAgIGJpbmRSdWxlcyA9IFtiaW5kUnVsZXNdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBiaW5kUnVsZXMuZm9yRWFjaChiaW5kUnVsZSA9PiB7XG4gICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmUoY29udGV4dCwgYmluZFJ1bGVbMF0sIHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgZHNldChjb250ZXh0LCBiaW5kUnVsZVsxXSwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgX2dldFN0YXRlKGFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4ganNvbkNsb25lKGFjY2Vzc29yID8gZGdldChwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0sIGFjY2Vzc29yKSA6IHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSk7XG4gICAgfVxuXG4gICAgX3NldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0gPSBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBfc3Vic2NyaWJlKGNvbnRleHQsIGFjY2Vzc29yLCBjYikge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmliZXJzLmdldChjb250ZXh0KSB8fCBbXTtcbiAgICAgIHN1YnNjcmlwdGlvbnMucHVzaCh7IGFjY2Vzc29yLCBjYiB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLnNldChjb250ZXh0LCBzdWJzY3JpcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZGVzdHJveVN1YnNjcmliZXIoY29udGV4dCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgIH1cblxuICAgIF9ub3RpZnlTdWJzY3JpYmVycyhzZXRBY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHN1YnNjcmliZXJzKSB7XG4gICAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oeyBhY2Nlc3NvciwgY2IgfSkge1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXonXG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJhei5ibGF6J1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKHNldEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgYWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBhY2Nlc3NvcikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2UuZy4gc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLionXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2YoJyonKSA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBkZWVwQWNjZXNzb3IgPSBhY2Nlc3Nvci5yZXBsYWNlKCcuKicsICcnKS5yZXBsYWNlKCcqJywgJycpO1xuICAgICAgICAgICAgaWYgKHNldEFjY2Vzc29yLmluZGV4T2YoZGVlcEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBkZWVwQWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBkZWVwQWNjZXNzb3IpKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgbW9kZWw7XG4iLCJpbXBvcnQgbW9kZWwgZnJvbSAnLi4vbGliL21vZGVsLmpzJztcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBtb2RlbCgpIHtcblx0Z2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICByZXR1cm4ge2ZvbzoxfTtcbiAgfVxufVxuXG5kZXNjcmliZShcIk1vZGVsIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiZGVmYXVsdFN0YXRlIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cdGl0KFwiZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KCdmb28nLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IDFcblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajInLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMicpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdpdGggYXJyYXlzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbXVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJywnZG9nJyk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnKSkudG8uZXF1YWwoJ2RvZycpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJyx7Zm9vOjF9KTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJywyKTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaXB0aW9ucyB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBURVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cdFx0bGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihURVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0dGhyb3coJ25vIHN1YnNjcmliZXIgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZGVlcE9iajEnKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMS4qJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsLnNldChURVNUX1NFTCwgdHJ1ZSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpYmVycyBjYW4gYmUgZGVzdHJveWVkXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24obXlNb2RlbC5URVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHR0aHJvdyhuZXcgRXJyb3IoJ3Nob3VsZCBub3QgYmUgb2JzZXJ2ZWQnKSk7XG5cdFx0fSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KG15TW9kZWwuVEVTVF9TRUwsIHRydWUpO1xuXHR9KTtcblxuXHRpdChcInByb3BlcnRpZXMgYm91bmQgZnJvbSBtb2RlbCB0byBjdXN0b20gZWxlbWVudFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXG4gICAgbGV0IG15RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAodmFsdWUpID0+IHsgdGhpcy5wcm9wID0gdmFsdWU7IH0pO1xuICAgIG9ic2VydmVyLmRlc3Ryb3koKTtcblxuICAgIGNvbnN0IHByb3BlcnR5QmluZGVyID0gbXlNb2RlbC5jcmVhdGVQcm9wZXJ0eUJpbmRlcihteUVsZW1lbnQpLmFkZEJpbmRpbmdzKFxuICAgICAgWydmb28nLCAncHJvcCddXG4gICAgKTtcblxuICAgIG15TW9kZWwuc2V0KCdmb28nLCAnMycpO1xuICAgIGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuICAgIHByb3BlcnR5QmluZGVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldCgnZm9vJywgJzInKTtcblx0XHRjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcblx0fSk7XG5cbn0pO1xuIiwiLyogICovXG5cblxuXG5jb25zdCBldmVudEh1YkZhY3RvcnkgPSAoKSA9PiB7XG4gIGNvbnN0IHN1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICBsZXQgc3Vic2NyaWJlckNvdW50ID0gMDtcblxuICAvLyRGbG93Rml4TWVcbiAgcmV0dXJuIHtcbiAgICBwdWJsaXNoOiBmdW5jdGlvbihldmVudCwgLi4uYXJncykge1xuICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChzdWJzY3JpcHRpb25zID0+IHtcbiAgICAgICAgKHN1YnNjcmlwdGlvbnMuZ2V0KGV2ZW50KSB8fCBbXSkuZm9yRWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAgICAgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNyZWF0ZVN1YnNjcmliZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXJzLmhhcyhjb250ZXh0KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIG5ldyBNYXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSBzdWJzY3JpYmVycy5nZXQoY29udGV4dCk7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVyLmhhcyhldmVudCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuc2V0KGV2ZW50LCBbXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXIuZ2V0KGV2ZW50KS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgb2ZmOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXJzLmdldChjb250ZXh0KS5kZWxldGUoZXZlbnQpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZXZlbnRIdWJGYWN0b3J5O1xuIiwiaW1wb3J0IGV2ZW50SHViRmFjdG9yeSBmcm9tICcuLi9saWIvZXZlbnQtaHViLmpzJztcblxuZGVzY3JpYmUoXCJFdmVudEh1YiBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImJhc2ljIHB1Yi9zdWIgd29ya3NcIiwgKGRvbmUpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpYmVycyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmlwdGlvbnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMik7XG4gICAgICB9KVxuXG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicsIDIpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJkZXN0cm95KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViU3Vic2NyaWJlci5kZXN0cm95KCk7XG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgwKTtcblx0fSk7XG5cbiAgaXQoXCJvZmYoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCh1bmRlZmluZWQpO1xuICAgICAgfSlcbiAgICAgIC5vZmYoJ2ZvbycpXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJyk7ICAvL3Nob3VsZCBjYWxsZWRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXG59KTtcbiJdLCJuYW1lcyI6WyJ0ZW1wbGF0ZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiaSIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsImlubmVySFRNTCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsIkVycm9yIiwiZGVzY3JpYmUiLCJpdCIsImVsIiwiZXhwZWN0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJ0byIsImVxdWFsIiwiYXNzZXJ0IiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwiZGVmaW5lUHJvcGVydHkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwiY3VyckhhbmRsZSIsImNhbGxiYWNrcyIsIm5vZGVDb250ZW50Iiwibm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsImZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImxhc3RIYW5kbGUiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsIm1pY3JvVGFzayIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwia2V5cyIsImFzc2lnbiIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsInR5cGUiLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwibmFtZSIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJoYW5kbGUiLCJwb3AiLCJQcm9wZXJ0aWVzVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImNvbnRhaW5lciIsInByb3BlcnRpZXNUZXN0IiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlciIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJhIiwiZGVlcCIsImJvZHkiLCJhcnIiLCJmbiIsInNvbWUiLCJldmVyeSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJzZXR1cCIsImdldFR5cGUiLCJzcmMiLCJnZXRTcmNUeXBlIiwibWF0Y2hlcyIsImNoZWNrcyIsImNsb25lIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwiaXMiLCJudWxsIiwiaXNQcmltaXRpdmUiLCJmdW5jdGlvbiIsImNsb25lciIsImJvb2xlYW4iLCJudW1iZXIiLCJzdHJpbmciLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJoZWFkZXJzIiwiSGVhZGVycyIsImJsb2IiLCJCbG9iIiwib2JqZWN0Iiwia2V5IiwiaWR4IiwiZmluZEluZGV4IiwiYmUiLCJmdW5jIiwiaXNGdW5jdGlvbiIsInJldml2ZXIiLCJrIiwidiIsImpzb25DbG9uZSIsInRocm93Iiwibm90IiwiY2xvbmVkIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwiZGVmYXVsdFZhbHVlIiwicGFydHMiLCJkZXB0aCIsImFycmF5UmVwbGFjZVN0cmF0ZWd5Iiwic291cmNlIiwiZmFjdG9yeSIsIm9wdHMiLCJhcnJheU1lcmdlIiwicmVzdWx0IiwibWVyZ2UiLCJtZXJnZXIiLCJjb25jYXQiLCJIdHRwTWV0aG9kcyIsImZyZWV6ZSIsIkdldCIsIlBvc3QiLCJQdXQiLCJQYXRjaCIsIkRlbGV0ZSIsIkh0dHAiLCJjcmVhdGVDb25maWciLCJIdHRwRXJyb3IiLCJzdGF0dXMiLCJ1cmwiLCJjYXRjaGVyIiwiZXJyb3JJZCIsImNhdGNoZXJzIiwibWlkZGxld2FyZSIsImNsZWFyIiwib3B0aW9ucyIsIm1peGluIiwiaGVhZGVyVmFsdWVzIiwiYWNjZXB0IiwiaGVhZGVyVmFsdWUiLCJBY2NlcHQiLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJjYWNoZSIsImludGVncml0eSIsImtlZXBhbGl2ZSIsInJlZGlyZWN0IiwiY29udGVudHMiLCJhdXRoIiwiQXV0aG9yaXphdGlvbiIsImpzb24iLCJmb3JtIiwiY29udmVydEZvcm1VcmwiLCJzZW5kIiwicG9zdCIsImluc2VydCIsInVwZGF0ZSIsImRlbGV0ZSIsInJlc29sdmVycyIsImFwcGx5TWlkZGxld2FyZSIsImZldGNoIiwid3JhcHBlciIsInRoZW4iLCJvayIsImRvQ2F0Y2giLCJwcm9taXNlIiwiY2F0Y2giLCJoYXMiLCJ3cmFwVHlwZVBhcnNlciIsImZ1bk5hbWUiLCJyZXNwb25zZUNoYWluIiwicmVzIiwicmVkdWNlIiwiY2hhaW4iLCJyIiwibWlkZGxld2FyZXMiLCJmZXRjaEZ1bmN0aW9uIiwicmVkdWNlUmlnaHQiLCJhY2MiLCJjdXJyIiwiZm9ybU9iamVjdCIsImVuY29kZVVSSUNvbXBvbmVudCIsImJhYmVsSGVscGVycy50eXBlb2YiLCJqb2luIiwiZGVsYXlNaWRkbGV3YXJlIiwiUHJvbWlzZSIsIm5leHQiLCJkZWxheSIsImxvZ01pZGRsZXdhcmUiLCJqc29uQXBpIiwiaHR0cCIsInByZXZUaW1lSWQiLCJwcmV2VW5pcXVlSWQiLCJwcmVmaXgiLCJuZXdVbmlxdWVJZCIsIm5vdyIsInVuaXF1ZUlkIiwibW9kZWwiLCJzdWJzY3JpYmVyQ291bnQiLCJfc3RhdGVLZXkiLCJfc3Vic2NyaWJlcnMiLCJfc2V0U3RhdGUiLCJkZWZhdWx0U3RhdGUiLCJhY2Nlc3NvciIsIl9nZXRTdGF0ZSIsImFyZzEiLCJhcmcyIiwib2xkU3RhdGUiLCJuZXdTdGF0ZSIsImRzZXQiLCJfbm90aWZ5U3Vic2NyaWJlcnMiLCJjcmVhdGVTdWJzY3JpYmVyIiwic2VsZiIsIl9zdWJzY3JpYmUiLCJkZXN0cm95IiwiX2Rlc3Ryb3lTdWJzY3JpYmVyIiwiY3JlYXRlUHJvcGVydHlCaW5kZXIiLCJhZGRCaW5kaW5ncyIsImJpbmRSdWxlcyIsImJpbmRSdWxlIiwiZGdldCIsInN1YnNjcmlwdGlvbnMiLCJzZXRBY2Nlc3NvciIsInN1YnNjcmliZXJzIiwiZGVlcEFjY2Vzc29yIiwiTW9kZWwiLCJmb28iLCJteU1vZGVsIiwiZGVlcE9iajEiLCJkZWVwT2JqMiIsInNlbGVjdGVkIiwiVEVTVF9TRUwiLCJteU1vZGVsU3Vic2NyaWJlciIsIm51bUNhbGxiYWNrc0NhbGxlZCIsIm15RWxlbWVudCIsInByb3BlcnR5QmluZGVyIiwiZXZlbnRIdWJGYWN0b3J5IiwicHVibGlzaCIsInN1YnNjcmliZXIiLCJkb25lIiwibXlFdmVudEh1YiIsIm15RXZlbnRIdWJTdWJzY3JpYmVyIiwibXlFdmVudEh1YlN1YnNjcmliZXIyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7RUFBQTtBQUNBLHlCQUFlLFVBQUNBLFFBQUQsRUFBYztFQUMzQixNQUFJLGFBQWFDLFNBQVNDLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBakIsRUFBcUQ7RUFDbkQsV0FBT0QsU0FBU0UsVUFBVCxDQUFvQkgsU0FBU0ksT0FBN0IsRUFBc0MsSUFBdEMsQ0FBUDtFQUNEOztFQUVELE1BQUlDLFdBQVdKLFNBQVNLLHNC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
