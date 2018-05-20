/* @flow */
import createStorage from './create-storage.js';
import type from './type.js';

export interface Interceptor {
  request?: (request: Request) => Request | Response | Promise<Request | Response>;

  requestError?: (error: any) => Request | Response | Promise<Request | Response>;

  response?: (response: Response, request?: Request) => Response | Promise<Response>;

  responseError?: (error: any, request?: Request) => Response | Promise<Response>;
}

export interface IConfigurator {
  +baseUrl: string;

  +defaults: RequestInit;

  +interceptors: Interceptor[];

  withBaseUrl(baseUrl: string): IConfigurator;

  withDefaults(defaults: RequestInit): IConfigurator;

  withInterceptor(interceptor: Interceptor): IConfigurator;

  useStandardConfigurator(): IConfigurator;

  rejectErrorResponses(): IConfigurator;
}

export interface IHttpClient {
  constructor(config: IConfigurator): void;

  fetch(input: Request | string, init?: RequestInit): Promise<Response>;

  get(input: Request | string, init?: RequestInit): Promise<Response>;

  post(input: Request | string, body?: any, init?: RequestInit): Promise<Response>;

  put(input: Request | string, body?: any, init?: RequestInit): Promise<Response>;

  patch(input: Request | string, body?: any, init?: RequestInit): Promise<Response>;

  addInterceptor(interceptor: Interceptor): void;
}

/**
 * The init object used to initialize a fetch Request.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 */
export type RequestInit = Object & {
  method?: string,

  headers?: Headers | Object,

  body?: Blob | FormData | URLSearchParams | string,

  mode?: string,

  credentials?: string,

  cache?: string,

  redirect?: string,

  referrer?: string,

  integrity?: string
};

const privates: Function = createStorage();

/**
 * A class for configuring HttpClients.
 */
export class Configurator implements IConfigurator {
  get baseUrl(): string {
    return privates(this).baseUrl;
  }

  get defaults(): RequestInit {
    return Object.freeze(privates(this).defaults);
  }

  get interceptors(): Array<Interceptor> {
    return privates(this).interceptors;
  }

  constructor() {
    privates(this).baseUrl = '';
    privates(this).interceptors = [];
  }

  withBaseUrl(baseUrl: string): Configurator {
    privates(this).baseUrl = baseUrl;
    return this;
  }

  withDefaults(defaults: RequestInit): Configurator {
    privates(this).defaults = defaults;
    return this;
  }

  withInterceptor(interceptor: Interceptor): Configurator {
    privates(this).interceptors.push(interceptor);
    return this;
  }

  useStandardConfigurator(): Configurator {
    let standardConfig: RequestInit = {
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Requested-By': 'DEEP-UI'
      }
    };
    privates(this).defaults = Object.assign({}, standardConfig);
    return this.rejectErrorResponses();
  }

  rejectErrorResponses(): Configurator {
    return this.withInterceptor({ response: rejectOnError });
  }
}

export class HttpClient implements IHttpClient {
  constructor(config: IConfigurator) {
    privates(this).config = config;
  }

  addInterceptor(interceptor: Interceptor): void {
    privates(this).config.withInterceptor(interceptor);
  }

  fetch(input: Request | string, init: RequestInit = {}): Promise<Response> {
    let request: Request = this._buildRequest(input, init);

    return this._processRequest(request)
      .then((result: Request | Response) => {
        let response: Promise<Response>;

        if (result instanceof Response) {
          response = Promise.resolve(result);
        } else if (result instanceof Request) {
          request = result;
          response = fetch(result);
        } else {
          throw new Error(
            `An invalid result was returned by the interceptor chain. Expected a Request or Response instance`
          );
        }
        return this._processResponse(response);
      })
      .then((result: Request | Response) => {
        if (result instanceof Request) {
          return this.fetch(result);
        }
        return result;
      });
  }

  get(input: Request | string, init?: RequestInit): Promise<Response> {
    return this.fetch(input, init);
  }

  post(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return this._fetch(input, 'POST', body, init);
  }

  put(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return this._fetch(input, 'PUT', body, init);
  }

  patch(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return this._fetch(input, 'PATCH', body, init);
  }

  delete(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return this._fetch(input, 'DELETE', body, init);
  }

  _buildRequest(input: Request | string, init: RequestInit = {}): Request {
    let defaults: RequestInit = privates(this).config.defaults || {};
    let request: Request;
    let body: Blob | FormData | URLSearchParams | string = '';
    let requestContentType: string;
    let parsedDefaultHeaders: Object = parseHeaderValues(defaults.headers);

    if (input instanceof Request) {
      request = input;
      requestContentType = new Headers(request.headers).get('Content-Type');
    } else {
      body = init.body;
      let bodyObj: Object | null = body ? { body } : null;
      let requestInit: RequestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
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
  }

  _processRequest(request: Request | Promise<Request>): Promise<any> {
    return applyInterceptors(request, privates(this).config.interceptors, 'request', 'requestError');
  }

  _processResponse(response: Response | Promise<Response>): Promise<any> {
    return applyInterceptors(response, privates(this).config.interceptors, 'response', 'responseError');
  }

  _fetch(input: Request | string, method: string, body?: any, init?: RequestInit) {
    if (!init) {
      init = {};
    }
    init.method = method;
    if (body) {
      init.body = body;
    }
    return this.fetch(input, init);
  }
}

export default (configure: (configurator: IConfigurator) => void = defaultConfig): IHttpClient => {
  if (type.undefined(fetch)) {
    throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
  }
  const config: IConfigurator = new Configurator();
  configure(config);
  return new HttpClient(config);
};

function applyInterceptors(
  input: Request | Response | Promise<Request | Response>,
  interceptors: Array<Interceptor> = [],
  successName: string,
  errorName: string
): Promise<any> {
  return interceptors.reduce((chain: Promise<any>, interceptor: Interceptor) => {
    // $FlowFixMe
    const successHandler: Function = interceptor[successName];
    // $FlowFixMe
    const errorHandler: Function = interceptor[errorName];
    return chain.then(
      (successHandler && successHandler.bind(interceptor)) || identity,
      (errorHandler && errorHandler.bind(interceptor)) || thrower
    );
  }, Promise.resolve(input));
}

function rejectOnError(response: Response): Response {
  if (!response.ok) {
    throw response;
  }
  return response;
}

function identity(x: any): any {
  return x;
}

function thrower(x: any): any {
  throw x;
}

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

function defaultConfig(config: IConfigurator): void {
  config.useStandardConfigurator();
}
