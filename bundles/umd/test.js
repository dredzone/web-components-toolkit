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

  /*  */

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

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9tZXJnZS5qcyIsIi4uLy4uL2xpYi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaHR0cC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0ICh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHRlbXBsYXRlQ29udGVudCBmcm9tICcuL3RlbXBsYXRlLWNvbnRlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoaHRtbCkgPT4ge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWwudHJpbSgpO1xuICBjb25zdCBmcmFnID0gdGVtcGxhdGVDb250ZW50KHRlbXBsYXRlKTtcbiAgaWYgKGZyYWcgJiYgZnJhZy5maXJzdENoaWxkKSB7XG4gICAgcmV0dXJuIGZyYWcuZmlyc3RDaGlsZDtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjcmVhdGVFbGVtZW50IGZvciAke2h0bWx9YCk7XG59O1xuIiwiaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KSkgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xubGV0IGN1cnJIYW5kbGUgPSAwO1xubGV0IGxhc3RIYW5kbGUgPSAwO1xubGV0IGNhbGxiYWNrcyA9IFtdO1xubGV0IG5vZGVDb250ZW50ID0gMDtcbmxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4vKipcbiAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0ICB0aW1pbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICovXG5leHBvcnQgY29uc3QgcnVuID0gKGNhbGxiYWNrKSA9PiB7XG4gIG5vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobm9kZUNvbnRlbnQrKyk7XG4gIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIGN1cnJIYW5kbGUrKztcbn07XG5cbi8qKlxuICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYGAgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAqL1xuZXhwb3J0IGNvbnN0IGNhbmNlbCA9IChoYW5kbGUpID0+IHtcbiAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbGFzdEhhbmRsZTtcbiAgaWYgKGlkeCA+PSAwKSB7XG4gICAgaWYgKCFjYWxsYmFja3NbaWR4XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgfVxuICAgIGNhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgfVxufTtcblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIGxhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0ICogYXMgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCAqIGFzIG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID0gY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9IHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN1cnJlbnRQcm9wcywgY2hhbmdlZFByb3BzLCBvbGRQcm9wcykge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+IHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpKSB8fCBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PiBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgeyBpc051bWJlciwgaXNBcnJheSwgaXNCb29sZWFuLCBpc0RhdGUsIGlzU3RyaW5nLCBpc09iamVjdCB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gKGlzQXJyYXkgPyBudWxsIDoge30pIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSA9IGZhbHNlKSA9PiB7XG4gIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtcHJvcGVydGllcy5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS1ldmVudHMvbGlzdGVuLWV2ZW50LmpzJztcblxuY2xhc3MgUHJvcGVydGllc1Rlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtdGVzdCcpO1xuXG5kZXNjcmliZSgnY3VzdG9tLWVsZW1lbnQtcHJvcGVydGllcycsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc1Rlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLXRlc3QnKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuXHQgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc1Rlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNUZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNUZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNUZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNUZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNUZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBhZnRlciBmcm9tICcuLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHR5cGUsIGFzc2lnbihldmVudERlZmF1bHRQYXJhbXMsIHsgZGV0YWlsOiBkYXRhIH0pKSk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1ldmVudHMuanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi9saWIvZG9tLWV2ZW50cy9zdG9wLWV2ZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdjdXN0b20tZWxlbWVudC1ldmVudHMnLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuc29tZShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLmV2ZXJ5KGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbnkgfSBmcm9tICcuL2FycmF5L2FueS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGFsbCB9IGZyb20gJy4vYXJyYXkvYWxsLmpzJztcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9IFtcbiAgJ01hcCcsXG4gICdTZXQnLFxuICAnU3ltYm9sJyxcbiAgJ0FycmF5JyxcbiAgJ09iamVjdCcsXG4gICdTdHJpbmcnLFxuICAnRGF0ZScsXG4gICdSZWdFeHAnLFxuICAnRnVuY3Rpb24nLFxuICAnQm9vbGVhbicsXG4gICdOdW1iZXInLFxuICAnTnVsbCcsXG4gICdVbmRlZmluZWQnLFxuICAnQXJndW1lbnRzJyxcbiAgJ0Vycm9yJyxcbiAgJ1JlcXVlc3QnLFxuICAnUmVzcG9uc2UnLFxuICAnSGVhZGVycycsXG4gICdCbG9iJ1xuXTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5cbmV4cG9ydCBkZWZhdWx0IChzZXR1cCgpKTtcblxuZXhwb3J0IGNvbnN0IGdldFR5cGUgPSAoc3JjKSA9PiBnZXRTcmNUeXBlKHNyYyk7XG5cbmZ1bmN0aW9uIGdldFNyY1R5cGUoc3JjKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChzcmMpO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGxldCBjaGVja3MgPSB7fTtcbiAgZm9yIChsZXQgaSA9IGxlbjsgaS0tOyApIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaV0udG9Mb3dlckNhc2UoKTtcbiAgICBjaGVja3NbdHlwZV0gPSBzcmMgPT4gZ2V0U3JjVHlwZShzcmMpID09PSB0eXBlO1xuICAgIGNoZWNrc1t0eXBlXS5hbGwgPSBkb0FsbEFwaShjaGVja3NbdHlwZV0pO1xuICAgIGNoZWNrc1t0eXBlXS5hbnkgPSBkb0FueUFwaShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG4iLCIvKiAgKi9cbmltcG9ydCBpcywgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzcmMpID0+IGNsb25lKHNyYywgW10sIFtdKTtcblxuZnVuY3Rpb24gY2xvbmUoc3JjLCBjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoaXMudW5kZWZpbmVkKHNyYykgfHwgaXMubnVsbChzcmMpIHx8IGlzUHJpbWl0aXZlKHNyYykgfHwgaXMuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cbiAgcmV0dXJuIGNsb25lcihnZXRUeXBlKHNyYyksIHNyYywgY2lyY3VsYXJzLCBjbG9uZXMpO1xufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShzcmMpIHtcbiAgcmV0dXJuIGlzLmJvb2xlYW4oc3JjKSB8fCBpcy5udW1iZXIoc3JjKSB8fCBpcy5zdHJpbmcoc3JjKTtcbn1cblxuZnVuY3Rpb24gY2xvbmVyKHR5cGUsIGNvbnRleHQsIC4uLmFyZ3MpIHtcbiAgY29uc3QgaGFuZGxlcnMgPSB7XG4gICAgZGF0ZSgpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmdldFRpbWUoKSk7XG4gICAgfSxcbiAgICByZWdleHAoKSB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzKTtcbiAgICB9LFxuICAgIGFycmF5KCkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwKGNsb25lKTtcbiAgICB9LFxuICAgIG1hcCgpIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20odGhpcy5lbnRyaWVzKCkpKTtcbiAgICB9LFxuICAgIHNldCgpIHtcbiAgICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20odGhpcy52YWx1ZXMoKSkpO1xuICAgIH0sXG4gICAgcmVxdWVzdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfSxcbiAgICByZXNwb25zZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfSxcbiAgICBoZWFkZXJzKCkge1xuICAgICAgbGV0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgICAgZm9yIChsZXQgW25hbWUsIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMpIHtcbiAgICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICBibG9iKCkge1xuICAgICAgcmV0dXJuIG5ldyBCbG9iKFt0aGlzXSwgeyB0eXBlOiB0aGlzLnR5cGUgfSk7XG4gICAgfSxcbiAgICBvYmplY3QoY2lyY3VsYXJzID0gW10sIGNsb25lcyA9IFtdKSB7XG4gICAgICBjaXJjdWxhcnMucHVzaCh0aGlzKTtcbiAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG4gICAgICBjbG9uZXMucHVzaChvYmopO1xuICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcbiAgICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHRoaXNba2V5XSk7XG4gICAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHRoaXNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH07XG4gIGlmICh0eXBlIGluIGhhbmRsZXJzKSB7XG4gICAgY29uc3QgZm4gPSBoYW5kbGVyc1t0eXBlXTtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG4iLCJpbXBvcnQgY2xvbmUgZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcblx0aXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcblx0XHQvLyBOdWxsXG5cdFx0ZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG5cdFx0Ly8gVW5kZWZpbmVkXG5cdFx0ZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuXHRcdC8vIEZ1bmN0aW9uXG5cdFx0Y29uc3QgZnVuYyA9ICgpID0+IHt9O1xuXHRcdGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG5cdFx0Ly8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHZhbHVlLCByZXZpdmVyID0gKGssIHYpID0+IHYpID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCByZXZpdmVyKTtcbiIsImltcG9ydCBqc29uQ2xvbmUgZnJvbSAnLi4vLi4vbGliL29iamVjdC9qc29uLWNsb25lLmpzJztcblxuZGVzY3JpYmUoJ2pzb24tY2xvbmUnLCAoKSA9PiB7XG5cdGl0KCdub24tc2VyaWFsaXphYmxlIHZhbHVlcyB0aHJvdycsICgpID0+IHtcblx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCkpLnRvLnRocm93KEVycm9yKTtcblx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCgpID0+IHt9KSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUodW5kZWZpbmVkKSkudG8udGhyb3coRXJyb3IpO1xuXHR9KTtcblxuXHRpdCgncHJpbWl0aXZlIHNlcmlhbGl6YWJsZSB2YWx1ZXMnLCAoKSA9PiB7XG5cdFx0ZXhwZWN0KGpzb25DbG9uZShudWxsKSkudG8uYmUubnVsbDtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG5cdH0pO1xuXG5cdGl0KCdvYmplY3QgY2xvbmVkJywgKCkgPT4ge1xuXHRcdGNvbnN0IG9iaiA9IHsnYSc6ICdiJ307XG5cdFx0ZXhwZWN0KGpzb25DbG9uZShvYmopKS5ub3QudG8uYmUuZXF1YWwob2JqKTtcblx0fSk7XG5cblx0aXQoJ3Jldml2ZXIgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJzInfTtcblx0XHRjb25zdCBjbG9uZWQgPSBqc29uQ2xvbmUob2JqLCAoaywgdikgPT4gayAhPT0gJycgPyBOdW1iZXIodikgKiAyIDogdik7XG5cdFx0ZXhwZWN0KGNsb25lZC5hKS5lcXVhbCg0KTtcblx0fSk7XG59KTsiLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIG9ialtrZXldID8gb2JqW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgbGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0ID0gZGVmYXVsdFZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBkZXB0aCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3RbcGFydHNbaV1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0W3BhcnRzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICB9XG4gIG9iamVjdFtwYXJ0c1tkZXB0aF1dID0gdmFsdWU7XG59O1xuIiwiLyogICovXG5pbXBvcnQgaXMsIHsgZ2V0VHlwZSB9IGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IGNsb25lIGZyb20gJy4vY2xvbmUuanMnO1xuXG5cbmV4cG9ydCBjb25zdCBhcnJheVJlcGxhY2VTdHJhdGVneSA9IChzb3VyY2UsIHRhcmdldCkgPT4gY2xvbmUodGFyZ2V0KTtcblxuZXhwb3J0IGNvbnN0IGZhY3RvcnkgPSAob3B0cyA9IHsgYXJyYXlNZXJnZTogYXJyYXlSZXBsYWNlU3RyYXRlZ3kgfSkgPT4gKFxuICAuLi5hcmdzXG4pID0+IHtcbiAgbGV0IHJlc3VsdDtcblxuICBmb3IgKGxldCBpID0gYXJncy5sZW5ndGg7IGkgPiAwOyAtLWkpIHtcbiAgICByZXN1bHQgPSBtZXJnZShhcmdzLnBvcCgpLCByZXN1bHQsIG9wdHMpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZhY3RvcnkoKTtcblxuZnVuY3Rpb24gbWVyZ2Uoc291cmNlLCB0YXJnZXQsIG9wdHMpIHtcbiAgaWYgKGlzLnVuZGVmaW5lZCh0YXJnZXQpKSB7XG4gICAgcmV0dXJuIGNsb25lKHNvdXJjZSk7XG4gIH1cblxuICBsZXQgdHlwZSA9IGdldFR5cGUoc291cmNlKTtcbiAgaWYgKHR5cGUgPT09IGdldFR5cGUodGFyZ2V0KSkge1xuICAgIHJldHVybiBtZXJnZXIodHlwZSwgc291cmNlLCB0YXJnZXQsIG9wdHMpO1xuICB9XG4gIHJldHVybiBjbG9uZSh0YXJnZXQpO1xufVxuXG5mdW5jdGlvbiBtZXJnZXIodHlwZSwgc291cmNlLCB0YXJnZXQsIG9wdHMpIHtcbiAgY29uc3QgaGFuZGxlcnMgPSB7XG4gICAgb2JqZWN0KCkge1xuICAgICAgY29uc3QgcmVzdWx0ID0ge307XG5cbiAgICAgIGNvbnN0IGtleXMgPSB7XG4gICAgICAgIHNvdXJjZTogT2JqZWN0LmtleXMoc291cmNlKSxcbiAgICAgICAgdGFyZ2V0OiBPYmplY3Qua2V5cyh0YXJnZXQpXG4gICAgICB9O1xuXG4gICAgICBrZXlzLnNvdXJjZS5jb25jYXQoa2V5cy50YXJnZXQpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHNvdXJjZVtrZXldLCB0YXJnZXRba2V5XSwgb3B0cyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgYXJyYXkoKSB7XG4gICAgICByZXR1cm4gb3B0cy5hcnJheU1lcmdlLmFwcGx5KG51bGwsIFtzb3VyY2UsIHRhcmdldF0pO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZSBpbiBoYW5kbGVycykge1xuICAgIHJldHVybiBoYW5kbGVyc1t0eXBlXSgpO1xuICB9XG4gIHJldHVybiBjbG9uZSh0YXJnZXQpO1xufVxuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAobykgPT5cbiAgT2JqZWN0LmtleXMobykucmVkdWNlKChtLCBrKSA9PiBtLnNldChrLCBvW2tdKSwgbmV3IE1hcCgpKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkZ2V0IH0gZnJvbSAnLi9vYmplY3QvZGdldC5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGRzZXQgfSBmcm9tICcuL29iamVjdC9kc2V0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgY2xvbmUgfSBmcm9tICcuL29iamVjdC9jbG9uZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIG1lcmdlIH0gZnJvbSAnLi9vYmplY3QvbWVyZ2UuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBqc29uQ2xvbmUgfSBmcm9tICcuL29iamVjdC9qc29uLWNsb25lLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgb2JqZWN0VG9NYXAgfSBmcm9tICcuL29iamVjdC9vYmplY3QtdG8tbWFwLmpzJztcbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgeyBjbG9uZSwgbWVyZ2UgfSBmcm9tICcuL29iamVjdC5qcyc7XG5cblxuXG5cblxuXG5cbmV4cG9ydCBjb25zdCBIdHRwTWV0aG9kcyA9IE9iamVjdC5mcmVlemUoe1xuICBHZXQ6ICdHRVQnLFxuICBQb3N0OiAnUE9TVCcsXG4gIFB1dDogJ1BVVCcsXG4gIFBhdGNoOiAnUEFUQ0gnLFxuICBEZWxldGU6ICdERUxFVEUnXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gbmV3IEh0dHAoY3JlYXRlQ29uZmlnKCkpO1xuXG5jb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuY2xhc3MgSHR0cEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZXNwb25zZSkge1xuICAgIHN1cGVyKGAke3Jlc3BvbnNlLnN0YXR1c30gZm9yICR7cmVzcG9uc2UudXJsfWApO1xuICAgIHRoaXMubmFtZSA9ICdIdHRwRXJyb3InO1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgfVxufVxuXG5jbGFzcyBIdHRwIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgcHJpdmF0ZXModGhpcykuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgY2F0Y2hlcihlcnJvcklkLCBjYXRjaGVyKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcuY2F0Y2hlcnMuc2V0KGVycm9ySWQsIGNhdGNoZXIpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgbWlkZGxld2FyZShtaWRkbGV3YXJlLCBjbGVhciA9IGZhbHNlKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcubWlkZGxld2FyZSA9IGNsZWFyID8gbWlkZGxld2FyZSA6IGNvbmZpZy5taWRkbGV3YXJlLmNvbmNhdChtaWRkbGV3YXJlKTtcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIHVybCh1cmwsIHJlcGxhY2UgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLnVybCA9IHJlcGxhY2UgPyB1cmwgOiBjb25maWcudXJsICsgdXJsO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgb3B0aW9ucyhvcHRpb25zLCBtaXhpbiA9IHRydWUpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5vcHRpb25zID0gbWl4aW4gPyBtZXJnZShjb25maWcub3B0aW9ucywgb3B0aW9ucykgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIGhlYWRlcnMoaGVhZGVyVmFsdWVzKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcub3B0aW9ucy5oZWFkZXJzID0gbWVyZ2UoY29uZmlnLm9wdGlvbnMuaGVhZGVycywgaGVhZGVyVmFsdWVzKTtcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIGFjY2VwdChoZWFkZXJWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhlYWRlcnMoeyBBY2NlcHQ6IGhlYWRlclZhbHVlIH0pO1xuICB9XG5cbiAgY29udGVudChoZWFkZXJWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhlYWRlcnMoeyAnQ29udGVudC1UeXBlJzogaGVhZGVyVmFsdWUgfSk7XG4gIH1cblxuICBtb2RlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IG1vZGU6IHZhbHVlIH0pO1xuICB9XG5cbiAgY3JlZGVudGlhbHModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgY3JlZGVudGlhbHM6IHZhbHVlIH0pO1xuICB9XG5cbiAgY2FjaGUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgY2FjaGU6IHZhbHVlIH0pO1xuICB9XG5cbiAgaW50ZWdyaXR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IGludGVncml0eTogdmFsdWUgfSk7XG4gIH1cblxuICBrZWVwYWxpdmUodmFsdWUgPSB0cnVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IGtlZXBhbGl2ZTogdmFsdWUgfSk7XG4gIH1cblxuICByZWRpcmVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyByZWRpcmVjdDogdmFsdWUgfSk7XG4gIH1cblxuICBib2R5KGNvbnRlbnRzKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcub3B0aW9ucy5ib2R5ID0gY29udGVudHM7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBhdXRoKGhlYWRlclZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycyh7IEF1dGhvcml6YXRpb246IGhlYWRlclZhbHVlIH0pO1xuICB9XG5cbiAganNvbih2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnQoJ2FwcGxpY2F0aW9uL2pzb24nKS5ib2R5KEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH1cblxuICBmb3JtKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuYm9keShjb252ZXJ0Rm9ybVVybCh2YWx1ZSkpLmNvbnRlbnQoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICB9XG5cbiAgbWV0aG9kKHZhbHVlID0gSHR0cE1ldGhvZHMuR2V0KSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IG1ldGhvZDogdmFsdWUgfSk7XG4gIH1cblxuICBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLkdldCkuc2VuZCgpO1xuICB9XG5cbiAgcG9zdCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuUG9zdCkuc2VuZCgpO1xuICB9XG5cbiAgaW5zZXJ0KCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5QdXQpLnNlbmQoKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuUGF0Y2gpLnNlbmQoKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuRGVsZXRlKS5zZW5kKCk7XG4gIH1cblxuICBzZW5kKCkge1xuICAgIGNvbnN0IHsgdXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlLCByZXNvbHZlcnMsIGNhdGNoZXJzIH0gPSBwcml2YXRlcyh0aGlzKS5jb25maWc7XG4gICAgY29uc3QgcmVxdWVzdCA9IGFwcGx5TWlkZGxld2FyZShtaWRkbGV3YXJlKShmZXRjaCk7XG4gICAgY29uc3Qgd3JhcHBlciA9IHJlcXVlc3QodXJsLCBvcHRpb25zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgSHR0cEVycm9yKHJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRvQ2F0Y2ggPSAocHJvbWlzZSkgPT4ge1xuICAgICAgcmV0dXJuIHByb21pc2UuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGNhdGNoZXJzLmhhcyhlcnIuc3RhdHVzKSkge1xuICAgICAgICAgIHJldHVybiBjYXRjaGVycy5nZXQoZXJyLnN0YXR1cykoZXJyLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2F0Y2hlcnMuaGFzKGVyci5uYW1lKSkge1xuICAgICAgICAgIHJldHVybiBjYXRjaGVycy5nZXQoZXJyLm5hbWUpKGVyciwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHdyYXBUeXBlUGFyc2VyID0gKGZ1bk5hbWUpID0+IChjYikgPT5cbiAgICAgIGZ1bk5hbWVcbiAgICAgICAgPyBkb0NhdGNoKFxuICAgICAgICAgICAgd3JhcHBlclxuICAgICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlICYmIHJlc3BvbnNlW2Z1bk5hbWVdKCkpXG4gICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IChyZXNwb25zZSAmJiBjYiAmJiBjYihyZXNwb25zZSkpIHx8IHJlc3BvbnNlKVxuICAgICAgICAgIClcbiAgICAgICAgOiBkb0NhdGNoKHdyYXBwZXIudGhlbihyZXNwb25zZSA9PiAocmVzcG9uc2UgJiYgY2IgJiYgY2IocmVzcG9uc2UpKSB8fCByZXNwb25zZSkpO1xuXG4gICAgY29uc3QgcmVzcG9uc2VDaGFpbiA9IHtcbiAgICAgIHJlczogd3JhcFR5cGVQYXJzZXIobnVsbCksXG4gICAgICBqc29uOiB3cmFwVHlwZVBhcnNlcignanNvbicpXG4gICAgfTtcblxuICAgIHJldHVybiByZXNvbHZlcnMucmVkdWNlKChjaGFpbiwgcikgPT4gcihjaGFpbiwgb3B0aW9ucyksIHJlc3BvbnNlQ2hhaW4pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZShtaWRkbGV3YXJlcykge1xuICByZXR1cm4gKGZldGNoRnVuY3Rpb24pID0+IHtcbiAgICBpZiAobWlkZGxld2FyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmV0Y2hGdW5jdGlvbjtcbiAgICB9XG5cbiAgICBpZiAobWlkZGxld2FyZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gbWlkZGxld2FyZXNbMF0oZmV0Y2hGdW5jdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIChtaWRkbGV3YXJlcy5yZWR1Y2VSaWdodChcbiAgICAgIChhY2MsIGN1cnIsIGlkeCkgPT4gKGlkeCA9PT0gbWlkZGxld2FyZXMubGVuZ3RoIC0gMiA/IGN1cnIoYWNjKGZldGNoRnVuY3Rpb24pKSA6IGN1cnIoKGFjYykpKVxuICAgICkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb25maWcoKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIHtcbiAgICAgIHVybDogJycsXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIGNhdGNoZXJzOiBuZXcgTWFwKCksXG4gICAgICByZXNvbHZlcnM6IFtdLFxuICAgICAgbWlkZGxld2FyZTogW11cbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGb3JtVXJsKGZvcm1PYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGZvcm1PYmplY3QpXG4gICAgLm1hcChcbiAgICAgIGtleSA9PlxuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArXG4gICAgICAgICc9JyArXG4gICAgICAgIGAke2VuY29kZVVSSUNvbXBvbmVudCh0eXBlb2YgZm9ybU9iamVjdFtrZXldID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KGZvcm1PYmplY3Rba2V5XSkgOiBmb3JtT2JqZWN0W2tleV0pfWBcbiAgICApXG4gICAgLmpvaW4oJyYnKTtcbn1cbiIsImltcG9ydCBodHRwIGZyb20gJy4uL2xpYi9odHRwLmpzJztcblxuZGVzY3JpYmUoJ2h0dHAnLCAoKSA9PiB7XG5cdGl0KCdjcmVhdGUgaHR0cCcsICgpID0+IHtcblx0XHRjb25zdCBkZWxheU1pZGRsZXdhcmUgPSBkZWxheSA9PiBuZXh0ID0+ICh1cmwsIG9wdHMpID0+IHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dCgoKSA9PiByZXMobmV4dCh1cmwsIG9wdHMpKSwgZGVsYXkpKTtcblx0XHR9O1xuXG5cdFx0LyogTG9ncyBhbGwgcmVxdWVzdHMgcGFzc2luZyB0aHJvdWdoLiAqL1xuXHRcdGNvbnN0IGxvZ01pZGRsZXdhcmUgPSAoKSA9PiBuZXh0ID0+ICh1cmwsIG9wdHMpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKG9wdHMubWV0aG9kICsgXCJAXCIgKyB1cmwpO1xuXHRcdFx0cmV0dXJuIG5leHQodXJsLCBvcHRzKVxuXHRcdH07XG5cblx0XHRsZXQganNvbkFwaSA9IGh0dHAoKVxuXHRcdFx0Lmpzb24oKVxuXHRcdFx0Lm1vZGUoJ2NvcnMnKVxuXHRcdFx0Lm1pZGRsZXdhcmUoW2RlbGF5TWlkZGxld2FyZSgzMDAwKSwgbG9nTWlkZGxld2FyZSgpXSlcblx0XHRcdC5jcmVkZW50aWFscygnc2FtZS1vcmlnaW4nKVxuXHRcdFx0LmhlYWRlcnMoeydYLVJlcXVlc3RlZC1CeSc6ICdERUVQLVVJJ30pO1xuXG5cdFx0anNvbkFwaVxuXHRcdFx0LnVybCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdC5nZXQoKVxuXHRcdFx0Lmpzb24oZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhKSk7XG5cdFx0Ly8gYXNzZXJ0Lmluc3RhbmNlT2YoaHR0cCgpLCAnaHR0cCBpcyBpbnN0YW5jZSBvZiBIdHRwJyk7XG5cdH0pO1xufSk7XG4iXSwibmFtZXMiOlsidGVtcGxhdGUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbXBvcnROb2RlIiwiY29udGVudCIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsImNoaWxkcmVuIiwiY2hpbGROb2RlcyIsImkiLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImNsb25lTm9kZSIsImh0bWwiLCJpbm5lckhUTUwiLCJ0cmltIiwiZnJhZyIsInRlbXBsYXRlQ29udGVudCIsImZpcnN0Q2hpbGQiLCJFcnJvciIsImRlc2NyaWJlIiwiaXQiLCJlbCIsImV4cGVjdCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwidG8iLCJlcXVhbCIsImFzc2VydCIsImluc3RhbmNlT2YiLCJOb2RlIiwiY3JlYXRvciIsIk9iamVjdCIsImNyZWF0ZSIsImJpbmQiLCJzdG9yZSIsIldlYWtNYXAiLCJvYmoiLCJ2YWx1ZSIsImdldCIsInNldCIsImJlaGF2aW91ciIsIm1ldGhvZE5hbWVzIiwia2xhc3MiLCJwcm90byIsInByb3RvdHlwZSIsImxlbiIsImRlZmluZVByb3BlcnR5IiwibWV0aG9kTmFtZSIsIm1ldGhvZCIsImFyZ3MiLCJ1bnNoaWZ0IiwiYXBwbHkiLCJ3cml0YWJsZSIsImN1cnJIYW5kbGUiLCJjYWxsYmFja3MiLCJub2RlQ29udGVudCIsIm5vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJmbHVzaCIsIm9ic2VydmUiLCJjaGFyYWN0ZXJEYXRhIiwicnVuIiwiY2FsbGJhY2siLCJ0ZXh0Q29udGVudCIsIlN0cmluZyIsInB1c2giLCJjYiIsImVyciIsInNldFRpbWVvdXQiLCJzcGxpY2UiLCJsYXN0SGFuZGxlIiwiZ2xvYmFsIiwiZGVmYXVsdFZpZXciLCJIVE1MRWxlbWVudCIsIl9IVE1MRWxlbWVudCIsImJhc2VDbGFzcyIsImN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MiLCJoYXNPd25Qcm9wZXJ0eSIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsImZpbmFsaXplQ2xhc3MiLCJkZWZpbmUiLCJ0YWdOYW1lIiwicmVnaXN0cnkiLCJjdXN0b21FbGVtZW50cyIsImZvckVhY2giLCJjYWxsYmFja01ldGhvZE5hbWUiLCJjYWxsIiwiY29uZmlndXJhYmxlIiwibmV3Q2FsbGJhY2tOYW1lIiwic3Vic3RyaW5nIiwib3JpZ2luYWxNZXRob2QiLCJhcm91bmQiLCJjcmVhdGVDb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UiLCJjcmVhdGVSZW5kZXJBZHZpY2UiLCJpbml0aWFsaXplZCIsImNvbnN0cnVjdCIsImF0dHJpYnV0ZUNoYW5nZWQiLCJhdHRyaWJ1dGVOYW1lIiwib2xkVmFsdWUiLCJuZXdWYWx1ZSIsImNvbm5lY3RlZCIsImRpc2Nvbm5lY3RlZCIsImFkb3B0ZWQiLCJyZW5kZXIiLCJfb25SZW5kZXIiLCJfcG9zdFJlbmRlciIsImNvbm5lY3RlZENhbGxiYWNrIiwiY29udGV4dCIsInJlbmRlckNhbGxiYWNrIiwicmVuZGVyaW5nIiwiZmlyc3RSZW5kZXIiLCJ1bmRlZmluZWQiLCJtaWNyb1Rhc2siLCJkaXNjb25uZWN0ZWRDYWxsYmFjayIsImtleXMiLCJhc3NpZ24iLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMiLCJwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzIiwicHJvcGVydGllc0NvbmZpZyIsImRhdGFIYXNBY2Nlc3NvciIsImRhdGFQcm90b1ZhbHVlcyIsImVuaGFuY2VQcm9wZXJ0eUNvbmZpZyIsImNvbmZpZyIsImhhc09ic2VydmVyIiwiaXNPYnNlcnZlclN0cmluZyIsIm9ic2VydmVyIiwiaXNTdHJpbmciLCJ0eXBlIiwiaXNOdW1iZXIiLCJOdW1iZXIiLCJpc0Jvb2xlYW4iLCJCb29sZWFuIiwiaXNPYmplY3QiLCJpc0FycmF5IiwiQXJyYXkiLCJpc0RhdGUiLCJEYXRlIiwibm90aWZ5IiwicmVhZE9ubHkiLCJyZWZsZWN0VG9BdHRyaWJ1dGUiLCJub3JtYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllcyIsIm91dHB1dCIsIm5hbWUiLCJwcm9wZXJ0eSIsImluaXRpYWxpemVQcm9wZXJ0aWVzIiwiX2ZsdXNoUHJvcGVydGllcyIsImNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSIsImF0dHJpYnV0ZSIsIl9hdHRyaWJ1dGVUb1Byb3BlcnR5IiwiY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UiLCJjdXJyZW50UHJvcHMiLCJjaGFuZ2VkUHJvcHMiLCJvbGRQcm9wcyIsImNvbnN0cnVjdG9yIiwiY2xhc3NQcm9wZXJ0aWVzIiwiX3Byb3BlcnR5VG9BdHRyaWJ1dGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJkZXRhaWwiLCJiZWZvcmUiLCJjcmVhdGVQcm9wZXJ0aWVzIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUiLCJoeXBlblJlZ0V4IiwicmVwbGFjZSIsIm1hdGNoIiwidG9VcHBlckNhc2UiLCJwcm9wZXJ0eU5hbWVUb0F0dHJpYnV0ZSIsInVwcGVyY2FzZVJlZ0V4IiwidG9Mb3dlckNhc2UiLCJwcm9wZXJ0eVZhbHVlIiwiX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IiLCJkYXRhIiwic2VyaWFsaXppbmciLCJkYXRhUGVuZGluZyIsImRhdGFPbGQiLCJkYXRhSW52YWxpZCIsIl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzIiwiX2luaXRpYWxpemVQcm9wZXJ0aWVzIiwicHJvcGVydGllc0NoYW5nZWQiLCJlbnVtZXJhYmxlIiwiX2dldFByb3BlcnR5IiwiX3NldFByb3BlcnR5IiwiX2lzVmFsaWRQcm9wZXJ0eVZhbHVlIiwiX3NldFBlbmRpbmdQcm9wZXJ0eSIsIl9pbnZhbGlkYXRlUHJvcGVydGllcyIsImNvbnNvbGUiLCJsb2ciLCJfZGVzZXJpYWxpemVWYWx1ZSIsInByb3BlcnR5VHlwZSIsImlzVmFsaWQiLCJfc2VyaWFsaXplVmFsdWUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJwcm9wZXJ0eUNvbmZpZyIsInN0cmluZ2lmeSIsInRvU3RyaW5nIiwib2xkIiwiY2hhbmdlZCIsIl9zaG91bGRQcm9wZXJ0eUNoYW5nZSIsInByb3BzIiwiX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UiLCJtYXAiLCJnZXRQcm9wZXJ0aWVzQ29uZmlnIiwiY2hlY2tPYmoiLCJsb29wIiwiZ2V0UHJvdG90eXBlT2YiLCJGdW5jdGlvbiIsInRhcmdldCIsImxpc3RlbmVyIiwiY2FwdHVyZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpbmRleE9mIiwiZXZlbnRzIiwic3BsaXQiLCJoYW5kbGVzIiwiaGFuZGxlIiwicG9wIiwiUHJvcGVydGllc1Rlc3QiLCJwcm9wIiwicmVmbGVjdEZyb21BdHRyaWJ1dGUiLCJmblZhbHVlUHJvcCIsImN1c3RvbUVsZW1lbnQiLCJjb250YWluZXIiLCJwcm9wZXJ0aWVzVGVzdCIsImdldEVsZW1lbnRCeUlkIiwiYXBwZW5kIiwiYWZ0ZXIiLCJsaXN0ZW5FdmVudCIsImlzT2siLCJldnQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZXJzIiwiZXZlbnREZWZhdWx0UGFyYW1zIiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJoYW5kbGVFdmVudCIsImV2ZW50Iiwib24iLCJvd24iLCJkaXNwYXRjaCIsIm9mZiIsImhhbmRsZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkV2ZW50c0VtaXR0ZXIiLCJFdmVudHNMaXN0ZW5lciIsImVtbWl0ZXIiLCJzdG9wRXZlbnQiLCJjaGFpIiwiYSIsImRlZXAiLCJib2R5IiwiYXJyIiwiZm4iLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidHlwZXMiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwic2V0dXAiLCJnZXRUeXBlIiwic3JjIiwiZ2V0U3JjVHlwZSIsIm1hdGNoZXMiLCJjaGVja3MiLCJjbG9uZSIsImNpcmN1bGFycyIsImNsb25lcyIsImlzIiwibnVsbCIsImlzUHJpbWl0aXZlIiwiZnVuY3Rpb24iLCJjbG9uZXIiLCJib29sZWFuIiwibnVtYmVyIiwic3RyaW5nIiwiZGF0ZSIsImdldFRpbWUiLCJyZWdleHAiLCJSZWdFeHAiLCJhcnJheSIsIk1hcCIsImZyb20iLCJlbnRyaWVzIiwiU2V0IiwidmFsdWVzIiwicmVxdWVzdCIsInJlc3BvbnNlIiwiaGVhZGVycyIsIkhlYWRlcnMiLCJibG9iIiwiQmxvYiIsIm9iamVjdCIsImtleSIsImlkeCIsImZpbmRJbmRleCIsImJlIiwiZnVuYyIsImlzRnVuY3Rpb24iLCJyZXZpdmVyIiwiayIsInYiLCJqc29uQ2xvbmUiLCJ0aHJvdyIsIm5vdCIsImNsb25lZCIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJub3RCb29sIiwiZXJyb3IiLCJub3RFcnJvciIsIm5vdEZ1bmN0aW9uIiwibm90TnVsbCIsIm5vdE51bWJlciIsIm5vdE9iamVjdCIsIm5vdFJlZ2V4cCIsImFycmF5UmVwbGFjZVN0cmF0ZWd5Iiwic291cmNlIiwiZmFjdG9yeSIsIm9wdHMiLCJhcnJheU1lcmdlIiwicmVzdWx0IiwibWVyZ2UiLCJtZXJnZXIiLCJjb25jYXQiLCJIdHRwTWV0aG9kcyIsImZyZWV6ZSIsIkdldCIsIlBvc3QiLCJQdXQiLCJQYXRjaCIsIkRlbGV0ZSIsIkh0dHAiLCJjcmVhdGVDb25maWciLCJIdHRwRXJyb3IiLCJzdGF0dXMiLCJ1cmwiLCJjYXRjaGVyIiwiZXJyb3JJZCIsImNhdGNoZXJzIiwibWlkZGxld2FyZSIsImNsZWFyIiwib3B0aW9ucyIsIm1peGluIiwiaGVhZGVyVmFsdWVzIiwiYWNjZXB0IiwiaGVhZGVyVmFsdWUiLCJBY2NlcHQiLCJtb2RlIiwiY3JlZGVudGlhbHMiLCJjYWNoZSIsImludGVncml0eSIsImtlZXBhbGl2ZSIsInJlZGlyZWN0IiwiY29udGVudHMiLCJhdXRoIiwiQXV0aG9yaXphdGlvbiIsImpzb24iLCJmb3JtIiwiY29udmVydEZvcm1VcmwiLCJzZW5kIiwicG9zdCIsImluc2VydCIsInVwZGF0ZSIsImRlbGV0ZSIsInJlc29sdmVycyIsImFwcGx5TWlkZGxld2FyZSIsImZldGNoIiwid3JhcHBlciIsInRoZW4iLCJvayIsImRvQ2F0Y2giLCJwcm9taXNlIiwiY2F0Y2giLCJoYXMiLCJ3cmFwVHlwZVBhcnNlciIsImZ1bk5hbWUiLCJyZXNwb25zZUNoYWluIiwicmVzIiwicmVkdWNlIiwiY2hhaW4iLCJyIiwibWlkZGxld2FyZXMiLCJmZXRjaEZ1bmN0aW9uIiwicmVkdWNlUmlnaHQiLCJhY2MiLCJjdXJyIiwiZm9ybU9iamVjdCIsImVuY29kZVVSSUNvbXBvbmVudCIsImJhYmVsSGVscGVycy50eXBlb2YiLCJqb2luIiwiZGVsYXlNaWRkbGV3YXJlIiwiUHJvbWlzZSIsIm5leHQiLCJkZWxheSIsImxvZ01pZGRsZXdhcmUiLCJqc29uQXBp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
