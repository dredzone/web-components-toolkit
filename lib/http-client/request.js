/*  */
import type from '../type.js';
import { } from './configurator.js';
import applyInterceptors from './apply-interceptor.js';

export const buildRequest = (input, init = {}, config) => {
  let defaults = config.defaults || {};
  let request;
  let body = '';
  let requestContentType;

  let parsedDefaultHeaders = parseHeaderValues(defaults.headers);
  if (input instanceof Request) {
    request = input;
    requestContentType = new Headers(request.headers).get('Content-Type');
  } else {
    body = init.body;
    let bodyObj = body ? { body } : null;
    let requestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
    requestContentType = new Headers(requestInit.headers).get('Content-Type');
    request = new Request(getRequestUrl(config.baseUrl, input), requestInit);
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

export const processRequest = (
    request,
    config
) => applyInterceptors(request, config.interceptors, 'request', 'requestError');

export const processResponse = (
  response,
  config
) => applyInterceptors(response, config.interceptors, 'response', 'responseError');

function parseHeaderValues(headers) {
  let parsedHeaders = {};
  for (let name in headers || {}) {
    if (headers.hasOwnProperty(name)) {
      // $FlowFixMe
      parsedHeaders[name] = type.function(headers[name]) ? headers[name]() : headers[name];
    }
  }
  return parsedHeaders;
}
const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

function getRequestUrl(baseUrl, url) {
  if (absoluteUrlRegexp.test(url)) {
    return url;
  }

  return (baseUrl || '') + url;
}

function setDefaultHeaders(headers, defaultHeaders) {
  for (let name in defaultHeaders || {}) {
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
