/* @flow */
import type from '../type.js';
import { type RequestInit, type IConfigurator } from './configurator.js';
import applyInterceptors from './apply-interceptor.js';

export const buildRequest: Function = (input: Request | string, init: RequestInit, config: IConfigurator): Request => {
  let defaults: RequestInit = config.defaults || {};
  let request: Request;
  let body: Blob | FormData | URLSearchParams | string = '';
  let requestContentType: string;

  let parsedDefaultHeaders = parseHeaderValues(defaults.headers);
  if (input instanceof Request) {
    request = input;
    requestContentType = new Headers(request.headers).get('Content-Type');
  } else {
    init || (init = {});
    body = init.body;
    let bodyObj: Object | null = body ? { body } : null;
    let requestInit: RequestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
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

export const processRequest: Function = (request: Request | Promise<Request>, config: IConfigurator): Promise<any> =>
  applyInterceptors(request, config.interceptors, 'request', 'requestError', config);

export const processResponse: Function = (
  response: Response | Promise<Response>,
  request: Request,
  config: IConfigurator
): Promise<any> => applyInterceptors(response, config.interceptors, 'response', 'responseError', request, config);

function parseHeaderValues(headers: Headers | Object): Object {
  let parsedHeaders: Object = {};
  for (let name in headers || {}) {
    if (headers.hasOwnProperty(name)) {
      // $FlowFixMe
      parsedHeaders[name] = type.function(headers[name]) ? headers[name]() : headers[name];
    }
  }
  return parsedHeaders;
}
const absoluteUrlRegexp: RegExp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

function getRequestUrl(baseUrl: string, url: string): string {
  if (absoluteUrlRegexp.test(url)) {
    return url;
  }

  return (baseUrl || '') + url;
}

function setDefaultHeaders(headers: Headers, defaultHeaders: Object): void {
  for (let name in defaultHeaders || {}) {
    if (defaultHeaders.hasOwnProperty(name) && !headers.has(name)) {
      headers.set(name, defaultHeaders[name]);
    }
  }
}

function isJSON(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (err) {
    return false;
  }

  return true;
}
