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
  var types = ['Map', 'Set', 'Symbol', 'Array', 'Object', 'String', 'Date', 'RegExp', 'Function', 'Boolean', 'Number', 'Null', 'Undefined', 'Arguments', 'Error'];
  var len = types.length;
  var typeCache = {};
  var typeRegexp = /\s([a-zA-Z]+)/;

  var type = setup();

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
    if (!src || !type.object(src) || type.function(src)) {
      return src;
    }
    var t = getType(src);
    if (t in cloneTypes) {
      return cloneTypes[t].apply(src, [circulars, clones]);
    }
    return src;
  }

  var cloneTypes = Object.freeze({
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
  });

  /*  */
  var jsonClone$1 = (function (value) {
  	var reviver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (k, v) {
  		return v;
  	};
  	return JSON.parse(JSON.stringify(value), reviver);
  });

  /*  */

  /*  */

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
  		it('When non-serializable value is passed in it throws', function () {
  			expect(function () {
  				return jsonClone$1();
  			}).to.throw(Error);
  			expect(function () {
  				return jsonClone$1(function () {});
  			}).to.throw(Error);
  			expect(function () {
  				return jsonClone$1(undefined);
  			}).to.throw(Error);
  		});

  		it('Primitive serializable values', function () {
  			expect(jsonClone$1(null)).to.be.null;
  			assert.equal(jsonClone$1(5), 5);
  			assert.equal(jsonClone$1('string'), 'string');
  			assert.equal(jsonClone$1(false), false);
  			assert.equal(jsonClone$1(true), true);
  		});

  		it('Object is not same', function () {
  			var obj = { 'a': 'b' };
  			expect(jsonClone$1(obj)).not.to.be.equal(obj);
  		});

  		it('Object reviver function', function () {
  			var obj = { 'a': '2' };
  			var cloned = jsonClone$1(obj, function (k, v) {
  				return k !== '' ? Number(v) * 2 : v;
  			});
  			expect(cloned.a).equal(4);
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
        expect(type.arguments(args)).to.be.true;
      });
      it('should return false if passed parameter type is not arguments', function () {
        var notArgs = ['test'];
        expect(type.arguments(notArgs)).to.be.false;
      });
      it('should return true if passed all parameters arguments', function () {
        var getArguments = function getArguments() {
          return arguments;
        };
        var args = getArguments('test');
        expect(type.arguments.all(args, args, args)).to.be.true;
      });
      it('should return true if passed any parameters arguments', function () {
        var getArguments = function getArguments() {
          return arguments;
        };
        var args = getArguments('test');
        expect(type.arguments.any(args, 'test', 'test2')).to.be.true;
      });
    });

    describe('array', function () {
      it('should return true if passed parameter type is array', function () {
        var array = ['test'];
        expect(type.array(array)).to.be.true;
      });
      it('should return false if passed parameter type is not array', function () {
        var notArray = 'test';
        expect(type.array(notArray)).to.be.false;
      });
      it('should return true if passed parameters all array', function () {
        expect(type.array.all(['test1'], ['test2'], ['test3'])).to.be.true;
      });
      it('should return true if passed parameters any array', function () {
        expect(type.array.any(['test1'], 'test2', 'test3')).to.be.true;
      });
    });

    describe('boolean', function () {
      it('should return true if passed parameter type is boolean', function () {
        var bool = true;
        expect(type.boolean(bool)).to.be.true;
      });
      it('should return false if passed parameter type is not boolean', function () {
        var notBool = 'test';
        expect(type.boolean(notBool)).to.be.false;
      });
    });

    describe('error', function () {
      it('should return true if passed parameter type is error', function () {
        var error = new Error();
        expect(type.error(error)).to.be.true;
      });
      it('should return false if passed parameter type is not error', function () {
        var notError = 'test';
        expect(type.error(notError)).to.be.false;
      });
    });

    describe('function', function () {
      it('should return true if passed parameter type is function', function () {
        expect(type.function(type.function)).to.be.true;
      });
      it('should return false if passed parameter type is not function', function () {
        var notFunction = 'test';
        expect(type.function(notFunction)).to.be.false;
      });
    });

    describe('null', function () {
      it('should return true if passed parameter type is null', function () {
        expect(type.null(null)).to.be.true;
      });
      it('should return false if passed parameter type is not null', function () {
        var notNull = 'test';
        expect(type.null(notNull)).to.be.false;
      });
    });

    describe('number', function () {
      it('should return true if passed parameter type is number', function () {
        expect(type.number(1)).to.be.true;
      });
      it('should return false if passed parameter type is not number', function () {
        var notNumber = 'test';
        expect(type.number(notNumber)).to.be.false;
      });
    });

    describe('object', function () {
      it('should return true if passed parameter type is object', function () {
        expect(type.object({})).to.be.true;
      });
      it('should return false if passed parameter type is not object', function () {
        var notObject = 'test';
        expect(type.object(notObject)).to.be.false;
      });
    });

    describe('regexp', function () {
      it('should return true if passed parameter type is regexp', function () {
        var regexp = new RegExp();
        expect(type.regexp(regexp)).to.be.true;
      });
      it('should return false if passed parameter type is not regexp', function () {
        var notRegexp = 'test';
        expect(type.regexp(notRegexp)).to.be.false;
      });
    });

    describe('string', function () {
      it('should return true if passed parameter type is string', function () {
        expect(type.string('test')).to.be.true;
      });
      it('should return false if passed parameter type is not string', function () {
        expect(type.string(1)).to.be.false;
      });
    });

    describe('undefined', function () {
      it('should return true if passed parameter type is undefined', function () {
        expect(type.undefined(undefined)).to.be.true;
      });
      it('should return false if passed parameter type is not undefined', function () {
        expect(type.undefined(null)).to.be.false;
        expect(type.undefined('test')).to.be.false;
      });
    });

    describe('map', function () {
      it('should return true if passed parameter type is Map', function () {
        expect(type.map(new Map())).to.be.true;
      });
      it('should return false if passed parameter type is not Map', function () {
        expect(type.map(null)).to.be.false;
        expect(type.map(Object.create(null))).to.be.false;
      });
    });

    describe('set', function () {
      it('should return true if passed parameter type is Set', function () {
        expect(type.set(new Set())).to.be.true;
      });
      it('should return false if passed parameter type is not Set', function () {
        expect(type.set(null)).to.be.false;
        expect(type.set(Object.create(null))).to.be.false;
      });
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

    if (type.undefined(fetch)) {
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
        parsedHeaders[name] = type.function(headers[name]) ? headers[name]() : headers[name];
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
        if (!type.string(arg1) && type.undefined(arg2)) {
          value = arg1;
        } else {
          value = arg2;
          accessor = arg1;
        }
        var oldState = this._getState();
        var newState = jsonClone$1(oldState);

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
        return jsonClone$1(accessor ? dget(privates[this._stateKey], accessor) : privates[this._stateKey]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2RvbS90ZW1wbGF0ZS1jb250ZW50LmpzIiwiLi4vLi4vbGliL2RvbS9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3Rlc3QvZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbGliL29iamVjdC9kZ2V0LmpzIiwiLi4vLi4vbGliL29iamVjdC9kc2V0LmpzIiwiLi4vLi4vbGliL2FycmF5L2FueS5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbGwuanMiLCIuLi8uLi9saWIvYXJyYXkuanMiLCIuLi8uLi9saWIvdHlwZS5qcyIsIi4uLy4uL2xpYi9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L2pzb24tY2xvbmUuanMiLCIuLi8uLi9saWIvb2JqZWN0L29iamVjdC10by1tYXAuanMiLCIuLi8uLi9saWIvb2JqZWN0LmpzIiwiLi4vLi4vdGVzdC9vYmplY3QvY2xvbmUuanMiLCIuLi8uLi90ZXN0L3R5cGUuanMiLCIuLi8uLi9saWIvY3JlYXRlLXN0b3JhZ2UuanMiLCIuLi8uLi9saWIvaHR0cC1jbGllbnQuanMiLCIuLi8uLi90ZXN0L2h0dHAtY2xpZW50LmpzIiwiLi4vLi4vbGliL3VuaXF1ZS1pZC5qcyIsIi4uLy4uL2xpYi9tb2RlbC5qcyIsIi4uLy4uL3Rlc3QvbW9kZWwuanMiLCIuLi8uLi9saWIvZXZlbnQtaHViLmpzIiwiLi4vLi4vdGVzdC9ldmVudC1odWIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgZGVmYXVsdCAodGVtcGxhdGUpID0+IHtcbiAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGxldCBjaGlsZHJlbiA9IHRlbXBsYXRlLmNoaWxkTm9kZXM7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZHJlbltpXS5jbG9uZU5vZGUodHJ1ZSkpO1xuICB9XG4gIHJldHVybiBmcmFnbWVudDtcbn07XG4iLCIvKiAgKi9cbmltcG9ydCB0ZW1wbGF0ZUNvbnRlbnQgZnJvbSAnLi90ZW1wbGF0ZS1jb250ZW50LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgKGh0bWwpID0+IHtcbiAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sLnRyaW0oKTtcbiAgY29uc3QgZnJhZyA9IHRlbXBsYXRlQ29udGVudCh0ZW1wbGF0ZSk7XG4gIGlmIChmcmFnICYmIGZyYWcuZmlyc3RDaGlsZCkge1xuICAgIHJldHVybiBmcmFnLmZpcnN0Q2hpbGQ7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY3JlYXRlRWxlbWVudCBmb3IgJHtodG1sfWApO1xufTtcbiIsImltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4uLy4uL2xpYi9kb20vY3JlYXRlLWVsZW1lbnQuanMnO1xuXG5kZXNjcmliZSgnY3JlYXRlLWVsZW1lbnQnLCAoKSA9PiB7XG4gIGl0KCdjcmVhdGUgZWxlbWVudCcsICgpID0+IHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsZW1lbnQoYFxuXHRcdFx0PGRpdiBjbGFzcz1cIm15LWNsYXNzXCI+SGVsbG8gV29ybGQ8L2Rpdj5cblx0XHRgKTtcbiAgICBleHBlY3QoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdteS1jbGFzcycpKS50by5lcXVhbCh0cnVlKTtcbiAgICBhc3NlcnQuaW5zdGFuY2VPZihlbCwgTm9kZSwgJ2VsZW1lbnQgaXMgaW5zdGFuY2Ugb2Ygbm9kZScpO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoXG4gIG9iaixcbiAga2V5LFxuICBkZWZhdWx0VmFsdWUgPSB1bmRlZmluZWRcbikgPT4ge1xuICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gb2JqW2tleV0gPyBvYmpba2V5XSA6IGRlZmF1bHRWYWx1ZTtcbiAgfVxuICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpO1xuICBjb25zdCBsZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG4gIGxldCBvYmplY3QgPSBvYmo7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3QgPSBkZWZhdWx0VmFsdWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAob2JqLCBrZXksIHZhbHVlKSA9PiB7XG4gIGlmIChrZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyk7XG4gIGNvbnN0IGRlcHRoID0gcGFydHMubGVuZ3RoIC0gMTtcbiAgbGV0IG9iamVjdCA9IG9iajtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIG9iamVjdFtwYXJ0c1tpXV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBvYmplY3RbcGFydHNbaV1dID0ge307XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtwYXJ0c1tpXV07XG4gIH1cbiAgb2JqZWN0W3BhcnRzW2RlcHRoXV0gPSB2YWx1ZTtcbn07XG4iLCIvKiAgKi9cbmV4cG9ydCBkZWZhdWx0IChhcnIsIGZuID0gQm9vbGVhbikgPT4gYXJyLnNvbWUoZm4pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5ldmVyeShmbik7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgYW55IH0gZnJvbSAnLi9hcnJheS9hbnkuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBhbGwgfSBmcm9tICcuL2FycmF5L2FsbC5qcyc7XG4iLCIvKiAgKi9cbmltcG9ydCB7IGFsbCwgYW55IH0gZnJvbSAnLi9hcnJheS5qcyc7XG5cblxuXG5cbmNvbnN0IGRvQWxsQXBpID0gKGZuKSA9PiAoLi4ucGFyYW1zKSA9PiBhbGwocGFyYW1zLCBmbik7XG5jb25zdCBkb0FueUFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYW55KHBhcmFtcywgZm4pO1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdHlwZXMgPSBbXG4gICdNYXAnLFxuICAnU2V0JyxcbiAgJ1N5bWJvbCcsXG4gICdBcnJheScsXG4gICdPYmplY3QnLFxuICAnU3RyaW5nJyxcbiAgJ0RhdGUnLFxuICAnUmVnRXhwJyxcbiAgJ0Z1bmN0aW9uJyxcbiAgJ0Jvb2xlYW4nLFxuICAnTnVtYmVyJyxcbiAgJ051bGwnLFxuICAnVW5kZWZpbmVkJyxcbiAgJ0FyZ3VtZW50cycsXG4gICdFcnJvcidcbl07XG5jb25zdCBsZW4gPSB0eXBlcy5sZW5ndGg7XG5jb25zdCB0eXBlQ2FjaGUgPSB7fTtcbmNvbnN0IHR5cGVSZWdleHAgPSAvXFxzKFthLXpBLVpdKykvO1xuXG5leHBvcnQgZGVmYXVsdCAoc2V0dXAoKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUeXBlID0gKHNyYykgPT4gZ2V0U3JjVHlwZShzcmMpO1xuXG5mdW5jdGlvbiBnZXRTcmNUeXBlKHNyYykge1xuICBsZXQgdHlwZSA9IHRvU3RyaW5nLmNhbGwoc3JjKTtcbiAgaWYgKCF0eXBlQ2FjaGVbdHlwZV0pIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHR5cGUubWF0Y2godHlwZVJlZ2V4cCk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWF0Y2hlcykgJiYgbWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2FjaGVbdHlwZV0gPSBtYXRjaGVzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0eXBlQ2FjaGVbdHlwZV07XG59XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICBsZXQgY2hlY2tzID0ge307XG4gIGZvciAobGV0IGkgPSBsZW47IGktLTsgKSB7XG4gICAgY29uc3QgdHlwZSA9IHR5cGVzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgY2hlY2tzW3R5cGVdID0gc3JjID0+IGdldFNyY1R5cGUoc3JjKSA9PT0gdHlwZTtcbiAgICBjaGVja3NbdHlwZV0uYWxsID0gZG9BbGxBcGkoY2hlY2tzW3R5cGVdKTtcbiAgICBjaGVja3NbdHlwZV0uYW55ID0gZG9BbnlBcGkoY2hlY2tzW3R5cGVdKTtcbiAgfVxuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiLyogICovXG5pbXBvcnQgdHlwZSwgeyBnZXRUeXBlIH0gZnJvbSAnLi4vdHlwZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzcmMpID0+IGNsb25lKHNyYywgW10sIFtdKTtcblxuZXhwb3J0IGNvbnN0IGpzb25DbG9uZSA9ICh2YWx1ZSwgcmV2aXZlciA9IChrLCB2KSA9PiB2KSA9PlxuICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSwgcmV2aXZlcik7XG5cbmZ1bmN0aW9uIGNsb25lKHNyYywgY2lyY3VsYXJzID0gW10sIGNsb25lcyA9IFtdKSB7XG4gIC8vIE51bGwvdW5kZWZpbmVkL2Z1bmN0aW9ucy9ldGNcbiAgaWYgKCFzcmMgfHwgIXR5cGUub2JqZWN0KHNyYykgfHwgdHlwZS5mdW5jdGlvbihzcmMpKSB7XG4gICAgcmV0dXJuIHNyYztcbiAgfVxuICBjb25zdCB0ID0gZ2V0VHlwZShzcmMpO1xuICBpZiAodCBpbiBjbG9uZVR5cGVzKSB7XG4gICAgcmV0dXJuIGNsb25lVHlwZXNbdF0uYXBwbHkoc3JjLCBbY2lyY3VsYXJzLCBjbG9uZXNdKTtcbiAgfVxuICByZXR1cm4gc3JjO1xufVxuXG5jb25zdCBjbG9uZVR5cGVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLmdldFRpbWUoKSk7XG4gIH0sXG4gIHJlZ2V4cDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAodGhpcyk7XG4gIH0sXG4gIGFycmF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoY2xvbmUpO1xuICB9LFxuICBtYXA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgTWFwKEFycmF5LmZyb20odGhpcy5lbnRyaWVzKCkpKTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFNldChBcnJheS5mcm9tKHRoaXMudmFsdWVzKCkpKTtcbiAgfSxcbiAgb2JqZWN0OiBmdW5jdGlvbihjaXJjdWxhcnMgPSBbXSwgY2xvbmVzID0gW10pIHtcbiAgICBjaXJjdWxhcnMucHVzaCh0aGlzKTtcbiAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuICAgIGNsb25lcy5wdXNoKG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcbiAgICAgIGxldCBpZHggPSBjaXJjdWxhcnMuZmluZEluZGV4KChpKSA9PiBpID09PSB0aGlzW2tleV0pO1xuICAgICAgb2JqW2tleV0gPSBpZHggPiAtMSA/IGNsb25lc1tpZHhdIDogY2xvbmUodGhpc1trZXldLCBjaXJjdWxhcnMsIGNsb25lcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAodmFsdWUsIHJldml2ZXIgPSAoaywgdikgPT4gdikgPT4gSlNPTi5wYXJzZShcblx0SlNPTi5zdHJpbmdpZnkodmFsdWUpLCByZXZpdmVyKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKG8pID0+XG4gIE9iamVjdC5rZXlzKG8pLnJlZHVjZShcbiAgICAobSwgaykgPT4gbS5zZXQoaywgb1trXSksXG4gICAgbmV3IE1hcCgpXG4gICk7XG4iLCIvKiAgKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgZGdldCB9IGZyb20gJy4vb2JqZWN0L2RnZXQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBkc2V0IH0gZnJvbSAnLi9vYmplY3QvZHNldC5qcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIGNsb25lIH0gZnJvbSAnLi9vYmplY3QvY2xvbmUuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBqc29uQ2xvbmUgfSBmcm9tICcuL29iamVjdC9qc29uLWNsb25lLmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgb2JqZWN0VG9NYXAgfSBmcm9tICcuL29iamVjdC9vYmplY3QtdG8tbWFwLmpzJztcbiIsImltcG9ydCB7Y2xvbmUsIGpzb25DbG9uZX0gZnJvbSAnLi4vLi4vbGliL29iamVjdC5qcyc7XG5cbmRlc2NyaWJlKCdjbG9uZScsICgpID0+IHtcbiAgZGVzY3JpYmUoJ3ByaW1pdGl2ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ1JldHVybnMgZXF1YWwgZGF0YSBmb3IgTnVsbC91bmRlZmluZWQvZnVuY3Rpb25zL2V0YycsICgpID0+IHtcbiAgICAgIC8vIE51bGxcbiAgICAgIGV4cGVjdChjbG9uZShudWxsKSkudG8uYmUubnVsbDtcblxuICAgICAgLy8gVW5kZWZpbmVkXG4gICAgICBleHBlY3QoY2xvbmUoKSkudG8uYmUudW5kZWZpbmVkO1xuXG4gICAgICAvLyBGdW5jdGlvblxuICAgICAgY29uc3QgZnVuYyA9ICgpID0+IHt9O1xuICAgICAgYXNzZXJ0LmlzRnVuY3Rpb24oY2xvbmUoZnVuYyksICdpcyBhIGZ1bmN0aW9uJyk7XG5cbiAgICAgIC8vIEV0YzogbnVtYmVycyBhbmQgc3RyaW5nXG4gICAgICBhc3NlcnQuZXF1YWwoY2xvbmUoNSksIDUpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKCdzdHJpbmcnKSwgJ3N0cmluZycpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgYXNzZXJ0LmVxdWFsKGNsb25lKHRydWUpLCB0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2pzb25DbG9uZScsICgpID0+IHtcbiAgICBpdCgnV2hlbiBub24tc2VyaWFsaXphYmxlIHZhbHVlIGlzIHBhc3NlZCBpbiBpdCB0aHJvd3MnLCAoKSA9PiB7XG5cdFx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKCkpLnRvLnRocm93KEVycm9yKTtcblx0XHRcdGV4cGVjdCgoKSA9PiBqc29uQ2xvbmUoKCkgPT4ge30pKS50by50aHJvdyhFcnJvcik7XG5cdFx0XHRleHBlY3QoKCkgPT4ganNvbkNsb25lKHVuZGVmaW5lZCkpLnRvLnRocm93KEVycm9yKTtcbiAgICB9KTtcblxuXHRcdGl0KCdQcmltaXRpdmUgc2VyaWFsaXphYmxlIHZhbHVlcycsICgpID0+IHtcblx0XHRcdGV4cGVjdChqc29uQ2xvbmUobnVsbCkpLnRvLmJlLm51bGw7XG5cdFx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKDUpLCA1KTtcblx0XHRcdGFzc2VydC5lcXVhbChqc29uQ2xvbmUoJ3N0cmluZycpLCAnc3RyaW5nJyk7XG5cdFx0XHRhc3NlcnQuZXF1YWwoanNvbkNsb25lKGZhbHNlKSwgZmFsc2UpO1xuXHRcdFx0YXNzZXJ0LmVxdWFsKGpzb25DbG9uZSh0cnVlKSwgdHJ1ZSk7XG5cdFx0fSk7XG5cblx0XHRpdCgnT2JqZWN0IGlzIG5vdCBzYW1lJywgKCkgPT4ge1xuXHRcdCAgY29uc3Qgb2JqID0geydhJzogJ2InfTtcblx0XHRcdGV4cGVjdChqc29uQ2xvbmUob2JqKSkubm90LnRvLmJlLmVxdWFsKG9iaik7XG5cdFx0fSk7XG5cblx0XHRpdCgnT2JqZWN0IHJldml2ZXIgZnVuY3Rpb24nLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBvYmogPSB7J2EnOiAnMid9O1xuXHRcdFx0Y29uc3QgY2xvbmVkID0ganNvbkNsb25lKG9iaiwgKGssIHYpID0+IGsgIT09ICcnID8gTnVtYmVyKHYpICogMiA6IHYpO1xuXHRcdFx0ZXhwZWN0KGNsb25lZC5hKS5lcXVhbCg0KTtcblx0XHR9KTtcblx0fSk7XG59KTtcbiIsImltcG9ydCBpcyBmcm9tICcuLi9saWIvdHlwZS5qcyc7XG5cbmRlc2NyaWJlKCd0eXBlJywgKCkgPT4ge1xuICBkZXNjcmliZSgnYXJndW1lbnRzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cyhhcmdzKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdEFyZ3MgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcmd1bWVudHMobm90QXJncykpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIGFsbCBwYXJhbWV0ZXJzIGFyZ3VtZW50cycsICgpID0+IHtcbiAgICAgIGxldCBnZXRBcmd1bWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cztcbiAgICAgIH07XG4gICAgICBsZXQgYXJncyA9IGdldEFyZ3VtZW50cygndGVzdCcpO1xuICAgICAgZXhwZWN0KGlzLmFyZ3VtZW50cy5hbGwoYXJncywgYXJncywgYXJncykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgYW55IHBhcmFtZXRlcnMgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgbGV0IGdldEFyZ3VtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzO1xuICAgICAgfTtcbiAgICAgIGxldCBhcmdzID0gZ2V0QXJndW1lbnRzKCd0ZXN0Jyk7XG4gICAgICBleHBlY3QoaXMuYXJndW1lbnRzLmFueShhcmdzLCAndGVzdCcsICd0ZXN0MicpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnYXJyYXknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYXJyYXknLCAoKSA9PiB7XG4gICAgICBsZXQgYXJyYXkgPSBbJ3Rlc3QnXTtcbiAgICAgIGV4cGVjdChpcy5hcnJheShhcnJheSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBhcnJheScsICgpID0+IHtcbiAgICAgIGxldCBub3RBcnJheSA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5hcnJheShub3RBcnJheSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlcnMgYWxsIGFycmF5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLmFycmF5LmFsbChbJ3Rlc3QxJ10sIFsndGVzdDInXSwgWyd0ZXN0MyddKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXJzIGFueSBhcnJheScsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5hcnJheS5hbnkoWyd0ZXN0MSddLCAndGVzdDInLCAndGVzdDMnKSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2Jvb2xlYW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBib29sID0gdHJ1ZTtcbiAgICAgIGV4cGVjdChpcy5ib29sZWFuKGJvb2wpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgYm9vbGVhbicsICgpID0+IHtcbiAgICAgIGxldCBub3RCb29sID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLmJvb2xlYW4obm90Qm9vbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZXJyb3InLCAoKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGV4cGVjdChpcy5lcnJvcihlcnJvcikpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGxldCBub3RFcnJvciA9ICd0ZXN0JztcbiAgICAgIGV4cGVjdChpcy5lcnJvcihub3RFcnJvcikpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24oaXMuZnVuY3Rpb24pKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgZnVuY3Rpb24nLCAoKSA9PiB7XG4gICAgICBsZXQgbm90RnVuY3Rpb24gPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMuZnVuY3Rpb24obm90RnVuY3Rpb24pKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ251bGwnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbnVsbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udWxsKG51bGwpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbiAgICAgIGxldCBub3ROdWxsID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bGwobm90TnVsbCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnbnVtYmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG51bWJlcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChpcy5udW1iZXIoMSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBudW1iZXInLCAoKSA9PiB7XG4gICAgICBsZXQgbm90TnVtYmVyID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLm51bWJlcihub3ROdW1iZXIpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ29iamVjdCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KHt9KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgbm90IG9iamVjdCcsICgpID0+IHtcbiAgICAgIGxldCBub3RPYmplY3QgPSAndGVzdCc7XG4gICAgICBleHBlY3QoaXMub2JqZWN0KG5vdE9iamVjdCkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncmVnZXhwJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIHJlZ2V4cCcsICgpID0+IHtcbiAgICAgIGxldCByZWdleHAgPSBuZXcgUmVnRXhwKCk7XG4gICAgICBleHBlY3QoaXMucmVnZXhwKHJlZ2V4cCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCByZWdleHAnLCAoKSA9PiB7XG4gICAgICBsZXQgbm90UmVnZXhwID0gJ3Rlc3QnO1xuICAgICAgZXhwZWN0KGlzLnJlZ2V4cChub3RSZWdleHApKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3N0cmluZycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKCd0ZXN0JykpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBzdHJpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc3RyaW5nKDEpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3VuZGVmaW5lZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKHVuZGVmaW5lZCkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCB1bmRlZmluZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMudW5kZWZpbmVkKG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy51bmRlZmluZWQoJ3Rlc3QnKSkudG8uYmUuZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtYXAnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSBpZiBwYXNzZWQgcGFyYW1ldGVyIHR5cGUgaXMgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChuZXcgTWFwKCkpKS50by5iZS50cnVlO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGZhbHNlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBub3QgTWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGlzLm1hcChudWxsKSkudG8uYmUuZmFsc2U7XG4gICAgICBleHBlY3QoaXMubWFwKE9iamVjdC5jcmVhdGUobnVsbCkpKS50by5iZS5mYWxzZTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3NldCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0cnVlIGlmIHBhc3NlZCBwYXJhbWV0ZXIgdHlwZSBpcyBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG5ldyBTZXQoKSkpLnRvLmJlLnRydWU7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2UgaWYgcGFzc2VkIHBhcmFtZXRlciB0eXBlIGlzIG5vdCBTZXQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoaXMuc2V0KG51bGwpKS50by5iZS5mYWxzZTtcbiAgICAgIGV4cGVjdChpcy5zZXQoT2JqZWN0LmNyZWF0ZShudWxsKSkpLnRvLmJlLmZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiLyogICovXG5leHBvcnQgZGVmYXVsdCAoY3JlYXRvciA9IE9iamVjdC5jcmVhdGUuYmluZChudWxsLCBudWxsLCB7fSkpID0+IHtcbiAgbGV0IHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgcmV0dXJuIChvYmopID0+IHtcbiAgICBsZXQgdmFsdWUgPSBzdG9yZS5nZXQob2JqKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICBzdG9yZS5zZXQob2JqLCAodmFsdWUgPSBjcmVhdG9yKG9iaikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xufTtcbiIsIi8qICAqL1xuaW1wb3J0IGNyZWF0ZVN0b3JhZ2UgZnJvbSAnLi9jcmVhdGUtc3RvcmFnZS5qcyc7XG5pbXBvcnQgdHlwZSBmcm9tICcuL3R5cGUuanMnO1xuXG5cblxuLyoqXG4gKiBUaGUgaW5pdCBvYmplY3QgdXNlZCB0byBpbml0aWFsaXplIGEgZmV0Y2ggUmVxdWVzdC5cbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvUmVxdWVzdC9SZXF1ZXN0XG4gKi9cblxuY29uc3QgcHJpdmF0ZXMgPSBjcmVhdGVTdG9yYWdlKCk7XG5cbi8qKlxuICogQSBjbGFzcyBmb3IgY29uZmlndXJpbmcgSHR0cENsaWVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0b3Ige1xuICBnZXQgYmFzZVVybCgpIHtcbiAgICByZXR1cm4gcHJpdmF0ZXModGhpcykuYmFzZVVybDtcbiAgfVxuXG4gIGdldCBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShwcml2YXRlcyh0aGlzKS5kZWZhdWx0cyk7XG4gIH1cblxuICBnZXQgaW50ZXJjZXB0b3JzKCkge1xuICAgIHJldHVybiBwcml2YXRlcyh0aGlzKS5pbnRlcmNlcHRvcnM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5iYXNlVXJsID0gJyc7XG4gICAgcHJpdmF0ZXModGhpcykuaW50ZXJjZXB0b3JzID0gW107XG4gIH1cblxuICB3aXRoQmFzZVVybChiYXNlVXJsKSB7XG4gICAgcHJpdmF0ZXModGhpcykuYmFzZVVybCA9IGJhc2VVcmw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoRGVmYXVsdHMoZGVmYXVsdHMpIHtcbiAgICBwcml2YXRlcyh0aGlzKS5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aEludGVyY2VwdG9yKGludGVyY2VwdG9yKSB7XG4gICAgcHJpdmF0ZXModGhpcykuaW50ZXJjZXB0b3JzLnB1c2goaW50ZXJjZXB0b3IpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKSB7XG4gICAgbGV0IHN0YW5kYXJkQ29uZmlnID0ge1xuICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtQnknOiAnREVFUC1VSSdcbiAgICAgIH1cbiAgICB9O1xuICAgIHByaXZhdGVzKHRoaXMpLmRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhbmRhcmRDb25maWcpO1xuICAgIHJldHVybiB0aGlzLnJlamVjdEVycm9yUmVzcG9uc2VzKCk7XG4gIH1cblxuICByZWplY3RFcnJvclJlc3BvbnNlcygpIHtcbiAgICByZXR1cm4gdGhpcy53aXRoSW50ZXJjZXB0b3IoeyByZXNwb25zZTogcmVqZWN0T25FcnJvciB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSHR0cENsaWVudCB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHByaXZhdGVzKHRoaXMpLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIGFkZEludGVyY2VwdG9yKGludGVyY2VwdG9yKSB7XG4gICAgcHJpdmF0ZXModGhpcykuY29uZmlnLndpdGhJbnRlcmNlcHRvcihpbnRlcmNlcHRvcik7XG4gIH1cblxuICBmZXRjaChpbnB1dCwgaW5pdCA9IHt9KSB7XG4gICAgbGV0IHJlcXVlc3QgPSB0aGlzLl9idWlsZFJlcXVlc3QoaW5wdXQsIGluaXQpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXF1ZXN0KHJlcXVlc3QpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIGxldCByZXNwb25zZTtcblxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgICAgICByZXNwb25zZSA9IFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0ID0gcmVzdWx0O1xuICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2gocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQW4gaW52YWxpZCByZXN1bHQgd2FzIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvciBjaGFpbi4gRXhwZWN0ZWQgYSBSZXF1ZXN0IG9yIFJlc3BvbnNlIGluc3RhbmNlYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmZldGNoKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG5cbiAgZ2V0KGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuZmV0Y2goaW5wdXQsIGluaXQpO1xuICB9XG5cbiAgcG9zdChpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ1BPU1QnLCBib2R5LCBpbml0KTtcbiAgfVxuXG4gIHB1dChpbnB1dCwgYm9keSwgaW5pdCkge1xuICAgIHJldHVybiB0aGlzLl9mZXRjaChpbnB1dCwgJ1BVVCcsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgcGF0Y2goaW5wdXQsIGJvZHksIGluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmV0Y2goaW5wdXQsICdQQVRDSCcsIGJvZHksIGluaXQpO1xuICB9XG5cbiAgZGVsZXRlKGlucHV0LCBib2R5LCBpbml0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoKGlucHV0LCAnREVMRVRFJywgYm9keSwgaW5pdCk7XG4gIH1cblxuICBfYnVpbGRSZXF1ZXN0KGlucHV0LCBpbml0ID0ge30pIHtcbiAgICBsZXQgZGVmYXVsdHMgPSBwcml2YXRlcyh0aGlzKS5jb25maWcuZGVmYXVsdHMgfHwge307XG4gICAgbGV0IHJlcXVlc3Q7XG4gICAgbGV0IGJvZHkgPSAnJztcbiAgICBsZXQgcmVxdWVzdENvbnRlbnRUeXBlO1xuICAgIGxldCBwYXJzZWREZWZhdWx0SGVhZGVycyA9IHBhcnNlSGVhZGVyVmFsdWVzKGRlZmF1bHRzLmhlYWRlcnMpO1xuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgcmVxdWVzdCA9IGlucHV0O1xuICAgICAgcmVxdWVzdENvbnRlbnRUeXBlID0gbmV3IEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKS5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gaW5pdC5ib2R5O1xuICAgICAgbGV0IGJvZHlPYmogPSBib2R5ID8geyBib2R5IH0gOiBudWxsO1xuICAgICAgbGV0IHJlcXVlc3RJbml0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHsgaGVhZGVyczoge30gfSwgaW5pdCwgYm9keU9iaik7XG4gICAgICByZXF1ZXN0Q29udGVudFR5cGUgPSBuZXcgSGVhZGVycyhyZXF1ZXN0SW5pdC5oZWFkZXJzKS5nZXQoJ0NvbnRlbnQtVHlwZScpO1xuICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGdldFJlcXVlc3RVcmwocHJpdmF0ZXModGhpcykuY29uZmlnLmJhc2VVcmwsIGlucHV0KSwgcmVxdWVzdEluaXQpO1xuICAgIH1cbiAgICBpZiAoIXJlcXVlc3RDb250ZW50VHlwZSkge1xuICAgICAgaWYgKG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIG5ldyBIZWFkZXJzKHBhcnNlZERlZmF1bHRIZWFkZXJzKS5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgICAgIH0gZWxzZSBpZiAoYm9keSAmJiBpc0pTT04oU3RyaW5nKGJvZHkpKSkge1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXREZWZhdWx0SGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMsIHBhcnNlZERlZmF1bHRIZWFkZXJzKTtcbiAgICBpZiAoYm9keSAmJiBib2R5IGluc3RhbmNlb2YgQmxvYiAmJiBib2R5LnR5cGUpIHtcbiAgICAgIC8vIHdvcmsgYXJvdW5kIGJ1ZyBpbiBJRSAmIEVkZ2Ugd2hlcmUgdGhlIEJsb2IgdHlwZSBpcyBpZ25vcmVkIGluIHRoZSByZXF1ZXN0XG4gICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzIxMzYxNjNcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsIGJvZHkudHlwZSk7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9XG5cbiAgX3Byb2Nlc3NSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICByZXR1cm4gYXBwbHlJbnRlcmNlcHRvcnMocmVxdWVzdCwgcHJpdmF0ZXModGhpcykuY29uZmlnLmludGVyY2VwdG9ycywgJ3JlcXVlc3QnLCAncmVxdWVzdEVycm9yJyk7XG4gIH1cblxuICBfcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGFwcGx5SW50ZXJjZXB0b3JzKHJlc3BvbnNlLCBwcml2YXRlcyh0aGlzKS5jb25maWcuaW50ZXJjZXB0b3JzLCAncmVzcG9uc2UnLCAncmVzcG9uc2VFcnJvcicpO1xuICB9XG5cbiAgX2ZldGNoKGlucHV0LCBtZXRob2QsIGJvZHksIGluaXQpIHtcbiAgICBpZiAoIWluaXQpIHtcbiAgICAgIGluaXQgPSB7fTtcbiAgICB9XG4gICAgaW5pdC5tZXRob2QgPSBtZXRob2Q7XG4gICAgaWYgKGJvZHkpIHtcbiAgICAgIGluaXQuYm9keSA9IGJvZHk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZldGNoKGlucHV0LCBpbml0KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoY29uZmlndXJlID0gZGVmYXVsdENvbmZpZykgPT4ge1xuICBpZiAodHlwZS51bmRlZmluZWQoZmV0Y2gpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWlyZXMgRmV0Y2ggQVBJIGltcGxlbWVudGF0aW9uLCBidXQgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgZG9lc24ndCBzdXBwb3J0IGl0LlwiKTtcbiAgfVxuICBjb25zdCBjb25maWcgPSBuZXcgQ29uZmlndXJhdG9yKCk7XG4gIGNvbmZpZ3VyZShjb25maWcpO1xuICByZXR1cm4gbmV3IEh0dHBDbGllbnQoY29uZmlnKTtcbn07XG5cbmZ1bmN0aW9uIGFwcGx5SW50ZXJjZXB0b3JzKFxuICBpbnB1dCxcbiAgaW50ZXJjZXB0b3JzID0gW10sXG4gIHN1Y2Nlc3NOYW1lLFxuICBlcnJvck5hbWVcbikge1xuICByZXR1cm4gaW50ZXJjZXB0b3JzLnJlZHVjZSgoY2hhaW4sIGludGVyY2VwdG9yKSA9PiB7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGNvbnN0IHN1Y2Nlc3NIYW5kbGVyID0gaW50ZXJjZXB0b3Jbc3VjY2Vzc05hbWVdO1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSBpbnRlcmNlcHRvcltlcnJvck5hbWVdO1xuICAgIHJldHVybiBjaGFpbi50aGVuKFxuICAgICAgKHN1Y2Nlc3NIYW5kbGVyICYmIHN1Y2Nlc3NIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCBpZGVudGl0eSxcbiAgICAgIChlcnJvckhhbmRsZXIgJiYgZXJyb3JIYW5kbGVyLmJpbmQoaW50ZXJjZXB0b3IpKSB8fCB0aHJvd2VyXG4gICAgKTtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKGlucHV0KSk7XG59XG5cbmZ1bmN0aW9uIHJlamVjdE9uRXJyb3IocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgIHRocm93IHJlc3BvbnNlO1xuICB9XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gdGhyb3dlcih4KSB7XG4gIHRocm93IHg7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyVmFsdWVzKGhlYWRlcnMpIHtcbiAgbGV0IHBhcnNlZEhlYWRlcnMgPSB7fTtcbiAgZm9yIChsZXQgbmFtZSBpbiBoZWFkZXJzIHx8IHt9KSB7XG4gICAgaWYgKGhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIHBhcnNlZEhlYWRlcnNbbmFtZV0gPSB0eXBlLmZ1bmN0aW9uKGhlYWRlcnNbbmFtZV0pID8gaGVhZGVyc1tuYW1lXSgpIDogaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnNlZEhlYWRlcnM7XG59XG5cbmNvbnN0IGFic29sdXRlVXJsUmVnZXhwID0gL14oW2Etel1bYS16MC05K1xcLS5dKjopP1xcL1xcLy9pO1xuXG5mdW5jdGlvbiBnZXRSZXF1ZXN0VXJsKGJhc2VVcmwsIHVybCkge1xuICBpZiAoYWJzb2x1dGVVcmxSZWdleHAudGVzdCh1cmwpKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHJldHVybiAoYmFzZVVybCB8fCAnJykgKyB1cmw7XG59XG5cbmZ1bmN0aW9uIHNldERlZmF1bHRIZWFkZXJzKGhlYWRlcnMsIGRlZmF1bHRIZWFkZXJzKSB7XG4gIGZvciAobGV0IG5hbWUgaW4gZGVmYXVsdEhlYWRlcnMgfHwge30pIHtcbiAgICBpZiAoZGVmYXVsdEhlYWRlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgJiYgIWhlYWRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICBoZWFkZXJzLnNldChuYW1lLCBkZWZhdWx0SGVhZGVyc1tuYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSlNPTihzdHIpIHtcbiAgdHJ5IHtcbiAgICBKU09OLnBhcnNlKHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0Q29uZmlnKGNvbmZpZykge1xuICBjb25maWcudXNlU3RhbmRhcmRDb25maWd1cmF0b3IoKTtcbn1cbiIsImltcG9ydCBjcmVhdGVIdHRwQ2xpZW50IGZyb20gJy4uL2xpYi9odHRwLWNsaWVudC5qcyc7XG5cbmRlc2NyaWJlKCdodHRwLWNsaWVudCcsICgpID0+IHtcblx0aXQoJ2FibGUgdG8gbWFrZSBhIEdFVCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLmdldCgnL2h0dHAtY2xpZW50LWdldC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmZvbykudG8uZXF1YWwoJzEnKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSlcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBPU1QgcmVxdWVzdCBmb3IgSlNPTicsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5wb3N0KCcvaHR0cC1jbGllbnQtcG9zdC10ZXN0JywgSlNPTi5zdHJpbmdpZnkoeyB0ZXN0RGF0YTogJzEnIH0pKVxuXHRcdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuXHRcdFx0LnRoZW4oZGF0YSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KGRhdGEuZm9vKS50by5lcXVhbCgnMicpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBVVCByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLnB1dCgnL2h0dHAtY2xpZW50LXB1dC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmNyZWF0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIFBBVENIIHJlcXVlc3QgZm9yIEpTT04nLCBkb25lID0+IHtcblx0XHRjcmVhdGVIdHRwQ2xpZW50KCkucGF0Y2goJy9odHRwLWNsaWVudC1wYXRjaC10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLnVwZGF0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoJ2FibGUgdG8gbWFrZSBhIERFTEVURSByZXF1ZXN0IGZvciBKU09OJywgZG9uZSA9PiB7XG5cdFx0Y3JlYXRlSHR0cENsaWVudCgpLmRlbGV0ZSgnL2h0dHAtY2xpZW50LWRlbGV0ZS10ZXN0Jylcblx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdC50aGVuKGRhdGEgPT4ge1xuXHRcdFx0XHRjaGFpLmV4cGVjdChkYXRhLmRlbGV0ZWQpLnRvLmVxdWFsKHRydWUpO1xuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9KTtcblx0fSk7XG5cblx0aXQoXCJhYmxlIHRvIG1ha2UgYSBHRVQgcmVxdWVzdCBmb3IgYSBURVhUXCIsIGRvbmUgPT4ge1xuXHRcdGNyZWF0ZUh0dHBDbGllbnQoKS5nZXQoJy9odHRwLWNsaWVudC1yZXNwb25zZS1ub3QtanNvbicpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG5cdFx0XHQudGhlbihyZXNwb25zZSA9PiB7XG5cdFx0XHRcdGNoYWkuZXhwZWN0KHJlc3BvbnNlKS50by5lcXVhbCgnbm90IGpzb24nKTtcblx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXG59KTtcbiIsIi8qICAqL1xuXG5sZXQgcHJldlRpbWVJZCA9IDA7XG5sZXQgcHJldlVuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgKHByZWZpeCkgPT4ge1xuICBsZXQgbmV3VW5pcXVlSWQgPSBEYXRlLm5vdygpO1xuICBpZiAobmV3VW5pcXVlSWQgPT09IHByZXZUaW1lSWQpIHtcbiAgICArK3ByZXZVbmlxdWVJZDtcbiAgfSBlbHNlIHtcbiAgICBwcmV2VGltZUlkID0gbmV3VW5pcXVlSWQ7XG4gICAgcHJldlVuaXF1ZUlkID0gMDtcbiAgfVxuXG4gIGxldCB1bmlxdWVJZCA9IGAke1N0cmluZyhuZXdVbmlxdWVJZCl9JHtTdHJpbmcocHJldlVuaXF1ZUlkKX1gO1xuICBpZiAocHJlZml4KSB7XG4gICAgdW5pcXVlSWQgPSBgJHtwcmVmaXh9XyR7dW5pcXVlSWR9YDtcbiAgfVxuICByZXR1cm4gdW5pcXVlSWQ7XG59O1xuIiwiaW1wb3J0IHsgZGdldCwgZHNldCwganNvbkNsb25lIH0gZnJvbSAnLi9vYmplY3QuanMnO1xuaW1wb3J0IGlzIGZyb20gJy4vdHlwZS5qcyc7XG5pbXBvcnQgY3JlYXRlU3RvcmFnZSBmcm9tICcuL2NyZWF0ZS1zdG9yYWdlLmpzJztcbmltcG9ydCB1bmlxdWVJZCBmcm9tICcuL3VuaXF1ZS1pZC5qcyc7XG5cbmNvbnN0IG1vZGVsID0gKGJhc2VDbGFzcyA9IGNsYXNzIHt9KSA9PiB7XG4gIGNvbnN0IHByaXZhdGVzID0gY3JlYXRlU3RvcmFnZSgpO1xuICBsZXQgc3Vic2NyaWJlckNvdW50ID0gMDtcblxuICByZXR1cm4gY2xhc3MgTW9kZWwgZXh0ZW5kcyBiYXNlQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5fc3RhdGVLZXkgPSB1bmlxdWVJZCgnX3N0YXRlJyk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3NldFN0YXRlKHRoaXMuZGVmYXVsdFN0YXRlKTtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdFN0YXRlKCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGdldChhY2Nlc3Nvcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFN0YXRlKGFjY2Vzc29yKTtcbiAgICB9XG5cbiAgICBzZXQoYXJnMSwgYXJnMikge1xuICAgICAgLy9zdXBwb3J0cyAoYWNjZXNzb3IsIHN0YXRlKSBPUiAoc3RhdGUpIGFyZ3VtZW50cyBmb3Igc2V0dGluZyB0aGUgd2hvbGUgdGhpbmdcbiAgICAgIGxldCBhY2Nlc3NvciwgdmFsdWU7XG4gICAgICBpZiAoIWlzLnN0cmluZyhhcmcxKSAmJiBpcy51bmRlZmluZWQoYXJnMikpIHtcbiAgICAgICAgdmFsdWUgPSBhcmcxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBhcmcyO1xuICAgICAgICBhY2Nlc3NvciA9IGFyZzE7XG4gICAgICB9XG4gICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLl9nZXRTdGF0ZSgpO1xuICAgICAgbGV0IG5ld1N0YXRlID0ganNvbkNsb25lKG9sZFN0YXRlKTtcblxuICAgICAgaWYgKGFjY2Vzc29yKSB7XG4gICAgICAgIGRzZXQobmV3U3RhdGUsIGFjY2Vzc29yLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdTdGF0ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoYWNjZXNzb3IsIG5ld1N0YXRlLCBvbGRTdGF0ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjcmVhdGVTdWJzY3JpYmVyKCkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHN1YnNjcmliZXJDb3VudCsrO1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvbjogZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIHNlbGYuX3N1YnNjcmliZShjb250ZXh0LCAuLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgLy9UT0RPOiBpcyBvZmYoKSBuZWVkZWQgZm9yIGluZGl2aWR1YWwgc3Vic2NyaXB0aW9uP1xuICAgICAgICBkZXN0cm95OiB0aGlzLl9kZXN0cm95U3Vic2NyaWJlci5iaW5kKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIHtcbiAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZVByb3BlcnR5QmluZGVyKGNvbnRleHQpIC0gY29udGV4dCBtdXN0IGJlIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhZGRCaW5kaW5nczogZnVuY3Rpb24oYmluZFJ1bGVzKSB7XG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGJpbmRSdWxlc1swXSkpIHtcbiAgICAgICAgICAgIGJpbmRSdWxlcyA9IFtiaW5kUnVsZXNdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBiaW5kUnVsZXMuZm9yRWFjaChiaW5kUnVsZSA9PiB7XG4gICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmUoY29udGV4dCwgYmluZFJ1bGVbMF0sIHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgZHNldChjb250ZXh0LCBiaW5kUnVsZVsxXSwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IHRoaXMuX2Rlc3Ryb3lTdWJzY3JpYmVyLmJpbmQodGhpcywgY29udGV4dClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgX2dldFN0YXRlKGFjY2Vzc29yKSB7XG4gICAgICByZXR1cm4ganNvbkNsb25lKGFjY2Vzc29yID8gZGdldChwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0sIGFjY2Vzc29yKSA6IHByaXZhdGVzW3RoaXMuX3N0YXRlS2V5XSk7XG4gICAgfVxuXG4gICAgX3NldFN0YXRlKG5ld1N0YXRlKSB7XG4gICAgICBwcml2YXRlc1t0aGlzLl9zdGF0ZUtleV0gPSBuZXdTdGF0ZTtcbiAgICB9XG5cbiAgICBfc3Vic2NyaWJlKGNvbnRleHQsIGFjY2Vzc29yLCBjYikge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmliZXJzLmdldChjb250ZXh0KSB8fCBbXTtcbiAgICAgIHN1YnNjcmlwdGlvbnMucHVzaCh7IGFjY2Vzc29yLCBjYiB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzLnNldChjb250ZXh0LCBzdWJzY3JpcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZGVzdHJveVN1YnNjcmliZXIoY29udGV4dCkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMuZGVsZXRlKGNvbnRleHQpO1xuICAgIH1cblxuICAgIF9ub3RpZnlTdWJzY3JpYmVycyhzZXRBY2Nlc3NvciwgbmV3U3RhdGUsIG9sZFN0YXRlKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKGZ1bmN0aW9uKHN1YnNjcmliZXJzKSB7XG4gICAgICAgIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24oeyBhY2Nlc3NvciwgY2IgfSkge1xuICAgICAgICAgIC8vZS5nLiAgc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLmJhci5iYXonXG4gICAgICAgICAgLy9lLmcuICBzYT0nZm9vLmJhci5iYXonLCBhPSdmb28uYmFyLmJhei5ibGF6J1xuICAgICAgICAgIGlmIChhY2Nlc3Nvci5pbmRleE9mKHNldEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgY2IoZGdldChuZXdTdGF0ZSwgYWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBhY2Nlc3NvcikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2UuZy4gc2E9J2Zvby5iYXIuYmF6JywgYT0nZm9vLionXG4gICAgICAgICAgaWYgKGFjY2Vzc29yLmluZGV4T2YoJyonKSA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBkZWVwQWNjZXNzb3IgPSBhY2Nlc3Nvci5yZXBsYWNlKCcuKicsICcnKS5yZXBsYWNlKCcqJywgJycpO1xuICAgICAgICAgICAgaWYgKHNldEFjY2Vzc29yLmluZGV4T2YoZGVlcEFjY2Vzc29yKSA9PT0gMCkge1xuICAgICAgICAgICAgICBjYihkZ2V0KG5ld1N0YXRlLCBkZWVwQWNjZXNzb3IpLCBkZ2V0KG9sZFN0YXRlLCBkZWVwQWNjZXNzb3IpKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgbW9kZWw7XG4iLCJpbXBvcnQgbW9kZWwgZnJvbSAnLi4vbGliL21vZGVsLmpzJztcblxuY2xhc3MgTW9kZWwgZXh0ZW5kcyBtb2RlbCgpIHtcblx0Z2V0IGRlZmF1bHRTdGF0ZSgpIHtcbiAgICByZXR1cm4ge2ZvbzoxfTtcbiAgfVxufVxuXG5kZXNjcmliZShcIk1vZGVsIG1ldGhvZHNcIiwgKCkgPT4ge1xuXG5cdGl0KFwiZGVmYXVsdFN0YXRlIHdvcmtzXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMSk7XG5cdH0pO1xuXG5cdGl0KFwiZ2V0KCkvc2V0KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KCdmb28nLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdmb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwiZGVlcCBnZXQoKS9zZXQoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IDFcblx0XHRcdH1cblx0XHR9KTtcblx0XHRteU1vZGVsLnNldCgnZGVlcE9iajEuZGVlcE9iajInLDIpO1xuICAgIGNoYWkuZXhwZWN0KG15TW9kZWwuZ2V0KCdkZWVwT2JqMS5kZWVwT2JqMicpKS50by5lcXVhbCgyKTtcblx0fSk7XG5cblx0aXQoXCJkZWVwIGdldCgpL3NldCgpIHdpdGggYXJyYXlzIHdvcmtcIiwgKCkgPT4ge1xuXHRcdGxldCBteU1vZGVsID0gbmV3IE1vZGVsKCkuc2V0KHtcblx0XHRcdGRlZXBPYmoxOiB7XG5cdFx0XHRcdGRlZXBPYmoyOiBbXVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJywnZG9nJyk7XG4gICAgY2hhaS5leHBlY3QobXlNb2RlbC5nZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAnKSkudG8uZXF1YWwoJ2RvZycpO1xuXHRcdG15TW9kZWwuc2V0KCdkZWVwT2JqMS5kZWVwT2JqMi4wJyx7Zm9vOjF9KTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMSk7XG5cdFx0bXlNb2RlbC5zZXQoJ2RlZXBPYmoxLmRlZXBPYmoyLjAuZm9vJywyKTtcblx0XHRjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZGVlcE9iajEuZGVlcE9iajIuMC5mb28nKSkudG8uZXF1YWwoMik7XG5cdH0pO1xuXG5cdGl0KFwic3Vic2NyaXB0aW9ucyB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKS5zZXQoe1xuXHRcdFx0ZGVlcE9iajE6IHtcblx0XHRcdFx0ZGVlcE9iajI6IFt7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6ZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOnRydWVcblx0XHRcdFx0fV1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBURVNUX1NFTCA9ICdkZWVwT2JqMS5kZWVwT2JqMi4wLnNlbGVjdGVkJztcblxuXHRcdGNvbnN0IG15TW9kZWxTdWJzY3JpYmVyID0gbXlNb2RlbC5jcmVhdGVTdWJzY3JpYmVyKCk7XG5cdFx0bGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbihURVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsU3Vic2NyaWJlci5vbignZGVlcE9iajEnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0XHRcdG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuXHRcdFx0dGhyb3coJ25vIHN1YnNjcmliZXIgc2hvdWxkIGJlIGNhbGxlZCBmb3IgZGVlcE9iajEnKTtcblx0XHR9KTtcblxuXHRcdG15TW9kZWxTdWJzY3JpYmVyLm9uKCdkZWVwT2JqMS4qJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRudW1DYWxsYmFja3NDYWxsZWQrKztcblx0XHRcdGNoYWkuZXhwZWN0KG5ld1ZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbCh0cnVlKTtcblx0XHRcdGNoYWkuZXhwZWN0KG9sZFZhbHVlLmRlZXBPYmoyWzBdLnNlbGVjdGVkKS50by5lcXVhbChmYWxzZSk7XG5cdFx0fSk7XG5cblx0XHRteU1vZGVsLnNldChURVNUX1NFTCwgdHJ1ZSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdGNoYWkuZXhwZWN0KG51bUNhbGxiYWNrc0NhbGxlZCkudG8uZXF1YWwoMik7XG5cblx0fSk7XG5cblx0aXQoXCJzdWJzY3JpYmVycyBjYW4gYmUgZGVzdHJveWVkXCIsICgpID0+IHtcblx0XHRsZXQgbXlNb2RlbCA9IG5ldyBNb2RlbCgpLnNldCh7XG5cdFx0XHRkZWVwT2JqMToge1xuXHRcdFx0XHRkZWVwT2JqMjogW3tcblx0XHRcdFx0XHRzZWxlY3RlZDpmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6dHJ1ZVxuXHRcdFx0XHR9XVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG15TW9kZWwuVEVTVF9TRUwgPSAnZGVlcE9iajEuZGVlcE9iajIuMC5zZWxlY3RlZCc7XG5cblx0XHRjb25zdCBteU1vZGVsU3Vic2NyaWJlciA9IG15TW9kZWwuY3JlYXRlU3Vic2NyaWJlcigpO1xuXG5cdFx0bXlNb2RlbFN1YnNjcmliZXIub24obXlNb2RlbC5URVNUX1NFTCwgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHR0aHJvdyhuZXcgRXJyb3IoJ3Nob3VsZCBub3QgYmUgb2JzZXJ2ZWQnKSk7XG5cdFx0fSk7XG5cdFx0bXlNb2RlbFN1YnNjcmliZXIuZGVzdHJveSgpO1xuXHRcdG15TW9kZWwuc2V0KG15TW9kZWwuVEVTVF9TRUwsIHRydWUpO1xuXHR9KTtcblxuXHRpdChcInByb3BlcnRpZXMgYm91bmQgZnJvbSBtb2RlbCB0byBjdXN0b20gZWxlbWVudFwiLCAoKSA9PiB7XG5cdFx0bGV0IG15TW9kZWwgPSBuZXcgTW9kZWwoKTtcbiAgICBjaGFpLmV4cGVjdChteU1vZGVsLmdldCgnZm9vJykpLnRvLmVxdWFsKDEpO1xuXG4gICAgbGV0IG15RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Byb3BlcnRpZXMtbWl4aW4tdGVzdCcpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBteU1vZGVsLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAodmFsdWUpID0+IHsgdGhpcy5wcm9wID0gdmFsdWU7IH0pO1xuICAgIG9ic2VydmVyLmRlc3Ryb3koKTtcblxuICAgIGNvbnN0IHByb3BlcnR5QmluZGVyID0gbXlNb2RlbC5jcmVhdGVQcm9wZXJ0eUJpbmRlcihteUVsZW1lbnQpLmFkZEJpbmRpbmdzKFxuICAgICAgWydmb28nLCAncHJvcCddXG4gICAgKTtcblxuICAgIG15TW9kZWwuc2V0KCdmb28nLCAnMycpO1xuICAgIGNoYWkuZXhwZWN0KG15RWxlbWVudC5wcm9wKS50by5lcXVhbCgnMycpO1xuICAgIHByb3BlcnR5QmluZGVyLmRlc3Ryb3koKTtcblx0XHRteU1vZGVsLnNldCgnZm9vJywgJzInKTtcblx0XHRjaGFpLmV4cGVjdChteUVsZW1lbnQucHJvcCkudG8uZXF1YWwoJzMnKTtcblx0fSk7XG5cbn0pO1xuIiwiLyogICovXG5cblxuXG5jb25zdCBldmVudEh1YkZhY3RvcnkgPSAoKSA9PiB7XG4gIGNvbnN0IHN1YnNjcmliZXJzID0gbmV3IE1hcCgpO1xuICBsZXQgc3Vic2NyaWJlckNvdW50ID0gMDtcblxuICAvLyRGbG93Rml4TWVcbiAgcmV0dXJuIHtcbiAgICBwdWJsaXNoOiBmdW5jdGlvbihldmVudCwgLi4uYXJncykge1xuICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChzdWJzY3JpcHRpb25zID0+IHtcbiAgICAgICAgKHN1YnNjcmlwdGlvbnMuZ2V0KGV2ZW50KSB8fCBbXSkuZm9yRWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAgICAgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNyZWF0ZVN1YnNjcmliZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNvbnRleHQgPSBzdWJzY3JpYmVyQ291bnQrKztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICBpZiAoIXN1YnNjcmliZXJzLmhhcyhjb250ZXh0KSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMuc2V0KGNvbnRleHQsIG5ldyBNYXAoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIGNvbnN0IHN1YnNjcmliZXIgPSBzdWJzY3JpYmVycy5nZXQoY29udGV4dCk7XG4gICAgICAgICAgaWYgKCFzdWJzY3JpYmVyLmhhcyhldmVudCkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuc2V0KGV2ZW50LCBbXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXIuZ2V0KGV2ZW50KS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgb2ZmOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vJEZsb3dGaXhNZVxuICAgICAgICAgIHN1YnNjcmliZXJzLmdldChjb250ZXh0KS5kZWxldGUoZXZlbnQpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzdWJzY3JpYmVycy5kZWxldGUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZXZlbnRIdWJGYWN0b3J5O1xuIiwiaW1wb3J0IGV2ZW50SHViRmFjdG9yeSBmcm9tICcuLi9saWIvZXZlbnQtaHViLmpzJztcblxuZGVzY3JpYmUoXCJFdmVudEh1YiBtZXRob2RzXCIsICgpID0+IHtcblxuXHRpdChcImJhc2ljIHB1Yi9zdWIgd29ya3NcIiwgKGRvbmUpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcblx0fSk7XG5cbiAgaXQoXCJtdWx0aXBsZSBzdWJzY3JpYmVycyB3b3JrXCIsICgpID0+IHtcblx0XHRsZXQgbXlFdmVudEh1YiA9IGV2ZW50SHViRmFjdG9yeSgpO1xuICAgIGxldCBudW1DYWxsYmFja3NDYWxsZWQgPSAwO1xuICAgIGxldCBteUV2ZW50SHViU3Vic2NyaWJlciA9IG15RXZlbnRIdWIuY3JlYXRlU3Vic2NyaWJlcigpXG4gICAgICAub24oJ2ZvbycsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCgxKTtcbiAgICAgIH0pXG5cbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIGNoYWkuZXhwZWN0KGRhdGEpLnRvLmVxdWFsKDEpO1xuICAgICAgfSlcblxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJywgMSk7IC8vc2hvdWxkIHRyaWdnZXIgZXZlbnRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDIpO1xuXHR9KTtcblxuICBpdChcIm11bHRpcGxlIHN1YnNjcmlwdGlvbnMgd29ya1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdiYXInLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgY2hhaS5leHBlY3QoZGF0YSkudG8uZXF1YWwoMik7XG4gICAgICB9KVxuXG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2ZvbycsIDEpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgICBteUV2ZW50SHViLnB1Ymxpc2goJ2JhcicsIDIpOyAvL3Nob3VsZCB0cmlnZ2VyIGV2ZW50XG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgyKTtcblx0fSk7XG5cbiAgaXQoXCJkZXN0cm95KCkgd29ya3NcIiwgKCkgPT4ge1xuXHRcdGxldCBteUV2ZW50SHViID0gZXZlbnRIdWJGYWN0b3J5KCk7XG4gICAgbGV0IG51bUNhbGxiYWNrc0NhbGxlZCA9IDA7XG4gICAgbGV0IG15RXZlbnRIdWJTdWJzY3JpYmVyID0gbXlFdmVudEh1Yi5jcmVhdGVTdWJzY3JpYmVyKClcbiAgICAgIC5vbignZm9vJywgKGRhdGEpID0+IHtcbiAgICAgICAgbnVtQ2FsbGJhY2tzQ2FsbGVkKys7XG4gICAgICAgIHRocm93KG5ldyBFcnJvcignZm9vIHNob3VsZCBub3QgZ2V0IGNhbGxlZCBpbiB0aGlzIHRlc3QnKSk7XG4gICAgICB9KVxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnbm90aGluZyBsaXN0ZW5pbmcnLCAyKTsgLy9zaG91bGQgYmUgbm8tb3BcbiAgICBteUV2ZW50SHViU3Vic2NyaWJlci5kZXN0cm95KCk7XG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdmb28nKTsgIC8vc2hvdWxkIGJlIG5vLW9wXG4gICAgY2hhaS5leHBlY3QobnVtQ2FsbGJhY2tzQ2FsbGVkKS50by5lcXVhbCgwKTtcblx0fSk7XG5cbiAgaXQoXCJvZmYoKSB3b3Jrc1wiLCAoKSA9PiB7XG5cdFx0bGV0IG15RXZlbnRIdWIgPSBldmVudEh1YkZhY3RvcnkoKTtcbiAgICBsZXQgbnVtQ2FsbGJhY2tzQ2FsbGVkID0gMDtcbiAgICBsZXQgbXlFdmVudEh1YlN1YnNjcmliZXIgPSBteUV2ZW50SHViLmNyZWF0ZVN1YnNjcmliZXIoKVxuICAgICAgLm9uKCdmb28nLCAoZGF0YSkgPT4ge1xuICAgICAgICBudW1DYWxsYmFja3NDYWxsZWQrKztcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKCdmb28gc2hvdWxkIG5vdCBnZXQgY2FsbGVkIGluIHRoaXMgdGVzdCcpKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2JhcicsIChkYXRhKSA9PiB7XG4gICAgICAgIG51bUNhbGxiYWNrc0NhbGxlZCsrO1xuICAgICAgICBjaGFpLmV4cGVjdChkYXRhKS50by5lcXVhbCh1bmRlZmluZWQpO1xuICAgICAgfSlcbiAgICAgIC5vZmYoJ2ZvbycpXG4gICAgbXlFdmVudEh1Yi5wdWJsaXNoKCdub3RoaW5nIGxpc3RlbmluZycsIDIpOyAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnZm9vJyk7ICAvL3Nob3VsZCBiZSBuby1vcFxuICAgIG15RXZlbnRIdWIucHVibGlzaCgnYmFyJyk7ICAvL3Nob3VsZCBjYWxsZWRcbiAgICBjaGFpLmV4cGVjdChudW1DYWxsYmFja3NDYWxsZWQpLnRvLmVxdWFsKDEpO1xuXHR9KTtcblxuXG59KTtcbiJdLCJuYW1lcyI6WyJ0ZW1wbGF0ZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImltcG9ydE5vZGUiLCJjb250ZW50IiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiY2hpbGRyZW4iLCJjaGlsZE5vZGVzIiwiaSIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwiaHRtbCIsImlubmVySFRNTCIsInRyaW0iLCJmcmFnIiwidGVtcGxhdGVDb250ZW50IiwiZmlyc3RDaGlsZCIsIkVycm9yIiwiZGVzY3JpYmUiLCJpdCIsImVsIiwiZXhwZWN0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJ0byIsImVxdWFsIiwiYXNzZXJ0IiwiaW5zdGFuY2VPZiIsIk5vZGUiLCJvYmoiLCJrZXkiLCJkZWZhdWx0VmFsdWUiLCJ1bmRlZmluZWQiLCJpbmRleE9mIiwicGFydHMiLCJzcGxpdCIsIm9iamVjdCIsInZhbHVlIiwiZGVwdGgiLCJhcnIiLCJmbiIsIkJvb2xlYW4iLCJzb21lIiwiZXZlcnkiLCJkb0FsbEFwaSIsInBhcmFtcyIsImFsbCIsImRvQW55QXBpIiwiYW55IiwidG9TdHJpbmciLCJPYmplY3QiLCJwcm90b3R5cGUiLCJ0eXBlcyIsImxlbiIsInR5cGVDYWNoZSIsInR5cGVSZWdleHAiLCJzZXR1cCIsImdldFR5cGUiLCJzcmMiLCJnZXRTcmNUeXBlIiwidHlwZSIsImNhbGwiLCJtYXRjaGVzIiwibWF0Y2giLCJBcnJheSIsImlzQXJyYXkiLCJ0b0xvd2VyQ2FzZSIsImNoZWNrcyIsImNsb25lIiwiY2lyY3VsYXJzIiwiY2xvbmVzIiwiZnVuY3Rpb24iLCJ0IiwiY2xvbmVUeXBlcyIsImFwcGx5IiwiZnJlZXplIiwiZGF0ZSIsIkRhdGUiLCJnZXRUaW1lIiwicmVnZXhwIiwiUmVnRXhwIiwiYXJyYXkiLCJtYXAiLCJNYXAiLCJmcm9tIiwiZW50cmllcyIsInNldCIsIlNldCIsInZhbHVlcyIsInB1c2giLCJjcmVhdGUiLCJpZHgiLCJmaW5kSW5kZXgiLCJyZXZpdmVyIiwiayIsInYiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJiZSIsIm51bGwiLCJmdW5jIiwiaXNGdW5jdGlvbiIsImpzb25DbG9uZSIsInRocm93Iiwibm90IiwiY2xvbmVkIiwiTnVtYmVyIiwiYSIsImdldEFyZ3VtZW50cyIsImFyZ3VtZW50cyIsImFyZ3MiLCJpcyIsInRydWUiLCJub3RBcmdzIiwiZmFsc2UiLCJub3RBcnJheSIsImJvb2wiLCJib29sZWFuIiwibm90Qm9vbCIsImVycm9yIiwibm90RXJyb3IiLCJub3RGdW5jdGlvbiIsIm5vdE51bGwiLCJudW1iZXIiLCJub3ROdW1iZXIiLCJub3RPYmplY3QiLCJub3RSZWdleHAiLCJzdHJpbmciLCJjcmVhdG9yIiwiYmluZCIsInN0b3JlIiwiV2Vha01hcCIsImdldCIsInByaXZhdGVzIiwiY3JlYXRlU3RvcmFnZSIsIkNvbmZpZ3VyYXRvciIsImJhc2VVcmwiLCJkZWZhdWx0cyIsImludGVyY2VwdG9ycyIsIndpdGhCYXNlVXJsIiwid2l0aERlZmF1bHRzIiwid2l0aEludGVyY2VwdG9yIiwiaW50ZXJjZXB0b3IiLCJ1c2VTdGFuZGFyZENvbmZpZ3VyYXRvciIsInN0YW5kYXJkQ29uZmlnIiwibW9kZSIsImNyZWRlbnRpYWxzIiwiaGVhZGVycyIsIkFjY2VwdCIsImFzc2lnbiIsInJlamVjdEVycm9yUmVzcG9uc2VzIiwicmVzcG9uc2UiLCJyZWplY3RPbkVycm9yIiwiSHR0cENsaWVudCIsImNvbmZpZyIsImFkZEludGVyY2VwdG9yIiwiZmV0Y2giLCJpbnB1dCIsImluaXQiLCJyZXF1ZXN0IiwiX2J1aWxkUmVxdWVzdCIsIl9wcm9jZXNzUmVxdWVzdCIsInRoZW4iLCJyZXN1bHQiLCJSZXNwb25zZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiUmVxdWVzdCIsIl9wcm9jZXNzUmVzcG9uc2UiLCJwb3N0IiwiYm9keSIsIl9mZXRjaCIsInB1dCIsInBhdGNoIiwiZGVsZXRlIiwicmVxdWVzdENvbnRlbnRUeXBlIiwicGFyc2VkRGVmYXVsdEhlYWRlcnMiLCJwYXJzZUhlYWRlclZhbHVlcyIsIkhlYWRlcnMiLCJib2R5T2JqIiwicmVxdWVzdEluaXQiLCJnZXRSZXF1ZXN0VXJsIiwiaGFzIiwiaXNKU09OIiwiU3RyaW5nIiwic2V0RGVmYXVsdEhlYWRlcnMiLCJCbG9iIiwiYXBwbHlJbnRlcmNlcHRvcnMiLCJtZXRob2QiLCJjb25maWd1cmUiLCJkZWZhdWx0Q29uZmlnIiwic3VjY2Vzc05hbWUiLCJlcnJvck5hbWUiLCJyZWR1Y2UiLCJjaGFpbiIsInN1Y2Nlc3NIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwiaWRlbnRpdHkiLCJ0aHJvd2VyIiwib2siLCJ4IiwicGFyc2VkSGVhZGVycyIsIm5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsImFic29sdXRlVXJsUmVnZXhwIiwidXJsIiwidGVzdCIsImRlZmF1bHRIZWFkZXJzIiwic3RyIiwiZXJyIiwiY3JlYXRlSHR0cENsaWVudCIsImpzb24iLCJjaGFpIiwiZGF0YSIsImZvbyIsImRvbmUiLCJ0ZXN0RGF0YSIsImNyZWF0ZWQiLCJ1cGRhdGVkIiwiZGVsZXRlZCIsInRleHQiLCJwcmV2VGltZUlkIiwicHJldlVuaXF1ZUlkIiwicHJlZml4IiwibmV3VW5pcXVlSWQiLCJub3ciLCJ1bmlxdWVJZCIsIm1vZGVsIiwiYmFzZUNsYXNzIiwic3Vic2NyaWJlckNvdW50IiwiX3N0YXRlS2V5IiwiX3N1YnNjcmliZXJzIiwiX3NldFN0YXRlIiwiZGVmYXVsdFN0YXRlIiwiYWNjZXNzb3IiLCJfZ2V0U3RhdGUiLCJhcmcxIiwiYXJnMiIsIm9sZFN0YXRlIiwibmV3U3RhdGUiLCJkc2V0IiwiX25vdGlmeVN1YnNjcmliZXJzIiwiY3JlYXRlU3Vic2NyaWJlciIsImNvbnRleHQiLCJzZWxmIiwib24iLCJfc3Vic2NyaWJlIiwiZGVzdHJveSIsIl9kZXN0cm95U3Vic2NyaWJlciIsImNyZWF0ZVByb3BlcnR5QmluZGVyIiwiYWRkQmluZGluZ3MiLCJiaW5kUnVsZXMiLCJmb3JFYWNoIiwiYmluZFJ1bGUiLCJkZ2V0IiwiY2IiLCJzdWJzY3JpcHRpb25zIiwic2V0QWNjZXNzb3IiLCJzdWJzY3JpYmVycyIsImRlZXBBY2Nlc3NvciIsInJlcGxhY2UiLCJNb2RlbCIsIm15TW9kZWwiLCJkZWVwT2JqMSIsImRlZXBPYmoyIiwic2VsZWN0ZWQiLCJURVNUX1NFTCIsIm15TW9kZWxTdWJzY3JpYmVyIiwibnVtQ2FsbGJhY2tzQ2FsbGVkIiwibmV3VmFsdWUiLCJvbGRWYWx1ZSIsIm15RWxlbWVudCIsIm9ic2VydmVyIiwicHJvcCIsInByb3BlcnR5QmluZGVyIiwiZXZlbnRIdWJGYWN0b3J5IiwicHVibGlzaCIsImV2ZW50IiwiY2FsbGJhY2siLCJzdWJzY3JpYmVyIiwib2ZmIiwibXlFdmVudEh1YiIsIm15RXZlbnRIdWJTdWJzY3JpYmVyIiwibXlFdmVudEh1YlN1YnNjcmliZXIyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7RUFBQTtBQUNBLHlCQUFlLFVBQUNBLFFBQUQsRUFBYztFQUMzQixNQUFJLGFBQWFDLFNBQVNDLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBakIsRUFBcUQ7RUFDbkQsV0FBT0QsU0FBU0UsVUFBVCxDQUFvQkgsU0FBU0ksT0FBN0IsRUFBc0MsSUFBdEMsQ0FBUDtFQUNEOztFQUVELE1BQUlDLFdBQVdKLFNBQVNLLHNCQUFULEVBQWY7RUFDQSxNQUFJQyxXQUFXUCxTQUFTUSxVQUF4QjtFQUNBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRixTQUFTRyxNQUE3QixFQUFxQ0QsR0FBckMsRUFBMEM7RUFDeENKLGFBQVNNLFdBQVQsQ0FBcUJKLFNBQVNFLENBQVQsRUFBWUcsU0FBWixDQUFzQixJQUF0QixDQUFyQjtFQUNEO0VBQ0QsU0FBT1AsUUFBUDtFQUNELENBWEQ7O0VDREE7QUFDQTtBQUVBLHVCQUFlLFVBQUNRLElBQUQsRUFBVTtFQUN2QixNQUFNYixXQUFXQyxTQUFTQyxhQUFULENBQXVCLFVBQXZCLENBQWpCO0VBQ0FGLFdBQVNjLFNBQVQsR0FBcUJELEtBQUtFLElBQUwsRUFBckI7RUFDQSxNQUFNQyxPQUFPQyxnQkFBZ0JqQixRQUFoQixDQUFiO0VBQ0EsTUFBSWdCLFFBQVFBLEtBQUtFLFVBQWpCLEVBQTZCO0VBQzNCLFdBQU9GLEtBQUtFLFVBQVo7RUFDRDtFQUNELFFBQU0sSUFBSUMsS0FBSixrQ0FBeUNOLElBQXpDLENBQU47RUFDRCxDQVJEOztFQ0RBTyxTQUFTLGdCQUFULEVBQTJCLFlBQU07RUFDL0JDLEtBQUcsZ0JBQUgsRUFBcUIsWUFBTTtFQUN6QixRQUFNQyxLQUFLcEIsc0VBQVg7RUFHQXFCLFdBQU9ELEdBQUdFLFNBQUgsQ0FBYUMsUUFBYixDQUFzQixVQUF0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
