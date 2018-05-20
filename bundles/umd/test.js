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

  var http = (function () {
  	var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  	return new Http({ url: url, options: options, catchers: new Map(), resolvers: [], middleware: [] });
  });

  var privates = createStorage();

  var Http = function () {
  	function Http(config) {
  		classCallCheck(this, Http);

  		privates(this).config = config;
  	}

  	Http.prototype.url = function url(_url) {
  		var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  		var config = clone(privates(this).config);
  		config.url = replace ? _url : config.url + _url;
  		return new Http(config);
  	};

  	return Http;
  }();

  describe('http', function () {
  	it('create http', function () {
  		var api = http().url('http://www.google.com');
  		// assert.instanceOf(http(), 'http is instance of Http');
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

  /*  */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL2NyZWF0ZS1zdG9yYWdlLmpzIiwiLi4vLi4vbGliL2FkdmljZS9hcm91bmQuanMiLCIuLi8uLi9saWIvZG9tL21pY3JvdGFzay5qcyIsIi4uLy4uL2xpYi93ZWItY29tcG9uZW50cy9jdXN0b20tZWxlbWVudC5qcyIsIi4uLy4uL2xpYi9hZHZpY2UvYmVmb3JlLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvZG9tLWV2ZW50cy9saXN0ZW4tZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMiLCIuLi8uLi9saWIvYWR2aWNlL2FmdGVyLmpzIiwiLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL3N0b3AtZXZlbnQuanMiLCIuLi8uLi90ZXN0L3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LWV2ZW50cy5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbnkuanMiLCIuLi8uLi9saWIvYXJyYXkvYWxsLmpzIiwiLi4vLi4vbGliL2FycmF5LmpzIiwiLi4vLi4vbGliL3R5cGUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi90ZXN0L29iamVjdC9qc29uLWNsb25lLmpzIiwiLi4vLi4vdGVzdC90eXBlLmpzIiwiLi4vLi4vbGliL2h0dHAuanMiLCIuLi8uLi90ZXN0L2h0dHAuanMiLCIuLi8uLi9saWIvb2JqZWN0L2RnZXQuanMiLCIuLi8uLi9saWIvb2JqZWN0L2RzZXQuanMiLCIuLi8uLi9saWIvb2JqZWN0L29iamVjdC10by1tYXAuanMiLCIuLi8uLi9saWIvb2JqZWN0LmpzIiwiLi4vLi4vbGliL3VuaXF1ZS1pZC5qcyIsIi4uLy4uL2xpYi9tb2RlbC5qcyIsIi4uLy4uL3Rlc3QvbW9kZWwuanMiLCIuLi8uLi9saWIvZXZlbnQtaHViLmpzIiwiLi4vLi4vdGVzdC9ldmVudC1odWIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgZGVmYXVsdCAodGVtcGxhdGUpID0+IHtcbiAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBjaGlsZHJlbiA9IHRlbXBsYXRlLmNoaWxkTm9kZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB0ZW1wbGF0ZUNvbnRlbnQgZnJvbSAnLi90ZW1wbGF0ZS1jb250ZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufTtcbiIsImltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9kb20vY3JlYXRlLWVsZW1lbnQuanMnO1xuXG5kZXNjcmliZSgnY3JlYXRlLWVsZW1lbnQnLCAoKSA9PiB7XG4gIGl0KCdjcmVhdGUgZWxlbWVudCcsICgpID0+IHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQoYFxuXHRcdFx0PGRpdiBjbGFzcz1cIm15LWNsYXNzXCI+SGVsbG8gV29ybGQ8L2Rpdj5cblx0XHRgKTtcbiAgICBleHBlY3QoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdteS1jbGFzcycpKS50by5lcXVhbCh0cnVlKTtcbiAgICBhc3NlcnQuaW5zdGFuY2VPZihlbCwgTm9kZSwgJ2VsZW1lbnQgaXMgaW5zdGFuY2Ugb2Ygbm9kZScpO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSkpID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgYXJncy51bnNoaWZ0KG1ldGhvZCk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmxldCBjdXJySGFuZGxlID0gMDtcbmxldCBsYXN0SGFuZGxlID0gMDtcbmxldCBjYWxsYmFja3MgPSBbXTtcbmxldCBub2RlQ29udGVudCA9IDA7XG5sZXQgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbm5ldyBNdXRhdGlvbk9ic2VydmVyKGZsdXNoKS5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuLyoqXG4gKiBFbnF1ZXVlcyBhIGZ1bmN0aW9uIGNhbGxlZCBhdCAgdGltaW5nLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIHJ1blxuICogQHJldHVybiB7bnVtYmVyfSBIYW5kbGUgdXNlZCBmb3IgY2FuY2VsaW5nIHRhc2tcbiAqL1xuZXhwb3J0IGNvbnN0IHJ1biA9IChjYWxsYmFjaykgPT4ge1xuICBub2RlLnRleHRDb250ZW50ID0gU3RyaW5nKG5vZGVDb250ZW50KyspO1xuICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiBjdXJySGFuZGxlKys7XG59O1xuXG4vKipcbiAqIENhbmNlbHMgYSBwcmV2aW91c2x5IGVucXVldWVkIGBgIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBoYW5kbGUgSGFuZGxlIHJldHVybmVkIGZyb20gYHJ1bmAgb2YgY2FsbGJhY2sgdG8gY2FuY2VsXG4gKi9cbmV4cG9ydCBjb25zdCBjYW5jZWwgPSAoaGFuZGxlKSA9PiB7XG4gIGNvbnN0IGlkeCA9IGhhbmRsZSAtIGxhc3RIYW5kbGU7XG4gIGlmIChpZHggPj0gMCkge1xuICAgIGlmICghY2FsbGJhY2tzW2lkeF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGUpO1xuICAgIH1cbiAgICBjYWxsYmFja3NbaWR4XSA9IG51bGw7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBjb25zdCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbGV0IGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xuICBsYXN0SGFuZGxlICs9IGxlbjtcbn1cbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IGFyb3VuZCBmcm9tICcuLi9hZHZpY2UvYXJvdW5kLmpzJztcbmltcG9ydCAqIGFzIG1pY3JvVGFzayBmcm9tICcuLi9kb20vbWljcm90YXNrLmpzJztcblxuY29uc3QgZ2xvYmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9pc3N1ZXMvMTcwOVxuaWYgKHR5cGVvZiBnbG9iYWwuSFRNTEVsZW1lbnQgIT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgX0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gSFRNTEVsZW1lbnQoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWVzXG4gIH07XG4gIF9IVE1MRWxlbWVudC5wcm90b3R5cGUgPSBnbG9iYWwuSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICBnbG9iYWwuSFRNTEVsZW1lbnQgPSBfSFRNTEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCBjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzID0gW1xuICAgICdjb25uZWN0ZWRDYWxsYmFjaycsXG4gICAgJ2Rpc2Nvbm5lY3RlZENhbGxiYWNrJyxcbiAgICAnYWRvcHRlZENhbGxiYWNrJyxcbiAgICAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ1xuICBdO1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0O1xuICBjb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuICBpZiAoIWJhc2VDbGFzcykge1xuICAgIGJhc2VDbGFzcyA9IGNsYXNzIGV4dGVuZHMgZ2xvYmFsLkhUTUxFbGVtZW50IHt9O1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7fVxuXG4gICAgc3RhdGljIGRlZmluZSh0YWdOYW1lKSB7XG4gICAgICBjb25zdCByZWdpc3RyeSA9IGN1c3RvbUVsZW1lbnRzO1xuICAgICAgaWYgKCFyZWdpc3RyeS5nZXQodGFnTmFtZSkpIHtcbiAgICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgY3VzdG9tRWxlbWVudHNWMUNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFja01ldGhvZE5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwocHJvdG8sIGNhbGxiYWNrTWV0aG9kTmFtZSkpIHtcbiAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBjYWxsYmFja01ldGhvZE5hbWUsIHtcbiAgICAgICAgICAgICAgdmFsdWUoKSB7fSxcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3Q2FsbGJhY2tOYW1lID0gY2FsbGJhY2tNZXRob2ROYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjYWxsYmFja01ldGhvZE5hbWUubGVuZ3RoIC0gJ2NhbGxiYWNrJy5sZW5ndGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gcHJvdG9bY2FsbGJhY2tNZXRob2ROYW1lXTtcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgY2FsbGJhY2tNZXRob2ROYW1lLCB7XG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB0aGlzW25ld0NhbGxiYWNrTmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgICAgYXJvdW5kKGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpLCAnY29ubmVjdGVkJykodGhpcyk7XG4gICAgICAgIGFyb3VuZChjcmVhdGVEaXNjb25uZWN0ZWRBZHZpY2UoKSwgJ2Rpc2Nvbm5lY3RlZCcpKHRoaXMpO1xuICAgICAgICBhcm91bmQoY3JlYXRlUmVuZGVyQWR2aWNlKCksICdyZW5kZXInKSh0aGlzKTtcbiAgICAgICAgcmVnaXN0cnkuZGVmaW5lKHRhZ05hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCBpbml0aWFsaXplZCgpIHtcbiAgICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuY29uc3RydWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0KCkge31cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZChhdHRyaWJ1dGVOYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHt9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4gICAgY29ubmVjdGVkKCkge31cblxuICAgIGRpc2Nvbm5lY3RlZCgpIHt9XG5cbiAgICBhZG9wdGVkKCkge31cblxuICAgIHJlbmRlcigpIHt9XG5cbiAgICBfb25SZW5kZXIoKSB7fVxuXG4gICAgX3Bvc3RSZW5kZXIoKSB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICAgICAgICBjb250ZXh0LnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJBZHZpY2UoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHJlbmRlckNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmICghcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0UmVuZGVyID0gcHJpdmF0ZXMoY29udGV4dCkucmVuZGVyaW5nID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIG1pY3JvVGFzay5ydW4oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcml2YXRlcyhjb250ZXh0KS5yZW5kZXJpbmcpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKGNvbnRleHQpLnJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY29udGV4dC5fb25SZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgICAgcmVuZGVyQ2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgICAgICAgICAgIGNvbnRleHQuX3Bvc3RSZW5kZXIoZmlyc3RSZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGlzY29ubmVjdGVkQ2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgcHJpdmF0ZXMoY29udGV4dCkuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyhjb250ZXh0KS5jb25uZWN0ZWQgJiYgcHJpdmF0ZXMoY29udGV4dCkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChiZWhhdmlvdXIsIC4uLm1ldGhvZE5hbWVzKSA9PiB7XG4gIHJldHVybiBmdW5jdGlvbihrbGFzcykge1xuICAgIGNvbnN0IHByb3RvID0ga2xhc3MucHJvdG90eXBlO1xuICAgIGNvbnN0IGxlbiA9IG1ldGhvZE5hbWVzLmxlbmd0aDtcbiAgICBjb25zdCB7IGRlZmluZVByb3BlcnR5IH0gPSBPYmplY3Q7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG1ldGhvZE5hbWVzW2ldO1xuICAgICAgY29uc3QgbWV0aG9kID0gcHJvdG9bbWV0aG9kTmFtZV07XG4gICAgICBkZWZpbmVQcm9wZXJ0eShwcm90bywgbWV0aG9kTmFtZSwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIGJlaGF2aW91ci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBrbGFzcztcbiAgfTtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCBiZWZvcmUgZnJvbSAnLi4vYWR2aWNlL2JlZm9yZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgKiBhcyBtaWNyb1Rhc2sgZnJvbSAnLi4vZG9tL21pY3JvdGFzay5qcyc7XG5cblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGJhc2VDbGFzcykgPT4ge1xuICBjb25zdCB7IGRlZmluZVByb3BlcnR5LCBrZXlzLCBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzID0ge307XG4gIGNvbnN0IHByb3BlcnR5TmFtZXNUb0F0dHJpYnV0ZXMgPSB7fTtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbiAgbGV0IHByb3BlcnRpZXNDb25maWc7XG4gIGxldCBkYXRhSGFzQWNjZXNzb3IgPSB7fTtcbiAgbGV0IGRhdGFQcm90b1ZhbHVlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhjb25maWcpIHtcbiAgICBjb25maWcuaGFzT2JzZXJ2ZXIgPSAnb2JzZXJ2ZXInIGluIGNvbmZpZztcbiAgICBjb25maWcuaXNPYnNlcnZlclN0cmluZyA9IGNvbmZpZy5oYXNPYnNlcnZlciAmJiB0eXBlb2YgY29uZmlnLm9ic2VydmVyID09PSAnc3RyaW5nJztcbiAgICBjb25maWcuaXNTdHJpbmcgPSBjb25maWcudHlwZSA9PT0gU3RyaW5nO1xuICAgIGNvbmZpZy5pc051bWJlciA9IGNvbmZpZy50eXBlID09PSBOdW1iZXI7XG4gICAgY29uZmlnLmlzQm9vbGVhbiA9IGNvbmZpZy50eXBlID09PSBCb29sZWFuO1xuICAgIGNvbmZpZy5pc09iamVjdCA9IGNvbmZpZy50eXBlID09PSBPYmplY3Q7XG4gICAgY29uZmlnLmlzQXJyYXkgPSBjb25maWcudHlwZSA9PT0gQXJyYXk7XG4gICAgY29uZmlnLmlzRGF0ZSA9IGNvbmZpZy50eXBlID09PSBEYXRlO1xuICAgIGNvbmZpZy5ub3RpZnkgPSAnbm90aWZ5JyBpbiBjb25maWc7XG4gICAgY29uZmlnLnJlYWRPbmx5ID0gJ3JlYWRPbmx5JyBpbiBjb25maWcgPyBjb25maWcucmVhZE9ubHkgOiBmYWxzZTtcbiAgICBjb25maWcucmVmbGVjdFRvQXR0cmlidXRlID1cbiAgICAgICdyZWZsZWN0VG9BdHRyaWJ1dGUnIGluIGNvbmZpZ1xuICAgICAgICA/IGNvbmZpZy5yZWZsZWN0VG9BdHRyaWJ1dGVcbiAgICAgICAgOiBjb25maWcuaXNTdHJpbmcgfHwgY29uZmlnLmlzTnVtYmVyIHx8IGNvbmZpZy5pc0Jvb2xlYW47XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGxldCBuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydGllcywgbmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbbmFtZV07XG4gICAgICBvdXRwdXRbbmFtZV0gPSB0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgPyB7IHR5cGU6IHByb3BlcnR5IH0gOiBwcm9wZXJ0eTtcbiAgICAgIGVuaGFuY2VQcm9wZXJ0eUNvbmZpZyhvdXRwdXRbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFzc2lnbihjb250ZXh0LCBwcml2YXRlcyhjb250ZXh0KS5pbml0aWFsaXplUHJvcGVydGllcyk7XG4gICAgICAgIHByaXZhdGVzKGNvbnRleHQpLmluaXRpYWxpemVQcm9wZXJ0aWVzID0ge307XG4gICAgICB9XG4gICAgICBjb250ZXh0Ll9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlidXRlQ2hhbmdlQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhdHRyaWJ1dGUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXM7XG4gICAgICBpZiAob2xkVmFsdWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIGNvbnRleHQuX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCBuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihjdXJyZW50UHJvcHMsIGNoYW5nZWRQcm9wcywgb2xkUHJvcHMpIHtcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpcztcbiAgICAgIE9iamVjdC5rZXlzKGNoYW5nZWRQcm9wcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIG5vdGlmeSxcbiAgICAgICAgICBoYXNPYnNlcnZlcixcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGUsXG4gICAgICAgICAgaXNPYnNlcnZlclN0cmluZyxcbiAgICAgICAgICBvYnNlcnZlclxuICAgICAgICB9ID0gY29udGV4dC5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICBpZiAocmVmbGVjdFRvQXR0cmlidXRlKSB7XG4gICAgICAgICAgY29udGV4dC5fcHJvcGVydHlUb0F0dHJpYnV0ZShwcm9wZXJ0eSwgY2hhbmdlZFByb3BzW3Byb3BlcnR5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc09ic2VydmVyICYmIGlzT2JzZXJ2ZXJTdHJpbmcpIHtcbiAgICAgICAgICB0aGlzW29ic2VydmVyXShjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc09ic2VydmVyICYmIHR5cGVvZiBvYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG9ic2VydmVyLmFwcGx5KGNvbnRleHQsIFtjaGFuZ2VkUHJvcHNbcHJvcGVydHldLCBvbGRQcm9wc1twcm9wZXJ0eV1dKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm90aWZ5KSB7XG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KGAke3Byb3BlcnR5fS1jaGFuZ2VkYCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZTogY2hhbmdlZFByb3BzW3Byb3BlcnR5XSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZTogb2xkUHJvcHNbcHJvcGVydHldXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjbGFzcyBQcm9wZXJ0aWVzIGV4dGVuZHMgYmFzZUNsYXNzIHtcblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY2xhc3NQcm9wZXJ0aWVzKS5tYXAoKHByb3BlcnR5KSA9PiB0aGlzLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSkgfHwgW107XG4gICAgfVxuXG4gICAgc3RhdGljIGZpbmFsaXplQ2xhc3MoKSB7XG4gICAgICBzdXBlci5maW5hbGl6ZUNsYXNzKCk7XG4gICAgICBiZWZvcmUoY3JlYXRlQ29ubmVjdGVkQWR2aWNlKCksICdjb25uZWN0ZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UoKSwgJ2F0dHJpYnV0ZUNoYW5nZWQnKSh0aGlzKTtcbiAgICAgIGJlZm9yZShjcmVhdGVQcm9wZXJ0aWVzQ2hhbmdlZEFkdmljZSgpLCAncHJvcGVydGllc0NoYW5nZWQnKSh0aGlzKTtcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydGllcygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhdHRyaWJ1dGVUb1Byb3BlcnR5TmFtZShhdHRyaWJ1dGUpIHtcbiAgICAgIGxldCBwcm9wZXJ0eSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdO1xuICAgICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCBoeXBlblJlZ0V4ID0gLy0oW2Etel0pL2c7XG4gICAgICAgIHByb3BlcnR5ID0gYXR0cmlidXRlLnJlcGxhY2UoaHlwZW5SZWdFeCwgbWF0Y2ggPT4gbWF0Y2hbMV0udG9VcHBlckNhc2UoKSk7XG4gICAgICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lc1thdHRyaWJ1dGVdID0gcHJvcGVydHk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgc3RhdGljIHByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KSB7XG4gICAgICBsZXQgYXR0cmlidXRlID0gcHJvcGVydHlOYW1lc1RvQXR0cmlidXRlc1twcm9wZXJ0eV07XG4gICAgICBpZiAoIWF0dHJpYnV0ZSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFuZCBtZW1vaXplLlxuICAgICAgICBjb25zdCB1cHBlcmNhc2VSZWdFeCA9IC8oW0EtWl0pL2c7XG4gICAgICAgIGF0dHJpYnV0ZSA9IHByb3BlcnR5LnJlcGxhY2UodXBwZXJjYXNlUmVnRXgsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzVG9BdHRyaWJ1dGVzW3Byb3BlcnR5XSA9IGF0dHJpYnV0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjbGFzc1Byb3BlcnRpZXMoKSB7XG4gICAgICBpZiAoIXByb3BlcnRpZXNDb25maWcpIHtcbiAgICAgICAgY29uc3QgZ2V0UHJvcGVydGllc0NvbmZpZyA9ICgpID0+IHByb3BlcnRpZXNDb25maWcgfHwge307XG4gICAgICAgIGxldCBjaGVja09iaiA9IG51bGw7XG4gICAgICAgIGxldCBsb29wID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZSAobG9vcCkge1xuICAgICAgICAgIGNoZWNrT2JqID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrT2JqID09PSBudWxsID8gdGhpcyA6IGNoZWNrT2JqKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY2hlY2tPYmogfHxcbiAgICAgICAgICAgICFjaGVja09iai5jb25zdHJ1Y3RvciB8fFxuICAgICAgICAgICAgY2hlY2tPYmouY29uc3RydWN0b3IgPT09IEhUTUxFbGVtZW50IHx8XG4gICAgICAgICAgICBjaGVja09iai5jb25zdHJ1Y3RvciA9PT0gRnVuY3Rpb24gfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHxcbiAgICAgICAgICAgIGNoZWNrT2JqLmNvbnN0cnVjdG9yID09PSBjaGVja09iai5jb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbG9vcCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoY2hlY2tPYmosICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICAgIGdldFByb3BlcnRpZXNDb25maWcoKSwgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgICAgICBub3JtYWxpemVQcm9wZXJ0aWVzKGNoZWNrT2JqLnByb3BlcnRpZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb3BlcnRpZXNDb25maWcgPSBhc3NpZ24oXG4gICAgICAgICAgICBnZXRQcm9wZXJ0aWVzQ29uZmlnKCksIC8vICRGbG93Rml4TWVcbiAgICAgICAgICAgIG5vcm1hbGl6ZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzQ29uZmlnO1xuICAgIH1cblxuICAgIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKCkge1xuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmNsYXNzUHJvcGVydGllcztcbiAgICAgIGtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBzZXR1cCBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nLCBwcm9wZXJ0eSBhbHJlYWR5IGV4aXN0c2ApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XS52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRhdGFQcm90b1ZhbHVlc1twcm9wZXJ0eV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHByb3RvLl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XS5yZWFkT25seSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3QoKSB7XG4gICAgICBzdXBlci5jb25zdHJ1Y3QoKTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGEgPSB7fTtcbiAgICAgIHByaXZhdGVzKHRoaXMpLnNlcmlhbGl6aW5nID0gZmFsc2U7XG4gICAgICBwcml2YXRlcyh0aGlzKS5pbml0aWFsaXplUHJvcGVydGllcyA9IHt9O1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IG51bGw7XG4gICAgICBwcml2YXRlcyh0aGlzKS5kYXRhSW52YWxpZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcygpO1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZVByb3BlcnRpZXMoKTtcbiAgICB9XG5cbiAgICBwcm9wZXJ0aWVzQ2hhbmdlZChcbiAgICAgIGN1cnJlbnRQcm9wcyxcbiAgICAgIGNoYW5nZWRQcm9wcyxcbiAgICAgIG9sZFByb3BzIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICApIHt9XG5cbiAgICBfY3JlYXRlUHJvcGVydHlBY2Nlc3Nvcihwcm9wZXJ0eSwgcmVhZE9ubHkpIHtcbiAgICAgIGlmICghZGF0YUhhc0FjY2Vzc29yW3Byb3BlcnR5XSkge1xuICAgICAgICBkYXRhSGFzQWNjZXNzb3JbcHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcGVydHksIHtcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UHJvcGVydHkocHJvcGVydHkpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiByZWFkT25seVxuICAgICAgICAgICAgPyAoKSA9PiB7fVxuICAgICAgICAgICAgOiBmdW5jdGlvbihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2dldFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuZGF0YVtwcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgX3NldFByb3BlcnR5KHByb3BlcnR5LCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5faW52YWxpZGF0ZVByb3BlcnRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgY29uc29sZS5sb2coYGludmFsaWQgdmFsdWUgJHtuZXdWYWx1ZX0gZm9yIHByb3BlcnR5ICR7cHJvcGVydHl9IG9mXG5cdFx0XHRcdFx0dHlwZSAke3RoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XS50eXBlLm5hbWV9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRpYWxpemVQcm90b1Byb3BlcnRpZXMoKSB7XG4gICAgICBPYmplY3Qua2V5cyhkYXRhUHJvdG9WYWx1ZXMpLmZvckVhY2goKHByb3BlcnR5KSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID1cbiAgICAgICAgICB0eXBlb2YgZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBkYXRhUHJvdG9WYWx1ZXNbcHJvcGVydHldLmNhbGwodGhpcylcbiAgICAgICAgICAgIDogZGF0YVByb3RvVmFsdWVzW3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5fc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0aWFsaXplUHJvcGVydGllcygpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRhdGFIYXNBY2Nlc3NvcikuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmluaXRpYWxpemVQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2F0dHJpYnV0ZVRvUHJvcGVydHkoYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZykge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMuY29uc3RydWN0b3IuYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWUoYXR0cmlidXRlKTtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSB0aGlzLl9kZXNlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX2lzVmFsaWRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlUeXBlID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1Byb3BlcnRpZXNbcHJvcGVydHldLnR5cGU7XG4gICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgcHJvcGVydHlUeXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNWYWxpZCA9IGAke3R5cGVvZiB2YWx1ZX1gID09PSBwcm9wZXJ0eVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgX3Byb3BlcnR5VG9BdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICBwcml2YXRlcyh0aGlzKS5zZXJpYWxpemluZyA9IHRydWU7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLmNvbnN0cnVjdG9yLnByb3BlcnR5TmFtZVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgIHZhbHVlID0gdGhpcy5fc2VyaWFsaXplVmFsdWUocHJvcGVydHksIHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJpdmF0ZXModGhpcykuc2VyaWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfZGVzZXJpYWxpemVWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHsgaXNOdW1iZXIsIGlzQXJyYXksIGlzQm9vbGVhbiwgaXNEYXRlLCBpc1N0cmluZywgaXNPYmplY3QgfSA9IHRoaXMuY29uc3RydWN0b3IuY2xhc3NQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgIGlmIChpc0Jvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIGlmIChpc051bWJlcikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyAwIDogTnVtYmVyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdCB8fCBpc0FycmF5KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IChpc0FycmF5ID8gbnVsbCA6IHt9KSA6IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc0RhdGUpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gJycgOiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NlcmlhbGl6ZVZhbHVlKHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgY29uc3QgcHJvcGVydHlDb25maWcgPSB0aGlzLmNvbnN0cnVjdG9yLmNsYXNzUHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICBjb25zdCB7IGlzQm9vbGVhbiwgaXNPYmplY3QsIGlzQXJyYXkgfSA9IHByb3BlcnR5Q29uZmlnO1xuXG4gICAgICBpZiAoaXNCb29sZWFuKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0IHx8IGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgX3NldFBlbmRpbmdQcm9wZXJ0eShwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgIGxldCBvbGQgPSBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XTtcbiAgICAgIGxldCBjaGFuZ2VkID0gdGhpcy5fc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpO1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgaWYgKCFwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZykge1xuICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFQZW5kaW5nID0ge307XG4gICAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YU9sZCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSBvbGQgaXMgY2FwdHVyZWQgZnJvbSB0aGUgbGFzdCB0dXJuXG4gICAgICAgIGlmIChwcml2YXRlcyh0aGlzKS5kYXRhT2xkICYmICEocHJvcGVydHkgaW4gcHJpdmF0ZXModGhpcykuZGF0YU9sZCkpIHtcbiAgICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkW3Byb3BlcnR5XSA9IG9sZDtcbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZ1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH1cblxuICAgIF9pbnZhbGlkYXRlUHJvcGVydGllcygpIHtcbiAgICAgIGlmICghcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQgPSB0cnVlO1xuICAgICAgICBtaWNyb1Rhc2sucnVuKCgpID0+IHtcbiAgICAgICAgICBpZiAocHJpdmF0ZXModGhpcykuZGF0YUludmFsaWQpIHtcbiAgICAgICAgICAgIHByaXZhdGVzKHRoaXMpLmRhdGFJbnZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9mbHVzaFByb3BlcnRpZXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9mbHVzaFByb3BlcnRpZXMoKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHByaXZhdGVzKHRoaXMpLmRhdGE7XG4gICAgICBjb25zdCBjaGFuZ2VkUHJvcHMgPSBwcml2YXRlcyh0aGlzKS5kYXRhUGVuZGluZztcbiAgICAgIGNvbnN0IG9sZCA9IHByaXZhdGVzKHRoaXMpLmRhdGFPbGQ7XG5cbiAgICAgIGlmICh0aGlzLl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKHByb3BzLCBjaGFuZ2VkUHJvcHMsIG9sZCkpIHtcbiAgICAgICAgcHJpdmF0ZXModGhpcykuZGF0YVBlbmRpbmcgPSBudWxsO1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5kYXRhT2xkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzQ2hhbmdlZChwcm9wcywgY2hhbmdlZFByb3BzLCBvbGQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlKFxuICAgICAgY3VycmVudFByb3BzLFxuICAgICAgY2hhbmdlZFByb3BzLFxuICAgICAgb2xkUHJvcHMgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICkge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oY2hhbmdlZFByb3BzKTtcbiAgICB9XG5cbiAgICBfc2hvdWxkUHJvcGVydHlDaGFuZ2UocHJvcGVydHksIHZhbHVlLCBvbGQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFN0cmljdCBlcXVhbGl0eSBjaGVja1xuICAgICAgICBvbGQgIT09IHZhbHVlICYmXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyAob2xkPT1OYU4sIHZhbHVlPT1OYU4pIGFsd2F5cyByZXR1cm5zIGZhbHNlXG4gICAgICAgIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICApO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvKiAgKi9cblxuZXhwb3J0IGRlZmF1bHQgKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUgPSBmYWxzZSkgPT4ge1xuICByZXR1cm4gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59O1xuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUgPSAoKSA9PiB7fTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd0YXJnZXQgbXVzdCBiZSBhbiBldmVudCBlbWl0dGVyJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgaWYgKHR5cGUuaW5kZXhPZignLCcpID4gLTEpIHtcbiAgICBsZXQgZXZlbnRzID0gdHlwZS5zcGxpdCgvXFxzKixcXHMqLyk7XG4gICAgbGV0IGhhbmRsZXMgPSBldmVudHMubWFwKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICBsZXQgaGFuZGxlO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZSA9IGhhbmRsZXMucG9wKCkpKSB7XG4gICAgICAgICAgaGFuZGxlLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG59XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQuanMnO1xuaW1wb3J0IHByb3BlcnRpZXMgZnJvbSAnLi4vLi4vbGliL3dlYi1jb21wb25lbnRzL2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMuanMnO1xuaW1wb3J0IGxpc3RlbkV2ZW50IGZyb20gJy4uLy4uL2xpYi9kb20tZXZlbnRzL2xpc3Rlbi1ldmVudC5qcyc7XG5cbmNsYXNzIFByb3BlcnRpZXNUZXN0IGV4dGVuZHMgcHJvcGVydGllcyhjdXN0b21FbGVtZW50KCkpIHtcbiAgc3RhdGljIGdldCBwcm9wZXJ0aWVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgdmFsdWU6ICdwcm9wJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICByZWZsZWN0RnJvbUF0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICgpID0+IHt9LFxuICAgICAgICBub3RpZnk6IHRydWVcbiAgICAgIH0sXG4gICAgICBmblZhbHVlUHJvcDoge1xuICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuUHJvcGVydGllc1Rlc3QuZGVmaW5lKCdwcm9wZXJ0aWVzLXRlc3QnKTtcblxuZGVzY3JpYmUoJ2N1c3RvbS1lbGVtZW50LXByb3BlcnRpZXMnLCAoKSA9PiB7XG4gIGxldCBjb250YWluZXI7XG4gIGNvbnN0IHByb3BlcnRpZXNUZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy10ZXN0Jyk7XG5cbiAgYmVmb3JlKCgpID0+IHtcblx0ICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kKHByb3BlcnRpZXNUZXN0KTtcbiAgfSk7XG5cbiAgYWZ0ZXIoKCkgPT4ge1xuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICB9KTtcblxuICBpdCgncHJvcGVydGllcycsICgpID0+IHtcbiAgICBhc3NlcnQuZXF1YWwocHJvcGVydGllc1Rlc3QucHJvcCwgJ3Byb3AnKTtcbiAgfSk7XG5cbiAgaXQoJ3JlZmxlY3RpbmcgcHJvcGVydGllcycsICgpID0+IHtcbiAgICBwcm9wZXJ0aWVzVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gICAgcHJvcGVydGllc1Rlc3QuX2ZsdXNoUHJvcGVydGllcygpO1xuICAgIGFzc2VydC5lcXVhbChwcm9wZXJ0aWVzVGVzdC5nZXRBdHRyaWJ1dGUoJ3Byb3AnKSwgJ3Byb3BWYWx1ZScpO1xuICB9KTtcblxuICBpdCgnbm90aWZ5IHByb3BlcnR5IGNoYW5nZScsICgpID0+IHtcbiAgICBsaXN0ZW5FdmVudChwcm9wZXJ0aWVzVGVzdCwgJ3Byb3AtY2hhbmdlZCcsIGV2dCA9PiB7XG4gICAgICBhc3NlcnQuaXNPayhldnQudHlwZSA9PT0gJ3Byb3AtY2hhbmdlZCcsICdldmVudCBkaXNwYXRjaGVkJyk7XG4gICAgfSk7XG5cbiAgICBwcm9wZXJ0aWVzVGVzdC5wcm9wID0gJ3Byb3BWYWx1ZSc7XG4gIH0pO1xuXG4gIGl0KCd2YWx1ZSBhcyBhIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgIGFzc2VydC5pc09rKFxuICAgICAgQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVGVzdC5mblZhbHVlUHJvcCksXG4gICAgICAnZnVuY3Rpb24gZXhlY3V0ZWQnXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGJlaGF2aW91ciwgLi4ubWV0aG9kTmFtZXMpID0+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGtsYXNzKSB7XG4gICAgY29uc3QgcHJvdG8gPSBrbGFzcy5wcm90b3R5cGU7XG4gICAgY29uc3QgbGVuID0gbWV0aG9kTmFtZXMubGVuZ3RoO1xuICAgIGNvbnN0IHsgZGVmaW5lUHJvcGVydHkgfSA9IE9iamVjdDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBtZXRob2ROYW1lID0gbWV0aG9kTmFtZXNbaV07XG4gICAgICBjb25zdCBtZXRob2QgPSBwcm90b1ttZXRob2ROYW1lXTtcbiAgICAgIGRlZmluZVByb3BlcnR5KHByb3RvLCBtZXRob2ROYW1lLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBtZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgYmVoYXZpb3VyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ga2xhc3M7XG4gIH07XG59O1xuIiwiLyogICovXG5pbXBvcnQgYWZ0ZXIgZnJvbSAnLi4vYWR2aWNlL2FmdGVyLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4uL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBsaXN0ZW5FdmVudCwgeyB9IGZyb20gJy4uL2RvbS1ldmVudHMvbGlzdGVuLWV2ZW50LmpzJztcblxuXG5cbi8qKlxuICogTWl4aW4gYWRkcyBDdXN0b21FdmVudCBoYW5kbGluZyB0byBhbiBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChiYXNlQ2xhc3MpID0+IHtcbiAgY29uc3QgeyBhc3NpZ24gfSA9IE9iamVjdDtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVyczogW11cbiAgICB9O1xuICB9KTtcbiAgY29uc3QgZXZlbnREZWZhdWx0UGFyYW1zID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbGFibGU6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIGNsYXNzIEV2ZW50cyBleHRlbmRzIGJhc2VDbGFzcyB7XG5cbiAgICBzdGF0aWMgZmluYWxpemVDbGFzcygpIHtcbiAgICAgIHN1cGVyLmZpbmFsaXplQ2xhc3MoKTtcbiAgICAgIGFmdGVyKGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpLCAnZGlzY29ubmVjdGVkJykodGhpcyk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IGBvbiR7ZXZlbnQudHlwZX1gO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzW2hhbmRsZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICB0aGlzW2hhbmRsZV0oZXZlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB0aGlzLm93bihsaXN0ZW5FdmVudCh0aGlzLCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICAgIH1cblxuICAgIGRpc3BhdGNoKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh0eXBlLCBhc3NpZ24oZXZlbnREZWZhdWx0UGFyYW1zLCB7IGRldGFpbDogZGF0YSB9KSkpO1xuICAgIH1cblxuICAgIG9mZigpIHtcbiAgICAgIHByaXZhdGVzKHRoaXMpLmhhbmRsZXJzLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgaGFuZGxlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIG93biguLi5oYW5kbGVycykge1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBwcml2YXRlcyh0aGlzKS5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2Nvbm5lY3RlZEFkdmljZSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcbiAgICAgIGNvbnRleHQub2ZmKCk7XG4gICAgfTtcbiAgfVxufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGV2dCkgPT4ge1xuICBpZiAoZXZ0LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBldnQucHJldmVudERlZmF1bHQoKTtcbn07XG4iLCJpbXBvcnQgY3VzdG9tRWxlbWVudCBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQuanMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuLi8uLi9saWIvd2ViLWNvbXBvbmVudHMvY3VzdG9tLWVsZW1lbnQtZXZlbnRzLmpzJztcbmltcG9ydCBzdG9wRXZlbnQgZnJvbSAnLi4vLi4vbGliL2RvbS1ldmVudHMvc3RvcC1ldmVudC5qcyc7XG5cbmNsYXNzIEV2ZW50c0VtaXR0ZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuY2xhc3MgRXZlbnRzTGlzdGVuZXIgZXh0ZW5kcyBldmVudHMoY3VzdG9tRWxlbWVudCgpKSB7XG4gIGNvbm5lY3RlZCgpIHt9XG5cbiAgZGlzY29ubmVjdGVkKCkge31cbn1cblxuRXZlbnRzRW1pdHRlci5kZWZpbmUoJ2V2ZW50cy1lbWl0dGVyJyk7XG5FdmVudHNMaXN0ZW5lci5kZWZpbmUoJ2V2ZW50cy1saXN0ZW5lcicpO1xuXG5kZXNjcmliZSgnY3VzdG9tLWVsZW1lbnQtZXZlbnRzJywgKCkgPT4ge1xuICBsZXQgY29udGFpbmVyO1xuICBjb25zdCBlbW1pdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZXZlbnRzLWVtaXR0ZXInKTtcbiAgY29uc3QgbGlzdGVuZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdldmVudHMtbGlzdGVuZXInKTtcblxuICBiZWZvcmUoKCkgPT4ge1xuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgICBsaXN0ZW5lci5hcHBlbmQoZW1taXRlcik7XG4gICAgY29udGFpbmVyLmFwcGVuZChsaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGFmdGVyKCgpID0+IHtcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xuXG4gIGl0KCdleHBlY3QgZW1pdHRlciB0byBmaXJlRXZlbnQgYW5kIGxpc3RlbmVyIHRvIGhhbmRsZSBhbiBldmVudCcsICgpID0+IHtcbiAgICBsaXN0ZW5lci5vbignaGknLCBldnQgPT4ge1xuICAgICAgc3RvcEV2ZW50KGV2dCk7XG4gICAgICBjaGFpLmV4cGVjdChldnQudGFyZ2V0KS50by5lcXVhbChlbW1pdGVyKTtcbiAgICAgIGNoYWkuZXhwZWN0KGV2dC5kZXRhaWwpLmEoJ29iamVjdCcpO1xuICAgICAgY2hhaS5leHBlY3QoZXZ0LmRldGFpbCkudG8uZGVlcC5lcXVhbCh7IGJvZHk6ICdncmVldGluZycgfSk7XG4gICAgfSk7XG4gICAgZW1taXRlci5kaXNwYXRjaCgnaGknLCB7IGJvZHk6ICdncmVldGluZycgfSk7XG4gIH0pO1xufSk7XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSBbXG4gICdNYXAnLFxuICAnU2V0JyxcbiAgJ1N5bWJvbCcsXG4gICdBcnJheScsXG4gICdPYmplY3QnLFxuICAnU3RyaW5nJyxcbiAgJ0RhdGUnLFxuICAnUmVnRXhwJyxcbiAgJ0Z1bmN0aW9uJyxcbiAgJ0Jvb2xlYW4nLFxuICAnTnVtYmVyJyxcbiAgJ051bGwnLFxuICAnVW5kZWZpbmVkJyxcbiAgJ0FyZ3VtZW50cycsXG4gICdFcnJvcicsXG4gICdSZXF1ZXN0JyxcbiAgJ1Jlc3BvbnNlJyxcbiAgJ0hlYWRlcnMnLFxuICAnQmxvYidcbl07XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuXG5leHBvcnQgZGVmYXVsdCAoc2V0dXAoKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUeXBlID0gKHNyYykgPT4gZ2V0U3JjVHlwZShzcmMpO1xuXG5mdW5jdGlvbiBnZXRTcmNUeXBlKHNyYykge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwoc3JjKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gc3JjID0+IGdldFNyY1R5cGUoc3JjKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiLyogICovXG5pbXBvcnQgaXMsIHsgZ2V0VHlwZSB9IGZyb20gJy4uL3R5cGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoc3JjKSA9PiBjbG9uZShzcmMsIFtdLCBbXSk7XG5cbmZ1bmN0aW9uIGNsb25lKHNyYywgY2lyY3VsYXJzID0gW10sIGNsb25lcyA9IFtdKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKGlzLnVuZGVmaW5lZChzcmMpIHx8IGlzLm51bGwoc3JjKSB8fCBpc1ByaW1pdGl2ZShzcmMpIHx8IGlzLmZ1bmN0aW9uKHNyYykpIHtcbiAgICByZXR1cm4gc3JjO1xuICB9XG4gIHJldHVybiBjbG9uZXIoZ2V0VHlwZShzcmMpLCBzcmMsIGNpcmN1bGFycywgY2xvbmVzKTtcbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoc3JjKSB7XG5cdHJldHVybiBpcy5ib29sZWFuKHNyYykgfHwgaXMubnVtYmVyKHNyYykgfHwgaXMuc3RyaW5nKHNyYyk7XG59XG5cbmZ1bmN0aW9uIGNsb25lcih0eXBlLCBjb250ZXh0LCAuLi5hcmdzKSB7XG5cdGNvbnN0IGhhbmRsZXJzID0ge1xuXHRcdGRhdGUoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUodGhpcy5nZXRUaW1lKCkpO1xuXHRcdH0sXG5cdFx0cmVnZXhwKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBSZWdFeHAodGhpcyk7XG5cdFx0fSxcblx0XHRhcnJheSgpIHtcblx0XHRcdHJldHVybiB0aGlzLm1hcChjbG9uZSk7XG5cdFx0fSxcblx0XHRtYXAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE1hcChBcnJheS5mcm9tKHRoaXMuZW50cmllcygpKSk7XG5cdFx0fSxcblx0XHRzZXQoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFNldChBcnJheS5mcm9tKHRoaXMudmFsdWVzKCkpKTtcblx0XHR9LFxuXHRcdHJlcXVlc3QoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH0sXG5cdFx0cmVzcG9uc2UoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH0sXG5cdFx0aGVhZGVycygpIHtcblx0XHRcdGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcblx0XHRcdGZvciAobGV0IFtuYW1lLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKSB7XG5cdFx0XHRcdGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBoZWFkZXJzO1xuXHRcdH0sXG5cdFx0YmxvYigpIHtcblx0XHRcdHJldHVybiBuZXcgQmxvYihbdGhpc10sIHt0eXBlOiB0aGlzLnR5cGV9KTtcblx0XHR9LFxuXHRcdG9iamVjdChjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcblx0XHRcdGNpcmN1bGFycy5wdXNoKHRoaXMpO1xuXHRcdFx0Y29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcblx0XHRcdGNsb25lcy5wdXNoKG9iaik7XG5cdFx0XHRmb3IgKGxldCBrZXkgaW4gdGhpcykge1xuXHRcdFx0XHRsZXQgaWR4ID0gY2lyY3VsYXJzLmZpbmRJbmRleCgoaSkgPT4gaSA9PT0gdGhpc1trZXldKTtcblx0XHRcdFx0b2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH1cblx0fTtcblx0aWYgKHR5cGUgaW4gaGFuZGxlcnMpIHtcblx0XHRjb25zdCBmbiA9IGhhbmRsZXJzW3R5cGVdO1xuXHRcdHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcblx0fVxuXHRyZXR1cm4gY29udGV4dDtcbn1cbiIsImltcG9ydCBjbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2Nsb25lLmpzJztcblxuZGVzY3JpYmUoJ2Nsb25lJywgKCkgPT4ge1xuXHRpdCgnUmV0dXJucyBlcXVhbCBkYXRhIGZvciBOdWxsL3VuZGVmaW5lZC9mdW5jdGlvbnMvZXRjJywgKCkgPT4ge1xuXHRcdC8vIE51bGxcblx0XHRleHBlY3QoY2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cblx0XHQvLyBVbmRlZmluZWRcblx0XHRleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG5cdFx0Ly8gRnVuY3Rpb25cblx0XHRjb25zdCBmdW5jID0gKCkgPT4ge307XG5cdFx0YXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cblx0XHQvLyBFdGM6IG51bWJlcnMgYW5kIHN0cmluZ1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZSg1KSwgNSk7XG5cdFx0YXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuXHRcdGFzc2VydC5lcXVhbChjbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoY2xvbmUodHJ1ZSksIHRydWUpO1xuXHR9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAodmFsdWUsIHJldml2ZXIgPSAoaywgdikgPT4gdikgPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSksIHJldml2ZXIpO1xuIiwiaW1wb3J0IGpzb25DbG9uZSBmcm9tICcuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuXG5kZXNjcmliZSgnanNvbi1jbG9uZScsICgpID0+IHtcblx0aXQoJ25vbi1zZXJpYWxpemFibGUgdmFsdWVzIHRocm93JywgKCkgPT4ge1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKSkudG8udGhyb3coRXJyb3IpO1xuXHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0ZXhwZWN0KCgpID0+IGpzb25DbG9uZSh1bmRlZmluZWQpKS50by50aHJvdyhFcnJvcik7XG5cdH0pO1xuXG5cdGl0KCdwcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRleHBlY3QoanNvbkNsb25lKG51bGwpKS50by5iZS5udWxsO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoNSksIDUpO1xuXHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZShmYWxzZSksIGZhbHNlKTtcblx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKHRydWUpLCB0cnVlKTtcblx0fSk7XG5cblx0aXQoJ29iamVjdCBjbG9uZWQnLCAoKSA9PiB7XG5cdFx0Y29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRleHBlY3QoanNvbkNsb25lKG9iaikpLm5vdC50by5iZS5lcXVhbChvYmopO1xuXHR9KTtcblxuXHRpdCgncmV2aXZlciBmdW5jdGlvbicsICgpID0+IHtcblx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdGNvbnN0IGNsb25lZCA9IGpzb25DbG9uZShvYmosIChrLCB2KSA9PiBrICE9PSAnJyA/IE51bWJlcih2KSAqIDIgOiB2KTtcblx0XHRleHBlY3QoY2xvbmVkLmEpLmVxdWFsKDQpO1xuXHR9KTtcbn0pOyIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCBjbG9uZSBmcm9tICcuL29iamVjdC9jbG9uZS5qcyc7XG5cblxuXG5cblxuXG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IChcblx0dXJsID0gJycsXG5cdG9wdGlvbnMgPSB7fVxuKSA9PiBuZXcgSHR0cCh7dXJsLCBvcHRpb25zLCBjYXRjaGVyczogbmV3IE1hcCgpLCByZXNvbHZlcnM6IFtdLCBtaWRkbGV3YXJlOiBbXX0pO1xuXG5jb25zdCBwcml2YXRlcyA9IGNyZWF0ZVN0b3JhZ2UoKTtcblxuY2xhc3MgSHR0cCB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdHByaXZhdGVzKHRoaXMpLmNvbmZpZyA9IGNvbmZpZztcblx0fVxuXG5cdHVybCh1cmwsIHJlcGxhY2UgPSBmYWxzZSkge1xuXHRcdGNvbnN0IGNvbmZpZyA9IGNsb25lKHByaXZhdGVzKHRoaXMpLmNvbmZpZyk7XG5cdFx0Y29uZmlnLnVybCA9IHJlcGxhY2UgPyB1cmwgOiBjb25maWcudXJsICsgdXJsO1xuXHRcdHJldHVybiBuZXcgSHR0cChjb25maWcpO1xuXHR9XG59IiwiaW1wb3J0IGh0dHAgZnJvbSAnLi4vbGliL2h0dHAuanMnO1xuXG5kZXNjcmliZSgnaHR0cCcsICgpID0+IHtcblx0aXQoJ2NyZWF0ZSBodHRwJywgKCkgPT4ge1xuXHRcdGxldCBhcGkgPSBodHRwKCkudXJsKCdodHRwOi8vd3d3Lmdvb2dsZS5jb20nKTtcblx0XHQvLyBhc3NlcnQuaW5zdGFuY2VPZihodHRwKCksICdodHRwIGlzIGluc3RhbmNlIG9mIEh0dHAnKTtcblx0fSk7XG59KTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWQpID0+IHtcbiAgaWYgKGtleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgcmV0dXJuIG9ialtrZXldID8gb2JqW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gIH1cbiAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQoJy4nKTtcbiAgY29uc3QgbGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuICBsZXQgb2JqZWN0ID0gb2JqO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0ID0gZGVmYXVsdFZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG9iaiwga2V5LCB2YWx1ZSkgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBkZXB0aCA9IHBhcnRzLmxlbmd0aCAtIDE7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXB0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3RbcGFydHNbaV1dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgb2JqZWN0W3BhcnRzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBvYmplY3QgPSBvYmplY3RbcGFydHNbaV1dO1xuICB9XG4gIG9iamVjdFtwYXJ0c1tkZXB0aF1dID0gdmFsdWU7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAobykgPT5cbiAgT2JqZWN0LmtleXMobykucmVkdWNlKChtLCBrKSA9PiBtLnNldChrLCBvW2tdKSwgbmV3IE1hcCgpKTtcbiIsIi8qICAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkZ2V0IH0gZnJvbSAnLi9vYmplY3QvZGdldC5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGRzZXQgfSBmcm9tICcuL29iamVjdC9kc2V0LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgY2xvbmUgfSBmcm9tICcuL29iamVjdC9jbG9uZS5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGpzb25DbG9uZSB9IGZyb20gJy4vb2JqZWN0L2pzb24tY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBvYmplY3RUb01hcCB9IGZyb20gJy4vb2JqZWN0L29iamVjdC10by1tYXAuanMnO1xuIiwiLyogICovXG5cbmxldCBwcmV2VGltZUlkID0gMDtcbmxldCBwcmV2VW5pcXVlSWQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCAocHJlZml4KSA9PiB7XG4gIGxldCBuZXdVbmlxdWVJZCA9IERhdGUubm93KCk7XG4gIGlmIChuZXdVbmlxdWVJZCA9PT0gcHJldlRpbWVJZCkge1xuICAgICsrcHJldlVuaXF1ZUlkO1xuICB9IGVsc2Uge1xuICAgIHByZXZUaW1lSWQgPSBuZXdVbmlxdWVJZDtcbiAgICBwcmV2VW5pcXVlSWQgPSAwO1xuICB9XG5cbiAgbGV0IHVuaXF1ZUlkID0gYCR7U3RyaW5nKG5ld1VuaXF1ZUlkKX0ke1N0cmluZyhwcmV2VW5pcXVlSWQpfWA7XG4gIGlmIChwcmVmaXgpIHtcbiAgICB1bmlxdWVJZCA9IGAke3ByZWZpeH1fJHt1bmlxdWVJZH1gO1xuICB9XG4gIHJldHVybiB1bmlxdWVJZDtcbn07XG4iLCJpbXBvcnQgeyBkZ2V0LCBkc2V0LCBqc29uQ2xvbmUgfSBmcm9tICcuL29iamVjdC5qcyc7XG5pbXBvcnQgaXMgZnJvbSAnLi90eXBlLmpzJztcbmltcG9ydCBjcmVhdGVTdG9yYWdlIGZyb20gJy4vY3JlYXRlLXN0b3JhZ2UuanMnO1xuaW1wb3J0IHVuaXF1ZUlkIGZyb20gJy4vdW5pcXVlLWlkLmpzJztcblxuY29uc3QgbW9kZWwgPSAoYmFzZUNsYXNzID0gY2xhc3Mge30pID0+IHtcbiAgY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIHJldHVybiBjbGFzcyBNb2RlbCBleHRlbmRzIGJhc2VDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLl9zdGF0ZUtleSA9IHVuaXF1ZUlkKCdfc3RhdGUnKTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5fc2V0U3RhdGUodGhpcy5kZWZhdWx0U3RhdGUpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0U3RhdGUoKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgZ2V0KGFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdGUoYWNjZXNzb3IpO1xuICAgIH1cblxuICAgIHNldChhcmcxLCBhcmcyKSB7XG4gICAgICAvL3N1cHBvcnRzIChhY2Nlc3Nvciwgc3RhdGUpIE9SIChzdGF0ZSkgYXJndW1lbnRzIGZvciBzZXR0aW5nIHRoZSB3aG9sZSB0aGluZ1xuICAgICAgbGV0IGFjY2Vzc29yLCB2YWx1ZTtcbiAgICAgIGlmICghaXMuc3RyaW5nKGFyZzEpICYmIGlzLnVuZGVmaW5lZChhcmcyKSkge1xuICAgICAgICB2YWx1ZSA9IGFyZzE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGFyZzI7XG4gICAgICAgIGFjY2Vzc29yID0gYXJnMTtcbiAgICAgIH1cbiAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMuX2dldFN0YXRlKCk7XG4gICAgICBsZXQgbmV3U3RhdGUgPSBqc29uQ2xvbmUob2xkU3RhdGUpO1xuXG4gICAgICBpZiAoYWNjZXNzb3IpIHtcbiAgICAgICAgZHNldChuZXdTdGF0ZSwgYWNjZXNzb3IsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1N0YXRlID0gdmFsdWU7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyhhY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZVN1YnNjcmliZXIoKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gc3Vic2NyaWJlckNvdW50Kys7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgc2VsZi5fc3Vic2NyaWJlKGNvbnRleHQsIC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICAvL1RPRE86IGlzIG9mZigpIG5lZWRlZCBmb3IgaW5kaXZpZHVhbCBzdWJzY3JpcHRpb24/XG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkge1xuICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlUHJvcGVydHlCaW5kZXIoY29udGV4dCkgLSBjb250ZXh0IG11c3QgYmUgb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFkZEJpbmRpbmdzOiBmdW5jdGlvbihiaW5kUnVsZXMpIHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYmluZFJ1bGVzWzBdKSkge1xuICAgICAgICAgICAgYmluZFJ1bGVzID0gW2JpbmRSdWxlc107XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpbmRSdWxlcy5mb3JFYWNoKGJpbmRSdWxlID0+IHtcbiAgICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCBiaW5kUnVsZVswXSwgdmFsdWUgPT4ge1xuICAgICAgICAgICAgICBkc2V0KGNvbnRleHQsIGJpbmRSdWxlWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogdGhpcy5fZGVzdHJveVN1YnNjcmliZXIuYmluZCh0aGlzLCBjb250ZXh0KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBfZ2V0U3RhdGUoYWNjZXNzb3IpIHtcbiAgICAgIHJldHVybiBqc29uQ2xvbmUoYWNjZXNzb3IgPyBkZ2V0KHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSwgYWNjZXNzb3IpIDogcHJpdmF0ZXNbdGhpcy5fc3RhdGVLZXldKTtcbiAgICB9XG5cbiAgICBfc2V0U3RhdGUobmV3U3RhdGUpIHtcbiAgICAgIHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSA9IG5ld1N0YXRlO1xuICAgIH1cblxuICAgIF9zdWJzY3JpYmUoY29udGV4dCwgYWNjZXNzb3IsIGNiKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpIHx8IFtdO1xuICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHsgYWNjZXNzb3IsIGNiIH0pO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIHN1YnNjcmlwdGlvbnMpO1xuICAgIH1cblxuICAgIF9kZXN0cm95U3Vic2NyaWJlcihjb250ZXh0KSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgfVxuXG4gICAgX25vdGlmeVN1YnNjcmliZXJzKHNldEFjY2Vzc29yLCBuZXdTdGF0ZSwgb2xkU3RhdGUpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oc3Vic2NyaWJlcnMpIHtcbiAgICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbih7IGFjY2Vzc29yLCBjYiB9KSB7XG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJheidcbiAgICAgICAgICAvL2UuZy4gIHNhPSdmb28uYmFyLmJheicsIGE9J2Zvby5iYXIuYmF6LmJsYXonXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2Yoc2V0QWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBhY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGFjY2Vzc29yKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vZS5nLiBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uKidcbiAgICAgICAgICBpZiAoYWNjZXNzb3IuaW5kZXhPZignKicpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZXBBY2Nlc3NvciA9IGFjY2Vzc29yLnJlcGxhY2UoJy4qJywgJycpLnJlcGxhY2UoJyonLCAnJyk7XG4gICAgICAgICAgICBpZiAoc2V0QWNjZXNzb3IuaW5kZXhPZihkZWVwQWNjZXNzb3IpID09PSAwKSB7XG4gICAgICAgICAgICAgIGNiKGRnZXQobmV3U3RhdGUsIGRlZXBBY2Nlc3NvciksIGRnZXQob2xkU3RhdGUsIGRlZXBBY2Nlc3NvcikpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCBtb2RlbDtcbiIsImltcG9ydCBtb2RlbCBmcm9tICcuLi9saWIvbW9kZWwuanMnO1xuXG5jbGFzcyBNb2RlbCBleHRlbmRzIG1vZGVsKCkge1xuXHRnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgIHJldHVybiB7Zm9vOjF9O1xuICB9XG59XG5cbmRlc2NyaWJlKFwiTW9kZWwgbWV0aG9kc1wiLCAoKSA9PiB7XG5cblx0aXQoXCJkZWZhdWx0U3RhdGUgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgxKTtcblx0fSk7XG5cblx0aXQoXCJnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoJ2ZvbycsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2ZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogMVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMicsMik7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyJykpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuXHRpdChcImRlZXAgZ2V0KCkvc2V0KCkgd2l0aCBhcnJheXMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFtdXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLCdkb2cnKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMCcpKS50by5lcXVhbCgnZG9nJyk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnLHtmb286MX0pO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgxKTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nLDIpO1xuXHRcdGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wLmZvbycpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpcHRpb25zIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNvbnN0IFRFU1RfU0VMID0gJ2RlZXBPYmoxLmRlZXBPYmoyLjAuc2VsZWN0ZWQnO1xuXG5cdFx0Y29uc3QgbXlNb2RlbFN1YnNjcmliZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKTtcblx0XHRsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKFRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMScsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHRcdFx0bnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG5cdFx0XHR0aHJvdygnbm8gc3Vic2NyaWJlciBzaG91bGQgYmUgY2FsbGVkIGZvciBkZWVwT2JqMScpO1xuXHRcdH0pO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24oJ2RlZXBPYmoxLionLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0Y2hhaS5leHBlY3QobmV3VmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0Y2hhaS5leHBlY3Qob2xkVmFsdWUuZGVlcE9iajJbMF0uc2VsZWN0ZWQpLnRvLmVxdWFsKGZhbHNlKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWwuc2V0KFRFU1RfU0VMLCB0cnVlKTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0Y2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblxuXHR9KTtcblxuXHRpdChcInN1YnNjcmliZXJzIGNhbiBiZSBkZXN0cm95ZWRcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbe1xuXHRcdFx0XHRcdHNlbGVjdGVkOmZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDp0cnVlXG5cdFx0XHRcdH1dXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bXlNb2RlbC5URVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihteU1vZGVsLlRFU1RfU0VMLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdHRocm93KG5ldyBFcnJvcignc2hvdWxkIG5vdCBiZSBvYnNlcnZlZCcpKTtcblx0XHR9KTtcblx0XHRteU1vZGVsU3Vic2NyaWJlci5kZXN0cm95KCk7XG5cdFx0bXlNb2RlbC5zZXQobXlNb2RlbC5URVNUX1NFTCwgdHJ1ZSk7XG5cdH0pO1xuXG5cdGl0KFwicHJvcGVydGllcyBib3VuZCBmcm9tIG1vZGVsIHRvIGN1c3RvbSBlbGVtZW50XCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cbiAgICBsZXQgbXlFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJvcGVydGllcy1taXhpbi10ZXN0Jyk7XG5cbiAgICBjb25zdCBvYnNlcnZlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsICh2YWx1ZSkgPT4geyB0aGlzLnByb3AgPSB2YWx1ZTsgfSk7XG4gICAgb2JzZXJ2ZXIuZGVzdHJveSgpO1xuXG4gICAgY29uc3QgcHJvcGVydHlCaW5kZXIgPSBteU1vZGVsLmNyZWF0ZVByb3BlcnR5QmluZGVyKG15RWxlbWVudCkuYWRkQmluZGluZ3MoXG4gICAgICBbJ2ZvbycsICdwcm9wJ11cbiAgICApO1xuXG4gICAgbXlNb2RlbC5zZXQoJ2ZvbycsICczJyk7XG4gICAgY2hhaS5leHBlY3QobXlFbGVtZW50LnByb3ApLnRvLmVxdWFsKCczJyk7XG4gICAgcHJvcGVydHlCaW5kZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KCdmb28nLCAnMicpO1xuXHRcdGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuXHR9KTtcblxufSk7XG4iLCIvKiAgKi9cblxuXG5cbmNvbnN0IGV2ZW50SHViRmFjdG9yeSA9ICgpID0+IHtcbiAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgTWFwKCk7XG4gIGxldCBzdWJzY3JpYmVyQ291bnQgPSAwO1xuXG4gIC8vJEZsb3dGaXhNZVxuICByZXR1cm4ge1xuICAgIHB1Ymxpc2g6IGZ1bmN0aW9uKGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgICBzdWJzY3JpYmVycy5mb3JFYWNoKHN1YnNjcmlwdGlvbnMgPT4ge1xuICAgICAgICAoc3Vic2NyaXB0aW9ucy5nZXQoZXZlbnQpIHx8IFtdKS5mb3JFYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgICBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY3JlYXRlU3Vic2NyaWJlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgIGlmICghc3Vic2NyaWJlcnMuaGFzKGNvbnRleHQpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVycy5zZXQoY29udGV4dCwgbmV3IE1hcCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgY29uc3Qgc3Vic2NyaWJlciA9IHN1YnNjcmliZXJzLmdldChjb250ZXh0KTtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXIuaGFzKGV2ZW50KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5zZXQoZXZlbnQsIFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlci5nZXQoZXZlbnQpLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgICAgc3Vic2NyaWJlcnMuZ2V0KGNvbnRleHQpLmRlbGV0ZShldmVudCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBldmVudEh1YkZhY3Rvcnk7XG4iLCJpbXBvcnQgZXZlbnRIdWJGYWN0b3J5IGZyb20gJy4uL2xpYi9ldmVudC1odWIuanMnO1xuXG5kZXNjcmliZShcIkV2ZW50SHViIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiYmFzaWMgcHViL3N1YiB3b3Jrc1wiLCAoZG9uZSkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmliZXJzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlcjIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nLCAxKTsgLy9zaG91bGQgdHJpZ2dlciBldmVudFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG4gIGl0KFwibXVsdGlwbGUgc3Vic2NyaXB0aW9ucyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgyKTtcbiAgICAgIH0pXG5cbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJywgMik7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcImRlc3Ryb3koKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWJTdWJzY3JpYmVyLmRlc3Ryb3koKTtcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycpOyAgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDApO1xuXHR9KTtcblxuICBpdChcIm9mZigpIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoJ2ZvbyBzaG91bGQgbm90IGdldCBjYWxsZWQgaW4gdGhpcyB0ZXN0JykpO1xuICAgICAgfSlcbiAgICAgIC5vbignYmFyJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKHVuZGVmaW5lZCk7XG4gICAgICB9KVxuICAgICAgLm9mZignZm9vJylcbiAgICBteUV2ZW50SHViLnB1Ymxpc2goJ25vdGhpbmcgbGlzdGVuaW5nJywgMik7IC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdiYXInKTsgIC8vc2hvdWxkIGNhbGxlZFxuICAgIGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cbn0pO1xuIl0sIm5hbWVzIjpbInRlbXBsYXRlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW1wb3J0Tm9kZSIsImNvbnRlbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJjaGlsZHJlbiIsImNoaWxkTm9kZXMiLCJpIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJodG1sIiwiaW5uZXJIVE1MIiwidHJpbSIsImZyYWciLCJ0ZW1wbGF0ZUNvbnRlbnQiLCJmaXJzdENoaWxkIiwiRXJyb3IiLCJkZXNjcmliZSIsIml0IiwiZWwiLCJleHBlY3QiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInRvIiwiZXF1YWwiLCJhc3NlcnQiLCJpbnN0YW5jZU9mIiwiTm9kZSIsImNyZWF0b3IiLCJPYmplY3QiLCJjcmVhdGUiLCJiaW5kIiwic3RvcmUiLCJXZWFrTWFwIiwib2JqIiwidmFsdWUiLCJnZXQiLCJzZXQiLCJiZWhhdmlvdXIiLCJtZXRob2ROYW1lcyIsImtsYXNzIiwicHJvdG8iLCJwcm90b3R5cGUiLCJsZW4iLCJkZWZpbmVQcm9wZXJ0eSIsIm1ldGhvZE5hbWUiLCJtZXRob2QiLCJhcmdzIiwidW5zaGlmdCIsImFwcGx5Iiwid3JpdGFibGUiLCJjdXJySGFuZGxlIiwiY2FsbGJhY2tzIiwibm9kZUNvbnRlbnQiLCJub2RlIiwiY3JlYXRlVGV4dE5vZGUiLCJNdXRhdGlvbk9ic2VydmVyIiwiZmx1c2giLCJvYnNlcnZlIiwiY2hhcmFjdGVyRGF0YSIsInJ1biIsImNhbGxiYWNrIiwidGV4dENvbnRlbnQiLCJTdHJpbmciLCJwdXNoIiwiY2IiLCJlcnIiLCJzZXRUaW1lb3V0Iiwic3BsaWNlIiwibGFzdEhhbmRsZSIsImdsb2JhbCIsImRlZmF1bHRWaWV3IiwiSFRNTEVsZW1lbnQiLCJfSFRNTEVsZW1lbnQiLCJiYXNlQ2xhc3MiLCJjdXN0b21FbGVtZW50c1YxQ2FsbGJhY2tzIiwiaGFzT3duUHJvcGVydHkiLCJwcml2YXRlcyIsImNyZWF0ZVN0b3JhZ2UiLCJmaW5hbGl6ZUNsYXNzIiwiZGVmaW5lIiwidGFnTmFtZSIsInJlZ2lzdHJ5IiwiY3VzdG9tRWxlbWVudHMiLCJmb3JFYWNoIiwiY2FsbGJhY2tNZXRob2ROYW1lIiwiY2FsbCIsImNvbmZpZ3VyYWJsZSIsIm5ld0NhbGxiYWNrTmFtZSIsInN1YnN0cmluZyIsIm9yaWdpbmFsTWV0aG9kIiwiYXJvdW5kIiwiY3JlYXRlQ29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlRGlzY29ubmVjdGVkQWR2aWNlIiwiY3JlYXRlUmVuZGVyQWR2aWNlIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3QiLCJhdHRyaWJ1dGVDaGFuZ2VkIiwiYXR0cmlidXRlTmFtZSIsIm9sZFZhbHVlIiwibmV3VmFsdWUiLCJjb25uZWN0ZWQiLCJkaXNjb25uZWN0ZWQiLCJhZG9wdGVkIiwicmVuZGVyIiwiX29uUmVuZGVyIiwiX3Bvc3RSZW5kZXIiLCJjb25uZWN0ZWRDYWxsYmFjayIsImNvbnRleHQiLCJyZW5kZXJDYWxsYmFjayIsInJlbmRlcmluZyIsImZpcnN0UmVuZGVyIiwidW5kZWZpbmVkIiwibWljcm9UYXNrIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJrZXlzIiwiYXNzaWduIiwiYXR0cmlidXRlVG9Qcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lc1RvQXR0cmlidXRlcyIsInByb3BlcnRpZXNDb25maWciLCJkYXRhSGFzQWNjZXNzb3IiLCJkYXRhUHJvdG9WYWx1ZXMiLCJlbmhhbmNlUHJvcGVydHlDb25maWciLCJjb25maWciLCJoYXNPYnNlcnZlciIsImlzT2JzZXJ2ZXJTdHJpbmciLCJvYnNlcnZlciIsImlzU3RyaW5nIiwidHlwZSIsImlzTnVtYmVyIiwiTnVtYmVyIiwiaXNCb29sZWFuIiwiQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNBcnJheSIsIkFycmF5IiwiaXNEYXRlIiwiRGF0ZSIsIm5vdGlmeSIsInJlYWRPbmx5IiwicmVmbGVjdFRvQXR0cmlidXRlIiwibm9ybWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvdXRwdXQiLCJuYW1lIiwicHJvcGVydHkiLCJpbml0aWFsaXplUHJvcGVydGllcyIsIl9mbHVzaFByb3BlcnRpZXMiLCJjcmVhdGVBdHRyaWJ1dGVDaGFuZ2VBZHZpY2UiLCJhdHRyaWJ1dGUiLCJfYXR0cmlidXRlVG9Qcm9wZXJ0eSIsImNyZWF0ZVByb3BlcnRpZXNDaGFuZ2VkQWR2aWNlIiwiY3VycmVudFByb3BzIiwiY2hhbmdlZFByb3BzIiwib2xkUHJvcHMiLCJjb25zdHJ1Y3RvciIsImNsYXNzUHJvcGVydGllcyIsIl9wcm9wZXJ0eVRvQXR0cmlidXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYmVmb3JlIiwiY3JlYXRlUHJvcGVydGllcyIsImF0dHJpYnV0ZVRvUHJvcGVydHlOYW1lIiwiaHlwZW5SZWdFeCIsInJlcGxhY2UiLCJtYXRjaCIsInRvVXBwZXJDYXNlIiwicHJvcGVydHlOYW1lVG9BdHRyaWJ1dGUiLCJ1cHBlcmNhc2VSZWdFeCIsInRvTG93ZXJDYXNlIiwicHJvcGVydHlWYWx1ZSIsIl9jcmVhdGVQcm9wZXJ0eUFjY2Vzc29yIiwiZGF0YSIsInNlcmlhbGl6aW5nIiwiZGF0YVBlbmRpbmciLCJkYXRhT2xkIiwiZGF0YUludmFsaWQiLCJfaW5pdGlhbGl6ZVByb3RvUHJvcGVydGllcyIsIl9pbml0aWFsaXplUHJvcGVydGllcyIsInByb3BlcnRpZXNDaGFuZ2VkIiwiZW51bWVyYWJsZSIsIl9nZXRQcm9wZXJ0eSIsIl9zZXRQcm9wZXJ0eSIsIl9pc1ZhbGlkUHJvcGVydHlWYWx1ZSIsIl9zZXRQZW5kaW5nUHJvcGVydHkiLCJfaW52YWxpZGF0ZVByb3BlcnRpZXMiLCJjb25zb2xlIiwibG9nIiwiX2Rlc2VyaWFsaXplVmFsdWUiLCJwcm9wZXJ0eVR5cGUiLCJpc1ZhbGlkIiwiX3NlcmlhbGl6ZVZhbHVlIiwicmVtb3ZlQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwicHJvcGVydHlDb25maWciLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIm9sZCIsImNoYW5nZWQiLCJfc2hvdWxkUHJvcGVydHlDaGFuZ2UiLCJwcm9wcyIsIl9zaG91bGRQcm9wZXJ0aWVzQ2hhbmdlIiwibWFwIiwiZ2V0UHJvcGVydGllc0NvbmZpZyIsImNoZWNrT2JqIiwibG9vcCIsImdldFByb3RvdHlwZU9mIiwiRnVuY3Rpb24iLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJhZGRMaXN0ZW5lciIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiaW5kZXhPZiIsImV2ZW50cyIsInNwbGl0IiwiaGFuZGxlcyIsImhhbmRsZSIsInBvcCIsIlByb3BlcnRpZXNUZXN0IiwicHJvcCIsInJlZmxlY3RGcm9tQXR0cmlidXRlIiwiZm5WYWx1ZVByb3AiLCJjdXN0b21FbGVtZW50IiwiY29udGFpbmVyIiwicHJvcGVydGllc1Rlc3QiLCJnZXRFbGVtZW50QnlJZCIsImFwcGVuZCIsImFmdGVyIiwibGlzdGVuRXZlbnQiLCJpc09rIiwiZXZ0IiwicmV0dXJuVmFsdWUiLCJoYW5kbGVycyIsImV2ZW50RGVmYXVsdFBhcmFtcyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiaGFuZGxlRXZlbnQiLCJldmVudCIsIm9uIiwib3duIiwiZGlzcGF0Y2giLCJvZmYiLCJoYW5kbGVyIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJFdmVudHNFbWl0dGVyIiwiRXZlbnRzTGlzdGVuZXIiLCJlbW1pdGVyIiwic3RvcEV2ZW50IiwiY2hhaSIsImEiLCJkZWVwIiwiYm9keSIsImFyciIsImZuIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInR5cGVzIiwidHlwZUNhY2hlIiwidHlwZVJlZ2V4cCIsInNldHVwIiwiZ2V0VHlwZSIsInNyYyIsImdldFNyY1R5cGUiLCJtYXRjaGVzIiwiY2hlY2tzIiwiY2xvbmUiLCJjaXJjdWxhcnMiLCJjbG9uZXMiLCJpcyIsIm51bGwiLCJpc1ByaW1pdGl2ZSIsImZ1bmN0aW9uIiwiY2xvbmVyIiwiYm9vbGVhbiIsIm51bWJlciIsInN0cmluZyIsImRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsIlNldCIsInZhbHVlcyIsInJlcXVlc3QiLCJyZXNwb25zZSIsImhlYWRlcnMiLCJIZWFkZXJzIiwiYmxvYiIsIkJsb2IiLCJvYmplY3QiLCJrZXkiLCJpZHgiLCJmaW5kSW5kZXgiLCJiZSIsImZ1bmMiLCJpc0Z1bmN0aW9uIiwicmV2aXZlciIsImsiLCJ2IiwianNvbkNsb25lIiwidGhyb3ciLCJub3QiLCJjbG9uZWQiLCJnZXRBcmd1bWVudHMiLCJhcmd1bWVudHMiLCJ0cnVlIiwibm90QXJncyIsImZhbHNlIiwibm90QXJyYXkiLCJib29sIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJ1cmwiLCJvcHRpb25zIiwiSHR0cCIsImNhdGNoZXJzIiwicmVzb2x2ZXJzIiwibWlkZGxld2FyZSIsImFwaSIsImh0dHAiLCJkZWZhdWx0VmFsdWUiLCJwYXJ0cyIsImRlcHRoIiwicHJldlRpbWVJZCIsInByZXZVbmlxdWVJZCIsInByZWZpeCIsIm5ld1VuaXF1ZUlkIiwibm93IiwidW5pcXVlSWQiLCJtb2RlbCIsInN1YnNjcmliZXJDb3VudCIsIl9zdGF0ZUtleSIsIl9zdWJzY3JpYmVycyIsIl9zZXRTdGF0ZSIsImRlZmF1bHRTdGF0ZSIsImFjY2Vzc29yIiwiX2dldFN0YXRlIiwiYXJnMSIsImFyZzIiLCJvbGRTdGF0ZSIsIm5ld1N0YXRlIiwiZHNldCIsIl9ub3RpZnlTdWJzY3JpYmVycyIsImNyZWF0ZVN1YnNjcmliZXIiLCJzZWxmIiwiX3N1YnNjcmliZSIsImRlc3Ryb3kiLCJfZGVzdHJveVN1YnNjcmliZXIiLCJjcmVhdGVQcm9wZXJ0eUJpbmRlciIsImFkZEJpbmRpbmdzIiwiYmluZFJ1bGVzIiwiYmluZFJ1bGUiLCJkZ2V0Iiwic3Vic2NyaXB0aW9ucyIsImRlbGV0ZSIsInNldEFjY2Vzc29yIiwic3Vic2NyaWJlcnMiLCJkZWVwQWNjZXNzb3IiLCJNb2RlbCIsImZvbyIsIm15TW9kZWwiLCJkZWVwT2JqMSIsImRlZXBPYmoyIiwic2VsZWN0ZWQiLCJURVNUX1NFTCIsIm15TW9kZWxTdWJzY3JpYmVyIiwibnVtQ2FsbGJhY2tzQ2FsbGVkIiwibXlFbGVtZW50IiwicHJvcGVydHlCaW5kZXIiLCJldmVudEh1YkZhY3RvcnkiLCJwdWJsaXNoIiwiaGFzIiwic3Vic2NyaWJlciIsImRvbmUiLCJteUV2ZW50SHViIiwibXlFdmVudEh1YlN1YnNjcmliZXIiLCJteUV2ZW50SHViU3Vic2NyaWJlcjIiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBO0FBQ0EseUJBQWUsVUFBQ0EsUUFBRCxFQUFjO0VBQzNCLE1BQUksYUFBYUMsU0FBU0MsYUFBVCxDQUF1QixVQUF2QixDQUFqQixFQUFxRDtFQUNuRCxXQUFPRCxTQUFTRSxVQUFULENBQW9CSCxTQUFTSSxPQUE3QixFQUFzQyxJQUF0QyxDQUFQO0VBQ0Q7O0VBRUQsTUFBSUMsV0FBV0osU0FBU0ssc0JBQVQsRUFBZjtFQUNBLE1BQUlDLFdBQVdQLFNBQVNRLFVBQXhCO0VBQ0EsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLFNBQVNHLE1BQTdCLEVBQXFDRCxHQUFyQyxFQUEwQztFQUN4Q0osYUFBU00sV0FBVCxDQUFxQkosU0FBU0UsQ0FBVCxFQUFZRyxTQUFaLENBQXNCLElBQXRCLENBQXJCO0VBQ0Q7RUFDRCxTQUFPUCxRQUFQO0VBQ0QsQ0FYRDs7RUNEQTtBQUNBO0FBRUEsdUJBQWUsVUFBQ1EsSUFBRCxFQUFVO0VBQ3ZCLE1BQU1iLFdBQVdDLFNBQVNDLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBakI7RUFDQUYsV0FBU2MsU0FBVCxHQUFxQkQsS0FBS0UsSUFBTCxFQUFyQjtFQUNBLE1BQU1DLE9BQU9DLGdCQUFnQmpCLFFBQWhCLENBQWI7RUFDQSxNQUFJZ0IsUUFBUUEsS0FBS0UsVUFBakIsRUFBNkI7RUFDM0IsV0FBT0YsS0FBS0UsVUFBWjtFQUNEO0VBQ0QsUUFBTSxJQUFJQyxLQUFKLGtDQUF5Q04sSUFBekMsQ0FBTjtFQUNELENBUkQ7O0VDREFPLFNBQVMsZ0JBQVQsRUFBMkIsWUFBTTtFQUMvQkMsS0FBRyxnQkFBSCxFQUFxQixZQUFNO0VBQ3pCLFFBQU1DLEtBQUtwQixzRUFBWDtFQUdBcUIsV0FBT0QsR0FBR0UsU0FBSCxDQUFhQyxRQUFiLENBQXNCLFVBQXRCLENBQVAsRUFBMENDLEVBQTFDLENBQTZDQyxLQUE3QyxDQUFtRCxJQUFuRDtFQUNBQyxXQUFPQyxVQUFQLENBQWtCUCxFQUFsQixFQUFzQlEsSUFBdEIsRUFBNEIsNkJBQTVCO0VBQ0QsR0FORDtFQU9ELENBUkQ7O0VDRkE7QUFDQSx1QkFBZSxZQUFrRDtFQUFBLE1BQWpEQyxPQUFpRCx1RUFBdkNDLE9BQU9DLE1BQVAsQ0FBY0MsSUFBZCxDQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixFQUEvQixDQUF1Qzs7RUFDL0QsTUFBSUMsUUFBUSxJQUFJQyxPQUFKLEVBQVo7RUFDQSxTQUFPLFVBQUNDLEdBQUQsRUFBUztFQUNkLFFBQUlDLFFBQVFILE1BQU1JLEdBQU4sQ0FBVUYsR0FBVixDQUFaO0VBQ0EsUUFBSSxDQUFDQyxLQUFMLEVBQVk7RUFDVkgsWUFBTUssR0FBTixDQUFVSCxHQUFWLEVBQWdCQyxRQUFRUCxRQUFRTSxHQUFSLENBQXhCO0VBQ0Q7RUFDRCxXQUFPQyxLQUFQO0VBQ0QsR0FORDtFQU9ELENBVEQ7O0VDREE7QUFDQSxnQkFBZSxVQUFDRyxTQUFELEVBQStCO0VBQUEsb0NBQWhCQyxXQUFnQjtFQUFoQkEsZUFBZ0I7RUFBQTs7RUFDNUMsU0FBTyxVQUFTQyxLQUFULEVBQWdCO0VBQ3JCLFFBQU1DLFFBQVFELE1BQU1FLFNBQXBCO0VBQ0EsUUFBTUMsTUFBTUosWUFBWWhDLE1BQXhCO0VBRnFCLFFBR2JxQyxjQUhhLEdBR01mLE1BSE4sQ0FHYmUsY0FIYTs7RUFBQSwrQkFJWnRDLENBSlk7RUFLbkIsVUFBTXVDLGFBQWFOLFlBQVlqQyxDQUFaLENBQW5CO0VBQ0EsVUFBTXdDLFNBQVNMLE1BQU1JLFVBQU4sQ0FBZjtFQUNBRCxxQkFBZUgsS0FBZixFQUFzQkksVUFBdEIsRUFBa0M7RUFDaENWLGVBQU8saUJBQWtCO0VBQUEsNkNBQU5ZLElBQU07RUFBTkEsZ0JBQU07RUFBQTs7RUFDdkJBLGVBQUtDLE9BQUwsQ0FBYUYsTUFBYjtFQUNBUixvQkFBVVcsS0FBVixDQUFnQixJQUFoQixFQUFzQkYsSUFBdEI7RUFDRCxTQUorQjtFQUtoQ0csa0JBQVU7RUFMc0IsT0FBbEM7RUFQbUI7O0VBSXJCLFNBQUssSUFBSTVDLElBQUksQ0FBYixFQUFnQkEsSUFBSXFDLEdBQXBCLEVBQXlCckMsR0FBekIsRUFBOEI7RUFBQSxZQUFyQkEsQ0FBcUI7RUFVN0I7RUFDRCxXQUFPa0MsS0FBUDtFQUNELEdBaEJEO0VBaUJELENBbEJEOztFQ0RBO0VBQ0EsSUFBSVcsYUFBYSxDQUFqQjtBQUNBLEVBQ0EsSUFBSUMsWUFBWSxFQUFoQjtFQUNBLElBQUlDLGNBQWMsQ0FBbEI7RUFDQSxJQUFJQyxPQUFPeEQsU0FBU3lELGNBQVQsQ0FBd0IsRUFBeEIsQ0FBWDtFQUNBLElBQUlDLGdCQUFKLENBQXFCQyxLQUFyQixFQUE0QkMsT0FBNUIsQ0FBb0NKLElBQXBDLEVBQTBDLEVBQUVLLGVBQWUsSUFBakIsRUFBMUM7O0VBRUE7Ozs7OztBQU1BLEVBQU8sSUFBTUMsTUFBTSxTQUFOQSxHQUFNLENBQUNDLFFBQUQsRUFBYztFQUMvQlAsT0FBS1EsV0FBTCxHQUFtQkMsT0FBT1YsYUFBUCxDQUFuQjtFQUNBRCxZQUFVWSxJQUFWLENBQWVILFFBQWY7RUFDQSxTQUFPVixZQUFQO0VBQ0QsQ0FKTTs7RUFxQlAsU0FBU00sS0FBVCxHQUFpQjtFQUNmLE1BQU1kLE1BQU1TLFVBQVU3QyxNQUF0QjtFQUNBLE9BQUssSUFBSUQsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcUMsR0FBcEIsRUFBeUJyQyxHQUF6QixFQUE4QjtFQUM1QixRQUFJMkQsS0FBS2IsVUFBVTlDLENBQVYsQ0FBVDtFQUNBLFFBQUkyRCxNQUFNLE9BQU9BLEVBQVAsS0FBYyxVQUF4QixFQUFvQztFQUNsQyxVQUFJO0VBQ0ZBO0VBQ0QsT0FGRCxDQUVFLE9BQU9DLEdBQVAsRUFBWTtFQUNaQyxtQkFBVyxZQUFNO0VBQ2YsZ0JBQU1ELEdBQU47RUFDRCxTQUZEO0VBR0Q7RUFDRjtFQUNGO0VBQ0RkLFlBQVVnQixNQUFWLENBQWlCLENBQWpCLEVBQW9CekIsR0FBcEI7QUFDQTBCLEVBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VDbkREO0FBQ0E7RUFJQSxJQUFNQyxXQUFTeEUsU0FBU3lFLFdBQXhCOztFQUVBO0VBQ0EsSUFBSSxPQUFPRCxTQUFPRSxXQUFkLEtBQThCLFVBQWxDLEVBQThDO0VBQzVDLE1BQU1DLGVBQWUsU0FBU0QsV0FBVCxHQUF1QjtFQUMxQztFQUNELEdBRkQ7RUFHQUMsZUFBYS9CLFNBQWIsR0FBeUI0QixTQUFPRSxXQUFQLENBQW1COUIsU0FBNUM7RUFDQTRCLFdBQU9FLFdBQVAsR0FBcUJDLFlBQXJCO0VBQ0Q7O0FBR0QsdUJBQWUsVUFBQ0MsU0FBRCxFQUFlO0VBQzVCLE1BQU1DLDRCQUE0QixDQUNoQyxtQkFEZ0MsRUFFaEMsc0JBRmdDLEVBR2hDLGlCQUhnQyxFQUloQywwQkFKZ0MsQ0FBbEM7RUFENEIsTUFPcEIvQixpQkFQb0IsR0FPZWYsTUFQZixDQU9wQmUsY0FQb0I7RUFBQSxNQU9KZ0MsY0FQSSxHQU9lL0MsTUFQZixDQU9KK0MsY0FQSTs7RUFRNUIsTUFBTUMsV0FBV0MsZUFBakI7O0VBRUEsTUFBSSxDQUFDSixTQUFMLEVBQWdCO0VBQ2RBO0VBQUE7O0VBQUE7RUFBQTtFQUFBO0VBQUE7O0VBQUE7RUFBQSxNQUEwQkosU0FBT0UsV0FBakM7RUFDRDs7RUFFRDtFQUFBOztFQUFBLGtCQU1TTyxhQU5ULDRCQU15QixFQU56Qjs7RUFBQSxrQkFRU0MsTUFSVCxtQkFRZ0JDLE9BUmhCLEVBUXlCO0VBQ3JCLFVBQU1DLFdBQVdDLGNBQWpCO0VBQ0EsVUFBSSxDQUFDRCxTQUFTOUMsR0FBVCxDQUFhNkMsT0FBYixDQUFMLEVBQTRCO0VBQzFCLFlBQU14QyxRQUFRLEtBQUtDLFNBQW5CO0VBQ0FpQyxrQ0FBMEJTLE9BQTFCLENBQWtDLFVBQUNDLGtCQUFELEVBQXdCO0VBQ3hELGNBQUksQ0FBQ1QsZUFBZVUsSUFBZixDQUFvQjdDLEtBQXBCLEVBQTJCNEMsa0JBQTNCLENBQUwsRUFBcUQ7RUFDbkR6Qyw4QkFBZUgsS0FBZixFQUFzQjRDLGtCQUF0QixFQUEwQztFQUN4Q2xELG1CQUR3QyxtQkFDaEMsRUFEZ0M7O0VBRXhDb0QsNEJBQWM7RUFGMEIsYUFBMUM7RUFJRDtFQUNELGNBQU1DLGtCQUFrQkgsbUJBQW1CSSxTQUFuQixDQUN0QixDQURzQixFQUV0QkosbUJBQW1COUUsTUFBbkIsR0FBNEIsV0FBV0EsTUFGakIsQ0FBeEI7RUFJQSxjQUFNbUYsaUJBQWlCakQsTUFBTTRDLGtCQUFOLENBQXZCO0VBQ0F6Qyw0QkFBZUgsS0FBZixFQUFzQjRDLGtCQUF0QixFQUEwQztFQUN4Q2xELG1CQUFPLGlCQUFrQjtFQUFBLGdEQUFOWSxJQUFNO0VBQU5BLG9CQUFNO0VBQUE7O0VBQ3ZCLG1CQUFLeUMsZUFBTCxFQUFzQnZDLEtBQXRCLENBQTRCLElBQTVCLEVBQWtDRixJQUFsQztFQUNBMkMsNkJBQWV6QyxLQUFmLENBQXFCLElBQXJCLEVBQTJCRixJQUEzQjtFQUNELGFBSnVDO0VBS3hDd0MsMEJBQWM7RUFMMEIsV0FBMUM7RUFPRCxTQW5CRDs7RUFxQkEsYUFBS1IsYUFBTDtFQUNBWSxlQUFPQyx1QkFBUCxFQUFnQyxXQUFoQyxFQUE2QyxJQUE3QztFQUNBRCxlQUFPRSwwQkFBUCxFQUFtQyxjQUFuQyxFQUFtRCxJQUFuRDtFQUNBRixlQUFPRyxvQkFBUCxFQUE2QixRQUE3QixFQUF1QyxJQUF2QztFQUNBWixpQkFBU0YsTUFBVCxDQUFnQkMsT0FBaEIsRUFBeUIsSUFBekI7RUFDRDtFQUNGLEtBdkNIOztFQUFBO0VBQUE7RUFBQSw2QkF5Q29CO0VBQ2hCLGVBQU9KLFNBQVMsSUFBVCxFQUFla0IsV0FBZixLQUErQixJQUF0QztFQUNEO0VBM0NIO0VBQUE7RUFBQSw2QkFFa0M7RUFDOUIsZUFBTyxFQUFQO0VBQ0Q7RUFKSDs7RUE2Q0UsNkJBQXFCO0VBQUE7O0VBQUEseUNBQU5oRCxJQUFNO0VBQU5BLFlBQU07RUFBQTs7RUFBQSxtREFDbkIsZ0RBQVNBLElBQVQsRUFEbUI7O0VBRW5CLGFBQUtpRCxTQUFMO0VBRm1CO0VBR3BCOztFQWhESCw0QkFrREVBLFNBbERGLHdCQWtEYyxFQWxEZDs7RUFvREU7OztFQXBERiw0QkFxREVDLGdCQXJERiw2QkFxRG1CQyxhQXJEbkIsRUFxRGtDQyxRQXJEbEMsRUFxRDRDQyxRQXJENUMsRUFxRHNELEVBckR0RDtFQXNERTs7RUF0REYsNEJBd0RFQyxTQXhERix3QkF3RGMsRUF4RGQ7O0VBQUEsNEJBMERFQyxZQTFERiwyQkEwRGlCLEVBMURqQjs7RUFBQSw0QkE0REVDLE9BNURGLHNCQTREWSxFQTVEWjs7RUFBQSw0QkE4REVDLE1BOURGLHFCQThEVyxFQTlEWDs7RUFBQSw0QkFnRUVDLFNBaEVGLHdCQWdFYyxFQWhFZDs7RUFBQSw0QkFrRUVDLFdBbEVGLDBCQWtFZ0IsRUFsRWhCOztFQUFBO0VBQUEsSUFBbUNoQyxTQUFuQzs7RUFxRUEsV0FBU2tCLHFCQUFULEdBQWlDO0VBQy9CLFdBQU8sVUFBU2UsaUJBQVQsRUFBNEI7RUFDakMsVUFBTUMsVUFBVSxJQUFoQjtFQUNBL0IsZUFBUytCLE9BQVQsRUFBa0JQLFNBQWxCLEdBQThCLElBQTlCO0VBQ0EsVUFBSSxDQUFDeEIsU0FBUytCLE9BQVQsRUFBa0JiLFdBQXZCLEVBQW9DO0VBQ2xDbEIsaUJBQVMrQixPQUFULEVBQWtCYixXQUFsQixHQUFnQyxJQUFoQztFQUNBWSwwQkFBa0JyQixJQUFsQixDQUF1QnNCLE9BQXZCO0VBQ0FBLGdCQUFRSixNQUFSO0VBQ0Q7RUFDRixLQVJEO0VBU0Q7O0VBRUQsV0FBU1Ysa0JBQVQsR0FBOEI7RUFDNUIsV0FBTyxVQUFTZSxjQUFULEVBQXlCO0VBQzlCLFVBQU1ELFVBQVUsSUFBaEI7RUFDQSxVQUFJLENBQUMvQixTQUFTK0IsT0FBVCxFQUFrQkUsU0FBdkIsRUFBa0M7RUFDaEMsWUFBTUMsY0FBY2xDLFNBQVMrQixPQUFULEVBQWtCRSxTQUFsQixLQUFnQ0UsU0FBcEQ7RUFDQW5DLGlCQUFTK0IsT0FBVCxFQUFrQkUsU0FBbEIsR0FBOEIsSUFBOUI7RUFDQUcsV0FBQSxDQUFjLFlBQU07RUFDbEIsY0FBSXBDLFNBQVMrQixPQUFULEVBQWtCRSxTQUF0QixFQUFpQztFQUMvQmpDLHFCQUFTK0IsT0FBVCxFQUFrQkUsU0FBbEIsR0FBOEIsS0FBOUI7RUFDQUYsb0JBQVFILFNBQVIsQ0FBa0JNLFdBQWxCO0VBQ0FGLDJCQUFldkIsSUFBZixDQUFvQnNCLE9BQXBCO0VBQ0FBLG9CQUFRRixXQUFSLENBQW9CSyxXQUFwQjtFQUNEO0VBQ0YsU0FQRDtFQVFEO0VBQ0YsS0FkRDtFQWVEOztFQUVELFdBQVNsQix3QkFBVCxHQUFvQztFQUNsQyxXQUFPLFVBQVNxQixvQkFBVCxFQUErQjtFQUNwQyxVQUFNTixVQUFVLElBQWhCO0VBQ0EvQixlQUFTK0IsT0FBVCxFQUFrQlAsU0FBbEIsR0FBOEIsS0FBOUI7RUFDQVksU0FBQSxDQUFjLFlBQU07RUFDbEIsWUFBSSxDQUFDcEMsU0FBUytCLE9BQVQsRUFBa0JQLFNBQW5CLElBQWdDeEIsU0FBUytCLE9BQVQsRUFBa0JiLFdBQXRELEVBQW1FO0VBQ2pFbEIsbUJBQVMrQixPQUFULEVBQWtCYixXQUFsQixHQUFnQyxLQUFoQztFQUNBbUIsK0JBQXFCNUIsSUFBckIsQ0FBMEJzQixPQUExQjtFQUNEO0VBQ0YsT0FMRDtFQU1ELEtBVEQ7RUFVRDtFQUNGLENBN0hEOztFQ2pCQTtBQUNBLGtCQUFlLFVBQUN0RSxTQUFELEVBQStCO0VBQUEsb0NBQWhCQyxXQUFnQjtFQUFoQkEsZUFBZ0I7RUFBQTs7RUFDNUMsU0FBTyxVQUFTQyxLQUFULEVBQWdCO0VBQ3JCLFFBQU1DLFFBQVFELE1BQU1FLFNBQXBCO0VBQ0EsUUFBTUMsTUFBTUosWUFBWWhDLE1BQXhCO0VBRnFCLFFBR2JxQyxjQUhhLEdBR01mLE1BSE4sQ0FHYmUsY0FIYTs7RUFBQSwrQkFJWnRDLENBSlk7RUFLbkIsVUFBTXVDLGFBQWFOLFlBQVlqQyxDQUFaLENBQW5CO0VBQ0EsVUFBTXdDLFNBQVNMLE1BQU1JLFVBQU4sQ0FBZjtFQUNBRCxxQkFBZUgsS0FBZixFQUFzQkksVUFBdEIsRUFBa0M7RUFDaENWLGVBQU8saUJBQWtCO0VBQUEsNkNBQU5ZLElBQU07RUFBTkEsZ0JBQU07RUFBQTs7RUFDdkJULG9CQUFVVyxLQUFWLENBQWdCLElBQWhCLEVBQXNCRixJQUF0QjtFQUNBLGlCQUFPRCxPQUFPRyxLQUFQLENBQWEsSUFBYixFQUFtQkYsSUFBbkIsQ0FBUDtFQUNELFNBSitCO0VBS2hDRyxrQkFBVTtFQUxzQixPQUFsQztFQVBtQjs7RUFJckIsU0FBSyxJQUFJNUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcUMsR0FBcEIsRUFBeUJyQyxHQUF6QixFQUE4QjtFQUFBLFlBQXJCQSxDQUFxQjtFQVU3QjtFQUNELFdBQU9rQyxLQUFQO0VBQ0QsR0FoQkQ7RUFpQkQsQ0FsQkQ7O0VDREE7QUFDQTtBQVFBLG9CQUFlLFVBQUNrQyxTQUFELEVBQWU7RUFBQSxNQUNwQjlCLGlCQURvQixHQUNhZixNQURiLENBQ3BCZSxjQURvQjtFQUFBLE1BQ0p1RSxJQURJLEdBQ2F0RixNQURiLENBQ0pzRixJQURJO0VBQUEsTUFDRUMsTUFERixHQUNhdkYsTUFEYixDQUNFdUYsTUFERjs7RUFFNUIsTUFBTUMsMkJBQTJCLEVBQWpDO0VBQ0EsTUFBTUMsNEJBQTRCLEVBQWxDO0VBQ0EsTUFBTXpDLFdBQVdDLGVBQWpCOztFQUVBLE1BQUl5Qyx5QkFBSjtFQUNBLE1BQUlDLGtCQUFrQixFQUF0QjtFQUNBLE1BQUlDLGtCQUFrQixFQUF0Qjs7RUFFQSxXQUFTQyxxQkFBVCxDQUErQkMsTUFBL0IsRUFBdUM7RUFDckNBLFdBQU9DLFdBQVAsR0FBcUIsY0FBY0QsTUFBbkM7RUFDQUEsV0FBT0UsZ0JBQVAsR0FBMEJGLE9BQU9DLFdBQVAsSUFBc0IsT0FBT0QsT0FBT0csUUFBZCxLQUEyQixRQUEzRTtFQUNBSCxXQUFPSSxRQUFQLEdBQWtCSixPQUFPSyxJQUFQLEtBQWdCakUsTUFBbEM7RUFDQTRELFdBQU9NLFFBQVAsR0FBa0JOLE9BQU9LLElBQVAsS0FBZ0JFLE1BQWxDO0VBQ0FQLFdBQU9RLFNBQVAsR0FBbUJSLE9BQU9LLElBQVAsS0FBZ0JJLE9BQW5DO0VBQ0FULFdBQU9VLFFBQVAsR0FBa0JWLE9BQU9LLElBQVAsS0FBZ0JuRyxNQUFsQztFQUNBOEYsV0FBT1csT0FBUCxHQUFpQlgsT0FBT0ssSUFBUCxLQUFnQk8sS0FBakM7RUFDQVosV0FBT2EsTUFBUCxHQUFnQmIsT0FBT0ssSUFBUCxLQUFnQlMsSUFBaEM7RUFDQWQsV0FBT2UsTUFBUCxHQUFnQixZQUFZZixNQUE1QjtFQUNBQSxXQUFPZ0IsUUFBUCxHQUFrQixjQUFjaEIsTUFBZCxHQUF1QkEsT0FBT2dCLFFBQTlCLEdBQXlDLEtBQTNEO0VBQ0FoQixXQUFPaUIsa0JBQVAsR0FDRSx3QkFBd0JqQixNQUF4QixHQUNJQSxPQUFPaUIsa0JBRFgsR0FFSWpCLE9BQU9JLFFBQVAsSUFBbUJKLE9BQU9NLFFBQTFCLElBQXNDTixPQUFPUSxTQUhuRDtFQUlEOztFQUVELFdBQVNVLG1CQUFULENBQTZCQyxVQUE3QixFQUF5QztFQUN2QyxRQUFNQyxTQUFTLEVBQWY7RUFDQSxTQUFLLElBQUlDLElBQVQsSUFBaUJGLFVBQWpCLEVBQTZCO0VBQzNCLFVBQUksQ0FBQ2pILE9BQU8rQyxjQUFQLENBQXNCVSxJQUF0QixDQUEyQndELFVBQTNCLEVBQXVDRSxJQUF2QyxDQUFMLEVBQW1EO0VBQ2pEO0VBQ0Q7RUFDRCxVQUFNQyxXQUFXSCxXQUFXRSxJQUFYLENBQWpCO0VBQ0FELGFBQU9DLElBQVAsSUFBZSxPQUFPQyxRQUFQLEtBQW9CLFVBQXBCLEdBQWlDLEVBQUVqQixNQUFNaUIsUUFBUixFQUFqQyxHQUFzREEsUUFBckU7RUFDQXZCLDRCQUFzQnFCLE9BQU9DLElBQVAsQ0FBdEI7RUFDRDtFQUNELFdBQU9ELE1BQVA7RUFDRDs7RUFFRCxXQUFTbkQscUJBQVQsR0FBaUM7RUFDL0IsV0FBTyxZQUFXO0VBQ2hCLFVBQU1nQixVQUFVLElBQWhCO0VBQ0EsVUFBSS9FLE9BQU9zRixJQUFQLENBQVl0QyxTQUFTK0IsT0FBVCxFQUFrQnNDLG9CQUE5QixFQUFvRDNJLE1BQXBELEdBQTZELENBQWpFLEVBQW9FO0VBQ2xFNkcsZUFBT1IsT0FBUCxFQUFnQi9CLFNBQVMrQixPQUFULEVBQWtCc0Msb0JBQWxDO0VBQ0FyRSxpQkFBUytCLE9BQVQsRUFBa0JzQyxvQkFBbEIsR0FBeUMsRUFBekM7RUFDRDtFQUNEdEMsY0FBUXVDLGdCQUFSO0VBQ0QsS0FQRDtFQVFEOztFQUVELFdBQVNDLDJCQUFULEdBQXVDO0VBQ3JDLFdBQU8sVUFBU0MsU0FBVCxFQUFvQmxELFFBQXBCLEVBQThCQyxRQUE5QixFQUF3QztFQUM3QyxVQUFNUSxVQUFVLElBQWhCO0VBQ0EsVUFBSVQsYUFBYUMsUUFBakIsRUFBMkI7RUFDekJRLGdCQUFRMEMsb0JBQVIsQ0FBNkJELFNBQTdCLEVBQXdDakQsUUFBeEM7RUFDRDtFQUNGLEtBTEQ7RUFNRDs7RUFFRCxXQUFTbUQsNkJBQVQsR0FBeUM7RUFDdkMsV0FBTyxVQUFTQyxZQUFULEVBQXVCQyxZQUF2QixFQUFxQ0MsUUFBckMsRUFBK0M7RUFBQTs7RUFDcEQsVUFBSTlDLFVBQVUsSUFBZDtFQUNBL0UsYUFBT3NGLElBQVAsQ0FBWXNDLFlBQVosRUFBMEJyRSxPQUExQixDQUFrQyxVQUFDNkQsUUFBRCxFQUFjO0VBQUEsb0NBTzFDckMsUUFBUStDLFdBQVIsQ0FBb0JDLGVBQXBCLENBQW9DWCxRQUFwQyxDQVAwQztFQUFBLFlBRTVDUCxNQUY0Qyx5QkFFNUNBLE1BRjRDO0VBQUEsWUFHNUNkLFdBSDRDLHlCQUc1Q0EsV0FINEM7RUFBQSxZQUk1Q2dCLGtCQUo0Qyx5QkFJNUNBLGtCQUo0QztFQUFBLFlBSzVDZixnQkFMNEMseUJBSzVDQSxnQkFMNEM7RUFBQSxZQU01Q0MsUUFONEMseUJBTTVDQSxRQU40Qzs7RUFROUMsWUFBSWMsa0JBQUosRUFBd0I7RUFDdEJoQyxrQkFBUWlELG9CQUFSLENBQTZCWixRQUE3QixFQUF1Q1EsYUFBYVIsUUFBYixDQUF2QztFQUNEO0VBQ0QsWUFBSXJCLGVBQWVDLGdCQUFuQixFQUFxQztFQUNuQyxnQkFBS0MsUUFBTCxFQUFlMkIsYUFBYVIsUUFBYixDQUFmLEVBQXVDUyxTQUFTVCxRQUFULENBQXZDO0VBQ0QsU0FGRCxNQUVPLElBQUlyQixlQUFlLE9BQU9FLFFBQVAsS0FBb0IsVUFBdkMsRUFBbUQ7RUFDeERBLG1CQUFTN0UsS0FBVCxDQUFlMkQsT0FBZixFQUF3QixDQUFDNkMsYUFBYVIsUUFBYixDQUFELEVBQXlCUyxTQUFTVCxRQUFULENBQXpCLENBQXhCO0VBQ0Q7RUFDRCxZQUFJUCxNQUFKLEVBQVk7RUFDVjlCLGtCQUFRa0QsYUFBUixDQUNFLElBQUlDLFdBQUosQ0FBbUJkLFFBQW5CLGVBQXVDO0VBQ3JDZSxvQkFBUTtFQUNONUQsd0JBQVVxRCxhQUFhUixRQUFiLENBREo7RUFFTjlDLHdCQUFVdUQsU0FBU1QsUUFBVDtFQUZKO0VBRDZCLFdBQXZDLENBREY7RUFRRDtFQUNGLE9BMUJEO0VBMkJELEtBN0JEO0VBOEJEOztFQUVEO0VBQUE7O0VBQUE7RUFBQTtFQUFBO0VBQUE7O0VBQUEsZUFNU2xFLGFBTlQsNEJBTXlCO0VBQ3JCLGlCQUFNQSxhQUFOO0VBQ0FrRixlQUFPckUsdUJBQVAsRUFBZ0MsV0FBaEMsRUFBNkMsSUFBN0M7RUFDQXFFLGVBQU9iLDZCQUFQLEVBQXNDLGtCQUF0QyxFQUEwRCxJQUExRDtFQUNBYSxlQUFPViwrQkFBUCxFQUF3QyxtQkFBeEMsRUFBNkQsSUFBN0Q7RUFDQSxXQUFLVyxnQkFBTDtFQUNELEtBWkg7O0VBQUEsZUFjU0MsdUJBZFQsb0NBY2lDZCxTQWRqQyxFQWM0QztFQUN4QyxVQUFJSixXQUFXNUIseUJBQXlCZ0MsU0FBekIsQ0FBZjtFQUNBLFVBQUksQ0FBQ0osUUFBTCxFQUFlO0VBQ2I7RUFDQSxZQUFNbUIsYUFBYSxXQUFuQjtFQUNBbkIsbUJBQVdJLFVBQVVnQixPQUFWLENBQWtCRCxVQUFsQixFQUE4QjtFQUFBLGlCQUFTRSxNQUFNLENBQU4sRUFBU0MsV0FBVCxFQUFUO0VBQUEsU0FBOUIsQ0FBWDtFQUNBbEQsaUNBQXlCZ0MsU0FBekIsSUFBc0NKLFFBQXRDO0VBQ0Q7RUFDRCxhQUFPQSxRQUFQO0VBQ0QsS0F2Qkg7O0VBQUEsZUF5QlN1Qix1QkF6QlQsb0NBeUJpQ3ZCLFFBekJqQyxFQXlCMkM7RUFDdkMsVUFBSUksWUFBWS9CLDBCQUEwQjJCLFFBQTFCLENBQWhCO0VBQ0EsVUFBSSxDQUFDSSxTQUFMLEVBQWdCO0VBQ2Q7RUFDQSxZQUFNb0IsaUJBQWlCLFVBQXZCO0VBQ0FwQixvQkFBWUosU0FBU29CLE9BQVQsQ0FBaUJJLGNBQWpCLEVBQWlDLEtBQWpDLEVBQXdDQyxXQUF4QyxFQUFaO0VBQ0FwRCxrQ0FBMEIyQixRQUExQixJQUFzQ0ksU0FBdEM7RUFDRDtFQUNELGFBQU9BLFNBQVA7RUFDRCxLQWxDSDs7RUFBQSxlQXlFU2EsZ0JBekVULCtCQXlFNEI7RUFDeEIsVUFBTXpILFFBQVEsS0FBS0MsU0FBbkI7RUFDQSxVQUFNb0csYUFBYSxLQUFLYyxlQUF4QjtFQUNBekMsV0FBSzJCLFVBQUwsRUFBaUIxRCxPQUFqQixDQUF5QixVQUFDNkQsUUFBRCxFQUFjO0VBQ3JDLFlBQUlwSCxPQUFPK0MsY0FBUCxDQUFzQlUsSUFBdEIsQ0FBMkI3QyxLQUEzQixFQUFrQ3dHLFFBQWxDLENBQUosRUFBaUQ7RUFDL0MsZ0JBQU0sSUFBSWpJLEtBQUosaUNBQXVDaUksUUFBdkMsaUNBQU47RUFDRDtFQUNELFlBQU0wQixnQkFBZ0I3QixXQUFXRyxRQUFYLEVBQXFCOUcsS0FBM0M7RUFDQSxZQUFJd0ksa0JBQWtCM0QsU0FBdEIsRUFBaUM7RUFDL0JTLDBCQUFnQndCLFFBQWhCLElBQTRCMEIsYUFBNUI7RUFDRDtFQUNEbEksY0FBTW1JLHVCQUFOLENBQThCM0IsUUFBOUIsRUFBd0NILFdBQVdHLFFBQVgsRUFBcUJOLFFBQTdEO0VBQ0QsT0FURDtFQVVELEtBdEZIOztFQUFBLHlCQXdGRTNDLFNBeEZGLHdCQXdGYztFQUNWLDJCQUFNQSxTQUFOO0VBQ0FuQixlQUFTLElBQVQsRUFBZWdHLElBQWYsR0FBc0IsRUFBdEI7RUFDQWhHLGVBQVMsSUFBVCxFQUFlaUcsV0FBZixHQUE2QixLQUE3QjtFQUNBakcsZUFBUyxJQUFULEVBQWVxRSxvQkFBZixHQUFzQyxFQUF0QztFQUNBckUsZUFBUyxJQUFULEVBQWVrRyxXQUFmLEdBQTZCLElBQTdCO0VBQ0FsRyxlQUFTLElBQVQsRUFBZW1HLE9BQWYsR0FBeUIsSUFBekI7RUFDQW5HLGVBQVMsSUFBVCxFQUFlb0csV0FBZixHQUE2QixLQUE3QjtFQUNBLFdBQUtDLDBCQUFMO0VBQ0EsV0FBS0MscUJBQUw7RUFDRCxLQWxHSDs7RUFBQSx5QkFvR0VDLGlCQXBHRiw4QkFxR0k1QixZQXJHSixFQXNHSUMsWUF0R0osRUF1R0lDLFFBdkdKO0VBQUEsTUF3R0ksRUF4R0o7O0VBQUEseUJBMEdFa0IsdUJBMUdGLG9DQTBHMEIzQixRQTFHMUIsRUEwR29DTixRQTFHcEMsRUEwRzhDO0VBQzFDLFVBQUksQ0FBQ25CLGdCQUFnQnlCLFFBQWhCLENBQUwsRUFBZ0M7RUFDOUJ6Qix3QkFBZ0J5QixRQUFoQixJQUE0QixJQUE1QjtFQUNBckcsMEJBQWUsSUFBZixFQUFxQnFHLFFBQXJCLEVBQStCO0VBQzdCb0Msc0JBQVksSUFEaUI7RUFFN0I5Rix3QkFBYyxJQUZlO0VBRzdCbkQsYUFINkIsb0JBR3ZCO0VBQ0osbUJBQU8sS0FBS2tKLFlBQUwsQ0FBa0JyQyxRQUFsQixDQUFQO0VBQ0QsV0FMNEI7O0VBTTdCNUcsZUFBS3NHLFdBQ0QsWUFBTSxFQURMLEdBRUQsVUFBU3ZDLFFBQVQsRUFBbUI7RUFDakIsaUJBQUttRixZQUFMLENBQWtCdEMsUUFBbEIsRUFBNEI3QyxRQUE1QjtFQUNEO0VBVndCLFNBQS9CO0VBWUQ7RUFDRixLQTFISDs7RUFBQSx5QkE0SEVrRixZQTVIRix5QkE0SGVyQyxRQTVIZixFQTRIeUI7RUFDckIsYUFBT3BFLFNBQVMsSUFBVCxFQUFlZ0csSUFBZixDQUFvQjVCLFFBQXBCLENBQVA7RUFDRCxLQTlISDs7RUFBQSx5QkFnSUVzQyxZQWhJRix5QkFnSWV0QyxRQWhJZixFQWdJeUI3QyxRQWhJekIsRUFnSW1DO0VBQy9CLFVBQUksS0FBS29GLHFCQUFMLENBQTJCdkMsUUFBM0IsRUFBcUM3QyxRQUFyQyxDQUFKLEVBQW9EO0VBQ2xELFlBQUksS0FBS3FGLG1CQUFMLENBQXlCeEMsUUFBekIsRUFBbUM3QyxRQUFuQyxDQUFKLEVBQWtEO0VBQ2hELGVBQUtzRixxQkFBTDtFQUNEO0VBQ0YsT0FKRCxNQUlPO0VBQ0w7RUFDQUMsZ0JBQVFDLEdBQVIsb0JBQTZCeEYsUUFBN0Isc0JBQXNENkMsUUFBdEQsNEJBQ0ksS0FBS1UsV0FBTCxDQUFpQkMsZUFBakIsQ0FBaUNYLFFBQWpDLEVBQTJDakIsSUFBM0MsQ0FBZ0RnQixJQURwRDtFQUVEO0VBQ0YsS0ExSUg7O0VBQUEseUJBNElFa0MsMEJBNUlGLHlDQTRJK0I7RUFBQTs7RUFDM0JySixhQUFPc0YsSUFBUCxDQUFZTSxlQUFaLEVBQTZCckMsT0FBN0IsQ0FBcUMsVUFBQzZELFFBQUQsRUFBYztFQUNqRCxZQUFNOUcsUUFDSixPQUFPc0YsZ0JBQWdCd0IsUUFBaEIsQ0FBUCxLQUFxQyxVQUFyQyxHQUNJeEIsZ0JBQWdCd0IsUUFBaEIsRUFBMEIzRCxJQUExQixDQUErQixNQUEvQixDQURKLEdBRUltQyxnQkFBZ0J3QixRQUFoQixDQUhOO0VBSUEsZUFBS3NDLFlBQUwsQ0FBa0J0QyxRQUFsQixFQUE0QjlHLEtBQTVCO0VBQ0QsT0FORDtFQU9ELEtBcEpIOztFQUFBLHlCQXNKRWdKLHFCQXRKRixvQ0FzSjBCO0VBQUE7O0VBQ3RCdEosYUFBT3NGLElBQVAsQ0FBWUssZUFBWixFQUE2QnBDLE9BQTdCLENBQXFDLFVBQUM2RCxRQUFELEVBQWM7RUFDakQsWUFBSXBILE9BQU8rQyxjQUFQLENBQXNCVSxJQUF0QixDQUEyQixNQUEzQixFQUFpQzJELFFBQWpDLENBQUosRUFBZ0Q7RUFDOUNwRSxtQkFBUyxNQUFULEVBQWVxRSxvQkFBZixDQUFvQ0QsUUFBcEMsSUFBZ0QsT0FBS0EsUUFBTCxDQUFoRDtFQUNBLGlCQUFPLE9BQUtBLFFBQUwsQ0FBUDtFQUNEO0VBQ0YsT0FMRDtFQU1ELEtBN0pIOztFQUFBLHlCQStKRUssb0JBL0pGLGlDQStKdUJELFNBL0p2QixFQStKa0NsSCxLQS9KbEMsRUErSnlDO0VBQ3JDLFVBQUksQ0FBQzBDLFNBQVMsSUFBVCxFQUFlaUcsV0FBcEIsRUFBaUM7RUFDL0IsWUFBTTdCLFdBQVcsS0FBS1UsV0FBTCxDQUFpQlEsdUJBQWpCLENBQXlDZCxTQUF6QyxDQUFqQjtFQUNBLGFBQUtKLFFBQUwsSUFBaUIsS0FBSzRDLGlCQUFMLENBQXVCNUMsUUFBdkIsRUFBaUM5RyxLQUFqQyxDQUFqQjtFQUNEO0VBQ0YsS0FwS0g7O0VBQUEseUJBc0tFcUoscUJBdEtGLGtDQXNLd0J2QyxRQXRLeEIsRUFzS2tDOUcsS0F0S2xDLEVBc0t5QztFQUNyQyxVQUFNMkosZUFBZSxLQUFLbkMsV0FBTCxDQUFpQkMsZUFBakIsQ0FBaUNYLFFBQWpDLEVBQTJDakIsSUFBaEU7RUFDQSxVQUFJK0QsVUFBVSxLQUFkO0VBQ0EsVUFBSSxRQUFPNUosS0FBUCx5Q0FBT0EsS0FBUCxPQUFpQixRQUFyQixFQUErQjtFQUM3QjRKLGtCQUFVNUosaUJBQWlCMkosWUFBM0I7RUFDRCxPQUZELE1BRU87RUFDTEMsa0JBQVUsYUFBVTVKLEtBQVYseUNBQVVBLEtBQVYsT0FBc0IySixhQUFhOUMsSUFBYixDQUFrQjBCLFdBQWxCLEVBQWhDO0VBQ0Q7RUFDRCxhQUFPcUIsT0FBUDtFQUNELEtBL0tIOztFQUFBLHlCQWlMRWxDLG9CQWpMRixpQ0FpTHVCWixRQWpMdkIsRUFpTGlDOUcsS0FqTGpDLEVBaUx3QztFQUNwQzBDLGVBQVMsSUFBVCxFQUFlaUcsV0FBZixHQUE2QixJQUE3QjtFQUNBLFVBQU16QixZQUFZLEtBQUtNLFdBQUwsQ0FBaUJhLHVCQUFqQixDQUF5Q3ZCLFFBQXpDLENBQWxCO0VBQ0E5RyxjQUFRLEtBQUs2SixlQUFMLENBQXFCL0MsUUFBckIsRUFBK0I5RyxLQUEvQixDQUFSO0VBQ0EsVUFBSUEsVUFBVTZFLFNBQWQsRUFBeUI7RUFDdkIsYUFBS2lGLGVBQUwsQ0FBcUI1QyxTQUFyQjtFQUNELE9BRkQsTUFFTyxJQUFJLEtBQUs2QyxZQUFMLENBQWtCN0MsU0FBbEIsTUFBaUNsSCxLQUFyQyxFQUE0QztFQUNqRCxhQUFLZ0ssWUFBTCxDQUFrQjlDLFNBQWxCLEVBQTZCbEgsS0FBN0I7RUFDRDtFQUNEMEMsZUFBUyxJQUFULEVBQWVpRyxXQUFmLEdBQTZCLEtBQTdCO0VBQ0QsS0EzTEg7O0VBQUEseUJBNkxFZSxpQkE3TEYsOEJBNkxvQjVDLFFBN0xwQixFQTZMOEI5RyxLQTdMOUIsRUE2THFDO0VBQUEsa0NBQ29DLEtBQUt3SCxXQUFMLENBQWlCQyxlQUFqQixDQUFpQ1gsUUFBakMsQ0FEcEM7RUFBQSxVQUN6QmhCLFFBRHlCLHlCQUN6QkEsUUFEeUI7RUFBQSxVQUNmSyxPQURlLHlCQUNmQSxPQURlO0VBQUEsVUFDTkgsU0FETSx5QkFDTkEsU0FETTtFQUFBLFVBQ0tLLE1BREwseUJBQ0tBLE1BREw7RUFBQSxVQUNhVCxRQURiLHlCQUNhQSxRQURiO0VBQUEsVUFDdUJNLFFBRHZCLHlCQUN1QkEsUUFEdkI7O0VBRWpDLFVBQUlGLFNBQUosRUFBZTtFQUNiaEcsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVTZFLFNBQXBDO0VBQ0QsT0FGRCxNQUVPLElBQUlpQixRQUFKLEVBQWM7RUFDbkI5RixnQkFBUUEsVUFBVSxJQUFWLElBQWtCQSxVQUFVNkUsU0FBNUIsR0FBd0MsQ0FBeEMsR0FBNENrQixPQUFPL0YsS0FBUCxDQUFwRDtFQUNELE9BRk0sTUFFQSxJQUFJNEYsUUFBSixFQUFjO0VBQ25CNUYsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVTZFLFNBQTVCLEdBQXdDLEVBQXhDLEdBQTZDakQsT0FBTzVCLEtBQVAsQ0FBckQ7RUFDRCxPQUZNLE1BRUEsSUFBSWtHLFlBQVlDLE9BQWhCLEVBQXlCO0VBQzlCbkcsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVTZFLFNBQTVCLEdBQXlDc0IsVUFBVSxJQUFWLEdBQWlCLEVBQTFELEdBQWdFOEQsS0FBS0MsS0FBTCxDQUFXbEssS0FBWCxDQUF4RTtFQUNELE9BRk0sTUFFQSxJQUFJcUcsTUFBSixFQUFZO0VBQ2pCckcsZ0JBQVFBLFVBQVUsSUFBVixJQUFrQkEsVUFBVTZFLFNBQTVCLEdBQXdDLEVBQXhDLEdBQTZDLElBQUl5QixJQUFKLENBQVN0RyxLQUFULENBQXJEO0VBQ0Q7RUFDRCxhQUFPQSxLQUFQO0VBQ0QsS0EzTUg7O0VBQUEseUJBNk1FNkosZUE3TUYsNEJBNk1rQi9DLFFBN01sQixFQTZNNEI5RyxLQTdNNUIsRUE2TW1DO0VBQy9CLFVBQU1tSyxpQkFBaUIsS0FBSzNDLFdBQUwsQ0FBaUJDLGVBQWpCLENBQWlDWCxRQUFqQyxDQUF2QjtFQUQrQixVQUV2QmQsU0FGdUIsR0FFVW1FLGNBRlYsQ0FFdkJuRSxTQUZ1QjtFQUFBLFVBRVpFLFFBRlksR0FFVWlFLGNBRlYsQ0FFWmpFLFFBRlk7RUFBQSxVQUVGQyxPQUZFLEdBRVVnRSxjQUZWLENBRUZoRSxPQUZFOzs7RUFJL0IsVUFBSUgsU0FBSixFQUFlO0VBQ2IsZUFBT2hHLFFBQVEsRUFBUixHQUFhNkUsU0FBcEI7RUFDRDtFQUNELFVBQUlxQixZQUFZQyxPQUFoQixFQUF5QjtFQUN2QixlQUFPOEQsS0FBS0csU0FBTCxDQUFlcEssS0FBZixDQUFQO0VBQ0Q7O0VBRURBLGNBQVFBLFFBQVFBLE1BQU1xSyxRQUFOLEVBQVIsR0FBMkJ4RixTQUFuQztFQUNBLGFBQU83RSxLQUFQO0VBQ0QsS0ExTkg7O0VBQUEseUJBNE5Fc0osbUJBNU5GLGdDQTROc0J4QyxRQTVOdEIsRUE0TmdDOUcsS0E1TmhDLEVBNE51QztFQUNuQyxVQUFJc0ssTUFBTTVILFNBQVMsSUFBVCxFQUFlZ0csSUFBZixDQUFvQjVCLFFBQXBCLENBQVY7RUFDQSxVQUFJeUQsVUFBVSxLQUFLQyxxQkFBTCxDQUEyQjFELFFBQTNCLEVBQXFDOUcsS0FBckMsRUFBNENzSyxHQUE1QyxDQUFkO0VBQ0EsVUFBSUMsT0FBSixFQUFhO0VBQ1gsWUFBSSxDQUFDN0gsU0FBUyxJQUFULEVBQWVrRyxXQUFwQixFQUFpQztFQUMvQmxHLG1CQUFTLElBQVQsRUFBZWtHLFdBQWYsR0FBNkIsRUFBN0I7RUFDQWxHLG1CQUFTLElBQVQsRUFBZW1HLE9BQWYsR0FBeUIsRUFBekI7RUFDRDtFQUNEO0VBQ0EsWUFBSW5HLFNBQVMsSUFBVCxFQUFlbUcsT0FBZixJQUEwQixFQUFFL0IsWUFBWXBFLFNBQVMsSUFBVCxFQUFlbUcsT0FBN0IsQ0FBOUIsRUFBcUU7RUFDbkVuRyxtQkFBUyxJQUFULEVBQWVtRyxPQUFmLENBQXVCL0IsUUFBdkIsSUFBbUN3RCxHQUFuQztFQUNEO0VBQ0Q1SCxpQkFBUyxJQUFULEVBQWVnRyxJQUFmLENBQW9CNUIsUUFBcEIsSUFBZ0M5RyxLQUFoQztFQUNBMEMsaUJBQVMsSUFBVCxFQUFla0csV0FBZixDQUEyQjlCLFFBQTNCLElBQXVDOUcsS0FBdkM7RUFDRDtFQUNELGFBQU91SyxPQUFQO0VBQ0QsS0E1T0g7O0VBQUEseUJBOE9FaEIscUJBOU9GLG9DQThPMEI7RUFBQTs7RUFDdEIsVUFBSSxDQUFDN0csU0FBUyxJQUFULEVBQWVvRyxXQUFwQixFQUFpQztFQUMvQnBHLGlCQUFTLElBQVQsRUFBZW9HLFdBQWYsR0FBNkIsSUFBN0I7RUFDQWhFLFdBQUEsQ0FBYyxZQUFNO0VBQ2xCLGNBQUlwQyxTQUFTLE1BQVQsRUFBZW9HLFdBQW5CLEVBQWdDO0VBQzlCcEcscUJBQVMsTUFBVCxFQUFlb0csV0FBZixHQUE2QixLQUE3QjtFQUNBLG1CQUFLOUIsZ0JBQUw7RUFDRDtFQUNGLFNBTEQ7RUFNRDtFQUNGLEtBeFBIOztFQUFBLHlCQTBQRUEsZ0JBMVBGLCtCQTBQcUI7RUFDakIsVUFBTXlELFFBQVEvSCxTQUFTLElBQVQsRUFBZWdHLElBQTdCO0VBQ0EsVUFBTXBCLGVBQWU1RSxTQUFTLElBQVQsRUFBZWtHLFdBQXBDO0VBQ0EsVUFBTTBCLE1BQU01SCxTQUFTLElBQVQsRUFBZW1HLE9BQTNCOztFQUVBLFVBQUksS0FBSzZCLHVCQUFMLENBQTZCRCxLQUE3QixFQUFvQ25ELFlBQXBDLEVBQWtEZ0QsR0FBbEQsQ0FBSixFQUE0RDtFQUMxRDVILGlCQUFTLElBQVQsRUFBZWtHLFdBQWYsR0FBNkIsSUFBN0I7RUFDQWxHLGlCQUFTLElBQVQsRUFBZW1HLE9BQWYsR0FBeUIsSUFBekI7RUFDQSxhQUFLSSxpQkFBTCxDQUF1QndCLEtBQXZCLEVBQThCbkQsWUFBOUIsRUFBNENnRCxHQUE1QztFQUNEO0VBQ0YsS0FwUUg7O0VBQUEseUJBc1FFSSx1QkF0UUYsb0NBdVFJckQsWUF2UUosRUF3UUlDLFlBeFFKLEVBeVFJQyxRQXpRSjtFQUFBLE1BMFFJO0VBQ0EsYUFBT3RCLFFBQVFxQixZQUFSLENBQVA7RUFDRCxLQTVRSDs7RUFBQSx5QkE4UUVrRCxxQkE5UUYsa0NBOFF3QjFELFFBOVF4QixFQThRa0M5RyxLQTlRbEMsRUE4UXlDc0ssR0E5UXpDLEVBOFE4QztFQUMxQztFQUNFO0VBQ0FBLGdCQUFRdEssS0FBUjtFQUNBO0VBQ0NzSyxnQkFBUUEsR0FBUixJQUFldEssVUFBVUEsS0FGMUIsQ0FGRjs7RUFBQTtFQU1ELEtBclJIOztFQUFBO0VBQUE7RUFBQSw2QkFFa0M7RUFBQTs7RUFDOUIsZUFBT04sT0FBT3NGLElBQVAsQ0FBWSxLQUFLeUMsZUFBakIsRUFBa0NrRCxHQUFsQyxDQUFzQyxVQUFDN0QsUUFBRDtFQUFBLGlCQUFjLE9BQUt1Qix1QkFBTCxDQUE2QnZCLFFBQTdCLENBQWQ7RUFBQSxTQUF0QyxLQUErRixFQUF0RztFQUNEO0VBSkg7RUFBQTtFQUFBLDZCQW9DK0I7RUFDM0IsWUFBSSxDQUFDMUIsZ0JBQUwsRUFBdUI7RUFDckIsY0FBTXdGLHNCQUFzQixTQUF0QkEsbUJBQXNCO0VBQUEsbUJBQU14RixvQkFBb0IsRUFBMUI7RUFBQSxXQUE1QjtFQUNBLGNBQUl5RixXQUFXLElBQWY7RUFDQSxjQUFJQyxPQUFPLElBQVg7O0VBRUEsaUJBQU9BLElBQVAsRUFBYTtFQUNYRCx1QkFBV25MLE9BQU9xTCxjQUFQLENBQXNCRixhQUFhLElBQWIsR0FBb0IsSUFBcEIsR0FBMkJBLFFBQWpELENBQVg7RUFDQSxnQkFDRSxDQUFDQSxRQUFELElBQ0EsQ0FBQ0EsU0FBU3JELFdBRFYsSUFFQXFELFNBQVNyRCxXQUFULEtBQXlCbkYsV0FGekIsSUFHQXdJLFNBQVNyRCxXQUFULEtBQXlCd0QsUUFIekIsSUFJQUgsU0FBU3JELFdBQVQsS0FBeUI5SCxNQUp6QixJQUtBbUwsU0FBU3JELFdBQVQsS0FBeUJxRCxTQUFTckQsV0FBVCxDQUFxQkEsV0FOaEQsRUFPRTtFQUNBc0QscUJBQU8sS0FBUDtFQUNEO0VBQ0QsZ0JBQUlwTCxPQUFPK0MsY0FBUCxDQUFzQlUsSUFBdEIsQ0FBMkIwSCxRQUEzQixFQUFxQyxZQUFyQyxDQUFKLEVBQXdEO0VBQ3REO0VBQ0F6RixpQ0FBbUJILE9BQ2pCMkYscUJBRGlCO0VBRWpCbEUsa0NBQW9CbUUsU0FBU2xFLFVBQTdCLENBRmlCLENBQW5CO0VBSUQ7RUFDRjtFQUNELGNBQUksS0FBS0EsVUFBVCxFQUFxQjtFQUNuQjtFQUNBdkIsK0JBQW1CSCxPQUNqQjJGLHFCQURpQjtFQUVqQmxFLGdDQUFvQixLQUFLQyxVQUF6QixDQUZpQixDQUFuQjtFQUlEO0VBQ0Y7RUFDRCxlQUFPdkIsZ0JBQVA7RUFDRDtFQXZFSDtFQUFBO0VBQUEsSUFBZ0M3QyxTQUFoQztFQXVSRCxDQXBYRDs7RUNUQTs7QUFFQSxxQkFBZSxVQUFDMEksTUFBRCxFQUFTcEYsSUFBVCxFQUFlcUYsUUFBZixFQUE2QztFQUFBLE1BQXBCQyxPQUFvQix1RUFBVixLQUFVOztFQUMxRCxTQUFPakIsTUFBTWUsTUFBTixFQUFjcEYsSUFBZCxFQUFvQnFGLFFBQXBCLEVBQThCQyxPQUE5QixDQUFQO0VBQ0QsQ0FGRDs7RUFJQSxTQUFTQyxXQUFULENBQXFCSCxNQUFyQixFQUE2QnBGLElBQTdCLEVBQW1DcUYsUUFBbkMsRUFBNkNDLE9BQTdDLEVBQXNEO0VBQ3BELE1BQUlGLE9BQU9JLGdCQUFYLEVBQTZCO0VBQzNCSixXQUFPSSxnQkFBUCxDQUF3QnhGLElBQXhCLEVBQThCcUYsUUFBOUIsRUFBd0NDLE9BQXhDO0VBQ0EsV0FBTztFQUNMRyxjQUFRLGtCQUFXO0VBQ2pCLGFBQUtBLE1BQUwsR0FBYyxZQUFNLEVBQXBCO0VBQ0FMLGVBQU9NLG1CQUFQLENBQTJCMUYsSUFBM0IsRUFBaUNxRixRQUFqQyxFQUEyQ0MsT0FBM0M7RUFDRDtFQUpJLEtBQVA7RUFNRDtFQUNELFFBQU0sSUFBSXRNLEtBQUosQ0FBVSxpQ0FBVixDQUFOO0VBQ0Q7O0VBRUQsU0FBU3FMLEtBQVQsQ0FBZWUsTUFBZixFQUF1QnBGLElBQXZCLEVBQTZCcUYsUUFBN0IsRUFBdUNDLE9BQXZDLEVBQWdEO0VBQzlDLE1BQUl0RixLQUFLMkYsT0FBTCxDQUFhLEdBQWIsSUFBb0IsQ0FBQyxDQUF6QixFQUE0QjtFQUMxQixRQUFJQyxTQUFTNUYsS0FBSzZGLEtBQUwsQ0FBVyxTQUFYLENBQWI7RUFDQSxRQUFJQyxVQUFVRixPQUFPZCxHQUFQLENBQVcsVUFBUzlFLElBQVQsRUFBZTtFQUN0QyxhQUFPdUYsWUFBWUgsTUFBWixFQUFvQnBGLElBQXBCLEVBQTBCcUYsUUFBMUIsRUFBb0NDLE9BQXBDLENBQVA7RUFDRCxLQUZhLENBQWQ7RUFHQSxXQUFPO0VBQ0xHLFlBREssb0JBQ0k7RUFDUCxhQUFLQSxNQUFMLEdBQWMsWUFBTSxFQUFwQjtFQUNBLFlBQUlNLGVBQUo7RUFDQSxlQUFRQSxTQUFTRCxRQUFRRSxHQUFSLEVBQWpCLEVBQWlDO0VBQy9CRCxpQkFBT04sTUFBUDtFQUNEO0VBQ0Y7RUFQSSxLQUFQO0VBU0Q7RUFDRCxTQUFPRixZQUFZSCxNQUFaLEVBQW9CcEYsSUFBcEIsRUFBMEJxRixRQUExQixFQUFvQ0MsT0FBcEMsQ0FBUDtFQUNEOztNQ2hDS1c7Ozs7Ozs7Ozs7NkJBQ29CO0VBQ3RCLGFBQU87RUFDTEMsY0FBTTtFQUNKbEcsZ0JBQU1qRSxNQURGO0VBRUo1QixpQkFBTyxNQUZIO0VBR0p5Ryw4QkFBb0IsSUFIaEI7RUFJSnVGLGdDQUFzQixJQUpsQjtFQUtKckcsb0JBQVUsb0JBQU0sRUFMWjtFQU1KWSxrQkFBUTtFQU5KLFNBREQ7RUFTTDBGLHFCQUFhO0VBQ1hwRyxnQkFBTU8sS0FESztFQUVYcEcsaUJBQU8saUJBQVc7RUFDaEIsbUJBQU8sRUFBUDtFQUNEO0VBSlU7RUFUUixPQUFQO0VBZ0JEOzs7SUFsQjBCMkcsV0FBV3VGLGVBQVg7O0VBcUI3QkosZUFBZWpKLE1BQWYsQ0FBc0IsaUJBQXRCOztFQUVBL0QsU0FBUywyQkFBVCxFQUFzQyxZQUFNO0VBQzFDLE1BQUlxTixrQkFBSjtFQUNBLE1BQU1DLGlCQUFpQnpPLFNBQVNDLGFBQVQsQ0FBdUIsaUJBQXZCLENBQXZCOztFQUVBa0ssU0FBTyxZQUFNO0VBQ1pxRSxnQkFBWXhPLFNBQVMwTyxjQUFULENBQXdCLFdBQXhCLENBQVo7RUFDR0YsY0FBVUcsTUFBVixDQUFpQkYsY0FBakI7RUFDSCxHQUhEOztFQUtBRyxRQUFNLFlBQU07RUFDUkosY0FBVTNOLFNBQVYsR0FBc0IsRUFBdEI7RUFDSCxHQUZEOztFQUlBTyxLQUFHLFlBQUgsRUFBaUIsWUFBTTtFQUNyQk8sV0FBT0QsS0FBUCxDQUFhK00sZUFBZUwsSUFBNUIsRUFBa0MsTUFBbEM7RUFDRCxHQUZEOztFQUlBaE4sS0FBRyx1QkFBSCxFQUE0QixZQUFNO0VBQ2hDcU4sbUJBQWVMLElBQWYsR0FBc0IsV0FBdEI7RUFDQUssbUJBQWVwRixnQkFBZjtFQUNBMUgsV0FBT0QsS0FBUCxDQUFhK00sZUFBZXJDLFlBQWYsQ0FBNEIsTUFBNUIsQ0FBYixFQUFrRCxXQUFsRDtFQUNELEdBSkQ7O0VBTUFoTCxLQUFHLHdCQUFILEVBQTZCLFlBQU07RUFDakN5TixnQkFBWUosY0FBWixFQUE0QixjQUE1QixFQUE0QyxlQUFPO0VBQ2pEOU0sYUFBT21OLElBQVAsQ0FBWUMsSUFBSTdHLElBQUosS0FBYSxjQUF6QixFQUF5QyxrQkFBekM7RUFDRCxLQUZEOztFQUlBdUcsbUJBQWVMLElBQWYsR0FBc0IsV0FBdEI7RUFDRCxHQU5EOztFQVFBaE4sS0FBRyxxQkFBSCxFQUEwQixZQUFNO0VBQzlCTyxXQUFPbU4sSUFBUCxDQUNFckcsTUFBTUQsT0FBTixDQUFjaUcsZUFBZUgsV0FBN0IsQ0FERixFQUVFLG1CQUZGO0VBSUQsR0FMRDtFQU1ELENBckNEOztFQzNCQTtBQUNBLGlCQUFlLFVBQUM5TCxTQUFELEVBQStCO0VBQUEsb0NBQWhCQyxXQUFnQjtFQUFoQkEsZUFBZ0I7RUFBQTs7RUFDNUMsU0FBTyxVQUFTQyxLQUFULEVBQWdCO0VBQ3JCLFFBQU1DLFFBQVFELE1BQU1FLFNBQXBCO0VBQ0EsUUFBTUMsTUFBTUosWUFBWWhDLE1BQXhCO0VBRnFCLFFBR2JxQyxjQUhhLEdBR01mLE1BSE4sQ0FHYmUsY0FIYTs7RUFBQSwrQkFJWnRDLENBSlk7RUFLbkIsVUFBTXVDLGFBQWFOLFlBQVlqQyxDQUFaLENBQW5CO0VBQ0EsVUFBTXdDLFNBQVNMLE1BQU1JLFVBQU4sQ0FBZjtFQUNBRCxxQkFBZUgsS0FBZixFQUFzQkksVUFBdEIsRUFBa0M7RUFDaENWLGVBQU8saUJBQWtCO0VBQUEsNkNBQU5ZLElBQU07RUFBTkEsZ0JBQU07RUFBQTs7RUFDdkIsY0FBTStMLGNBQWNoTSxPQUFPRyxLQUFQLENBQWEsSUFBYixFQUFtQkYsSUFBbkIsQ0FBcEI7RUFDQVQsb0JBQVVXLEtBQVYsQ0FBZ0IsSUFBaEIsRUFBc0JGLElBQXRCO0VBQ0EsaUJBQU8rTCxXQUFQO0VBQ0QsU0FMK0I7RUFNaEM1TCxrQkFBVTtFQU5zQixPQUFsQztFQVBtQjs7RUFJckIsU0FBSyxJQUFJNUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcUMsR0FBcEIsRUFBeUJyQyxHQUF6QixFQUE4QjtFQUFBLFlBQXJCQSxDQUFxQjtFQVc3QjtFQUNELFdBQU9rQyxLQUFQO0VBQ0QsR0FqQkQ7RUFrQkQsQ0FuQkQ7O0VDREE7QUFDQTtFQU1BOzs7QUFHQSxnQkFBZSxVQUFDa0MsU0FBRCxFQUFlO0VBQUEsTUFDcEIwQyxNQURvQixHQUNUdkYsTUFEUyxDQUNwQnVGLE1BRG9COztFQUU1QixNQUFNdkMsV0FBV0MsY0FBYyxZQUFXO0VBQ3hDLFdBQU87RUFDTGlLLGdCQUFVO0VBREwsS0FBUDtFQUdELEdBSmdCLENBQWpCO0VBS0EsTUFBTUMscUJBQXFCO0VBQ3pCQyxhQUFTLEtBRGdCO0VBRXpCQyxnQkFBWTtFQUZhLEdBQTNCOztFQUtBO0VBQUE7O0VBQUE7RUFBQTtFQUFBO0VBQUE7O0VBQUEsV0FFU25LLGFBRlQsNEJBRXlCO0VBQ3JCLGlCQUFNQSxhQUFOO0VBQ0EySixjQUFNN0ksMEJBQU4sRUFBa0MsY0FBbEMsRUFBa0QsSUFBbEQ7RUFDRCxLQUxIOztFQUFBLHFCQU9Fc0osV0FQRix3QkFPY0MsS0FQZCxFQU9xQjtFQUNqQixVQUFNckIsZ0JBQWNxQixNQUFNcEgsSUFBMUI7RUFDQSxVQUFJLE9BQU8sS0FBSytGLE1BQUwsQ0FBUCxLQUF3QixVQUE1QixFQUF3QztFQUN0QztFQUNBLGFBQUtBLE1BQUwsRUFBYXFCLEtBQWI7RUFDRDtFQUNGLEtBYkg7O0VBQUEscUJBZUVDLEVBZkYsZUFlS3JILElBZkwsRUFlV3FGLFFBZlgsRUFlcUJDLE9BZnJCLEVBZThCO0VBQzFCLFdBQUtnQyxHQUFMLENBQVNYLFlBQVksSUFBWixFQUFrQjNHLElBQWxCLEVBQXdCcUYsUUFBeEIsRUFBa0NDLE9BQWxDLENBQVQ7RUFDRCxLQWpCSDs7RUFBQSxxQkFtQkVpQyxRQW5CRixxQkFtQld2SCxJQW5CWCxFQW1CNEI7RUFBQSxVQUFYNkMsSUFBVyx1RUFBSixFQUFJOztFQUN4QixXQUFLZixhQUFMLENBQW1CLElBQUlDLFdBQUosQ0FBZ0IvQixJQUFoQixFQUFzQlosT0FBTzRILGtCQUFQLEVBQTJCLEVBQUVoRixRQUFRYSxJQUFWLEVBQTNCLENBQXRCLENBQW5CO0VBQ0QsS0FyQkg7O0VBQUEscUJBdUJFMkUsR0F2QkYsa0JBdUJRO0VBQ0ozSyxlQUFTLElBQVQsRUFBZWtLLFFBQWYsQ0FBd0IzSixPQUF4QixDQUFnQyxVQUFDcUssT0FBRCxFQUFhO0VBQzNDQSxnQkFBUWhDLE1BQVI7RUFDRCxPQUZEO0VBR0QsS0EzQkg7O0VBQUEscUJBNkJFNkIsR0E3QkYsa0JBNkJtQjtFQUFBOztFQUFBLHdDQUFWUCxRQUFVO0VBQVZBLGdCQUFVO0VBQUE7O0VBQ2ZBLGVBQVMzSixPQUFULENBQWlCLFVBQUNxSyxPQUFELEVBQWE7RUFDNUI1SyxpQkFBUyxNQUFULEVBQWVrSyxRQUFmLENBQXdCL0ssSUFBeEIsQ0FBNkJ5TCxPQUE3QjtFQUNELE9BRkQ7RUFHRCxLQWpDSDs7RUFBQTtFQUFBLElBQTRCL0ssU0FBNUI7O0VBb0NBLFdBQVNtQix3QkFBVCxHQUFvQztFQUNsQyxXQUFPLFlBQVc7RUFDaEIsVUFBTWUsVUFBVSxJQUFoQjtFQUNBQSxjQUFRNEksR0FBUjtFQUNELEtBSEQ7RUFJRDtFQUNGLENBdEREOztFQ1ZBO0FBQ0EsbUJBQWUsVUFBQ1gsR0FBRCxFQUFTO0VBQ3RCLE1BQUlBLElBQUlhLGVBQVIsRUFBeUI7RUFDdkJiLFFBQUlhLGVBQUo7RUFDRDtFQUNEYixNQUFJYyxjQUFKO0VBQ0QsQ0FMRDs7TUNHTUM7Ozs7Ozs7OzRCQUNKdkosaUNBQVk7OzRCQUVaQyx1Q0FBZTs7O0lBSFdzSCxPQUFPUyxlQUFQOztNQU10QndCOzs7Ozs7Ozs2QkFDSnhKLGlDQUFZOzs2QkFFWkMsdUNBQWU7OztJQUhZc0gsT0FBT1MsZUFBUDs7RUFNN0J1QixjQUFjNUssTUFBZCxDQUFxQixnQkFBckI7RUFDQTZLLGVBQWU3SyxNQUFmLENBQXNCLGlCQUF0Qjs7RUFFQS9ELFNBQVMsdUJBQVQsRUFBa0MsWUFBTTtFQUN0QyxNQUFJcU4sa0JBQUo7RUFDQSxNQUFNd0IsVUFBVWhRLFNBQVNDLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQWhCO0VBQ0EsTUFBTXNOLFdBQVd2TixTQUFTQyxhQUFULENBQXVCLGlCQUF2QixDQUFqQjs7RUFFQWtLLFNBQU8sWUFBTTtFQUNYcUUsZ0JBQVl4TyxTQUFTME8sY0FBVCxDQUF3QixXQUF4QixDQUFaO0VBQ0FuQixhQUFTb0IsTUFBVCxDQUFnQnFCLE9BQWhCO0VBQ0F4QixjQUFVRyxNQUFWLENBQWlCcEIsUUFBakI7RUFDRCxHQUpEOztFQU1BcUIsUUFBTSxZQUFNO0VBQ1ZKLGNBQVUzTixTQUFWLEdBQXNCLEVBQXRCO0VBQ0QsR0FGRDs7RUFJQU8sS0FBRyw2REFBSCxFQUFrRSxZQUFNO0VBQ3RFbU0sYUFBU2dDLEVBQVQsQ0FBWSxJQUFaLEVBQWtCLGVBQU87RUFDdkJVLGdCQUFVbEIsR0FBVjtFQUNBbUIsV0FBSzVPLE1BQUwsQ0FBWXlOLElBQUl6QixNQUFoQixFQUF3QjdMLEVBQXhCLENBQTJCQyxLQUEzQixDQUFpQ3NPLE9BQWpDO0VBQ0FFLFdBQUs1TyxNQUFMLENBQVl5TixJQUFJN0UsTUFBaEIsRUFBd0JpRyxDQUF4QixDQUEwQixRQUExQjtFQUNBRCxXQUFLNU8sTUFBTCxDQUFZeU4sSUFBSTdFLE1BQWhCLEVBQXdCekksRUFBeEIsQ0FBMkIyTyxJQUEzQixDQUFnQzFPLEtBQWhDLENBQXNDLEVBQUUyTyxNQUFNLFVBQVIsRUFBdEM7RUFDRCxLQUxEO0VBTUFMLFlBQVFQLFFBQVIsQ0FBaUIsSUFBakIsRUFBdUIsRUFBRVksTUFBTSxVQUFSLEVBQXZCO0VBQ0QsR0FSRDtFQVNELENBeEJEOztFQ25CQTtBQUNBLGFBQWUsVUFBQ0MsR0FBRDtFQUFBLE1BQU1DLEVBQU4sdUVBQVdqSSxPQUFYO0VBQUEsU0FBdUJnSSxJQUFJRSxJQUFKLENBQVNELEVBQVQsQ0FBdkI7RUFBQSxDQUFmOztFQ0RBO0FBQ0EsYUFBZSxVQUFDRCxHQUFEO0VBQUEsTUFBTUMsRUFBTix1RUFBV2pJLE9BQVg7RUFBQSxTQUF1QmdJLElBQUlHLEtBQUosQ0FBVUYsRUFBVixDQUF2QjtFQUFBLENBQWY7O0VDREE7O0VDQUE7QUFDQTtFQUtBLElBQU1HLFdBQVcsU0FBWEEsUUFBVyxDQUFDSCxFQUFEO0VBQUEsU0FBUTtFQUFBLHNDQUFJSSxNQUFKO0VBQUlBLFlBQUo7RUFBQTs7RUFBQSxXQUFlQyxJQUFJRCxNQUFKLEVBQVlKLEVBQVosQ0FBZjtFQUFBLEdBQVI7RUFBQSxDQUFqQjtFQUNBLElBQU1NLFdBQVcsU0FBWEEsUUFBVyxDQUFDTixFQUFEO0VBQUEsU0FBUTtFQUFBLHVDQUFJSSxNQUFKO0VBQUlBLFlBQUo7RUFBQTs7RUFBQSxXQUFlRyxJQUFJSCxNQUFKLEVBQVlKLEVBQVosQ0FBZjtFQUFBLEdBQVI7RUFBQSxDQUFqQjtFQUNBLElBQU03RCxXQUFXM0ssT0FBT2EsU0FBUCxDQUFpQjhKLFFBQWxDO0VBQ0EsSUFBTXFFLFFBQVEsQ0FDWixLQURZLEVBRVosS0FGWSxFQUdaLFFBSFksRUFJWixPQUpZLEVBS1osUUFMWSxFQU1aLFFBTlksRUFPWixNQVBZLEVBUVosUUFSWSxFQVNaLFVBVFksRUFVWixTQVZZLEVBV1osUUFYWSxFQVlaLE1BWlksRUFhWixXQWJZLEVBY1osV0FkWSxFQWVaLE9BZlksRUFnQlosU0FoQlksRUFpQlosVUFqQlksRUFrQlosU0FsQlksRUFtQlosTUFuQlksQ0FBZDtFQXFCQSxJQUFNbE8sTUFBTWtPLE1BQU10USxNQUFsQjtFQUNBLElBQU11USxZQUFZLEVBQWxCO0VBQ0EsSUFBTUMsYUFBYSxlQUFuQjs7QUFFQSxXQUFnQkMsT0FBaEI7O0FBRUEsRUFBTyxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsR0FBRDtFQUFBLFNBQVNDLFdBQVdELEdBQVgsQ0FBVDtFQUFBLENBQWhCOztFQUVQLFNBQVNDLFVBQVQsQ0FBb0JELEdBQXBCLEVBQXlCO0VBQ3ZCLE1BQUlsSixPQUFPd0UsU0FBU2xILElBQVQsQ0FBYzRMLEdBQWQsQ0FBWDtFQUNBLE1BQUksQ0FBQ0osVUFBVTlJLElBQVYsQ0FBTCxFQUFzQjtFQUNwQixRQUFJb0osVUFBVXBKLEtBQUtzQyxLQUFMLENBQVd5RyxVQUFYLENBQWQ7RUFDQSxRQUFJeEksTUFBTUQsT0FBTixDQUFjOEksT0FBZCxLQUEwQkEsUUFBUTdRLE1BQVIsR0FBaUIsQ0FBL0MsRUFBa0Q7RUFDaER1USxnQkFBVTlJLElBQVYsSUFBa0JvSixRQUFRLENBQVIsRUFBVzFHLFdBQVgsRUFBbEI7RUFDRDtFQUNGO0VBQ0QsU0FBT29HLFVBQVU5SSxJQUFWLENBQVA7RUFDRDs7RUFFRCxTQUFTZ0osS0FBVCxHQUFpQjtFQUNmLE1BQUlLLFNBQVMsRUFBYjs7RUFEZSw2QkFFTi9RLENBRk07RUFHYixRQUFNMEgsT0FBTzZJLE1BQU12USxDQUFOLEVBQVNvSyxXQUFULEVBQWI7RUFDQTJHLFdBQU9ySixJQUFQLElBQWU7RUFBQSxhQUFPbUosV0FBV0QsR0FBWCxNQUFvQmxKLElBQTNCO0VBQUEsS0FBZjtFQUNBcUosV0FBT3JKLElBQVAsRUFBYTBJLEdBQWIsR0FBbUJGLFNBQVNhLE9BQU9ySixJQUFQLENBQVQsQ0FBbkI7RUFDQXFKLFdBQU9ySixJQUFQLEVBQWE0SSxHQUFiLEdBQW1CRCxTQUFTVSxPQUFPckosSUFBUCxDQUFULENBQW5CO0VBTmE7O0VBRWYsT0FBSyxJQUFJMUgsSUFBSXFDLEdBQWIsRUFBa0JyQyxHQUFsQixHQUF5QjtFQUFBLFVBQWhCQSxDQUFnQjtFQUt4QjtFQUNELFNBQU8rUSxNQUFQO0VBQ0Q7O0VDMUREO0FBQ0E7QUFFQSxlQUFlLFVBQUNILEdBQUQ7RUFBQSxRQUFTSSxRQUFNSixHQUFOLEVBQVcsRUFBWCxFQUFlLEVBQWYsQ0FBVDtFQUFBLENBQWY7O0VBRUEsU0FBU0ksT0FBVCxDQUFlSixHQUFmLEVBQWlEO0VBQUEsS0FBN0JLLFNBQTZCLHVFQUFqQixFQUFpQjtFQUFBLEtBQWJDLE1BQWEsdUVBQUosRUFBSTs7RUFDL0M7RUFDQSxLQUFJQyxHQUFHekssU0FBSCxDQUFha0ssR0FBYixLQUFxQk8sR0FBR0MsSUFBSCxDQUFRUixHQUFSLENBQXJCLElBQXFDUyxZQUFZVCxHQUFaLENBQXJDLElBQXlETyxHQUFHRyxRQUFILENBQVlWLEdBQVosQ0FBN0QsRUFBK0U7RUFDN0UsU0FBT0EsR0FBUDtFQUNEO0VBQ0QsUUFBT1csT0FBT1osUUFBUUMsR0FBUixDQUFQLEVBQXFCQSxHQUFyQixFQUEwQkssU0FBMUIsRUFBcUNDLE1BQXJDLENBQVA7RUFDRDs7RUFFRCxTQUFTRyxXQUFULENBQXFCVCxHQUFyQixFQUEwQjtFQUN6QixRQUFPTyxHQUFHSyxPQUFILENBQVdaLEdBQVgsS0FBbUJPLEdBQUdNLE1BQUgsQ0FBVWIsR0FBVixDQUFuQixJQUFxQ08sR0FBR08sTUFBSCxDQUFVZCxHQUFWLENBQTVDO0VBQ0E7O0VBRUQsU0FBU1csTUFBVCxDQUFnQjdKLElBQWhCLEVBQXNCcEIsT0FBdEIsRUFBd0M7RUFDdkMsS0FBTW1JLFdBQVc7RUFDaEJrRCxNQURnQixrQkFDVDtFQUNOLFVBQU8sSUFBSXhKLElBQUosQ0FBUyxLQUFLeUosT0FBTCxFQUFULENBQVA7RUFDQSxHQUhlO0VBSWhCQyxRQUpnQixvQkFJUDtFQUNSLFVBQU8sSUFBSUMsTUFBSixDQUFXLElBQVgsQ0FBUDtFQUNBLEdBTmU7RUFPaEJDLE9BUGdCLG1CQU9SO0VBQ1AsVUFBTyxLQUFLdkYsR0FBTCxDQUFTd0UsT0FBVCxDQUFQO0VBQ0EsR0FUZTtFQVVoQnhFLEtBVmdCLGlCQVVWO0VBQ0wsVUFBTyxJQUFJd0YsR0FBSixDQUFRL0osTUFBTWdLLElBQU4sQ0FBVyxLQUFLQyxPQUFMLEVBQVgsQ0FBUixDQUFQO0VBQ0EsR0FaZTtFQWFoQm5RLEtBYmdCLGlCQWFWO0VBQ0wsVUFBTyxJQUFJb1EsR0FBSixDQUFRbEssTUFBTWdLLElBQU4sQ0FBVyxLQUFLRyxNQUFMLEVBQVgsQ0FBUixDQUFQO0VBQ0EsR0FmZTtFQWdCaEJDLFNBaEJnQixxQkFnQk47RUFDVCxVQUFPLEtBQUtyQixLQUFMLEVBQVA7RUFDQSxHQWxCZTtFQW1CaEJzQixVQW5CZ0Isc0JBbUJMO0VBQ1YsVUFBTyxLQUFLdEIsS0FBTCxFQUFQO0VBQ0EsR0FyQmU7RUFzQmhCdUIsU0F0QmdCLHFCQXNCTjtFQUNULE9BQUlBLFVBQVUsSUFBSUMsT0FBSixFQUFkO0VBQ0Esd0JBQTBCLEtBQUtOLE9BQS9CLGtIQUF3QztFQUFBOztFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7O0VBQUE7RUFBQSxRQUE5QnhKLElBQThCO0VBQUEsUUFBeEI3RyxLQUF3Qjs7RUFDdkMwUSxZQUFRcEUsTUFBUixDQUFlekYsSUFBZixFQUFxQjdHLEtBQXJCO0VBQ0E7RUFDRCxVQUFPMFEsT0FBUDtFQUNBLEdBNUJlO0VBNkJoQkUsTUE3QmdCLGtCQTZCVDtFQUNOLFVBQU8sSUFBSUMsSUFBSixDQUFTLENBQUMsSUFBRCxDQUFULEVBQWlCLEVBQUNoTCxNQUFNLEtBQUtBLElBQVosRUFBakIsQ0FBUDtFQUNBLEdBL0JlO0VBZ0NoQmlMLFFBaENnQixvQkFnQ29CO0VBQUE7O0VBQUEsT0FBN0IxQixTQUE2Qix1RUFBakIsRUFBaUI7RUFBQSxPQUFiQyxNQUFhLHVFQUFKLEVBQUk7O0VBQ25DRCxhQUFVdk4sSUFBVixDQUFlLElBQWY7RUFDQSxPQUFNOUIsTUFBTUwsT0FBT0MsTUFBUCxDQUFjLElBQWQsQ0FBWjtFQUNBMFAsVUFBT3hOLElBQVAsQ0FBWTlCLEdBQVo7O0VBSG1DLDhCQUkxQmdSLEdBSjBCO0VBS2xDLFFBQUlDLE1BQU01QixVQUFVNkIsU0FBVixDQUFvQixVQUFDOVMsQ0FBRDtFQUFBLFlBQU9BLE1BQU0sTUFBSzRTLEdBQUwsQ0FBYjtFQUFBLEtBQXBCLENBQVY7RUFDQWhSLFFBQUlnUixHQUFKLElBQVdDLE1BQU0sQ0FBQyxDQUFQLEdBQVczQixPQUFPMkIsR0FBUCxDQUFYLEdBQXlCN0IsUUFBTSxNQUFLNEIsR0FBTCxDQUFOLEVBQWlCM0IsU0FBakIsRUFBNEJDLE1BQTVCLENBQXBDO0VBTmtDOztFQUluQyxRQUFLLElBQUkwQixHQUFULElBQWdCLElBQWhCLEVBQXNCO0VBQUEsVUFBYkEsR0FBYTtFQUdyQjtFQUNELFVBQU9oUixHQUFQO0VBQ0E7RUF6Q2UsRUFBakI7RUEyQ0EsS0FBSThGLFFBQVErRyxRQUFaLEVBQXNCO0VBQ3JCLE1BQU1zQixLQUFLdEIsU0FBUy9HLElBQVQsQ0FBWDs7RUFEcUIsb0NBNUNXakYsSUE0Q1g7RUE1Q1dBLE9BNENYO0VBQUE7O0VBRXJCLFNBQU9zTixHQUFHcE4sS0FBSCxDQUFTMkQsT0FBVCxFQUFrQjdELElBQWxCLENBQVA7RUFDQTtFQUNELFFBQU82RCxPQUFQO0VBQ0E7O0VDaEVEM0YsU0FBUyxPQUFULEVBQWtCLFlBQU07RUFDdkJDLElBQUcscURBQUgsRUFBMEQsWUFBTTtFQUMvRDtFQUNBRSxTQUFPa1EsTUFBTSxJQUFOLENBQVAsRUFBb0IvUCxFQUFwQixDQUF1QjhSLEVBQXZCLENBQTBCM0IsSUFBMUI7O0VBRUE7RUFDQXRRLFNBQU9rUSxPQUFQLEVBQWdCL1AsRUFBaEIsQ0FBbUI4UixFQUFuQixDQUFzQnJNLFNBQXRCOztFQUVBO0VBQ0EsTUFBTXNNLE9BQU8sU0FBUEEsSUFBTyxHQUFNLEVBQW5CO0VBQ0E3UixTQUFPOFIsVUFBUCxDQUFrQmpDLE1BQU1nQyxJQUFOLENBQWxCLEVBQStCLGVBQS9COztFQUVBO0VBQ0E3UixTQUFPRCxLQUFQLENBQWE4UCxNQUFNLENBQU4sQ0FBYixFQUF1QixDQUF2QjtFQUNBN1AsU0FBT0QsS0FBUCxDQUFhOFAsTUFBTSxRQUFOLENBQWIsRUFBOEIsUUFBOUI7RUFDQTdQLFNBQU9ELEtBQVAsQ0FBYThQLE1BQU0sS0FBTixDQUFiLEVBQTJCLEtBQTNCO0VBQ0E3UCxTQUFPRCxLQUFQLENBQWE4UCxNQUFNLElBQU4sQ0FBYixFQUEwQixJQUExQjtFQUNBLEVBaEJEO0VBaUJBLENBbEJEOztFQ0ZBO0FBQ0EsbUJBQWUsVUFBQ25QLEtBQUQ7RUFBQSxNQUFRcVIsT0FBUix1RUFBa0IsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKO0VBQUEsV0FBVUEsQ0FBVjtFQUFBLEdBQWxCO0VBQUEsU0FBa0N0SCxLQUFLQyxLQUFMLENBQVdELEtBQUtHLFNBQUwsQ0FBZXBLLEtBQWYsQ0FBWCxFQUFrQ3FSLE9BQWxDLENBQWxDO0VBQUEsQ0FBZjs7RUNDQXZTLFNBQVMsWUFBVCxFQUF1QixZQUFNO0VBQzVCQyxJQUFHLCtCQUFILEVBQW9DLFlBQU07RUFDekNFLFNBQU87RUFBQSxVQUFNdVMsV0FBTjtFQUFBLEdBQVAsRUFBMEJwUyxFQUExQixDQUE2QnFTLEtBQTdCLENBQW1DNVMsS0FBbkM7RUFDQUksU0FBTztFQUFBLFVBQU11UyxVQUFVLFlBQU0sRUFBaEIsQ0FBTjtFQUFBLEdBQVAsRUFBa0NwUyxFQUFsQyxDQUFxQ3FTLEtBQXJDLENBQTJDNVMsS0FBM0M7RUFDQUksU0FBTztFQUFBLFVBQU11UyxVQUFVM00sU0FBVixDQUFOO0VBQUEsR0FBUCxFQUFtQ3pGLEVBQW5DLENBQXNDcVMsS0FBdEMsQ0FBNEM1UyxLQUE1QztFQUNBLEVBSkQ7O0VBTUFFLElBQUcsK0JBQUgsRUFBb0MsWUFBTTtFQUN6Q0UsU0FBT3VTLFVBQVUsSUFBVixDQUFQLEVBQXdCcFMsRUFBeEIsQ0FBMkI4UixFQUEzQixDQUE4QjNCLElBQTlCO0VBQ0FqUSxTQUFPRCxLQUFQLENBQWFtUyxVQUFVLENBQVYsQ0FBYixFQUEyQixDQUEzQjtFQUNBbFMsU0FBT0QsS0FBUCxDQUFhbVMsVUFBVSxRQUFWLENBQWIsRUFBa0MsUUFBbEM7RUFDQWxTLFNBQU9ELEtBQVAsQ0FBYW1TLFVBQVUsS0FBVixDQUFiLEVBQStCLEtBQS9CO0VBQ0FsUyxTQUFPRCxLQUFQLENBQWFtUyxVQUFVLElBQVYsQ0FBYixFQUE4QixJQUE5QjtFQUNBLEVBTkQ7O0VBUUF6UyxJQUFHLGVBQUgsRUFBb0IsWUFBTTtFQUN6QixNQUFNZ0IsTUFBTSxFQUFDLEtBQUssR0FBTixFQUFaO0VBQ0FkLFNBQU91UyxVQUFVelIsR0FBVixDQUFQLEVBQXVCMlIsR0FBdkIsQ0FBMkJ0UyxFQUEzQixDQUE4QjhSLEVBQTlCLENBQWlDN1IsS0FBakMsQ0FBdUNVLEdBQXZDO0VBQ0EsRUFIRDs7RUFLQWhCLElBQUcsa0JBQUgsRUFBdUIsWUFBTTtFQUM1QixNQUFNZ0IsTUFBTSxFQUFDLEtBQUssR0FBTixFQUFaO0VBQ0EsTUFBTTRSLFNBQVNILFVBQVV6UixHQUFWLEVBQWUsVUFBQ3VSLENBQUQsRUFBSUMsQ0FBSjtFQUFBLFVBQVVELE1BQU0sRUFBTixHQUFXdkwsT0FBT3dMLENBQVAsSUFBWSxDQUF2QixHQUEyQkEsQ0FBckM7RUFBQSxHQUFmLENBQWY7RUFDQXRTLFNBQU8wUyxPQUFPN0QsQ0FBZCxFQUFpQnpPLEtBQWpCLENBQXVCLENBQXZCO0VBQ0EsRUFKRDtFQUtBLENBekJEOztFQ0FBUCxTQUFTLE1BQVQsRUFBaUIsWUFBTTtFQUNyQkEsV0FBUyxXQUFULEVBQXNCLFlBQU07RUFDMUJDLE9BQUcsMERBQUgsRUFBK0QsWUFBTTtFQUNuRSxVQUFJNlMsZUFBZSxTQUFmQSxZQUFlLEdBQVc7RUFDNUIsZUFBT0MsU0FBUDtFQUNELE9BRkQ7RUFHQSxVQUFJalIsT0FBT2dSLGFBQWEsTUFBYixDQUFYO0VBQ0EzUyxhQUFPcVEsR0FBR3VDLFNBQUgsQ0FBYWpSLElBQWIsQ0FBUCxFQUEyQnhCLEVBQTNCLENBQThCOFIsRUFBOUIsQ0FBaUNZLElBQWpDO0VBQ0QsS0FORDtFQU9BL1MsT0FBRywrREFBSCxFQUFvRSxZQUFNO0VBQ3hFLFVBQU1nVCxVQUFVLENBQUMsTUFBRCxDQUFoQjtFQUNBOVMsYUFBT3FRLEdBQUd1QyxTQUFILENBQWFFLE9BQWIsQ0FBUCxFQUE4QjNTLEVBQTlCLENBQWlDOFIsRUFBakMsQ0FBb0NjLEtBQXBDO0VBQ0QsS0FIRDtFQUlBalQsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFLFVBQUk2UyxlQUFlLFNBQWZBLFlBQWUsR0FBVztFQUM1QixlQUFPQyxTQUFQO0VBQ0QsT0FGRDtFQUdBLFVBQUlqUixPQUFPZ1IsYUFBYSxNQUFiLENBQVg7RUFDQTNTLGFBQU9xUSxHQUFHdUMsU0FBSCxDQUFhdEQsR0FBYixDQUFpQjNOLElBQWpCLEVBQXVCQSxJQUF2QixFQUE2QkEsSUFBN0IsQ0FBUCxFQUEyQ3hCLEVBQTNDLENBQThDOFIsRUFBOUMsQ0FBaURZLElBQWpEO0VBQ0QsS0FORDtFQU9BL1MsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFLFVBQUk2UyxlQUFlLFNBQWZBLFlBQWUsR0FBVztFQUM1QixlQUFPQyxTQUFQO0VBQ0QsT0FGRDtFQUdBLFVBQUlqUixPQUFPZ1IsYUFBYSxNQUFiLENBQVg7RUFDQTNTLGFBQU9xUSxHQUFHdUMsU0FBSCxDQUFhcEQsR0FBYixDQUFpQjdOLElBQWpCLEVBQXVCLE1BQXZCLEVBQStCLE9BQS9CLENBQVAsRUFBZ0R4QixFQUFoRCxDQUFtRDhSLEVBQW5ELENBQXNEWSxJQUF0RDtFQUNELEtBTkQ7RUFPRCxHQTFCRDs7RUE0QkFoVCxXQUFTLE9BQVQsRUFBa0IsWUFBTTtFQUN0QkMsT0FBRyxzREFBSCxFQUEyRCxZQUFNO0VBQy9ELFVBQUltUixRQUFRLENBQUMsTUFBRCxDQUFaO0VBQ0FqUixhQUFPcVEsR0FBR1ksS0FBSCxDQUFTQSxLQUFULENBQVAsRUFBd0I5USxFQUF4QixDQUEyQjhSLEVBQTNCLENBQThCWSxJQUE5QjtFQUNELEtBSEQ7RUFJQS9TLE9BQUcsMkRBQUgsRUFBZ0UsWUFBTTtFQUNwRSxVQUFJa1QsV0FBVyxNQUFmO0VBQ0FoVCxhQUFPcVEsR0FBR1ksS0FBSCxDQUFTK0IsUUFBVCxDQUFQLEVBQTJCN1MsRUFBM0IsQ0FBOEI4UixFQUE5QixDQUFpQ2MsS0FBakM7RUFDRCxLQUhEO0VBSUFqVCxPQUFHLG1EQUFILEVBQXdELFlBQU07RUFDNURFLGFBQU9xUSxHQUFHWSxLQUFILENBQVMzQixHQUFULENBQWEsQ0FBQyxPQUFELENBQWIsRUFBd0IsQ0FBQyxPQUFELENBQXhCLEVBQW1DLENBQUMsT0FBRCxDQUFuQyxDQUFQLEVBQXNEblAsRUFBdEQsQ0FBeUQ4UixFQUF6RCxDQUE0RFksSUFBNUQ7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLG1EQUFILEVBQXdELFlBQU07RUFDNURFLGFBQU9xUSxHQUFHWSxLQUFILENBQVN6QixHQUFULENBQWEsQ0FBQyxPQUFELENBQWIsRUFBd0IsT0FBeEIsRUFBaUMsT0FBakMsQ0FBUCxFQUFrRHJQLEVBQWxELENBQXFEOFIsRUFBckQsQ0FBd0RZLElBQXhEO0VBQ0QsS0FGRDtFQUdELEdBZkQ7O0VBaUJBaFQsV0FBUyxTQUFULEVBQW9CLFlBQU07RUFDeEJDLE9BQUcsd0RBQUgsRUFBNkQsWUFBTTtFQUNqRSxVQUFJbVQsT0FBTyxJQUFYO0VBQ0FqVCxhQUFPcVEsR0FBR0ssT0FBSCxDQUFXdUMsSUFBWCxDQUFQLEVBQXlCOVMsRUFBekIsQ0FBNEI4UixFQUE1QixDQUErQlksSUFBL0I7RUFDRCxLQUhEO0VBSUEvUyxPQUFHLDZEQUFILEVBQWtFLFlBQU07RUFDdEUsVUFBSW9ULFVBQVUsTUFBZDtFQUNBbFQsYUFBT3FRLEdBQUdLLE9BQUgsQ0FBV3dDLE9BQVgsQ0FBUCxFQUE0Qi9TLEVBQTVCLENBQStCOFIsRUFBL0IsQ0FBa0NjLEtBQWxDO0VBQ0QsS0FIRDtFQUlELEdBVEQ7O0VBV0FsVCxXQUFTLE9BQVQsRUFBa0IsWUFBTTtFQUN0QkMsT0FBRyxzREFBSCxFQUEyRCxZQUFNO0VBQy9ELFVBQUlxVCxRQUFRLElBQUl2VCxLQUFKLEVBQVo7RUFDQUksYUFBT3FRLEdBQUc4QyxLQUFILENBQVNBLEtBQVQsQ0FBUCxFQUF3QmhULEVBQXhCLENBQTJCOFIsRUFBM0IsQ0FBOEJZLElBQTlCO0VBQ0QsS0FIRDtFQUlBL1MsT0FBRywyREFBSCxFQUFnRSxZQUFNO0VBQ3BFLFVBQUlzVCxXQUFXLE1BQWY7RUFDQXBULGFBQU9xUSxHQUFHOEMsS0FBSCxDQUFTQyxRQUFULENBQVAsRUFBMkJqVCxFQUEzQixDQUE4QjhSLEVBQTlCLENBQWlDYyxLQUFqQztFQUNELEtBSEQ7RUFJRCxHQVREOztFQVdBbFQsV0FBUyxVQUFULEVBQXFCLFlBQU07RUFDekJDLE9BQUcseURBQUgsRUFBOEQsWUFBTTtFQUNsRUUsYUFBT3FRLEdBQUdHLFFBQUgsQ0FBWUgsR0FBR0csUUFBZixDQUFQLEVBQWlDclEsRUFBakMsQ0FBb0M4UixFQUFwQyxDQUF1Q1ksSUFBdkM7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLDhEQUFILEVBQW1FLFlBQU07RUFDdkUsVUFBSXVULGNBQWMsTUFBbEI7RUFDQXJULGFBQU9xUSxHQUFHRyxRQUFILENBQVk2QyxXQUFaLENBQVAsRUFBaUNsVCxFQUFqQyxDQUFvQzhSLEVBQXBDLENBQXVDYyxLQUF2QztFQUNELEtBSEQ7RUFJRCxHQVJEOztFQVVBbFQsV0FBUyxNQUFULEVBQWlCLFlBQU07RUFDckJDLE9BQUcscURBQUgsRUFBMEQsWUFBTTtFQUM5REUsYUFBT3FRLEdBQUdDLElBQUgsQ0FBUSxJQUFSLENBQVAsRUFBc0JuUSxFQUF0QixDQUF5QjhSLEVBQXpCLENBQTRCWSxJQUE1QjtFQUNELEtBRkQ7RUFHQS9TLE9BQUcsMERBQUgsRUFBK0QsWUFBTTtFQUNuRSxVQUFJd1QsVUFBVSxNQUFkO0VBQ0F0VCxhQUFPcVEsR0FBR0MsSUFBSCxDQUFRZ0QsT0FBUixDQUFQLEVBQXlCblQsRUFBekIsQ0FBNEI4UixFQUE1QixDQUErQmMsS0FBL0I7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQWxULFdBQVMsUUFBVCxFQUFtQixZQUFNO0VBQ3ZCQyxPQUFHLHVEQUFILEVBQTRELFlBQU07RUFDaEVFLGFBQU9xUSxHQUFHTSxNQUFILENBQVUsQ0FBVixDQUFQLEVBQXFCeFEsRUFBckIsQ0FBd0I4UixFQUF4QixDQUEyQlksSUFBM0I7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLDREQUFILEVBQWlFLFlBQU07RUFDckUsVUFBSXlULFlBQVksTUFBaEI7RUFDQXZULGFBQU9xUSxHQUFHTSxNQUFILENBQVU0QyxTQUFWLENBQVAsRUFBNkJwVCxFQUE3QixDQUFnQzhSLEVBQWhDLENBQW1DYyxLQUFuQztFQUNELEtBSEQ7RUFJRCxHQVJEOztFQVVBbFQsV0FBUyxRQUFULEVBQW1CLFlBQU07RUFDdkJDLE9BQUcsdURBQUgsRUFBNEQsWUFBTTtFQUNoRUUsYUFBT3FRLEdBQUd3QixNQUFILENBQVUsRUFBVixDQUFQLEVBQXNCMVIsRUFBdEIsQ0FBeUI4UixFQUF6QixDQUE0QlksSUFBNUI7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLDREQUFILEVBQWlFLFlBQU07RUFDckUsVUFBSTBULFlBQVksTUFBaEI7RUFDQXhULGFBQU9xUSxHQUFHd0IsTUFBSCxDQUFVMkIsU0FBVixDQUFQLEVBQTZCclQsRUFBN0IsQ0FBZ0M4UixFQUFoQyxDQUFtQ2MsS0FBbkM7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQWxULFdBQVMsUUFBVCxFQUFtQixZQUFNO0VBQ3ZCQyxPQUFHLHVEQUFILEVBQTRELFlBQU07RUFDaEUsVUFBSWlSLFNBQVMsSUFBSUMsTUFBSixFQUFiO0VBQ0FoUixhQUFPcVEsR0FBR1UsTUFBSCxDQUFVQSxNQUFWLENBQVAsRUFBMEI1USxFQUExQixDQUE2QjhSLEVBQTdCLENBQWdDWSxJQUFoQztFQUNELEtBSEQ7RUFJQS9TLE9BQUcsNERBQUgsRUFBaUUsWUFBTTtFQUNyRSxVQUFJMlQsWUFBWSxNQUFoQjtFQUNBelQsYUFBT3FRLEdBQUdVLE1BQUgsQ0FBVTBDLFNBQVYsQ0FBUCxFQUE2QnRULEVBQTdCLENBQWdDOFIsRUFBaEMsQ0FBbUNjLEtBQW5DO0VBQ0QsS0FIRDtFQUlELEdBVEQ7O0VBV0FsVCxXQUFTLFFBQVQsRUFBbUIsWUFBTTtFQUN2QkMsT0FBRyx1REFBSCxFQUE0RCxZQUFNO0VBQ2hFRSxhQUFPcVEsR0FBR08sTUFBSCxDQUFVLE1BQVYsQ0FBUCxFQUEwQnpRLEVBQTFCLENBQTZCOFIsRUFBN0IsQ0FBZ0NZLElBQWhDO0VBQ0QsS0FGRDtFQUdBL1MsT0FBRyw0REFBSCxFQUFpRSxZQUFNO0VBQ3JFRSxhQUFPcVEsR0FBR08sTUFBSCxDQUFVLENBQVYsQ0FBUCxFQUFxQnpRLEVBQXJCLENBQXdCOFIsRUFBeEIsQ0FBMkJjLEtBQTNCO0VBQ0QsS0FGRDtFQUdELEdBUEQ7O0VBU0FsVCxXQUFTLFdBQVQsRUFBc0IsWUFBTTtFQUMxQkMsT0FBRywwREFBSCxFQUErRCxZQUFNO0VBQ25FRSxhQUFPcVEsR0FBR3pLLFNBQUgsQ0FBYUEsU0FBYixDQUFQLEVBQWdDekYsRUFBaEMsQ0FBbUM4UixFQUFuQyxDQUFzQ1ksSUFBdEM7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLCtEQUFILEVBQW9FLFlBQU07RUFDeEVFLGFBQU9xUSxHQUFHekssU0FBSCxDQUFhLElBQWIsQ0FBUCxFQUEyQnpGLEVBQTNCLENBQThCOFIsRUFBOUIsQ0FBaUNjLEtBQWpDO0VBQ0EvUyxhQUFPcVEsR0FBR3pLLFNBQUgsQ0FBYSxNQUFiLENBQVAsRUFBNkJ6RixFQUE3QixDQUFnQzhSLEVBQWhDLENBQW1DYyxLQUFuQztFQUNELEtBSEQ7RUFJRCxHQVJEOztFQVVBbFQsV0FBUyxLQUFULEVBQWdCLFlBQU07RUFDcEJDLE9BQUcsb0RBQUgsRUFBeUQsWUFBTTtFQUM3REUsYUFBT3FRLEdBQUczRSxHQUFILENBQU8sSUFBSXdGLEdBQUosRUFBUCxDQUFQLEVBQTBCL1EsRUFBMUIsQ0FBNkI4UixFQUE3QixDQUFnQ1ksSUFBaEM7RUFDRCxLQUZEO0VBR0EvUyxPQUFHLHlEQUFILEVBQThELFlBQU07RUFDbEVFLGFBQU9xUSxHQUFHM0UsR0FBSCxDQUFPLElBQVAsQ0FBUCxFQUFxQnZMLEVBQXJCLENBQXdCOFIsRUFBeEIsQ0FBMkJjLEtBQTNCO0VBQ0EvUyxhQUFPcVEsR0FBRzNFLEdBQUgsQ0FBT2pMLE9BQU9DLE1BQVAsQ0FBYyxJQUFkLENBQVAsQ0FBUCxFQUFvQ1AsRUFBcEMsQ0FBdUM4UixFQUF2QyxDQUEwQ2MsS0FBMUM7RUFDRCxLQUhEO0VBSUQsR0FSRDs7RUFVQWxULFdBQVMsS0FBVCxFQUFnQixZQUFNO0VBQ3BCQyxPQUFHLG9EQUFILEVBQXlELFlBQU07RUFDN0RFLGFBQU9xUSxHQUFHcFAsR0FBSCxDQUFPLElBQUlvUSxHQUFKLEVBQVAsQ0FBUCxFQUEwQmxSLEVBQTFCLENBQTZCOFIsRUFBN0IsQ0FBZ0NZLElBQWhDO0VBQ0QsS0FGRDtFQUdBL1MsT0FBRyx5REFBSCxFQUE4RCxZQUFNO0VBQ2xFRSxhQUFPcVEsR0FBR3BQLEdBQUgsQ0FBTyxJQUFQLENBQVAsRUFBcUJkLEVBQXJCLENBQXdCOFIsRUFBeEIsQ0FBMkJjLEtBQTNCO0VBQ0EvUyxhQUFPcVEsR0FBR3BQLEdBQUgsQ0FBT1IsT0FBT0MsTUFBUCxDQUFjLElBQWQsQ0FBUCxDQUFQLEVBQW9DUCxFQUFwQyxDQUF1QzhSLEVBQXZDLENBQTBDYyxLQUExQztFQUNELEtBSEQ7RUFJRCxHQVJEO0VBU0QsQ0E3SkQ7O0VDRkE7QUFDQTtBQVlBLGNBQWU7RUFBQSxLQUNkVyxHQURjLHVFQUNSLEVBRFE7RUFBQSxLQUVkQyxPQUZjLHVFQUVKLEVBRkk7RUFBQSxRQUdWLElBQUlDLElBQUosQ0FBUyxFQUFDRixRQUFELEVBQU1DLGdCQUFOLEVBQWVFLFVBQVUsSUFBSTNDLEdBQUosRUFBekIsRUFBb0M0QyxXQUFXLEVBQS9DLEVBQW1EQyxZQUFZLEVBQS9ELEVBQVQsQ0FIVTtFQUFBLENBQWY7O0VBS0EsSUFBTXRRLFdBQVdDLGVBQWpCOztNQUVNa1E7RUFDTCxlQUFZck4sTUFBWixFQUFvQjtFQUFBOztFQUNuQjlDLFdBQVMsSUFBVCxFQUFlOEMsTUFBZixHQUF3QkEsTUFBeEI7RUFDQTs7a0JBRURtTixtQkFBSUEsTUFBc0I7RUFBQSxNQUFqQnpLLE9BQWlCLHVFQUFQLEtBQU87O0VBQ3pCLE1BQU0xQyxTQUFTMkosTUFBTXpNLFNBQVMsSUFBVCxFQUFlOEMsTUFBckIsQ0FBZjtFQUNBQSxTQUFPbU4sR0FBUCxHQUFhekssVUFBVXlLLElBQVYsR0FBZ0JuTixPQUFPbU4sR0FBUCxHQUFhQSxJQUExQztFQUNBLFNBQU8sSUFBSUUsSUFBSixDQUFTck4sTUFBVCxDQUFQO0VBQ0E7Ozs7O0VDM0JGMUcsU0FBUyxNQUFULEVBQWlCLFlBQU07RUFDdEJDLElBQUcsYUFBSCxFQUFrQixZQUFNO0VBQ3ZCLE1BQUlrVSxNQUFNQyxPQUFPUCxHQUFQLENBQVcsdUJBQVgsQ0FBVjtFQUNBO0VBQ0EsRUFIRDtFQUlBLENBTEQ7O0VDRkE7QUFDQSxjQUFlLFVBQUM1UyxHQUFELEVBQU1nUixHQUFOLEVBQXdDO0VBQUEsTUFBN0JvQyxZQUE2Qix1RUFBZHRPLFNBQWM7O0VBQ3JELE1BQUlrTSxJQUFJdkYsT0FBSixDQUFZLEdBQVosTUFBcUIsQ0FBQyxDQUExQixFQUE2QjtFQUMzQixXQUFPekwsSUFBSWdSLEdBQUosSUFBV2hSLElBQUlnUixHQUFKLENBQVgsR0FBc0JvQyxZQUE3QjtFQUNEO0VBQ0QsTUFBTUMsUUFBUXJDLElBQUlyRixLQUFKLENBQVUsR0FBVixDQUFkO0VBQ0EsTUFBTXROLFNBQVNnVixNQUFNaFYsTUFBckI7RUFDQSxNQUFJMFMsU0FBUy9RLEdBQWI7O0VBRUEsT0FBSyxJQUFJNUIsSUFBSSxDQUFiLEVBQWdCQSxJQUFJQyxNQUFwQixFQUE0QkQsR0FBNUIsRUFBaUM7RUFDL0IyUyxhQUFTQSxPQUFPc0MsTUFBTWpWLENBQU4sQ0FBUCxDQUFUO0VBQ0EsUUFBSSxPQUFPMlMsTUFBUCxLQUFrQixXQUF0QixFQUFtQztFQUNqQ0EsZUFBU3FDLFlBQVQ7RUFDQTtFQUNEO0VBQ0Y7RUFDRCxTQUFPckMsTUFBUDtFQUNELENBaEJEOztFQ0RBO0FBQ0EsY0FBZSxVQUFDL1EsR0FBRCxFQUFNZ1IsR0FBTixFQUFXL1EsS0FBWCxFQUFxQjtFQUNsQyxNQUFJK1EsSUFBSXZGLE9BQUosQ0FBWSxHQUFaLE1BQXFCLENBQUMsQ0FBMUIsRUFBNkI7RUFDM0J6TCxRQUFJZ1IsR0FBSixJQUFXL1EsS0FBWDtFQUNBO0VBQ0Q7RUFDRCxNQUFNb1QsUUFBUXJDLElBQUlyRixLQUFKLENBQVUsR0FBVixDQUFkO0VBQ0EsTUFBTTJILFFBQVFELE1BQU1oVixNQUFOLEdBQWUsQ0FBN0I7RUFDQSxNQUFJMFMsU0FBUy9RLEdBQWI7O0VBRUEsT0FBSyxJQUFJNUIsSUFBSSxDQUFiLEVBQWdCQSxJQUFJa1YsS0FBcEIsRUFBMkJsVixHQUEzQixFQUFnQztFQUM5QixRQUFJLE9BQU8yUyxPQUFPc0MsTUFBTWpWLENBQU4sQ0FBUCxDQUFQLEtBQTRCLFdBQWhDLEVBQTZDO0VBQzNDMlMsYUFBT3NDLE1BQU1qVixDQUFOLENBQVAsSUFBbUIsRUFBbkI7RUFDRDtFQUNEMlMsYUFBU0EsT0FBT3NDLE1BQU1qVixDQUFOLENBQVAsQ0FBVDtFQUNEO0VBQ0QyUyxTQUFPc0MsTUFBTUMsS0FBTixDQUFQLElBQXVCclQsS0FBdkI7RUFDRCxDQWhCRDs7RUNEQTs7RUNBQTs7RUNBQTs7RUFFQSxJQUFJc1QsYUFBYSxDQUFqQjtFQUNBLElBQUlDLGVBQWUsQ0FBbkI7O0FBRUEsa0JBQWUsVUFBQ0MsTUFBRCxFQUFZO0VBQ3pCLE1BQUlDLGNBQWNuTixLQUFLb04sR0FBTCxFQUFsQjtFQUNBLE1BQUlELGdCQUFnQkgsVUFBcEIsRUFBZ0M7RUFDOUIsTUFBRUMsWUFBRjtFQUNELEdBRkQsTUFFTztFQUNMRCxpQkFBYUcsV0FBYjtFQUNBRixtQkFBZSxDQUFmO0VBQ0Q7O0VBRUQsTUFBSUksZ0JBQWMvUixPQUFPNlIsV0FBUCxDQUFkLEdBQW9DN1IsT0FBTzJSLFlBQVAsQ0FBeEM7RUFDQSxNQUFJQyxNQUFKLEVBQVk7RUFDVkcsZUFBY0gsTUFBZCxTQUF3QkcsUUFBeEI7RUFDRDtFQUNELFNBQU9BLFFBQVA7RUFDRCxDQWREOztFQ0FBLElBQU1DLFFBQVEsU0FBUkEsS0FBUSxHQUEwQjtFQUFBLE1BQXpCclIsU0FBeUI7RUFBQTtFQUFBO0VBQUE7O0VBQUE7RUFBQTs7RUFDdEMsTUFBTUcsV0FBV0MsZUFBakI7RUFDQSxNQUFJa1Isa0JBQWtCLENBQXRCOztFQUVBO0VBQUE7O0VBQ0UscUJBQXFCO0VBQUE7O0VBQUEsd0NBQU5qVCxJQUFNO0VBQU5BLFlBQU07RUFBQTs7RUFBQSxrREFDbkIsZ0RBQVNBLElBQVQsRUFEbUI7O0VBRW5CLFlBQUtrVCxTQUFMLEdBQWlCSCxTQUFTLFFBQVQsQ0FBakI7RUFDQSxZQUFLSSxZQUFMLEdBQW9CLElBQUk1RCxHQUFKLEVBQXBCO0VBQ0EsWUFBSzZELFNBQUwsQ0FBZSxNQUFLQyxZQUFwQjtFQUptQjtFQUtwQjs7RUFOSCxvQkFZRWhVLEdBWkYsbUJBWU1pVSxRQVpOLEVBWWdCO0VBQ1osYUFBTyxLQUFLQyxTQUFMLENBQWVELFFBQWYsQ0FBUDtFQUNELEtBZEg7O0VBQUEsb0JBZ0JFaFUsR0FoQkYsbUJBZ0JNa1UsSUFoQk4sRUFnQllDLElBaEJaLEVBZ0JrQjtFQUNkO0VBQ0EsVUFBSUgsaUJBQUo7RUFBQSxVQUFjbFUsY0FBZDtFQUNBLFVBQUksQ0FBQ3NQLEdBQUdPLE1BQUgsQ0FBVXVFLElBQVYsQ0FBRCxJQUFvQjlFLEdBQUd6SyxTQUFILENBQWF3UCxJQUFiLENBQXhCLEVBQTRDO0VBQzFDclUsZ0JBQVFvVSxJQUFSO0VBQ0QsT0FGRCxNQUVPO0VBQ0xwVSxnQkFBUXFVLElBQVI7RUFDQUgsbUJBQVdFLElBQVg7RUFDRDtFQUNELFVBQUlFLFdBQVcsS0FBS0gsU0FBTCxFQUFmO0VBQ0EsVUFBSUksV0FBVy9DLFVBQVU4QyxRQUFWLENBQWY7O0VBRUEsVUFBSUosUUFBSixFQUFjO0VBQ1pNLGFBQUtELFFBQUwsRUFBZUwsUUFBZixFQUF5QmxVLEtBQXpCO0VBQ0QsT0FGRCxNQUVPO0VBQ0x1VSxtQkFBV3ZVLEtBQVg7RUFDRDtFQUNELFdBQUtnVSxTQUFMLENBQWVPLFFBQWY7RUFDQSxXQUFLRSxrQkFBTCxDQUF3QlAsUUFBeEIsRUFBa0NLLFFBQWxDLEVBQTRDRCxRQUE1QztFQUNBLGFBQU8sSUFBUDtFQUNELEtBcENIOztFQUFBLG9CQXNDRUksZ0JBdENGLCtCQXNDcUI7RUFDakIsVUFBTWpRLFVBQVVvUCxpQkFBaEI7RUFDQSxVQUFNYyxPQUFPLElBQWI7RUFDQSxhQUFPO0VBQ0x6SCxZQUFJLGNBQWtCO0VBQUEsNkNBQU50TSxJQUFNO0VBQU5BLGdCQUFNO0VBQUE7O0VBQ3BCK1QsZUFBS0MsVUFBTCxjQUFnQm5RLE9BQWhCLFNBQTRCN0QsSUFBNUI7RUFDQSxpQkFBTyxJQUFQO0VBQ0QsU0FKSTtFQUtMO0VBQ0FpVSxpQkFBUyxLQUFLQyxrQkFBTCxDQUF3QmxWLElBQXhCLENBQTZCLElBQTdCLEVBQW1DNkUsT0FBbkM7RUFOSixPQUFQO0VBUUQsS0FqREg7O0VBQUEsb0JBbURFc1Esb0JBbkRGLGlDQW1EdUJ0USxPQW5EdkIsRUFtRGdDO0VBQzVCLFVBQUksQ0FBQ0EsT0FBTCxFQUFjO0VBQ1osY0FBTSxJQUFJNUYsS0FBSixDQUFVLHdEQUFWLENBQU47RUFDRDtFQUNELFVBQU04VixPQUFPLElBQWI7RUFDQSxhQUFPO0VBQ0xLLHFCQUFhLHFCQUFTQyxTQUFULEVBQW9CO0VBQy9CLGNBQUksQ0FBQzdPLE1BQU1ELE9BQU4sQ0FBYzhPLFVBQVUsQ0FBVixDQUFkLENBQUwsRUFBa0M7RUFDaENBLHdCQUFZLENBQUNBLFNBQUQsQ0FBWjtFQUNEO0VBQ0RBLG9CQUFVaFMsT0FBVixDQUFrQixvQkFBWTtFQUM1QjBSLGlCQUFLQyxVQUFMLENBQWdCblEsT0FBaEIsRUFBeUJ5USxTQUFTLENBQVQsQ0FBekIsRUFBc0MsaUJBQVM7RUFDN0NWLG1CQUFLL1AsT0FBTCxFQUFjeVEsU0FBUyxDQUFULENBQWQsRUFBMkJsVixLQUEzQjtFQUNELGFBRkQ7RUFHRCxXQUpEO0VBS0EsaUJBQU8sSUFBUDtFQUNELFNBWEk7RUFZTDZVLGlCQUFTLEtBQUtDLGtCQUFMLENBQXdCbFYsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUM2RSxPQUFuQztFQVpKLE9BQVA7RUFjRCxLQXRFSDs7RUFBQSxvQkF3RUUwUCxTQXhFRixzQkF3RVlELFFBeEVaLEVBd0VzQjtFQUNsQixhQUFPMUMsVUFBVTBDLFdBQVdpQixLQUFLelMsU0FBUyxLQUFLb1IsU0FBZCxDQUFMLEVBQStCSSxRQUEvQixDQUFYLEdBQXNEeFIsU0FBUyxLQUFLb1IsU0FBZCxDQUFoRSxDQUFQO0VBQ0QsS0ExRUg7O0VBQUEsb0JBNEVFRSxTQTVFRixzQkE0RVlPLFFBNUVaLEVBNEVzQjtFQUNsQjdSLGVBQVMsS0FBS29SLFNBQWQsSUFBMkJTLFFBQTNCO0VBQ0QsS0E5RUg7O0VBQUEsb0JBZ0ZFSyxVQWhGRix1QkFnRmFuUSxPQWhGYixFQWdGc0J5UCxRQWhGdEIsRUFnRmdDcFMsRUFoRmhDLEVBZ0ZvQztFQUNoQyxVQUFNc1QsZ0JBQWdCLEtBQUtyQixZQUFMLENBQWtCOVQsR0FBbEIsQ0FBc0J3RSxPQUF0QixLQUFrQyxFQUF4RDtFQUNBMlEsb0JBQWN2VCxJQUFkLENBQW1CLEVBQUVxUyxrQkFBRixFQUFZcFMsTUFBWixFQUFuQjtFQUNBLFdBQUtpUyxZQUFMLENBQWtCN1QsR0FBbEIsQ0FBc0J1RSxPQUF0QixFQUErQjJRLGFBQS9CO0VBQ0QsS0FwRkg7O0VBQUEsb0JBc0ZFTixrQkF0RkYsK0JBc0ZxQnJRLE9BdEZyQixFQXNGOEI7RUFDMUIsV0FBS3NQLFlBQUwsQ0FBa0JzQixNQUFsQixDQUF5QjVRLE9BQXpCO0VBQ0QsS0F4Rkg7O0VBQUEsb0JBMEZFZ1Esa0JBMUZGLCtCQTBGcUJhLFdBMUZyQixFQTBGa0NmLFFBMUZsQyxFQTBGNENELFFBMUY1QyxFQTBGc0Q7RUFDbEQsV0FBS1AsWUFBTCxDQUFrQjlRLE9BQWxCLENBQTBCLFVBQVNzUyxXQUFULEVBQXNCO0VBQzlDQSxvQkFBWXRTLE9BQVosQ0FBb0IsZ0JBQTJCO0VBQUEsY0FBaEJpUixRQUFnQixRQUFoQkEsUUFBZ0I7RUFBQSxjQUFOcFMsRUFBTSxRQUFOQSxFQUFNOztFQUM3QztFQUNBO0VBQ0EsY0FBSW9TLFNBQVMxSSxPQUFULENBQWlCOEosV0FBakIsTUFBa0MsQ0FBdEMsRUFBeUM7RUFDdkN4VCxlQUFHcVQsS0FBS1osUUFBTCxFQUFlTCxRQUFmLENBQUgsRUFBNkJpQixLQUFLYixRQUFMLEVBQWVKLFFBQWYsQ0FBN0I7RUFDQTtFQUNEO0VBQ0Q7RUFDQSxjQUFJQSxTQUFTMUksT0FBVCxDQUFpQixHQUFqQixJQUF3QixDQUFDLENBQTdCLEVBQWdDO0VBQzlCLGdCQUFNZ0ssZUFBZXRCLFNBQVNoTSxPQUFULENBQWlCLElBQWpCLEVBQXVCLEVBQXZCLEVBQTJCQSxPQUEzQixDQUFtQyxHQUFuQyxFQUF3QyxFQUF4QyxDQUFyQjtFQUNBLGdCQUFJb04sWUFBWTlKLE9BQVosQ0FBb0JnSyxZQUFwQixNQUFzQyxDQUExQyxFQUE2QztFQUMzQzFULGlCQUFHcVQsS0FBS1osUUFBTCxFQUFlaUIsWUFBZixDQUFILEVBQWlDTCxLQUFLYixRQUFMLEVBQWVrQixZQUFmLENBQWpDO0VBQ0E7RUFDRDtFQUNGO0VBQ0YsU0FmRDtFQWdCRCxPQWpCRDtFQWtCRCxLQTdHSDs7RUFBQTtFQUFBO0VBQUEsNkJBUXFCO0VBQ2pCLGVBQU8sRUFBUDtFQUNEO0VBVkg7RUFBQTtFQUFBLElBQTJCalQsU0FBM0I7RUErR0QsQ0FuSEQ7Ozs7TUNITWtUOzs7Ozs7Ozs7OzJCQUNjO0VBQ2hCLFVBQU8sRUFBQ0MsS0FBSSxDQUFMLEVBQVA7RUFDRDs7O0lBSGlCOUI7O0VBTXBCOVUsU0FBUyxlQUFULEVBQTBCLFlBQU07O0VBRS9CQyxJQUFHLG9CQUFILEVBQXlCLFlBQU07RUFDOUIsTUFBSTRXLFVBQVUsSUFBSUYsS0FBSixFQUFkO0VBQ0U1SCxPQUFLNU8sTUFBTCxDQUFZMFcsUUFBUTFWLEdBQVIsQ0FBWSxLQUFaLENBQVosRUFBZ0NiLEVBQWhDLENBQW1DQyxLQUFuQyxDQUF5QyxDQUF6QztFQUNGLEVBSEQ7O0VBS0FOLElBQUcsbUJBQUgsRUFBd0IsWUFBTTtFQUM3QixNQUFJNFcsVUFBVSxJQUFJRixLQUFKLEdBQVl2VixHQUFaLENBQWdCLEtBQWhCLEVBQXNCLENBQXRCLENBQWQ7RUFDRTJOLE9BQUs1TyxNQUFMLENBQVkwVyxRQUFRMVYsR0FBUixDQUFZLEtBQVosQ0FBWixFQUFnQ2IsRUFBaEMsQ0FBbUNDLEtBQW5DLENBQXlDLENBQXpDO0VBQ0YsRUFIRDs7RUFLQU4sSUFBRyx3QkFBSCxFQUE2QixZQUFNO0VBQ2xDLE1BQUk0VyxVQUFVLElBQUlGLEtBQUosR0FBWXZWLEdBQVosQ0FBZ0I7RUFDN0IwVixhQUFVO0VBQ1RDLGNBQVU7RUFERDtFQURtQixHQUFoQixDQUFkO0VBS0FGLFVBQVF6VixHQUFSLENBQVksbUJBQVosRUFBZ0MsQ0FBaEM7RUFDRTJOLE9BQUs1TyxNQUFMLENBQVkwVyxRQUFRMVYsR0FBUixDQUFZLG1CQUFaLENBQVosRUFBOENiLEVBQTlDLENBQWlEQyxLQUFqRCxDQUF1RCxDQUF2RDtFQUNGLEVBUkQ7O0VBVUFOLElBQUcsbUNBQUgsRUFBd0MsWUFBTTtFQUM3QyxNQUFJNFcsVUFBVSxJQUFJRixLQUFKLEdBQVl2VixHQUFaLENBQWdCO0VBQzdCMFYsYUFBVTtFQUNUQyxjQUFVO0VBREQ7RUFEbUIsR0FBaEIsQ0FBZDtFQUtBRixVQUFRelYsR0FBUixDQUFZLHFCQUFaLEVBQWtDLEtBQWxDO0VBQ0UyTixPQUFLNU8sTUFBTCxDQUFZMFcsUUFBUTFWLEdBQVIsQ0FBWSxxQkFBWixDQUFaLEVBQWdEYixFQUFoRCxDQUFtREMsS0FBbkQsQ0FBeUQsS0FBekQ7RUFDRnNXLFVBQVF6VixHQUFSLENBQVkscUJBQVosRUFBa0MsRUFBQ3dWLEtBQUksQ0FBTCxFQUFsQztFQUNBN0gsT0FBSzVPLE1BQUwsQ0FBWTBXLFFBQVExVixHQUFSLENBQVkseUJBQVosQ0FBWixFQUFvRGIsRUFBcEQsQ0FBdURDLEtBQXZELENBQTZELENBQTdEO0VBQ0FzVyxVQUFRelYsR0FBUixDQUFZLHlCQUFaLEVBQXNDLENBQXRDO0VBQ0EyTixPQUFLNU8sTUFBTCxDQUFZMFcsUUFBUTFWLEdBQVIsQ0FBWSx5QkFBWixDQUFaLEVBQW9EYixFQUFwRCxDQUF1REMsS0FBdkQsQ0FBNkQsQ0FBN0Q7RUFDQSxFQVpEOztFQWNBTixJQUFHLHFCQUFILEVBQTBCLFlBQU07RUFDL0IsTUFBSTRXLFVBQVUsSUFBSUYsS0FBSixHQUFZdlYsR0FBWixDQUFnQjtFQUM3QjBWLGFBQVU7RUFDVEMsY0FBVSxDQUFDO0VBQ1ZDLGVBQVM7RUFEQyxLQUFELEVBR1Y7RUFDQ0EsZUFBUztFQURWLEtBSFU7RUFERDtFQURtQixHQUFoQixDQUFkO0VBVUEsTUFBTUMsV0FBVyw4QkFBakI7O0VBRUEsTUFBTUMsb0JBQW9CTCxRQUFRakIsZ0JBQVIsRUFBMUI7RUFDQSxNQUFJdUIscUJBQXFCLENBQXpCOztFQUVBRCxvQkFBa0I5SSxFQUFsQixDQUFxQjZJLFFBQXJCLEVBQStCLFVBQVM5UixRQUFULEVBQW1CRCxRQUFuQixFQUE2QjtFQUMzRGlTO0VBQ0FwSSxRQUFLNU8sTUFBTCxDQUFZZ0YsUUFBWixFQUFzQjdFLEVBQXRCLENBQXlCQyxLQUF6QixDQUErQixJQUEvQjtFQUNBd08sUUFBSzVPLE1BQUwsQ0FBWStFLFFBQVosRUFBc0I1RSxFQUF0QixDQUF5QkMsS0FBekIsQ0FBK0IsS0FBL0I7RUFDQSxHQUpEOztFQU1BMlcsb0JBQWtCOUksRUFBbEIsQ0FBcUIsVUFBckIsRUFBaUMsVUFBU2pKLFFBQVQsRUFBbUJELFFBQW5CLEVBQTZCO0VBQzdEaVM7RUFDQSxTQUFNLDZDQUFOO0VBQ0EsR0FIRDs7RUFLQUQsb0JBQWtCOUksRUFBbEIsQ0FBcUIsWUFBckIsRUFBbUMsVUFBU2pKLFFBQVQsRUFBbUJELFFBQW5CLEVBQTZCO0VBQy9EaVM7RUFDQXBJLFFBQUs1TyxNQUFMLENBQVlnRixTQUFTNFIsUUFBVCxDQUFrQixDQUFsQixFQUFxQkMsUUFBakMsRUFBMkMxVyxFQUEzQyxDQUE4Q0MsS0FBOUMsQ0FBb0QsSUFBcEQ7RUFDQXdPLFFBQUs1TyxNQUFMLENBQVkrRSxTQUFTNlIsUUFBVCxDQUFrQixDQUFsQixFQUFxQkMsUUFBakMsRUFBMkMxVyxFQUEzQyxDQUE4Q0MsS0FBOUMsQ0FBb0QsS0FBcEQ7RUFDQSxHQUpEOztFQU1Bc1csVUFBUXpWLEdBQVIsQ0FBWTZWLFFBQVosRUFBc0IsSUFBdEI7RUFDQUMsb0JBQWtCbkIsT0FBbEI7RUFDQWhILE9BQUs1TyxNQUFMLENBQVlnWCxrQkFBWixFQUFnQzdXLEVBQWhDLENBQW1DQyxLQUFuQyxDQUF5QyxDQUF6QztFQUVBLEVBckNEOztFQXVDQU4sSUFBRyw4QkFBSCxFQUFtQyxZQUFNO0VBQ3hDLE1BQUk0VyxVQUFVLElBQUlGLEtBQUosR0FBWXZWLEdBQVosQ0FBZ0I7RUFDN0IwVixhQUFVO0VBQ1RDLGNBQVUsQ0FBQztFQUNWQyxlQUFTO0VBREMsS0FBRCxFQUdWO0VBQ0NBLGVBQVM7RUFEVixLQUhVO0VBREQ7RUFEbUIsR0FBaEIsQ0FBZDtFQVVBSCxVQUFRSSxRQUFSLEdBQW1CLDhCQUFuQjs7RUFFQSxNQUFNQyxvQkFBb0JMLFFBQVFqQixnQkFBUixFQUExQjs7RUFFQXNCLG9CQUFrQjlJLEVBQWxCLENBQXFCeUksUUFBUUksUUFBN0IsRUFBdUMsVUFBUzlSLFFBQVQsRUFBbUJELFFBQW5CLEVBQTZCO0VBQ25FLFNBQU0sSUFBSW5GLEtBQUosQ0FBVSx3QkFBVixDQUFOO0VBQ0EsR0FGRDtFQUdBbVgsb0JBQWtCbkIsT0FBbEI7RUFDQWMsVUFBUXpWLEdBQVIsQ0FBWXlWLFFBQVFJLFFBQXBCLEVBQThCLElBQTlCO0VBQ0EsRUFwQkQ7O0VBc0JBaFgsSUFBRywrQ0FBSCxFQUFvRCxZQUFNO0VBQ3pELE1BQUk0VyxVQUFVLElBQUlGLEtBQUosRUFBZDtFQUNFNUgsT0FBSzVPLE1BQUwsQ0FBWTBXLFFBQVExVixHQUFSLENBQVksS0FBWixDQUFaLEVBQWdDYixFQUFoQyxDQUFtQ0MsS0FBbkMsQ0FBeUMsQ0FBekM7O0VBRUEsTUFBSTZXLFlBQVl2WSxTQUFTQyxhQUFULENBQXVCLHVCQUF2QixDQUFoQjs7RUFFQSxNQUFNK0gsV0FBV2dRLFFBQVFqQixnQkFBUixHQUNkeEgsRUFEYyxDQUNYLEtBRFcsRUFDSixVQUFDbE4sS0FBRCxFQUFXO0VBQUUsVUFBSytMLElBQUwsR0FBWS9MLEtBQVo7RUFBb0IsR0FEN0IsQ0FBakI7RUFFQTJGLFdBQVNrUCxPQUFUOztFQUVBLE1BQU1zQixpQkFBaUJSLFFBQVFaLG9CQUFSLENBQTZCbUIsU0FBN0IsRUFBd0NsQixXQUF4QyxDQUNyQixDQUFDLEtBQUQsRUFBUSxNQUFSLENBRHFCLENBQXZCOztFQUlBVyxVQUFRelYsR0FBUixDQUFZLEtBQVosRUFBbUIsR0FBbkI7RUFDQTJOLE9BQUs1TyxNQUFMLENBQVlpWCxVQUFVbkssSUFBdEIsRUFBNEIzTSxFQUE1QixDQUErQkMsS0FBL0IsQ0FBcUMsR0FBckM7RUFDQThXLGlCQUFldEIsT0FBZjtFQUNGYyxVQUFRelYsR0FBUixDQUFZLEtBQVosRUFBbUIsR0FBbkI7RUFDQTJOLE9BQUs1TyxNQUFMLENBQVlpWCxVQUFVbkssSUFBdEIsRUFBNEIzTSxFQUE1QixDQUErQkMsS0FBL0IsQ0FBcUMsR0FBckM7RUFDQSxFQW5CRDtFQXFCQSxDQXRIRDs7RUNSQTs7RUFJQSxJQUFNK1csa0JBQWtCLFNBQWxCQSxlQUFrQixHQUFNO0VBQzVCLE1BQU1iLGNBQWMsSUFBSXBGLEdBQUosRUFBcEI7RUFDQSxNQUFJMEQsa0JBQWtCLENBQXRCOztFQUVBO0VBQ0EsU0FBTztFQUNMd0MsYUFBUyxpQkFBU3BKLEtBQVQsRUFBeUI7RUFBQSx3Q0FBTnJNLElBQU07RUFBTkEsWUFBTTtFQUFBOztFQUNoQzJVLGtCQUFZdFMsT0FBWixDQUFvQix5QkFBaUI7RUFDbkMsU0FBQ21TLGNBQWNuVixHQUFkLENBQWtCZ04sS0FBbEIsS0FBNEIsRUFBN0IsRUFBaUNoSyxPQUFqQyxDQUF5QyxvQkFBWTtFQUNuRHZCLG9DQUFZZCxJQUFaO0VBQ0QsU0FGRDtFQUdELE9BSkQ7RUFLQSxhQUFPLElBQVA7RUFDRCxLQVJJO0VBU0w4VCxzQkFBa0IsNEJBQVc7RUFDM0IsVUFBSWpRLFVBQVVvUCxpQkFBZDtFQUNBLGFBQU87RUFDTDNHLFlBQUksWUFBU0QsS0FBVCxFQUFnQnZMLFFBQWhCLEVBQTBCO0VBQzVCLGNBQUksQ0FBQzZULFlBQVllLEdBQVosQ0FBZ0I3UixPQUFoQixDQUFMLEVBQStCO0VBQzdCOFEsd0JBQVlyVixHQUFaLENBQWdCdUUsT0FBaEIsRUFBeUIsSUFBSTBMLEdBQUosRUFBekI7RUFDRDtFQUNEO0VBQ0EsY0FBTW9HLGFBQWFoQixZQUFZdFYsR0FBWixDQUFnQndFLE9BQWhCLENBQW5CO0VBQ0EsY0FBSSxDQUFDOFIsV0FBV0QsR0FBWCxDQUFlckosS0FBZixDQUFMLEVBQTRCO0VBQzFCc0osdUJBQVdyVyxHQUFYLENBQWUrTSxLQUFmLEVBQXNCLEVBQXRCO0VBQ0Q7RUFDRDtFQUNBc0oscUJBQVd0VyxHQUFYLENBQWVnTixLQUFmLEVBQXNCcEwsSUFBdEIsQ0FBMkJILFFBQTNCO0VBQ0EsaUJBQU8sSUFBUDtFQUNELFNBYkk7RUFjTDJMLGFBQUssYUFBU0osS0FBVCxFQUFnQjtFQUNuQjtFQUNBc0ksc0JBQVl0VixHQUFaLENBQWdCd0UsT0FBaEIsRUFBeUI0USxNQUF6QixDQUFnQ3BJLEtBQWhDO0VBQ0EsaUJBQU8sSUFBUDtFQUNELFNBbEJJO0VBbUJMNEgsaUJBQVMsbUJBQVc7RUFDbEJVLHNCQUFZRixNQUFaLENBQW1CNVEsT0FBbkI7RUFDRDtFQXJCSSxPQUFQO0VBdUJEO0VBbENJLEdBQVA7RUFvQ0QsQ0F6Q0Q7O0VDRkEzRixTQUFTLGtCQUFULEVBQTZCLFlBQU07O0VBRWxDQyxLQUFHLHFCQUFILEVBQTBCLFVBQUN5WCxJQUFELEVBQVU7RUFDbkMsUUFBSUMsYUFBYUwsaUJBQWpCO0VBQ0UsUUFBSU0sdUJBQXVCRCxXQUFXL0IsZ0JBQVgsR0FDeEJ4SCxFQUR3QixDQUNyQixLQURxQixFQUNkLFVBQUN4RSxJQUFELEVBQVU7RUFDbkJtRixXQUFLNU8sTUFBTCxDQUFZeUosSUFBWixFQUFrQnRKLEVBQWxCLENBQXFCQyxLQUFyQixDQUEyQixDQUEzQjtFQUNBbVg7RUFDRCxLQUp3QixDQUEzQjtFQUtBQyxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBUGlDO0VBUW5DLEdBUkQ7O0VBVUN0WCxLQUFHLDJCQUFILEVBQWdDLFlBQU07RUFDdEMsUUFBSTBYLGFBQWFMLGlCQUFqQjtFQUNFLFFBQUlILHFCQUFxQixDQUF6QjtFQUNBLFFBQUlTLHVCQUF1QkQsV0FBVy9CLGdCQUFYLEdBQ3hCeEgsRUFEd0IsQ0FDckIsS0FEcUIsRUFDZCxVQUFDeEUsSUFBRCxFQUFVO0VBQ25CdU47RUFDQXBJLFdBQUs1TyxNQUFMLENBQVl5SixJQUFaLEVBQWtCdEosRUFBbEIsQ0FBcUJDLEtBQXJCLENBQTJCLENBQTNCO0VBQ0QsS0FKd0IsQ0FBM0I7O0VBTUEsUUFBSXNYLHdCQUF3QkYsV0FBVy9CLGdCQUFYLEdBQ3pCeEgsRUFEeUIsQ0FDdEIsS0FEc0IsRUFDZixVQUFDeEUsSUFBRCxFQUFVO0VBQ25CdU47RUFDQXBJLFdBQUs1TyxNQUFMLENBQVl5SixJQUFaLEVBQWtCdEosRUFBbEIsQ0FBcUJDLEtBQXJCLENBQTJCLENBQTNCO0VBQ0QsS0FKeUIsQ0FBNUI7O0VBTUFvWCxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBZm9DO0VBZ0JwQ3hJLFNBQUs1TyxNQUFMLENBQVlnWCxrQkFBWixFQUFnQzdXLEVBQWhDLENBQW1DQyxLQUFuQyxDQUF5QyxDQUF6QztFQUNGLEdBakJBOztFQW1CQU4sS0FBRyw2QkFBSCxFQUFrQyxZQUFNO0VBQ3hDLFFBQUkwWCxhQUFhTCxpQkFBakI7RUFDRSxRQUFJSCxxQkFBcUIsQ0FBekI7RUFDQSxRQUFJUyx1QkFBdUJELFdBQVcvQixnQkFBWCxHQUN4QnhILEVBRHdCLENBQ3JCLEtBRHFCLEVBQ2QsVUFBQ3hFLElBQUQsRUFBVTtFQUNuQnVOO0VBQ0FwSSxXQUFLNU8sTUFBTCxDQUFZeUosSUFBWixFQUFrQnRKLEVBQWxCLENBQXFCQyxLQUFyQixDQUEyQixDQUEzQjtFQUNELEtBSndCLEVBS3hCNk4sRUFMd0IsQ0FLckIsS0FMcUIsRUFLZCxVQUFDeEUsSUFBRCxFQUFVO0VBQ25CdU47RUFDQXBJLFdBQUs1TyxNQUFMLENBQVl5SixJQUFaLEVBQWtCdEosRUFBbEIsQ0FBcUJDLEtBQXJCLENBQTJCLENBQTNCO0VBQ0QsS0FSd0IsQ0FBM0I7O0VBVUVvWCxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBYm9DO0VBY3BDSSxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBQTBCLENBQTFCLEVBZG9DO0VBZXRDeEksU0FBSzVPLE1BQUwsQ0FBWWdYLGtCQUFaLEVBQWdDN1csRUFBaEMsQ0FBbUNDLEtBQW5DLENBQXlDLENBQXpDO0VBQ0YsR0FoQkE7O0VBa0JBTixLQUFHLGlCQUFILEVBQXNCLFlBQU07RUFDNUIsUUFBSTBYLGFBQWFMLGlCQUFqQjtFQUNFLFFBQUlILHFCQUFxQixDQUF6QjtFQUNBLFFBQUlTLHVCQUF1QkQsV0FBVy9CLGdCQUFYLEdBQ3hCeEgsRUFEd0IsQ0FDckIsS0FEcUIsRUFDZCxVQUFDeEUsSUFBRCxFQUFVO0VBQ25CdU47RUFDQSxZQUFNLElBQUlwWCxLQUFKLENBQVUsd0NBQVYsQ0FBTjtFQUNELEtBSndCLENBQTNCO0VBS0E0WCxlQUFXSixPQUFYLENBQW1CLG1CQUFuQixFQUF3QyxDQUF4QyxFQVIwQjtFQVMxQksseUJBQXFCN0IsT0FBckI7RUFDQTRCLGVBQVdKLE9BQVgsQ0FBbUIsS0FBbkIsRUFWMEI7RUFXMUJ4SSxTQUFLNU8sTUFBTCxDQUFZZ1gsa0JBQVosRUFBZ0M3VyxFQUFoQyxDQUFtQ0MsS0FBbkMsQ0FBeUMsQ0FBekM7RUFDRixHQVpBOztFQWNBTixLQUFHLGFBQUgsRUFBa0IsWUFBTTtFQUN4QixRQUFJMFgsYUFBYUwsaUJBQWpCO0VBQ0UsUUFBSUgscUJBQXFCLENBQXpCO0VBQ0EsUUFBSVMsdUJBQXVCRCxXQUFXL0IsZ0JBQVgsR0FDeEJ4SCxFQUR3QixDQUNyQixLQURxQixFQUNkLFVBQUN4RSxJQUFELEVBQVU7RUFDbkJ1TjtFQUNBLFlBQU0sSUFBSXBYLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0VBQ0QsS0FKd0IsRUFLeEJxTyxFQUx3QixDQUtyQixLQUxxQixFQUtkLFVBQUN4RSxJQUFELEVBQVU7RUFDbkJ1TjtFQUNBcEksV0FBSzVPLE1BQUwsQ0FBWXlKLElBQVosRUFBa0J0SixFQUFsQixDQUFxQkMsS0FBckIsQ0FBMkJ3RixTQUEzQjtFQUNELEtBUndCLEVBU3hCd0ksR0FUd0IsQ0FTcEIsS0FUb0IsQ0FBM0I7RUFVQW9KLGVBQVdKLE9BQVgsQ0FBbUIsbUJBQW5CLEVBQXdDLENBQXhDLEVBYnNCO0VBY3RCSSxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBZHNCO0VBZXRCSSxlQUFXSixPQUFYLENBQW1CLEtBQW5CLEVBZnNCO0VBZ0J0QnhJLFNBQUs1TyxNQUFMLENBQVlnWCxrQkFBWixFQUFnQzdXLEVBQWhDLENBQW1DQyxLQUFuQyxDQUF5QyxDQUF6QztFQUNGLEdBakJBO0VBb0JELENBbkZEOzs7OyJ9
