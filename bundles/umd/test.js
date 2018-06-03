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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9tZXJnZS5qcyIsIi4uLy4uL2xpYi9vYmplY3Qvb2JqZWN0LXRvLW1hcC5qcyIsIi4uLy4uL2xpYi9vYmplY3QuanMiLCIuLi8uLi9saWIvaHR0cC5qcyIsIi4uLy4uL3Rlc3QvaHR0cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0ICh0ZW1wbGF0ZSkgPT4ge1xuICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgfVxuXG4gIGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbGV0IGNoaWxkcmVuID0gdGVtcGxhdGUuY2hpbGROb2RlcztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldLmNsb25lTm9kZSh0cnVlKSk7XG4gIH1cbiAgcmV0dXJuIGZyYWdtZW50O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IHRlbXBsYXRlQ29udGVudCBmcm9tICcuL3RlbXBsYXRlLWNvbnRlbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoaHRtbCkgPT4ge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWwudHJpbSgpO1xuICBjb25zdCBmcmFnID0gdGVtcGxhdGVDb250ZW50KHRlbXBsYXRlKTtcbiAgaWYgKGZyYWcgJiYgZnJhZy5maXJzdENoaWxkKSB7XG4gICAgcmV0dXJuIGZyYWcuZmlyc3RDaGlsZDtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjcmVhdGVFbGVtZW50IGZvciAke2h0bWx9YCk7XG59O1xuIiwiaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyc7XG5cbmRlc2NyaWJlKCdjcmVhdGUtZWxlbWVudCcsICgpID0+IHtcbiAgaXQoJ2NyZWF0ZSBlbGVtZW50JywgKCkgPT4ge1xuICAgIGNvbnN0IGVsID0gY3JlYXRlRWxlbWVudChgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwibXktY2xhc3NcIj5IZWxsbyBXb3JsZDwvZGl2PlxuXHRcdGApO1xuICAgIGV4cGVjdChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ215LWNsYXNzJykpLnRvLmVxdWFsKHRydWUpO1xuICAgIGFzc2VydC5pbnN0YW5jZU9mKGVsLCBOb2RlLCAnZWxlbWVudCBpcyBpbnN0YW5jZSBvZiBub2RlJyk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChjcmVhdG9yID0gT2JqZWN0LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHt9KSkgPT4ge1xuICBsZXQgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKG9iaikgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHN0b3JlLmdldChvYmopO1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHN0b3JlLnNldChvYmosICh2YWx1ZSA9IGNyZWF0b3Iob2JqKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBhcmdzLnVuc2hpZnQobWV0aG9kKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xubGV0IGN1cnJIYW5kbGUgPSAwO1xubGV0IGxhc3RIYW5kbGUgPSAwO1xubGV0IGNhbGxiYWNrcyA9IFtdO1xubGV0IG5vZGVDb250ZW50ID0gMDtcbmxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xubmV3IE11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4vKipcbiAqIEVucXVldWVzIGEgZnVuY3Rpb24gY2FsbGVkIGF0ICB0aW1pbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gcnVuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEhhbmRsZSB1c2VkIGZvciBjYW5jZWxpbmcgdGFza1xuICovXG5leHBvcnQgY29uc3QgcnVuID0gKGNhbGxiYWNrKSA9PiB7XG4gIG5vZGUudGV4dENvbnRlbnQgPSBTdHJpbmcobm9kZUNvbnRlbnQrKyk7XG4gIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIGN1cnJIYW5kbGUrKztcbn07XG5cbi8qKlxuICogQ2FuY2VscyBhIHByZXZpb3VzbHkgZW5xdWV1ZWQgYGAgY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGhhbmRsZSBIYW5kbGUgcmV0dXJuZWQgZnJvbSBgcnVuYCBvZiBjYWxsYmFjayB0byBjYW5jZWxcbiAqL1xuZXhwb3J0IGNvbnN0IGNhbmNlbCA9IChoYW5kbGUpID0+IHtcbiAgY29uc3QgaWR4ID0gaGFuZGxlIC0gbGFzdEhhbmRsZTtcbiAgaWYgKGlkeCA+PSAwKSB7XG4gICAgaWYgKCFjYWxsYmFja3NbaWR4XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZSk7XG4gICAgfVxuICAgIGNhbGxiYWNrc1tpZHhdID0gbnVsbDtcbiAgfVxufTtcblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGNvbnN0IGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG4gIGxhc3RIYW5kbGUgKz0gbGVuO1xufVxuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgYXJvdW5kIGZyb20gJy4uL2FkdmljZS9hcm91bmQuanMnO1xuaW1wb3J0ICogYXMgbWljcm9UYXNrIGZyb20gJy4uL2RvbS9taWNyb3Rhc2suanMnO1xuXG5jb25zdCBnbG9iYWwgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2lzc3Vlcy8xNzA5XG5pZiAodHlwZW9mIGdsb2JhbC5IVE1MRWxlbWVudCAhPT0gJ2Z1bmN0aW9uJykge1xuICBjb25zdCBfSFRNTEVsZW1lbnQgPSBmdW5jdGlvbiBIVE1MRWxlbWVudCgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtbmFtZXNcbiAgfTtcbiAgX0hUTUxFbGVtZW50LnByb3RvdHlwZSA9IGdsb2JhbC5IVE1MRWxlbWVudC5wcm90b3R5cGU7XG4gIGdsb2JhbC5IVE1MRWxlbWVudCA9IF9IVE1MRWxlbWVudDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IGN1c3RvbUVsZW1lbnRzVjFDYWxsYmFja3MgPSBbXG4gICAgJ2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnZGlzY29ubmVjdGVkQ2FsbGJhY2snLFxuICAgICdhZG9wdGVkQ2FsbGJhY2snLFxuICAgICdhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2snXG4gIF07XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGhhc093blByb3BlcnR5IH0gPSBPYmplY3Q7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG4gIGlmICghYmFzZUNsYXNzKSB7XG4gICAgYmFzZUNsYXNzID0gY2xhc3MgZXh0ZW5kcyBnbG9iYWwuSFRNTEVsZW1lbnQge307XG4gIH1cblxuICByZXR1cm4gY2xhc3MgQ3VzdG9tRWxlbWVudCBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHt9XG5cbiAgICBzdGF0aWMgZGVmaW5lKHRhZ05hbWUpIHtcbiAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gY3VzdG9tRWxlbWVudHM7XG4gICAgICBpZiAoIXJlZ2lzdHJ5LmdldCh0YWdOYW1lKSkge1xuICAgICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrTWV0aG9kTmFtZSkgPT4ge1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lKSkge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSwge1xuICAgICAgICAgICAgICB2YWx1ZSgpIHt9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBuZXdDYWxsYmFja05hbWUgPSBjYWxsYmFja01ldGhvZE5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGNhbGxiYWNrTWV0aG9kTmFtZS5sZW5ndGggLSAnY2FsbGJhY2snLmxlbmd0aFxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBwcm90b1tjYWxsYmFja01ldGhvZE5hbWVdO1xuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHRoaXNbbmV3Q2FsbGJhY2tOYW1lXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmluYWxpemVDbGFzcygpO1xuICAgICAgICBhcm91bmQoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVSZW5kZXJBZHZpY2UoKSwgJ3JlbmRlcicpKHRoaXMpO1xuICAgICAgICByZWdpc3RyeS5kZWZpbmUodGFnTmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGluaXRpYWxpemVkKCkge1xuICAgICAgcmV0dXJuIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVkID09PSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5jb25zdHJ1Y3QoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7fVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkKGF0dHJpYnV0ZU5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge31cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICBjb25uZWN0ZWQoKSB7fVxuXG4gICAgZGlzY29ubmVjdGVkKCkge31cblxuICAgIGFkb3B0ZWQoKSB7fVxuXG4gICAgcmVuZGVyKCkge31cblxuICAgIF9vblJlbmRlcigpIHt9XG5cbiAgICBfcG9zdFJlbmRlcigpIHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIGNvbnRleHQucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlckFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVuZGVyQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgY29uc3QgZmlyc3RSZW5kZXIgPSBwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gdHJ1ZTtcbiAgICAgICAgbWljcm9UYXNrLnJ1bigoKSA9PiB7XG4gICAgICAgICAgaWYgKHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZykge1xuICAgICAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb250ZXh0Ll9vblJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgICByZW5kZXJDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICAgICAgY29udGV4dC5fcG9zdFJlbmRlcihmaXJzdFJlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkaXNjb25uZWN0ZWRDYWxsYmFjaykge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIXByaXZhdGVzKGNvbnRleHQpLmNvbm5lY3RlZCAmJiBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCkge1xuICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgZGlzY29ubmVjdGVkQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGtsYXNzO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGJlZm9yZSBmcm9tICcuLi9hZHZpY2UvYmVmb3JlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCAqIGFzIG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuXG5cblxuXG5leHBvcnQgZGVmYXVsdCAoYmFzZUNsYXNzKSA9PiB7XG4gIGNvbnN0IHsgZGVmaW5lUHJvcGVydHksIGtleXMsIGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZXMgPSB7fTtcbiAgY29uc3QgcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyA9IHt9O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBsZXQgcHJvcGVydGllc0NvbmZpZztcbiAgbGV0IGRhdGFIYXNBY2Nlc3NvciA9IHt9O1xuICBsZXQgZGF0YVByb3RvVmFsdWVzID0ge307XG5cbiAgZnVuY3Rpb24gZW5oYW5jZVByb3BlcnR5Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZy5oYXNPYnNlcnZlciA9ICdvYnNlcnZlcicgaW4gY29uZmlnO1xuICAgIGNvbmZpZy5pc09ic2VydmVyU3RyaW5nID0gY29uZmlnLmhhc09ic2VydmVyICYmIHR5cGVvZiBjb25maWcub2JzZXJ2ZXIgPT09ICdzdHJpbmcnO1xuICAgIGNvbmZpZy5pc1N0cmluZyA9IGNvbmZpZy50eXBlID09PSBTdHJpbmc7XG4gICAgY29uZmlnLmlzTnVtYmVyID0gY29uZmlnLnR5cGUgPT09IE51bWJlcjtcbiAgICBjb25maWcuaXNCb29sZWFuID0gY29uZmlnLnR5cGUgPT09IEJvb2xlYW47XG4gICAgY29uZmlnLmlzT2JqZWN0ID0gY29uZmlnLnR5cGUgPT09IE9iamVjdDtcbiAgICBjb25maWcuaXNBcnJheSA9IGNvbmZpZy50eXBlID09PSBBcnJheTtcbiAgICBjb25maWcuaXNEYXRlID0gY29uZmlnLnR5cGUgPT09IERhdGU7XG4gICAgY29uZmlnLm5vdGlmeSA9ICdub3RpZnknIGluIGNvbmZpZztcbiAgICBjb25maWcucmVhZE9ubHkgPSAncmVhZE9ubHknIGluIGNvbmZpZyA/IGNvbmZpZy5yZWFkT25seSA6IGZhbHNlO1xuICAgIGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGUgPVxuICAgICAgJ3JlZmxlY3RUb0F0dHJpYnV0ZScgaW4gY29uZmlnXG4gICAgICAgID8gY29uZmlnLnJlZmxlY3RUb0F0dHJpYnV0ZVxuICAgICAgICA6IGNvbmZpZy5pc1N0cmluZyB8fCBjb25maWcuaXNOdW1iZXIgfHwgY29uZmlnLmlzQm9vbGVhbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3BlcnRpZXMocHJvcGVydGllcykge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAobGV0IG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0aWVzLCBuYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgIG91dHB1dFtuYW1lXSA9IHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJyA/IHsgdHlwZTogcHJvcGVydHkgfSA6IHByb3BlcnR5O1xuICAgICAgZW5oYW5jZVByb3BlcnR5Q29uZmlnKG91dHB1dFtuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAoT2JqZWN0LmtleXMocHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXNzaWduKGNvbnRleHQsIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKTtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZVByb3BlcnRpZXMgPSB7fTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGF0dHJpYnV0ZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgY29udGV4dC5fYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJvcGVydGllc0NoYW5nZWRBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN1cnJlbnRQcm9wcywgY2hhbmdlZFByb3BzLCBvbGRQcm9wcykge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgT2JqZWN0LmtleXMoY2hhbmdlZFByb3BzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgbm90aWZ5LFxuICAgICAgICAgIGhhc09ic2VydmVyLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZSxcbiAgICAgICAgICBpc09ic2VydmVyU3RyaW5nLFxuICAgICAgICAgIG9ic2VydmVyXG4gICAgICAgIH0gPSBjb250ZXh0LmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgIGlmIChyZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjb250ZXh0Ll9wcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5LCBjaGFuZ2VkUHJvcHNbcHJvcGVydHldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzT2JzZXJ2ZXIgJiYgaXNPYnNlcnZlclN0cmluZykge1xuICAgICAgICAgIHRoaXNbb2JzZXJ2ZXJdKGNoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuYXBwbHkoY29udGV4dCwgW2NoYW5nZWRQcm9wc1twcm9wZXJ0eV0sIG9sZFByb3BzW3Byb3BlcnR5XV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3RpZnkpIHtcbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoYCR7cHJvcGVydHl9LWNoYW5nZWRgLCB7XG4gICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBjaGFuZ2VkUHJvcHNbcHJvcGVydHldLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlOiBvbGRQcm9wc1twcm9wZXJ0eV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIFByb3BlcnRpZXMgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jbGFzc1Byb3BlcnRpZXMpLm1hcCgocHJvcGVydHkpID0+IHRoaXMucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpKSB8fCBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGJlZm9yZShjcmVhdGVDb25uZWN0ZWRBZHZpY2UoKSwgJ2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZUF0dHJpYnV0ZUNoYW5nZUFkdmljZSgpLCAnYXR0cmlidXRlQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgYmVmb3JlKGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCksICdwcm9wZXJ0aWVzQ2hhbmdlZCcpKHRoaXMpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0aWVzKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lKGF0dHJpYnV0ZSkge1xuICAgICAgbGV0IHByb3BlcnR5ID0gYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV07XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IGh5cGVuUmVnRXggPSAvLShbYS16XSkvZztcbiAgICAgICAgcHJvcGVydHkgPSBhdHRyaWJ1dGUucmVwbGFjZShoeXBlblJlZ0V4LCBtYXRjaCA9PiBtYXRjaFsxXS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzW2F0dHJpYnV0ZV0gPSBwcm9wZXJ0eTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpIHtcbiAgICAgIGxldCBhdHRyaWJ1dGUgPSBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XTtcbiAgICAgIGlmICghYXR0cmlidXRlKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW5kIG1lbW9pemUuXG4gICAgICAgIGNvbnN0IHVwcGVyY2FzZVJlZ0V4ID0gLyhbQS1aXSkvZztcbiAgICAgICAgYXR0cmlidXRlID0gcHJvcGVydHkucmVwbGFjZSh1cHBlcmNhc2VSZWdFeCwgJy0kMScpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXNbcHJvcGVydHldID0gYXR0cmlidXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNsYXNzUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJvcGVydGllc0NvbmZpZykge1xuICAgICAgICBjb25zdCBnZXRQcm9wZXJ0aWVzQ29uZmlnID0gKCkgPT4gcHJvcGVydGllc0NvbmZpZyB8fCB7fTtcbiAgICAgICAgbGV0IGNoZWNrT2JqID0gbnVsbDtcbiAgICAgICAgbGV0IGxvb3AgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlIChsb29wKSB7XG4gICAgICAgICAgY2hlY2tPYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2hlY2tPYmogPT09IG51bGwgPyB0aGlzIDogY2hlY2tPYmopO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFjaGVja09iaiB8fFxuICAgICAgICAgICAgIWNoZWNrT2JqLmNvbnN0cnVjdG9yIHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gSFRNTEVsZW1lbnQgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbiB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IE9iamVjdCB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IGNoZWNrT2JqLmNvbnN0cnVjdG9yLmNvbnN0cnVjdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsb29wID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjaGVja09iaiwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgICAgZ2V0UHJvcGVydGllc0NvbmZpZygpLCAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXMoY2hlY2tPYmoucHJvcGVydGllcylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgcHJvcGVydGllc0NvbmZpZyA9IGFzc2lnbihcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgbm9ybWFsaXplUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXNDb25maWc7XG4gICAgfVxuXG4gICAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuY2xhc3NQcm9wZXJ0aWVzO1xuICAgICAga2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIHByb3BlcnR5KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHNldHVwIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHByb3BlcnR5IGFscmVhZHkgZXhpc3RzYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IHByb3BlcnRpZXNbcHJvcGVydHldLnZhbHVlO1xuICAgICAgICBpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG8uX2NyZWF0ZVByb3BlcnR5QWNjZXNzb3IocHJvcGVydHksIHByb3BlcnRpZXNbcHJvcGVydHldLnJlYWRPbmx5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdCgpIHtcbiAgICAgIHN1cGVyLmNvbnN0cnVjdCgpO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YSA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvdG9Qcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLl9pbml0aWFsaXplUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHByb3BlcnRpZXNDaGFuZ2VkKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge31cblxuICAgIF9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCByZWFkT25seSkge1xuICAgICAgaWYgKCFkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldKSB7XG4gICAgICAgIGRhdGFIYXNBY2Nlc3Nvcltwcm9wZXJ0eV0gPSB0cnVlO1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IHJlYWRPbmx5XG4gICAgICAgICAgICA/ICgpID0+IHt9XG4gICAgICAgICAgICA6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICBfc2V0UHJvcGVydHkocHJvcGVydHksIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5faXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIG5ld1ZhbHVlKSkge1xuICAgICAgICBpZiAodGhpcy5fc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRlUHJvcGVydGllcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCB2YWx1ZSAke25ld1ZhbHVlfSBmb3IgcHJvcGVydHkgJHtwcm9wZXJ0eX0gb2Zcblx0XHRcdFx0XHR0eXBlICR7dGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGUubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFQcm90b1ZhbHVlcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPVxuICAgICAgICAgIHR5cGVvZiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0uY2FsbCh0aGlzKVxuICAgICAgICAgICAgOiBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldO1xuICAgICAgICB0aGlzLl9zZXRQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm9wZXJ0aWVzKCkge1xuICAgICAgT2JqZWN0LmtleXMoZGF0YUhhc0FjY2Vzc29yKS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuaW5pdGlhbGl6ZVByb3BlcnRpZXNbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICAgICAgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfYXR0cmlidXRlVG9Qcm9wZXJ0eShhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdHJ1Y3Rvci5hdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpO1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IHRoaXMuX2Rlc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNWYWxpZFByb3BlcnR5VmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV0udHlwZTtcbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpc1ZhbGlkID0gdmFsdWUgaW5zdGFuY2VvZiBwcm9wZXJ0eVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc1ZhbGlkID0gYCR7dHlwZW9mIHZhbHVlfWAgPT09IHByb3BlcnR5VHlwZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBfcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IHRoaXMuY29uc3RydWN0b3IucHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUocHJvcGVydHkpO1xuICAgICAgdmFsdWUgPSB0aGlzLl9zZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIF9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgeyBpc051bWJlciwgaXNBcnJheSwgaXNCb29sZWFuLCBpc0RhdGUsIGlzU3RyaW5nLCBpc09iamVjdCB9ID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgaWYgKGlzQm9vbGVhbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IDAgOiBOdW1iZXIodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gKGlzQXJyYXkgPyBudWxsIDoge30pIDogSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGF0ZSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eUNvbmZpZyA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGNvbnN0IHsgaXNCb29sZWFuLCBpc09iamVjdCwgaXNBcnJheSB9ID0gcHJvcGVydHlDb25maWc7XG5cbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAoaXNPYmplY3QgfHwgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gdmFsdWUudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBfc2V0UGVuZGluZ1Byb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgbGV0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldO1xuICAgICAgbGV0IGNoYW5nZWQgPSB0aGlzLl9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG4gICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBpZiAoIXByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nKSB7XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSB7fTtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0ge307XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5zdXJlIG9sZCBpcyBjYXB0dXJlZCBmcm9tIHRoZSBsYXN0IHR1cm5cbiAgICAgICAgaWYgKHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgJiYgIShwcm9wZXJ0eSBpbiBwcml2YXRlcyh0aGlzKS5kYXRhT2xkKSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGRbcHJvcGVydHldID0gb2xkO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuXG4gICAgX2ludmFsaWRhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCkge1xuICAgICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2ZsdXNoUHJvcGVydGllcygpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gcHJpdmF0ZXModGhpcykuZGF0YTtcbiAgICAgIGNvbnN0IGNoYW5nZWRQcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nO1xuICAgICAgY29uc3Qgb2xkID0gcHJpdmF0ZXModGhpcykuZGF0YU9sZDtcblxuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UocHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkKSkge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZyA9IG51bGw7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFPbGQgPSBudWxsO1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNDaGFuZ2VkKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3Nob3VsZFByb3BlcnRpZXNDaGFuZ2UoXG4gICAgICBjdXJyZW50UHJvcHMsXG4gICAgICBjaGFuZ2VkUHJvcHMsXG4gICAgICBvbGRQcm9wcyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihjaGFuZ2VkUHJvcHMpO1xuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0eUNoYW5nZShwcm9wZXJ0eSwgdmFsdWUsIG9sZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gU3RyaWN0IGVxdWFsaXR5IGNoZWNrXG4gICAgICAgIG9sZCAhPT0gdmFsdWUgJiZcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIChvbGQ9PU5hTiwgdmFsdWU9PU5hTikgYWx3YXlzIHJldHVybnMgZmFsc2VcbiAgICAgICAgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgICk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSA9IGZhbHNlKSA9PiB7XG4gIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyc7XG5pbXBvcnQgcHJvcGVydGllcyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtcHJvcGVydGllcy5qcyc7XG5pbXBvcnQgbGlzdGVuRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS1ldmVudHMvbGlzdGVuLWV2ZW50LmpzJztcblxuY2xhc3MgUHJvcGVydGllc1Rlc3QgZXh0ZW5kcyBwcm9wZXJ0aWVzKGN1c3RvbUVsZW1lbnQoKSkge1xuICBzdGF0aWMgZ2V0IHByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3A6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ3Byb3AnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHJlZmxlY3RGcm9tQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogKCkgPT4ge30sXG4gICAgICAgIG5vdGlmeTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGZuVmFsdWVQcm9wOiB7XG4gICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5Qcm9wZXJ0aWVzVGVzdC5kZWZpbmUoJ3Byb3BlcnRpZXMtdGVzdCcpO1xuXG5kZXNjcmliZSgnY3VzdG9tLWVsZW1lbnQtcHJvcGVydGllcycsICgpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjtcbiAgY29uc3QgcHJvcGVydGllc1Rlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9wZXJ0aWVzLXRlc3QnKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuXHQgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmQocHJvcGVydGllc1Rlc3QpO1xuICB9KTtcblxuICBhZnRlcigoKSA9PiB7XG4gICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzVGVzdC5wcm9wLCAncHJvcCcpO1xuICB9KTtcblxuICBpdCgncmVmbGVjdGluZyBwcm9wZXJ0aWVzJywgKCkgPT4ge1xuICAgIHByb3BlcnRpZXNUZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgICBwcm9wZXJ0aWVzVGVzdC5fZmx1c2hQcm9wZXJ0aWVzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKHByb3BlcnRpZXNUZXN0LmdldEF0dHJpYnV0ZSgncHJvcCcpLCAncHJvcFZhbHVlJyk7XG4gIH0pO1xuXG4gIGl0KCdub3RpZnkgcHJvcGVydHkgY2hhbmdlJywgKCkgPT4ge1xuICAgIGxpc3RlbkV2ZW50KHByb3BlcnRpZXNUZXN0LCAncHJvcC1jaGFuZ2VkJywgZXZ0ID0+IHtcbiAgICAgIGFzc2VydC5pc09rKGV2dC50eXBlID09PSAncHJvcC1jaGFuZ2VkJywgJ2V2ZW50IGRpc3BhdGNoZWQnKTtcbiAgICB9KTtcblxuICAgIHByb3BlcnRpZXNUZXN0LnByb3AgPSAncHJvcFZhbHVlJztcbiAgfSk7XG5cbiAgaXQoJ3ZhbHVlIGFzIGEgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgYXNzZXJ0LmlzT2soXG4gICAgICBBcnJheS5pc0FycmF5KHByb3BlcnRpZXNUZXN0LmZuVmFsdWVQcm9wKSxcbiAgICAgICdmdW5jdGlvbiBleGVjdXRlZCdcbiAgICApO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYmVoYXZpb3VyLCAuLi5tZXRob2ROYW1lcykgPT4ge1xuICByZXR1cm4gZnVuY3Rpb24oa2xhc3MpIHtcbiAgICBjb25zdCBwcm90byA9IGtsYXNzLnByb3RvdHlwZTtcbiAgICBjb25zdCBsZW4gPSBtZXRob2ROYW1lcy5sZW5ndGg7XG4gICAgY29uc3QgeyBkZWZpbmVQcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBtZXRob2ROYW1lc1tpXTtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHByb3RvW21ldGhvZE5hbWVdO1xuICAgICAgZGVmaW5lUHJvcGVydHkocHJvdG8sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICBiZWhhdmlvdXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBhZnRlciBmcm9tICcuLi9hZHZpY2UvYWZ0ZXIuanMnO1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50LCB7IH0gZnJvbSAnLi4vZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMnO1xuXG5cblxuLyoqXG4gKiBNaXhpbiBhZGRzIEN1c3RvbUV2ZW50IGhhbmRsaW5nIHRvIGFuIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhhbmRsZXJzOiBbXVxuICAgIH07XG4gIH0pO1xuICBjb25zdCBldmVudERlZmF1bHRQYXJhbXMgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgfTtcblxuICByZXR1cm4gY2xhc3MgRXZlbnRzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBmaW5hbGl6ZUNsYXNzKCkge1xuICAgICAgc3VwZXIuZmluYWxpemVDbGFzcygpO1xuICAgICAgYWZ0ZXIoY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCksICdkaXNjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudCkge1xuICAgICAgY29uc3QgaGFuZGxlID0gYG9uJHtldmVudC50eXBlfWA7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaGFuZGxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgIHRoaXNbaGFuZGxlXShldmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICAgIHRoaXMub3duKGxpc3RlbkV2ZW50KHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSk7XG4gICAgfVxuXG4gICAgZGlzcGF0Y2godHlwZSwgZGF0YSA9IHt9KSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHR5cGUsIGFzc2lnbihldmVudERlZmF1bHRQYXJhbXMsIHsgZGV0YWlsOiBkYXRhIH0pKSk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgcHJpdmF0ZXModGhpcykuaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBoYW5kbGVyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3duKC4uLmhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgY29udGV4dC5vZmYoKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoZXZ0KSA9PiB7XG4gIGlmIChldnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG4gIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcbiIsImltcG9ydCBjdXN0b21FbGVtZW50IGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC1ldmVudHMuanMnO1xuaW1wb3J0IHN0b3BFdmVudCBmcm9tICcuLi8uLi9saWIvZG9tLWV2ZW50cy9zdG9wLWV2ZW50LmpzJztcblxuY2xhc3MgRXZlbnRzRW1pdHRlciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5jbGFzcyBFdmVudHNMaXN0ZW5lciBleHRlbmRzIGV2ZW50cyhjdXN0b21FbGVtZW50KCkpIHtcbiAgY29ubmVjdGVkKCkge31cblxuICBkaXNjb25uZWN0ZWQoKSB7fVxufVxuXG5FdmVudHNFbWl0dGVyLmRlZmluZSgnZXZlbnRzLWVtaXR0ZXInKTtcbkV2ZW50c0xpc3RlbmVyLmRlZmluZSgnZXZlbnRzLWxpc3RlbmVyJyk7XG5cbmRlc2NyaWJlKCdjdXN0b20tZWxlbWVudC1ldmVudHMnLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IGVtbWl0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtZW1pdHRlcicpO1xuICBjb25zdCBsaXN0ZW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG4gIGJlZm9yZSgoKSA9PiB7XG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICAgIGxpc3RlbmVyLmFwcGVuZChlbW1pdGVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kKGxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG5cbiAgaXQoJ2V4cGVjdCBlbWl0dGVyIHRvIGZpcmVFdmVudCBhbmQgbGlzdGVuZXIgdG8gaGFuZGxlIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgIGxpc3RlbmVyLm9uKCdoaScsIGV2dCA9PiB7XG4gICAgICBzdG9wRXZlbnQoZXZ0KTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC50YXJnZXQpLnRvLmVxdWFsKGVtbWl0ZXIpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkuYSgnb2JqZWN0Jyk7XG4gICAgICBjaGFpLmV4cGVjdChldnQuZGV0YWlsKS50by5kZWVwLmVxdWFsKHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgICB9KTtcbiAgICBlbW1pdGVyLmRpc3BhdGNoKCdoaScsIHsgYm9keTogJ2dyZWV0aW5nJyB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuc29tZShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLmV2ZXJ5KGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbnkgfSBmcm9tICcuL2FycmF5L2FueS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGFsbCB9IGZyb20gJy4vYXJyYXkvYWxsLmpzJztcbiIsIi8qICAqL1xuaW1wb3J0IHsgYWxsLCBhbnkgfSBmcm9tICcuL2FycmF5LmpzJztcblxuXG5cblxuY29uc3QgZG9BbGxBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFsbChwYXJhbXMsIGZuKTtcbmNvbnN0IGRvQW55QXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbnkocGFyYW1zLCBmbik7XG5jb25zdCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCB0eXBlcyA9IFtcbiAgJ01hcCcsXG4gICdTZXQnLFxuICAnU3ltYm9sJyxcbiAgJ0FycmF5JyxcbiAgJ09iamVjdCcsXG4gICdTdHJpbmcnLFxuICAnRGF0ZScsXG4gICdSZWdFeHAnLFxuICAnRnVuY3Rpb24nLFxuICAnQm9vbGVhbicsXG4gICdOdW1iZXInLFxuICAnTnVsbCcsXG4gICdVbmRlZmluZWQnLFxuICAnQXJndW1lbnRzJyxcbiAgJ0Vycm9yJyxcbiAgJ1JlcXVlc3QnLFxuICAnUmVzcG9uc2UnLFxuICAnSGVhZGVycycsXG4gICdCbG9iJ1xuXTtcbmNvbnN0IGxlbiA9IHR5cGVzLmxlbmd0aDtcbmNvbnN0IHR5cGVDYWNoZSA9IHt9O1xuY29uc3QgdHlwZVJlZ2V4cCA9IC9cXHMoW2EtekEtWl0rKS87XG5cbmV4cG9ydCBkZWZhdWx0IChzZXR1cCgpKTtcblxuZXhwb3J0IGNvbnN0IGdldFR5cGUgPSAoc3JjKSA9PiBnZXRTcmNUeXBlKHNyYyk7XG5cbmZ1bmN0aW9uIGdldFNyY1R5cGUoc3JjKSB7XG4gIGxldCB0eXBlID0gdG9TdHJpbmcuY2FsbChzcmMpO1xuICBpZiAoIXR5cGVDYWNoZVt0eXBlXSkge1xuICAgIGxldCBtYXRjaGVzID0gdHlwZS5tYXRjaCh0eXBlUmVnZXhwKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtYXRjaGVzKSAmJiBtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDYWNoZVt0eXBlXSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHR5cGVDYWNoZVt0eXBlXTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGxldCBjaGVja3MgPSB7fTtcbiAgZm9yIChsZXQgaSA9IGxlbjsgaS0tOyApIHtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaV0udG9Mb3dlckNhc2UoKTtcbiAgICBjaGVja3NbdHlwZV0gPSBzcmMgPT4gZ2V0U3JjVHlwZShzcmMpID09PSB0eXBlO1xuICAgIGNoZWNrc1t0eXBlXS5hbGwgPSBkb0FsbEFwaShjaGVja3NbdHlwZV0pO1xuICAgIGNoZWNrc1t0eXBlXS5hbnkgPSBkb0FueUFwaShjaGVja3NbdHlwZV0pO1xuICB9XG4gIHJldHVybiBjaGVja3M7XG59XG4iLCIvKiAgKi9cbmltcG9ydCBpcywgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzcmMpID0+IGNsb25lKHNyYywgW10sIFtdKTtcblxuZnVuY3Rpb24gY2xvbmUoc3JjLCBjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgLy8gTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0Y1xuICBpZiAoaXMudW5kZWZpbmVkKHNyYykgfHwgaXMubnVsbChzcmMpIHx8IGlzUHJpbWl0aXZlKHNyYykgfHwgaXMuZnVuY3Rpb24oc3JjKSkge1xuICAgIHJldHVybiBzcmM7XG4gIH1cbiAgcmV0dXJuIGNsb25lcihnZXRUeXBlKHNyYyksIHNyYywgY2lyY3VsYXJzLCBjbG9uZXMpO1xufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShzcmMpIHtcbiAgcmV0dXJuIGlzLmJvb2xlYW4oc3JjKSB8fCBpcy5udW1iZXIoc3JjKSB8fCBpcy5zdHJpbmcoc3JjKTtcbn1cblxuZnVuY3Rpb24gY2xvbmVyKHR5cGUsIGNvbnRleHQsIC4uLmFyZ3MpIHtcbiAgY29uc3QgaGFuZGxlcnMgPSB7XG4gICAgZGF0ZSgpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmdldFRpbWUoKSk7XG4gICAgfSxcbiAgICByZWdleHAoKSB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzKTtcbiAgICB9LFxuICAgIGFycmF5KCkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwKGNsb25lKTtcbiAgICB9LFxuICAgIG1hcCgpIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20odGhpcy5lbnRyaWVzKCkpKTtcbiAgICB9LFxuICAgIHNldCgpIHtcbiAgICAgIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20odGhpcy52YWx1ZXMoKSkpO1xuICAgIH0sXG4gICAgcmVxdWVzdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfSxcbiAgICByZXNwb25zZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgfSxcbiAgICBoZWFkZXJzKCkge1xuICAgICAgbGV0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgICAgZm9yIChsZXQgW25hbWUsIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMpIHtcbiAgICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICAgfSxcbiAgICBibG9iKCkge1xuICAgICAgcmV0dXJuIG5ldyBCbG9iKFt0aGlzXSwgeyB0eXBlOiB0aGlzLnR5cGUgfSk7XG4gICAgfSxcbiAgICBvYmplY3QoY2lyY3VsYXJzID0gW10sIGNsb25lcyA9IFtdKSB7XG4gICAgICBjaXJjdWxhcnMucHVzaCh0aGlzKTtcbiAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG4gICAgICBjbG9uZXMucHVzaChvYmopO1xuICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcbiAgICAgICAgbGV0IGlkeCA9IGNpcmN1bGFycy5maW5kSW5kZXgoKGkpID0+IGkgPT09IHRoaXNba2V5XSk7XG4gICAgICAgIG9ialtrZXldID0gaWR4ID4gLTEgPyBjbG9uZXNbaWR4XSA6IGNsb25lKHRoaXNba2V5XSwgY2lyY3VsYXJzLCBjbG9uZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH07XG4gIGlmICh0eXBlIGluIGhhbmRsZXJzKSB7XG4gICAgY29uc3QgZm4gPSBoYW5kbGVyc1t0eXBlXTtcbiAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG4iLCJpbXBvcnQgY2xvbmUgZnJvbSAnLi4vLi4vbGliL29iamVjdC9jbG9uZS5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcblx0aXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcblx0XHQvLyBOdWxsXG5cdFx0ZXhwZWN0KGNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXG5cdFx0Ly8gVW5kZWZpbmVkXG5cdFx0ZXhwZWN0KGNsb25lKCkpLnRvLmJlLnVuZGVmaW5lZDtcblxuXHRcdC8vIEZ1bmN0aW9uXG5cdFx0Y29uc3QgZnVuYyA9ICgpID0+IHt9O1xuXHRcdGFzc2VydC5pc0Z1bmN0aW9uKGNsb25lKGZ1bmMpLCAnaXMgYSBmdW5jdGlvbicpO1xuXG5cdFx0Ly8gRXRjOiBudW1iZXJzIGFuZCBzdHJpbmdcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSgnc3RyaW5nJyksICdzdHJpbmcnKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKHZhbHVlLCByZXZpdmVyID0gKGssIHYpID0+IHYpID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCByZXZpdmVyKTtcbiIsImltcG9ydCBqc29uQ2xvbmUgZnJvbSAnLi4vLi4vbGliL29iamVjdC9qc29uLWNsb25lLmpzJztcblxuZGVzY3JpYmUoJ2pzb24tY2xvbmUnLCAoKSA9PiB7XG5cdGl0KCdub24tc2VyaWFsaXphYmxlIHZhbHVlcyB0aHJvdycsICgpID0+IHtcblx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCkpLnRvLnRocm93KEVycm9yKTtcblx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCgpID0+IHt9KSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUodW5kZWZpbmVkKSkudG8udGhyb3coRXJyb3IpO1xuXHR9KTtcblxuXHRpdCgncHJpbWl0aXZlIHNlcmlhbGl6YWJsZSB2YWx1ZXMnLCAoKSA9PiB7XG5cdFx0ZXhwZWN0KGpzb25DbG9uZShudWxsKSkudG8uYmUubnVsbDtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoZmFsc2UpLCBmYWxzZSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG5cdH0pO1xuXG5cdGl0KCdvYmplY3QgY2xvbmVkJywgKCkgPT4ge1xuXHRcdGNvbnN0IG9iaiA9IHsnYSc6ICdiJ307XG5cdFx0ZXhwZWN0KGpzb25DbG9uZShvYmopKS5ub3QudG8uYmUuZXF1YWwob2JqKTtcblx0fSk7XG5cblx0aXQoJ3Jldml2ZXIgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJzInfTtcblx0XHRjb25zdCBjbG9uZWQgPSBqc29uQ2xvbmUob2JqLCAoaywgdikgPT4gayAhPT0gJycgPyBOdW1iZXIodikgKiAyIDogdik7XG5cdFx0ZXhwZWN0KGNsb25lZC5hKS5lcXVhbCg0KTtcblx0fSk7XG59KTsiLCJpbXBvcnQgaXMgZnJvbSAnLi4vbGliL3R5cGUuanMnO1xuXG5kZXNjcmliZSgndHlwZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2FyZ3VtZW50cycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMoYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBub3RBcmdzID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzKG5vdEFyZ3MpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBhbGwgcGFyYW1ldGVycyBhcmd1bWVudHMnLCAoKSA9PiB7XG4gICAgICBsZXQgZ2V0QXJndW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHM7XG4gICAgICB9O1xuICAgICAgbGV0IGFyZ3MgPSBnZXRBcmd1bWVudHMoJ3Rlc3QnKTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMuYWxsKGFyZ3MsIGFyZ3MsIGFyZ3MpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFueSBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbnkoYXJncywgJ3Rlc3QnLCAndGVzdDInKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FycmF5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFycmF5JywgKCkgPT4ge1xuICAgICAgbGV0IGFycmF5ID0gWyd0ZXN0J107XG4gICAgICBleHBlY3QoaXMuYXJyYXkoYXJyYXkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgbm90QXJyYXkgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuYXJyYXkobm90QXJyYXkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFsbCBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbGwoWyd0ZXN0MSddLCBbJ3Rlc3QyJ10sIFsndGVzdDMnXSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVycyBhbnkgYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuYXJyYXkuYW55KFsndGVzdDEnXSwgJ3Rlc3QyJywgJ3Rlc3QzJykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdib29sZWFuJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgYm9vbCA9IHRydWU7XG4gICAgICBleHBlY3QoaXMuYm9vbGVhbihib29sKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGJvb2xlYW4nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90Qm9vbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKG5vdEJvb2wpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGVycm9yJywgKCkgPT4ge1xuICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICBleHBlY3QoaXMuZXJyb3IoZXJyb3IpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RXJyb3IgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZXJyb3Iobm90RXJyb3IpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Z1bmN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKGlzLmZ1bmN0aW9uKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdEZ1bmN0aW9uID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmZ1bmN0aW9uKG5vdEZ1bmN0aW9uKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdudWxsJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bGwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVsbChudWxsKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG51bGwnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVsbCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udWxsKG5vdE51bGwpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bWJlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMubnVtYmVyKDEpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdE51bWJlciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5udW1iZXIobm90TnVtYmVyKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdvYmplY3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm9iamVjdCh7fSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90T2JqZWN0ID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm9iamVjdChub3RPYmplY3QpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3JlZ2V4cCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgcmVnZXhwID0gbmV3IFJlZ0V4cCgpO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChyZWdleHApKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgcmVnZXhwJywgKCkgPT4ge1xuICAgICAgbGV0IG5vdFJlZ2V4cCA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5yZWdleHAobm90UmVnZXhwKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzdHJpbmcnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygndGVzdCcpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3Qgc3RyaW5nJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnN0cmluZygxKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZCh1bmRlZmluZWQpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnVuZGVmaW5lZChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKCd0ZXN0JykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbWFwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobmV3IE1hcCgpKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IE1hcCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5tYXAobnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgICAgZXhwZWN0KGlzLm1hcChPYmplY3QuY3JlYXRlKG51bGwpKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdzZXQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChuZXcgU2V0KCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgU2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLnNldChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMuc2V0KE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmpba2V5XSAhPT0gJ3VuZGVmaW5lZCcgPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG4gIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdFtwYXJ0c1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3RbcGFydHNbaV1dID0ge307XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gIH1cbiAgb2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBpcywgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5pbXBvcnQgY2xvbmUgZnJvbSAnLi9jbG9uZS5qcyc7XG5cblxuZXhwb3J0IGNvbnN0IGFycmF5UmVwbGFjZVN0cmF0ZWd5ID0gKHNvdXJjZSwgdGFyZ2V0KSA9PiBjbG9uZSh0YXJnZXQpO1xuXG5leHBvcnQgY29uc3QgZmFjdG9yeSA9IChvcHRzID0geyBhcnJheU1lcmdlOiBhcnJheVJlcGxhY2VTdHJhdGVneSB9KSA9PiAoXG4gIC4uLmFyZ3NcbikgPT4ge1xuICBsZXQgcmVzdWx0O1xuXG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aDsgaSA+IDA7IC0taSkge1xuICAgIHJlc3VsdCA9IG1lcmdlKGFyZ3MucG9wKCksIHJlc3VsdCwgb3B0cyk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZmFjdG9yeSgpO1xuXG5mdW5jdGlvbiBtZXJnZShzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBpZiAoaXMudW5kZWZpbmVkKHRhcmdldCkpIHtcbiAgICByZXR1cm4gY2xvbmUoc291cmNlKTtcbiAgfVxuXG4gIGxldCB0eXBlID0gZ2V0VHlwZShzb3VyY2UpO1xuICBpZiAodHlwZSA9PT0gZ2V0VHlwZSh0YXJnZXQpKSB7XG4gICAgcmV0dXJuIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cyk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlcih0eXBlLCBzb3VyY2UsIHRhcmdldCwgb3B0cykge1xuICBjb25zdCBoYW5kbGVycyA9IHtcbiAgICBvYmplY3QoKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7fTtcblxuICAgICAgY29uc3Qga2V5cyA9IHtcbiAgICAgICAgc291cmNlOiBPYmplY3Qua2V5cyhzb3VyY2UpLFxuICAgICAgICB0YXJnZXQ6IE9iamVjdC5rZXlzKHRhcmdldClcbiAgICAgIH07XG5cbiAgICAgIGtleXMuc291cmNlLmNvbmNhdChrZXlzLnRhcmdldCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoc291cmNlW2tleV0sIHRhcmdldFtrZXldLCBvcHRzKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBhcnJheSgpIHtcbiAgICAgIHJldHVybiBvcHRzLmFycmF5TWVyZ2UuYXBwbHkobnVsbCwgW3NvdXJjZSwgdGFyZ2V0XSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlIGluIGhhbmRsZXJzKSB7XG4gICAgcmV0dXJuIGhhbmRsZXJzW3R5cGVdKCk7XG4gIH1cbiAgcmV0dXJuIGNsb25lKHRhcmdldCk7XG59XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChvKSA9PlxuICBPYmplY3Qua2V5cyhvKS5yZWR1Y2UoKG0sIGspID0+IG0uc2V0KGssIG9ba10pLCBuZXcgTWFwKCkpO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGRnZXQgfSBmcm9tICcuL29iamVjdC9kZ2V0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgZHNldCB9IGZyb20gJy4vb2JqZWN0L2RzZXQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBjbG9uZSB9IGZyb20gJy4vb2JqZWN0L2Nsb25lLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgbWVyZ2UgfSBmcm9tICcuL29iamVjdC9tZXJnZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBvYmplY3RUb01hcCB9IGZyb20gJy4vb2JqZWN0L29iamVjdC10by1tYXAuanMnO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB7IGNsb25lLCBtZXJnZSB9IGZyb20gJy4vb2JqZWN0LmpzJztcblxuXG5cblxuXG5cblxuZXhwb3J0IGNvbnN0IEh0dHBNZXRob2RzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIEdldDogJ0dFVCcsXG4gIFBvc3Q6ICdQT1NUJyxcbiAgUHV0OiAnUFVUJyxcbiAgUGF0Y2g6ICdQQVRDSCcsXG4gIERlbGV0ZTogJ0RFTEVURSdcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBuZXcgSHR0cChjcmVhdGVDb25maWcoKSk7XG5cbmNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuXG5jbGFzcyBIdHRwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHJlc3BvbnNlKSB7XG4gICAgc3VwZXIoYCR7cmVzcG9uc2Uuc3RhdHVzfSBmb3IgJHtyZXNwb25zZS51cmx9YCk7XG4gICAgdGhpcy5uYW1lID0gJ0h0dHBFcnJvcic7XG4gICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICB9XG59XG5cbmNsYXNzIEh0dHAge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBjYXRjaGVyKGVycm9ySWQsIGNhdGNoZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5jYXRjaGVycy5zZXQoZXJyb3JJZCwgY2F0Y2hlcik7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBtaWRkbGV3YXJlKG1pZGRsZXdhcmUsIGNsZWFyID0gZmFsc2UpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5taWRkbGV3YXJlID0gY2xlYXIgPyBtaWRkbGV3YXJlIDogY29uZmlnLm1pZGRsZXdhcmUuY29uY2F0KG1pZGRsZXdhcmUpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgdXJsKHVybCwgcmVwbGFjZSA9IGZhbHNlKSB7XG4gICAgY29uc3QgY29uZmlnID0gY2xvbmUocHJpdmF0ZXModGhpcykuY29uZmlnKTtcbiAgICBjb25maWcudXJsID0gcmVwbGFjZSA/IHVybCA6IGNvbmZpZy51cmwgKyB1cmw7XG4gICAgcmV0dXJuIG5ldyBIdHRwKGNvbmZpZyk7XG4gIH1cblxuICBvcHRpb25zKG9wdGlvbnMsIG1peGluID0gdHJ1ZSkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG4gICAgY29uZmlnLm9wdGlvbnMgPSBtaXhpbiA/IG1lcmdlKGNvbmZpZy5vcHRpb25zLCBvcHRpb25zKSA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgaGVhZGVycyhoZWFkZXJWYWx1ZXMpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5vcHRpb25zLmhlYWRlcnMgPSBtZXJnZShjb25maWcub3B0aW9ucy5oZWFkZXJzLCBoZWFkZXJWYWx1ZXMpO1xuICAgIHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuICB9XG5cbiAgYWNjZXB0KGhlYWRlclZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycyh7IEFjY2VwdDogaGVhZGVyVmFsdWUgfSk7XG4gIH1cblxuICBjb250ZW50KGhlYWRlclZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycyh7ICdDb250ZW50LVR5cGUnOiBoZWFkZXJWYWx1ZSB9KTtcbiAgfVxuXG4gIG1vZGUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgbW9kZTogdmFsdWUgfSk7XG4gIH1cblxuICBjcmVkZW50aWFscyh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBjcmVkZW50aWFsczogdmFsdWUgfSk7XG4gIH1cblxuICBjYWNoZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMoeyBjYWNoZTogdmFsdWUgfSk7XG4gIH1cblxuICBpbnRlZ3JpdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgaW50ZWdyaXR5OiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGtlZXBhbGl2ZSh2YWx1ZSA9IHRydWUpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsga2VlcGFsaXZlOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIHJlZGlyZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucyh7IHJlZGlyZWN0OiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGJvZHkoY29udGVudHMpIHtcbiAgICBjb25zdCBjb25maWcgPSBjbG9uZShwcml2YXRlcyh0aGlzKS5jb25maWcpO1xuICAgIGNvbmZpZy5vcHRpb25zLmJvZHkgPSBjb250ZW50cztcbiAgICByZXR1cm4gbmV3IEh0dHAoY29uZmlnKTtcbiAgfVxuXG4gIGF1dGgoaGVhZGVyVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzKHsgQXV0aG9yaXphdGlvbjogaGVhZGVyVmFsdWUgfSk7XG4gIH1cblxuICBqc29uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGVudCgnYXBwbGljYXRpb24vanNvbicpLmJvZHkoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfVxuXG4gIGZvcm0odmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5ib2R5KGNvbnZlcnRGb3JtVXJsKHZhbHVlKSkuY29udGVudCgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gIH1cblxuICBtZXRob2QodmFsdWUgPSBIdHRwTWV0aG9kcy5HZXQpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zKHsgbWV0aG9kOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIGdldCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXRob2QoSHR0cE1ldGhvZHMuR2V0KS5zZW5kKCk7XG4gIH1cblxuICBwb3N0KCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5Qb3N0KS5zZW5kKCk7XG4gIH1cblxuICBpbnNlcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMubWV0aG9kKEh0dHBNZXRob2RzLlB1dCkuc2VuZCgpO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5QYXRjaCkuc2VuZCgpO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGhvZChIdHRwTWV0aG9kcy5EZWxldGUpLnNlbmQoKTtcbiAgfVxuXG4gIHNlbmQoKSB7XG4gICAgY29uc3QgeyB1cmwsIG9wdGlvbnMsIG1pZGRsZXdhcmUsIHJlc29sdmVycywgY2F0Y2hlcnMgfSA9IHByaXZhdGVzKHRoaXMpLmNvbmZpZztcbiAgICBjb25zdCByZXF1ZXN0ID0gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmUpKGZldGNoKTtcbiAgICBjb25zdCB3cmFwcGVyID0gcmVxdWVzdCh1cmwsIG9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBIdHRwRXJyb3IocmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZG9DYXRjaCA9IChwcm9taXNlKSA9PiB7XG4gICAgICByZXR1cm4gcHJvbWlzZS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBpZiAoY2F0Y2hlcnMuaGFzKGVyci5zdGF0dXMpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhdGNoZXJzLmdldChlcnIuc3RhdHVzKShlcnIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYXRjaGVycy5oYXMoZXJyLm5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNhdGNoZXJzLmdldChlcnIubmFtZSkoZXJyLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcFR5cGVQYXJzZXIgPSAoZnVuTmFtZSkgPT4gKGNiKSA9PlxuICAgICAgZnVuTmFtZVxuICAgICAgICA/IGRvQ2F0Y2goXG4gICAgICAgICAgICB3cmFwcGVyXG4gICAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UgJiYgcmVzcG9uc2VbZnVuTmFtZV0oKSlcbiAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gKHJlc3BvbnNlICYmIGNiICYmIGNiKHJlc3BvbnNlKSkgfHwgcmVzcG9uc2UpXG4gICAgICAgICAgKVxuICAgICAgICA6IGRvQ2F0Y2god3JhcHBlci50aGVuKHJlc3BvbnNlID0+IChyZXNwb25zZSAmJiBjYiAmJiBjYihyZXNwb25zZSkpIHx8IHJlc3BvbnNlKSk7XG5cbiAgICBjb25zdCByZXNwb25zZUNoYWluID0ge1xuICAgICAgcmVzOiB3cmFwVHlwZVBhcnNlcihudWxsKSxcbiAgICAgIGpzb246IHdyYXBUeXBlUGFyc2VyKCdqc29uJylcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc29sdmVycy5yZWR1Y2UoKGNoYWluLCByKSA9PiByKGNoYWluLCBvcHRpb25zKSwgcmVzcG9uc2VDaGFpbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmVzKSB7XG4gIHJldHVybiAoZmV0Y2hGdW5jdGlvbikgPT4ge1xuICAgIGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmZXRjaEZ1bmN0aW9uO1xuICAgIH1cblxuICAgIGlmIChtaWRkbGV3YXJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBtaWRkbGV3YXJlc1swXShmZXRjaEZ1bmN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKG1pZGRsZXdhcmVzLnJlZHVjZVJpZ2h0KFxuICAgICAgKGFjYywgY3VyciwgaWR4KSA9PiAoaWR4ID09PSBtaWRkbGV3YXJlcy5sZW5ndGggLSAyID8gY3VycihhY2MoZmV0Y2hGdW5jdGlvbikpIDogY3VycigoYWNjKSkpXG4gICAgKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbmZpZygpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAge1xuICAgICAgdXJsOiAnJyxcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgICAgY2F0Y2hlcnM6IG5ldyBNYXAoKSxcbiAgICAgIHJlc29sdmVyczogW10sXG4gICAgICBtaWRkbGV3YXJlOiBbXVxuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gY29udmVydEZvcm1VcmwoZm9ybU9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoZm9ybU9iamVjdClcbiAgICAubWFwKFxuICAgICAga2V5ID0+XG4gICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChrZXkpICtcbiAgICAgICAgJz0nICtcbiAgICAgICAgYCR7ZW5jb2RlVVJJQ29tcG9uZW50KHR5cGVvZiBmb3JtT2JqZWN0W2tleV0gPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoZm9ybU9iamVjdFtrZXldKSA6IGZvcm1PYmplY3Rba2V5XSl9YFxuICAgIClcbiAgICAuam9pbignJicpO1xufVxuIiwiaW1wb3J0IGh0dHAgZnJvbSAnLi4vbGliL2h0dHAuanMnO1xuXG5kZXNjcmliZSgnaHR0cCcsICgpID0+IHtcblx0aXQoJ2NyZWF0ZSBodHRwJywgKCkgPT4ge1xuXHRcdGNvbnN0IGRlbGF5TWlkZGxld2FyZSA9IGRlbGF5ID0+IG5leHQgPT4gKHVybCwgb3B0cykgPT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KCgpID0+IHJlcyhuZXh0KHVybCwgb3B0cykpLCBkZWxheSkpO1xuXHRcdH07XG5cblx0XHQvKiBMb2dzIGFsbCByZXF1ZXN0cyBwYXNzaW5nIHRocm91Z2guICovXG5cdFx0Y29uc3QgbG9nTWlkZGxld2FyZSA9ICgpID0+IG5leHQgPT4gKHVybCwgb3B0cykgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2cob3B0cy5tZXRob2QgKyBcIkBcIiArIHVybCk7XG5cdFx0XHRyZXR1cm4gbmV4dCh1cmwsIG9wdHMpXG5cdFx0fTtcblxuXHRcdGxldCBqc29uQXBpID0gaHR0cCgpXG5cdFx0XHQuanNvbigpXG5cdFx0XHQubW9kZSgnY29ycycpXG5cdFx0XHQubWlkZGxld2FyZShbZGVsYXlNaWRkbGV3YXJlKDMwMDApLCBsb2dNaWRkbGV3YXJlKCldKVxuXHRcdFx0LmNyZWRlbnRpYWxzKCdzYW1lLW9yaWdpbicpXG5cdFx0XHQuaGVhZGVycyh7J1gtUmVxdWVzdGVkLUJ5JzogJ0RFRVAtVUknfSk7XG5cblx0XHRqc29uQXBpXG5cdFx0XHQudXJsKCcvaHR0cC1jbGllbnQtZ2V0LXRlc3QnKVxuXHRcdFx0LmdldCgpXG5cdFx0XHQuanNvbihkYXRhID0+IGNvbnNvbGUubG9nKGRhdGEpKTtcblx0XHQvLyBhc3NlcnQuaW5zdGFuY2VPZihodHRwKCksICdodHRwIGlzIGluc3RhbmNlIG9mIEh0dHAnKTtcblx0fSk7XG59KTtcbiJdLCJuYW1lcyI6WyJ0ZW1wbGF0ZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiaSIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsImlubmVySFRNTCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsIkVycm9yIiwiZGVzY3JpYmUiLCJpdCIsImVsIiwiZXhwZWN0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJ0byIsImVxdWFsIiwiYXNzZXJ0IiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJjcmVhdG9yIiwiT2JqZWN0IiwiY3JlYXRlIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsIm9iaiIsInZhbHVlIiwiZ2V0Iiwic2V0IiwiYmVoYXZpb3VyIiwibWV0aG9kTmFtZXMiLCJrbGFzcyIsInByb3RvIiwicHJvdG90eXBlIiwibGVuIiwiZGVmaW5lUHJvcGVydHkiLCJtZXRob2ROYW1lIiwibWV0aG9kIiwiYXJncyIsInVuc2hpZnQiLCJhcHBseSIsIndyaXRhYmxlIiwiY3VyckhhbmRsZSIsImNhbGxiYWNrcyIsIm5vZGVDb250ZW50Iiwibm9kZSIsImNyZWF0ZVRleHROb2RlIiwiTXV0YXRpb25PYnNlcnZlciIsImZsdXNoIiwib2JzZXJ2ZSIsImNoYXJhY3RlckRhdGEiLCJydW4iLCJjYWxsYmFjayIsInRleHRDb250ZW50IiwiU3RyaW5nIiwicHVzaCIsImNiIiwiZXJyIiwic2V0VGltZW91dCIsInNwbGljZSIsImxhc3RIYW5kbGUiLCJnbG9iYWwiLCJkZWZhdWx0VmlldyIsIkhUTUxFbGVtZW50IiwiX0hUTUxFbGVtZW50IiwiYmFzZUNsYXNzIiwiY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcyIsImhhc093blByb3BlcnR5IiwicHJpdmF0ZXMiLCJjcmVhdGVTdG9yYWdlIiwiZmluYWxpemVDbGFzcyIsImRlZmluZSIsInRhZ05hbWUiLCJyZWdpc3RyeSIsImN1c3RvbUVsZW1lbnRzIiwiZm9yRWFjaCIsImNhbGxiYWNrTWV0aG9kTmFtZSIsImNhbGwiLCJjb25maWd1cmFibGUiLCJuZXdDYWxsYmFja05hbWUiLCJzdWJzdHJpbmciLCJvcmlnaW5hbE1ldGhvZCIsImFyb3VuZCIsImNyZWF0ZUNvbm5lY3RlZEFkdmljZSIsImNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSIsImNyZWF0ZVJlbmRlckFkdmljZSIsImluaXRpYWxpemVkIiwiY29uc3RydWN0IiwiYXR0cmlidXRlQ2hhbmdlZCIsImF0dHJpYnV0ZU5hbWUiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwiY29ubmVjdGVkIiwiZGlzY29ubmVjdGVkIiwiYWRvcHRlZCIsInJlbmRlciIsIl9vblJlbmRlciIsIl9wb3N0UmVuZGVyIiwiY29ubmVjdGVkQ2FsbGJhY2siLCJjb250ZXh0IiwicmVuZGVyQ2FsbGJhY2siLCJyZW5kZXJpbmciLCJmaXJzdFJlbmRlciIsInVuZGVmaW5lZCIsIm1pY3JvVGFzayIsImRpc2Nvbm5lY3RlZENhbGxiYWNrIiwia2V5cyIsImFzc2lnbiIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMiLCJwcm9wZXJ0aWVzQ29uZmlnIiwiZGF0YUhhc0FjY2Vzc29yIiwiZGF0YVByb3RvVmFsdWVzIiwiZW5oYW5jZVByb3BlcnR5Q29uZmlnIiwiY29uZmlnIiwiaGFzT2JzZXJ2ZXIiLCJpc09ic2VydmVyU3RyaW5nIiwib2JzZXJ2ZXIiLCJpc1N0cmluZyIsInR5cGUiLCJpc051bWJlciIsIk51bWJlciIsImlzQm9vbGVhbiIsIkJvb2xlYW4iLCJpc09iamVjdCIsImlzQXJyYXkiLCJBcnJheSIsImlzRGF0ZSIsIkRhdGUiLCJub3RpZnkiLCJyZWFkT25seSIsInJlZmxlY3RUb0F0dHJpYnV0ZSIsIm5vcm1hbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwib3V0cHV0IiwibmFtZSIsInByb3BlcnR5IiwiaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJfZmx1c2hQcm9wZXJ0aWVzIiwiY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlIiwiYXR0cmlidXRlIiwiX2F0dHJpYnV0ZVRvUHJvcGVydHkiLCJjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSIsImN1cnJlbnRQcm9wcyIsImNoYW5nZWRQcm9wcyIsIm9sZFByb3BzIiwiY29uc3RydWN0b3IiLCJjbGFzc1Byb3BlcnRpZXMiLCJfcHJvcGVydHlUb0F0dHJpYnV0ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImJlZm9yZSIsImNyZWF0ZVByb3BlcnRpZXMiLCJhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZSIsImh5cGVuUmVnRXgiLCJyZXBsYWNlIiwibWF0Y2giLCJ0b1VwcGVyQ2FzZSIsInByb3BlcnR5TmFtZVRvQXR0cmlidXRlIiwidXBwZXJjYXNlUmVnRXgiLCJ0b0xvd2VyQ2FzZSIsInByb3BlcnR5VmFsdWUiLCJfY3JlYXRlUHJvcGVydHlBY2Nlc3NvciIsImRhdGEiLCJzZXJpYWxpemluZyIsImRhdGFQZW5kaW5nIiwiZGF0YU9sZCIsImRhdGFJbnZhbGlkIiwiX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMiLCJfaW5pdGlhbGl6ZVByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzQ2hhbmdlZCIsImVudW1lcmFibGUiLCJfZ2V0UHJvcGVydHkiLCJfc2V0UHJvcGVydHkiLCJfaXNWYWxpZFByb3BlcnR5VmFsdWUiLCJfc2V0UGVuZGluZ1Byb3BlcnR5IiwiX2ludmFsaWRhdGVQcm9wZXJ0aWVzIiwiY29uc29sZSIsImxvZyIsIl9kZXNlcmlhbGl6ZVZhbHVlIiwicHJvcGVydHlUeXBlIiwiaXNWYWxpZCIsIl9zZXJpYWxpemVWYWx1ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsInByb3BlcnR5Q29uZmlnIiwic3RyaW5naWZ5IiwidG9TdHJpbmciLCJvbGQiLCJjaGFuZ2VkIiwiX3Nob3VsZFByb3BlcnR5Q2hhbmdlIiwicHJvcHMiLCJfc2hvdWxkUHJvcGVydGllc0NoYW5nZSIsIm1hcCIsImdldFByb3BlcnRpZXNDb25maWciLCJjaGVja09iaiIsImxvb3AiLCJnZXRQcm90b3R5cGVPZiIsIkZ1bmN0aW9uIiwidGFyZ2V0IiwibGlzdGVuZXIiLCJjYXB0dXJlIiwiYWRkTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJoYW5kbGUiLCJwb3AiLCJQcm9wZXJ0aWVzVGVzdCIsInByb3AiLCJyZWZsZWN0RnJvbUF0dHJpYnV0ZSIsImZuVmFsdWVQcm9wIiwiY3VzdG9tRWxlbWVudCIsImNvbnRhaW5lciIsInByb3BlcnRpZXNUZXN0IiwiZ2V0RWxlbWVudEJ5SWQiLCJhcHBlbmQiLCJhZnRlciIsImxpc3RlbkV2ZW50IiwiaXNPayIsImV2dCIsInJldHVyblZhbHVlIiwiaGFuZGxlcnMiLCJldmVudERlZmF1bHRQYXJhbXMiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImhhbmRsZUV2ZW50IiwiZXZlbnQiLCJvbiIsIm93biIsImRpc3BhdGNoIiwib2ZmIiwiaGFuZGxlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiRXZlbnRzRW1pdHRlciIsIkV2ZW50c0xpc3RlbmVyIiwiZW1taXRlciIsInN0b3BFdmVudCIsImNoYWkiLCJhIiwiZGVlcCIsImJvZHkiLCJhcnIiLCJmbiIsInNvbWUiLCJldmVyeSIsImRvQWxsQXBpIiwicGFyYW1zIiwiYWxsIiwiZG9BbnlBcGkiLCJhbnkiLCJ0eXBlcyIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJzZXR1cCIsImdldFR5cGUiLCJzcmMiLCJnZXRTcmNUeXBlIiwibWF0Y2hlcyIsImNoZWNrcyIsImNsb25lIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwiaXMiLCJudWxsIiwiaXNQcmltaXRpdmUiLCJmdW5jdGlvbiIsImNsb25lciIsImJvb2xlYW4iLCJudW1iZXIiLCJzdHJpbmciLCJkYXRlIiwiZ2V0VGltZSIsInJlZ2V4cCIsIlJlZ0V4cCIsImFycmF5IiwiTWFwIiwiZnJvbSIsImVudHJpZXMiLCJTZXQiLCJ2YWx1ZXMiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJoZWFkZXJzIiwiSGVhZGVycyIsImJsb2IiLCJCbG9iIiwib2JqZWN0Iiwia2V5IiwiaWR4IiwiZmluZEluZGV4IiwiYmUiLCJmdW5jIiwiaXNGdW5jdGlvbiIsInJldml2ZXIiLCJrIiwidiIsImpzb25DbG9uZSIsInRocm93Iiwibm90IiwiY2xvbmVkIiwiZ2V0QXJndW1lbnRzIiwiYXJndW1lbnRzIiwidHJ1ZSIsIm5vdEFyZ3MiLCJmYWxzZSIsIm5vdEFycmF5IiwiYm9vbCIsIm5vdEJvb2wiLCJlcnJvciIsIm5vdEVycm9yIiwibm90RnVuY3Rpb24iLCJub3ROdWxsIiwibm90TnVtYmVyIiwibm90T2JqZWN0Iiwibm90UmVnZXhwIiwiYXJyYXlSZXBsYWNlU3RyYXRlZ3kiLCJzb3VyY2UiLCJmYWN0b3J5Iiwib3B0cyIsImFycmF5TWVyZ2UiLCJyZXN1bHQiLCJtZXJnZSIsIm1lcmdlciIsImNvbmNhdCIsIkh0dHBNZXRob2RzIiwiZnJlZXplIiwiR2V0IiwiUG9zdCIsIlB1dCIsIlBhdGNoIiwiRGVsZXRlIiwiSHR0cCIsImNyZWF0ZUNvbmZpZyIsIkh0dHBFcnJvciIsInN0YXR1cyIsInVybCIsImNhdGNoZXIiLCJlcnJvcklkIiwiY2F0Y2hlcnMiLCJtaWRkbGV3YXJlIiwiY2xlYXIiLCJvcHRpb25zIiwibWl4aW4iLCJoZWFkZXJWYWx1ZXMiLCJhY2NlcHQiLCJoZWFkZXJWYWx1ZSIsIkFjY2VwdCIsIm1vZGUiLCJjcmVkZW50aWFscyIsImNhY2hlIiwiaW50ZWdyaXR5Iiwia2VlcGFsaXZlIiwicmVkaXJlY3QiLCJjb250ZW50cyIsImF1dGgiLCJBdXRob3JpemF0aW9uIiwianNvbiIsImZvcm0iLCJjb252ZXJ0Rm9ybVVybCIsInNlbmQiLCJwb3N0IiwiaW5zZXJ0IiwidXBkYXRlIiwiZGVsZXRlIiwicmVzb2x2ZXJzIiwiYXBwbHlNaWRkbGV3YXJlIiwiZmV0Y2giLCJ3cmFwcGVyIiwidGhlbiIsIm9rIiwiZG9DYXRjaCIsInByb21pc2UiLCJjYXRjaCIsImhhcyIsIndyYXBUeXBlUGFyc2VyIiwiZnVuTmFtZSIsInJlc3BvbnNlQ2hhaW4iLCJyZXMiLCJyZWR1Y2UiLCJjaGFpbiIsInIiLCJtaWRkbGV3YXJlcyIsImZldGNoRnVuY3Rpb24iLCJyZWR1Y2VSaWdodCIsImFjYyIsImN1cnIiLCJmb3JtT2JqZWN0IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYmFiZWxIZWxwZXJzLnR5cGVvZiIsImpvaW4iLCJkZWxheU1pZGRsZXdhcmUiLCJQcm9taXNlIiwibmV4dCIsImRlbGF5Iiwi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
