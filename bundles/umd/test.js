(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

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

  /*  */
  var removeElement = (function (element) {
    if (element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  /*  */

  var createRouter = (function (domEntryPoint) {
    var lastDomEntryPoint = domEntryPoint.cloneNode(true);
    var routes = {};
    var hashEventHandler = null;
    var lastRouteHandler = null;

    var navigate = function navigate() {
      var hashUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      window.location.hash = hashUrl;
    };

    var reload = function reload() {
      return handleRouting();
    };

    var otherwise = function otherwise(routeHandler) {
      routes['*'] = routeHandler;
    };

    var addRoute = function addRoute(hashUrl, routeHandler, data) {
      routes[hashUrl] = routeHandler;
      routes[hashUrl].data = data;
      return { start: start, reload: reload, addRoute: addRoute, otherwise: otherwise, navigate: navigate };
    };

    var initializeDomElement = function initializeDomElement() {
      if (!domEntryPoint.parentElement) {
        return;
      }

      var domClone = lastDomEntryPoint.cloneNode(true);
      if (domEntryPoint && domEntryPoint.parentElement) {
        domEntryPoint.parentElement.insertBefore(domClone, domEntryPoint);
      }

      removeElement(domEntryPoint);
      domEntryPoint = domClone;
    };

    var disposeLastRoute = function disposeLastRoute() {
      if (lastRouteHandler && !is.undefined(lastRouteHandler.dispose)) {
        lastRouteHandler.dispose(domEntryPoint);
      }
    };

    var handleRouting = function handleRouting() {
      var defaultRouteIdentifier = '*';
      var currentHash = location.hash.slice(1);

      var maybeMatchingRouteIdentifier = findMatchingRouteIdentifier(currentHash, Object.keys(routes));
      var routeParams = {};
      if (maybeMatchingRouteIdentifier) {
        routeParams = extractRouteParams(maybeMatchingRouteIdentifier, currentHash);
      }

      var routeHandler = Object.keys(routes).indexOf(maybeMatchingRouteIdentifier) > -1 ? routes[maybeMatchingRouteIdentifier] : routes[defaultRouteIdentifier];

      if (routeHandler) {
        disposeLastRoute();
        lastRouteHandler = routeHandler;
        initializeDomElement();
        routeHandler(domEntryPoint, routeParams, routeHandler.data);
      }
    };

    var start = function start() {
      hashEventHandler = listenEvent(window, 'hashchange', handleRouting);
    };

    if (hashEventHandler) {
      hashEventHandler.remove();
    }

    return { start: start, addRoute: addRoute, otherwise: otherwise, navigate: navigate, reload: reload };
  });

  function parseRouteParamToCorrectType(paramValue) {
    if (!isNaN(paramValue)) {
      return parseInt(paramValue, 10);
    }
    if (paramValue === 'true' || paramValue === 'false') {
      return JSON.parse(paramValue);
    }
    return paramValue;
  }

  function extractRouteParams(routeIdentifier, currentHash) {
    var splittedHash = currentHash.split('/');
    var splittedRouteIdentifier = routeIdentifier.split('/');

    return splittedRouteIdentifier.map(function (routeIdentifierToken, index) {
      if (routeIdentifierToken.indexOf(':', 0) === -1) {
        return null;
      }
      var routeParam = {};
      var key = routeIdentifierToken.substr(1, routeIdentifierToken.length - 1);
      routeParam[key] = splittedHash[index];
      return routeParam;
    }).filter(function (p) {
      return p !== null;
    }).reduce(function (acc, curr) {
      if (curr) {
        Object.keys(curr).forEach(function (key) {
          // $FlowFixMe
          acc[key] = parseRouteParamToCorrectType(curr[key]);
        });
      }
      return acc;
    }, {});
  }

  function findMatchingRouteIdentifier(currentHash, routeKeys) {
    var splittedHash = currentHash.split('/');
    var firstHashToken = splittedHash[0];

    return routeKeys.filter(function (routeKey) {
      var splittedRouteKey = routeKey.split('/');
      var staticRouteTokensAreEqual = splittedRouteKey.map(function (routeToken, i) {
        if (routeToken.indexOf(':', 0) !== -1) {
          return true;
        }
        return routeToken === splittedHash[i];
      }).reduce(function (countInvalid, currentValidationState) {
        if (currentValidationState === false) {
          ++countInvalid;
        }
        return countInvalid;
      }, 0) === 0;

      return routeKey.indexOf(firstHashToken, 0) !== -1 && staticRouteTokensAreEqual && splittedHash.length === splittedRouteKey.length;
    })[0];
  }

  window.onerror = function (err) {
  	lastError = err;
  };

  var simulateHashChange = function simulateHashChange(hash) {
  	window.location.hash = hash;
  	window.dispatchEvent(new Event('hashchange'));
  };

  describe('router', function () {
  	var domEntryPoint = void 0;

  	before(function () {
  		domEntryPoint = document.createElement('main');
  		domEntryPoint.setAttribute('id', 'app');
  		document.body.appendChild(domEntryPoint);
  	});

  	beforeEach(function () {
  		domEntryPoint.innerHTML = '';
  	});

  	afterEach(function () {
  	});

  	it('create / start router', function () {
  		var router = createRouter(domEntryPoint);
  		router.addRoute('', function () {});
  		router.start();
  		simulateHashChange('');
  	});
  });

  //import './dom.js';
  // import './web-components.js';
  // import './object.js';
  // import './type.js';
  // import './http.js';

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2FycmF5L2FueS5qcyIsIi4uLy4uL2xpYi9hcnJheS9hbGwuanMiLCIuLi8uLi9saWIvYXJyYXkuanMiLCIuLi8uLi9saWIvdHlwZS5qcyIsIi4uLy4uL2xpYi9kb20tZXZlbnRzL2xpc3Rlbi1ldmVudC5qcyIsIi4uLy4uL2xpYi9kb20vcmVtb3ZlLWVsZW1lbnQuanMiLCIuLi8uLi9saWIvZG9tL3JvdXRlci5qcyIsIi4uLy4uL3Rlc3QvZG9tL3JvdXRlci5qcyIsIi4uLy4uL3Rlc3QvdGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogICovXG5leHBvcnQgZGVmYXVsdCAoYXJyLCBmbiA9IEJvb2xlYW4pID0+IGFyci5zb21lKGZuKTtcbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGFyciwgZm4gPSBCb29sZWFuKSA9PiBhcnIuZXZlcnkoZm4pO1xuIiwiLyogICovXG5leHBvcnQgeyBkZWZhdWx0IGFzIGFueSB9IGZyb20gJy4vYXJyYXkvYW55LmpzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYWxsIH0gZnJvbSAnLi9hcnJheS9hbGwuanMnO1xuIiwiLyogICovXG5pbXBvcnQgeyBhbGwsIGFueSB9IGZyb20gJy4vYXJyYXkuanMnO1xuXG5cblxuXG5jb25zdCBkb0FsbEFwaSA9IChmbikgPT4gKC4uLnBhcmFtcykgPT4gYWxsKHBhcmFtcywgZm4pO1xuY29uc3QgZG9BbnlBcGkgPSAoZm4pID0+ICguLi5wYXJhbXMpID0+IGFueShwYXJhbXMsIGZuKTtcbmNvbnN0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmNvbnN0IHR5cGVzID0gW1xuICAnTWFwJyxcbiAgJ1NldCcsXG4gICdTeW1ib2wnLFxuICAnQXJyYXknLFxuICAnT2JqZWN0JyxcbiAgJ1N0cmluZycsXG4gICdEYXRlJyxcbiAgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsXG4gICdCb29sZWFuJyxcbiAgJ051bWJlcicsXG4gICdOdWxsJyxcbiAgJ1VuZGVmaW5lZCcsXG4gICdBcmd1bWVudHMnLFxuICAnRXJyb3InLFxuICAnUmVxdWVzdCcsXG4gICdSZXNwb25zZScsXG4gICdIZWFkZXJzJyxcbiAgJ0Jsb2InXG5dO1xuY29uc3QgbGVuID0gdHlwZXMubGVuZ3RoO1xuY29uc3QgdHlwZUNhY2hlID0ge307XG5jb25zdCB0eXBlUmVnZXhwID0gL1xccyhbYS16QS1aXSspLztcblxuZXhwb3J0IGRlZmF1bHQgKHNldHVwKCkpO1xuXG5leHBvcnQgY29uc3QgZ2V0VHlwZSA9IChzcmMpID0+IGdldFNyY1R5cGUoc3JjKTtcblxuZnVuY3Rpb24gZ2V0U3JjVHlwZShzcmMpIHtcbiAgbGV0IHR5cGUgPSB0b1N0cmluZy5jYWxsKHNyYyk7XG4gIGlmICghdHlwZUNhY2hlW3R5cGVdKSB7XG4gICAgbGV0IG1hdGNoZXMgPSB0eXBlLm1hdGNoKHR5cGVSZWdleHApO1xuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGNoZXMpICYmIG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNhY2hlW3R5cGVdID0gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHlwZUNhY2hlW3R5cGVdO1xufVxuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgbGV0IGNoZWNrcyA9IHt9O1xuICBmb3IgKGxldCBpID0gbGVuOyBpLS07ICkge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXS50b0xvd2VyQ2FzZSgpO1xuICAgIGNoZWNrc1t0eXBlXSA9IHNyYyA9PiBnZXRTcmNUeXBlKHNyYykgPT09IHR5cGU7XG4gICAgY2hlY2tzW3R5cGVdLmFsbCA9IGRvQWxsQXBpKGNoZWNrc1t0eXBlXSk7XG4gICAgY2hlY2tzW3R5cGVdLmFueSA9IGRvQW55QXBpKGNoZWNrc1t0eXBlXSk7XG4gIH1cbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsIi8qICAqL1xuXG5leHBvcnQgZGVmYXVsdCAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSA9IGZhbHNlKSA9PiB7XG4gIHJldHVybiBwYXJzZSh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn07XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSA9ICgpID0+IHt9O1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIGV2ZW50IGVtaXR0ZXInKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICBpZiAodHlwZS5pbmRleE9mKCcsJykgPiAtMSkge1xuICAgIGxldCBldmVudHMgPSB0eXBlLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICBsZXQgaGFuZGxlcyA9IGV2ZW50cy5tYXAoZnVuY3Rpb24odHlwZSkge1xuICAgICAgcmV0dXJuIGFkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlID0gKCkgPT4ge307XG4gICAgICAgIGxldCBoYW5kbGU7XG4gICAgICAgIHdoaWxlICgoaGFuZGxlID0gaGFuZGxlcy5wb3AoKSkpIHtcbiAgICAgICAgICBoYW5kbGUucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKTtcbn1cbiIsIi8qICAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQpID0+IHtcbiAgaWYgKGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgfVxufTtcbiIsIi8qICAqL1xuaW1wb3J0IGlzIGZyb20gJy4uL3R5cGUuanMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBsaXN0ZW5FdmVudCB9IGZyb20gJy4uL2RvbS1ldmVudHMvbGlzdGVuLWV2ZW50LmpzJztcbmltcG9ydCByZW1vdmVFbGVtZW50IGZyb20gJy4vcmVtb3ZlLWVsZW1lbnQuanMnO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgKGRvbUVudHJ5UG9pbnQpID0+IHtcbiAgY29uc3QgbGFzdERvbUVudHJ5UG9pbnQgPSBkb21FbnRyeVBvaW50LmNsb25lTm9kZSh0cnVlKTtcbiAgbGV0IHJvdXRlcyA9IHt9O1xuICBsZXQgaGFzaEV2ZW50SGFuZGxlciA9IG51bGw7XG4gIGxldCBsYXN0Um91dGVIYW5kbGVyID0gbnVsbDtcblxuICBjb25zdCBuYXZpZ2F0ZSA9IChoYXNoVXJsID0gJycpID0+IHtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGhhc2hVcmw7XG4gIH07XG5cbiAgY29uc3QgcmVsb2FkID0gKCkgPT4gaGFuZGxlUm91dGluZygpO1xuXG4gIGNvbnN0IG90aGVyd2lzZSA9IChyb3V0ZUhhbmRsZXIpID0+IHtcbiAgICByb3V0ZXNbJyonXSA9IHJvdXRlSGFuZGxlcjtcbiAgfTtcblxuICBjb25zdCBhZGRSb3V0ZSA9IChoYXNoVXJsLCByb3V0ZUhhbmRsZXIsIGRhdGEpID0+IHtcbiAgICByb3V0ZXNbaGFzaFVybF0gPSByb3V0ZUhhbmRsZXI7XG4gICAgcm91dGVzW2hhc2hVcmxdLmRhdGEgPSBkYXRhO1xuICAgIHJldHVybiB7IHN0YXJ0LCByZWxvYWQsIGFkZFJvdXRlLCBvdGhlcndpc2UsIG5hdmlnYXRlIH07XG4gIH07XG5cbiAgY29uc3QgaW5pdGlhbGl6ZURvbUVsZW1lbnQgPSAoKSA9PiB7XG4gICAgaWYgKCFkb21FbnRyeVBvaW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkb21DbG9uZSA9IGxhc3REb21FbnRyeVBvaW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBpZiAoZG9tRW50cnlQb2ludCAmJiBkb21FbnRyeVBvaW50LnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIGRvbUVudHJ5UG9pbnQucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZG9tQ2xvbmUsIGRvbUVudHJ5UG9pbnQpO1xuICAgIH1cblxuICAgIHJlbW92ZUVsZW1lbnQoZG9tRW50cnlQb2ludCk7XG4gICAgZG9tRW50cnlQb2ludCA9IGRvbUNsb25lO1xuICB9O1xuXG4gIGNvbnN0IGRpc3Bvc2VMYXN0Um91dGUgPSAoKSA9PiB7XG4gICAgaWYgKGxhc3RSb3V0ZUhhbmRsZXIgJiYgIWlzLnVuZGVmaW5lZChsYXN0Um91dGVIYW5kbGVyLmRpc3Bvc2UpKSB7XG4gICAgICBsYXN0Um91dGVIYW5kbGVyLmRpc3Bvc2UoZG9tRW50cnlQb2ludCk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVJvdXRpbmcgPSAoKSA9PiB7XG4gICAgY29uc3QgZGVmYXVsdFJvdXRlSWRlbnRpZmllciA9ICcqJztcbiAgICBjb25zdCBjdXJyZW50SGFzaCA9IGxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XG5cbiAgICBjb25zdCBtYXliZU1hdGNoaW5nUm91dGVJZGVudGlmaWVyID0gZmluZE1hdGNoaW5nUm91dGVJZGVudGlmaWVyKGN1cnJlbnRIYXNoLCBPYmplY3Qua2V5cyhyb3V0ZXMpKTtcbiAgICBsZXQgcm91dGVQYXJhbXMgPSB7fTtcbiAgICBpZiAobWF5YmVNYXRjaGluZ1JvdXRlSWRlbnRpZmllcikge1xuICAgICAgcm91dGVQYXJhbXMgPSBleHRyYWN0Um91dGVQYXJhbXMobWF5YmVNYXRjaGluZ1JvdXRlSWRlbnRpZmllciwgY3VycmVudEhhc2gpO1xuICAgIH1cblxuICAgIGNvbnN0IHJvdXRlSGFuZGxlciA9XG4gICAgICBPYmplY3Qua2V5cyhyb3V0ZXMpLmluZGV4T2YobWF5YmVNYXRjaGluZ1JvdXRlSWRlbnRpZmllcikgPiAtMVxuICAgICAgICA/IHJvdXRlc1ttYXliZU1hdGNoaW5nUm91dGVJZGVudGlmaWVyXVxuICAgICAgICA6IHJvdXRlc1tkZWZhdWx0Um91dGVJZGVudGlmaWVyXTtcblxuICAgIGlmIChyb3V0ZUhhbmRsZXIpIHtcbiAgICAgIGRpc3Bvc2VMYXN0Um91dGUoKTtcbiAgICAgIGxhc3RSb3V0ZUhhbmRsZXIgPSByb3V0ZUhhbmRsZXI7XG4gICAgICBpbml0aWFsaXplRG9tRWxlbWVudCgpO1xuICAgICAgcm91dGVIYW5kbGVyKGRvbUVudHJ5UG9pbnQsIHJvdXRlUGFyYW1zLCByb3V0ZUhhbmRsZXIuZGF0YSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHN0YXJ0ID0gKCkgPT4ge1xuICAgIGhhc2hFdmVudEhhbmRsZXIgPSBsaXN0ZW5FdmVudCh3aW5kb3csICdoYXNoY2hhbmdlJywgaGFuZGxlUm91dGluZyk7XG4gIH07XG5cbiAgaWYgKGhhc2hFdmVudEhhbmRsZXIpIHtcbiAgICBoYXNoRXZlbnRIYW5kbGVyLnJlbW92ZSgpO1xuICB9XG5cbiAgcmV0dXJuIHsgc3RhcnQsIGFkZFJvdXRlLCBvdGhlcndpc2UsIG5hdmlnYXRlLCByZWxvYWQgfTtcbn07XG5cbmZ1bmN0aW9uIHBhcnNlUm91dGVQYXJhbVRvQ29ycmVjdFR5cGUocGFyYW1WYWx1ZSkge1xuICBpZiAoIWlzTmFOKHBhcmFtVmFsdWUpKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHBhcmFtVmFsdWUsIDEwKTtcbiAgfVxuICBpZiAocGFyYW1WYWx1ZSA9PT0gJ3RydWUnIHx8IHBhcmFtVmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShwYXJhbVZhbHVlKTtcbiAgfVxuICByZXR1cm4gcGFyYW1WYWx1ZTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFJvdXRlUGFyYW1zKHJvdXRlSWRlbnRpZmllciwgY3VycmVudEhhc2gpIHtcbiAgY29uc3Qgc3BsaXR0ZWRIYXNoID0gY3VycmVudEhhc2guc3BsaXQoJy8nKTtcbiAgY29uc3Qgc3BsaXR0ZWRSb3V0ZUlkZW50aWZpZXIgPSByb3V0ZUlkZW50aWZpZXIuc3BsaXQoJy8nKTtcblxuICByZXR1cm4gc3BsaXR0ZWRSb3V0ZUlkZW50aWZpZXJcbiAgICAubWFwKChyb3V0ZUlkZW50aWZpZXJUb2tlbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChyb3V0ZUlkZW50aWZpZXJUb2tlbi5pbmRleE9mKCc6JywgMCkgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3Qgcm91dGVQYXJhbSA9IHt9O1xuICAgICAgY29uc3Qga2V5ID0gcm91dGVJZGVudGlmaWVyVG9rZW4uc3Vic3RyKDEsIHJvdXRlSWRlbnRpZmllclRva2VuLmxlbmd0aCAtIDEpO1xuICAgICAgcm91dGVQYXJhbVtrZXldID0gc3BsaXR0ZWRIYXNoW2luZGV4XTtcbiAgICAgIHJldHVybiByb3V0ZVBhcmFtO1xuICAgIH0pXG4gICAgLmZpbHRlcihwID0+IHAgIT09IG51bGwpXG4gICAgLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICBpZiAoY3Vycikge1xuICAgICAgICBPYmplY3Qua2V5cyhjdXJyKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIGFjY1trZXldID0gcGFyc2VSb3V0ZVBhcmFtVG9Db3JyZWN0VHlwZShjdXJyW2tleV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdSb3V0ZUlkZW50aWZpZXIoY3VycmVudEhhc2gsIHJvdXRlS2V5cykge1xuICBjb25zdCBzcGxpdHRlZEhhc2ggPSBjdXJyZW50SGFzaC5zcGxpdCgnLycpO1xuICBjb25zdCBmaXJzdEhhc2hUb2tlbiA9IHNwbGl0dGVkSGFzaFswXTtcblxuICByZXR1cm4gcm91dGVLZXlzLmZpbHRlcihyb3V0ZUtleSA9PiB7XG4gICAgY29uc3Qgc3BsaXR0ZWRSb3V0ZUtleSA9IHJvdXRlS2V5LnNwbGl0KCcvJyk7XG4gICAgY29uc3Qgc3RhdGljUm91dGVUb2tlbnNBcmVFcXVhbCA9XG4gICAgICBzcGxpdHRlZFJvdXRlS2V5XG4gICAgICAgIC5tYXAoKHJvdXRlVG9rZW4sIGkpID0+IHtcbiAgICAgICAgICBpZiAocm91dGVUb2tlbi5pbmRleE9mKCc6JywgMCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJvdXRlVG9rZW4gPT09IHNwbGl0dGVkSGFzaFtpXTtcbiAgICAgICAgfSlcbiAgICAgICAgLnJlZHVjZSgoY291bnRJbnZhbGlkLCBjdXJyZW50VmFsaWRhdGlvblN0YXRlKSA9PiB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRWYWxpZGF0aW9uU3RhdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICArK2NvdW50SW52YWxpZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNvdW50SW52YWxpZDtcbiAgICAgICAgfSwgMCkgPT09IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgcm91dGVLZXkuaW5kZXhPZihmaXJzdEhhc2hUb2tlbiwgMCkgIT09IC0xICYmXG4gICAgICBzdGF0aWNSb3V0ZVRva2Vuc0FyZUVxdWFsICYmXG4gICAgICBzcGxpdHRlZEhhc2gubGVuZ3RoID09PSBzcGxpdHRlZFJvdXRlS2V5Lmxlbmd0aFxuICAgICk7XG4gIH0pWzBdO1xufVxuIiwiaW1wb3J0IGNyZWF0ZVJvdXRlciBmcm9tICcuLi8uLi9saWIvZG9tL3JvdXRlci5qcyc7XG5cbndpbmRvdy5vbmVycm9yID0gZXJyID0+IHtcblx0bGFzdEVycm9yID0gZXJyO1xufTtcblxuY29uc3Qgc2ltdWxhdGVIYXNoQ2hhbmdlID0gaGFzaCA9PiB7XG5cdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcblx0d2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdoYXNoY2hhbmdlJykpO1xufTtcblxuZGVzY3JpYmUoJ3JvdXRlcicsICgpID0+IHtcblx0bGV0IGRvbUVudHJ5UG9pbnQ7XG5cdGxldCBsYXN0RXJyb3I7XG5cblx0YmVmb3JlKCgpID0+IHtcblx0XHRkb21FbnRyeVBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbWFpbicpO1xuXHRcdGRvbUVudHJ5UG9pbnQuc2V0QXR0cmlidXRlKCdpZCcsICdhcHAnKTtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvbUVudHJ5UG9pbnQpO1xuXHR9KTtcblxuXHRiZWZvcmVFYWNoKCgpID0+IHtcblx0XHRkb21FbnRyeVBvaW50LmlubmVySFRNTCA9ICcnO1xuXHR9KTtcblxuXHRhZnRlckVhY2goKCkgPT4ge1xuXHRcdGxhc3RFcnJvciA9IHVuZGVmaW5lZDtcblx0fSk7XG5cblx0aXQoJ2NyZWF0ZSAvIHN0YXJ0IHJvdXRlcicsICgpID0+IHtcblx0XHRjb25zdCByb3V0ZXIgPSBjcmVhdGVSb3V0ZXIoZG9tRW50cnlQb2ludCk7XG5cdFx0cm91dGVyLmFkZFJvdXRlKCcnLCAoKSA9PiB7XG5cdFx0fSk7XG5cdFx0cm91dGVyLnN0YXJ0KCk7XG5cdFx0c2ltdWxhdGVIYXNoQ2hhbmdlKCcnKTtcblx0fSk7XG59KTtcbiIsImltcG9ydCAnLi9kb20vcm91dGVyLmpzJztcbi8vaW1wb3J0ICcuL2RvbS5qcyc7XG4vLyBpbXBvcnQgJy4vd2ViLWNvbXBvbmVudHMuanMnO1xuLy8gaW1wb3J0ICcuL29iamVjdC5qcyc7XG4vLyBpbXBvcnQgJy4vdHlwZS5qcyc7XG4vLyBpbXBvcnQgJy4vaHR0cC5qcyc7XG4iXSwibmFtZXMiOlsiYXJyIiwiZm4iLCJCb29sZWFuIiwic29tZSIsImV2ZXJ5IiwiZG9BbGxBcGkiLCJwYXJhbXMiLCJhbGwiLCJkb0FueUFwaSIsImFueSIsInRvU3RyaW5nIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidHlwZXMiLCJsZW4iLCJsZW5ndGgiLCJ0eXBlQ2FjaGUiLCJ0eXBlUmVnZXhwIiwic2V0dXAiLCJnZXRTcmNUeXBlIiwic3JjIiwidHlwZSIsImNhbGwiLCJtYXRjaGVzIiwibWF0Y2giLCJBcnJheSIsImlzQXJyYXkiLCJ0b0xvd2VyQ2FzZSIsImNoZWNrcyIsImkiLCJ0YXJnZXQiLCJsaXN0ZW5lciIsImNhcHR1cmUiLCJwYXJzZSIsImFkZExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJFcnJvciIsImluZGV4T2YiLCJldmVudHMiLCJzcGxpdCIsImhhbmRsZXMiLCJtYXAiLCJoYW5kbGUiLCJwb3AiLCJlbGVtZW50IiwicGFyZW50RWxlbWVudCIsInJlbW92ZUNoaWxkIiwiZG9tRW50cnlQb2ludCIsImxhc3REb21FbnRyeVBvaW50IiwiY2xvbmVOb2RlIiwicm91dGVzIiwiaGFzaEV2ZW50SGFuZGxlciIsImxhc3RSb3V0ZUhhbmRsZXIiLCJuYXZpZ2F0ZSIsImhhc2hVcmwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJyZWxvYWQiLCJoYW5kbGVSb3V0aW5nIiwib3RoZXJ3aXNlIiwicm91dGVIYW5kbGVyIiwiYWRkUm91dGUiLCJkYXRhIiwic3RhcnQiLCJpbml0aWFsaXplRG9tRWxlbWVudCIsImRvbUNsb25lIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlRWxlbWVudCIsImRpc3Bvc2VMYXN0Um91dGUiLCJpcyIsInVuZGVmaW5lZCIsImRpc3Bvc2UiLCJkZWZhdWx0Um91dGVJZGVudGlmaWVyIiwiY3VycmVudEhhc2giLCJzbGljZSIsIm1heWJlTWF0Y2hpbmdSb3V0ZUlkZW50aWZpZXIiLCJmaW5kTWF0Y2hpbmdSb3V0ZUlkZW50aWZpZXIiLCJrZXlzIiwicm91dGVQYXJhbXMiLCJleHRyYWN0Um91dGVQYXJhbXMiLCJsaXN0ZW5FdmVudCIsInBhcnNlUm91dGVQYXJhbVRvQ29ycmVjdFR5cGUiLCJwYXJhbVZhbHVlIiwiaXNOYU4iLCJwYXJzZUludCIsIkpTT04iLCJyb3V0ZUlkZW50aWZpZXIiLCJzcGxpdHRlZEhhc2giLCJzcGxpdHRlZFJvdXRlSWRlbnRpZmllciIsInJvdXRlSWRlbnRpZmllclRva2VuIiwiaW5kZXgiLCJyb3V0ZVBhcmFtIiwia2V5Iiwic3Vic3RyIiwiZmlsdGVyIiwicCIsInJlZHVjZSIsImFjYyIsImN1cnIiLCJmb3JFYWNoIiwicm91dGVLZXlzIiwiZmlyc3RIYXNoVG9rZW4iLCJzcGxpdHRlZFJvdXRlS2V5Iiwicm91dGVLZXkiLCJzdGF0aWNSb3V0ZVRva2Vuc0FyZUVxdWFsIiwicm91dGVUb2tlbiIsImNvdW50SW52YWxpZCIsImN1cnJlbnRWYWxpZGF0aW9uU3RhdGUiLCJvbmVycm9yIiwibGFzdEVycm9yIiwiZXJyIiwic2ltdWxhdGVIYXNoQ2hhbmdlIiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50IiwiZGVzY3JpYmUiLCJiZWZvcmUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGUiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJiZWZvcmVFYWNoIiwiaW5uZXJIVE1MIiwiYWZ0ZXJFYWNoIiwiaXQiLCJyb3V0ZXIiLCJjcmVhdGVSb3V0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBO0FBQ0EsYUFBZSxVQUFDQSxHQUFEO0VBQUEsTUFBTUMsRUFBTix1RUFBV0MsT0FBWDtFQUFBLFNBQXVCRixJQUFJRyxJQUFKLENBQVNGLEVBQVQsQ0FBdkI7RUFBQSxDQUFmOztFQ0RBO0FBQ0EsYUFBZSxVQUFDRCxHQUFEO0VBQUEsTUFBTUMsRUFBTix1RUFBV0MsT0FBWDtFQUFBLFNBQXVCRixJQUFJSSxLQUFKLENBQVVI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
