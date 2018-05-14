/* @flow */
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

  +middleware: Array<Function>;

  withBaseUrl(baseUrl: string): IConfigurator;

  withDefaults(defaults: RequestInit): IConfigurator;

  withInterceptor(interceptor: Interceptor): IConfigurator;

  withMiddleware(...middleware: Array<Function>): IConfigurator;

  useStandardConfigurator(): IConfigurator;

  rejectErrorResponses(): IConfigurator;
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

/**
 * A class for configuring HttpClients.
 */
class Configurator implements IConfigurator {
  baseUrl: string;
  defaults: RequestInit;
  interceptors: Interceptor[];
  middleware: Array<Function>;

  constructor() {
    this.baseUrl = '';
    this.defaults = {};
    this.interceptors = [];
    this.middleware = [];
  }

  withBaseUrl(baseUrl: string): Configurator {
    this.baseUrl = baseUrl;
    return this;
  }

  withDefaults(defaults: RequestInit): Configurator {
    this.defaults = defaults;
    return this;
  }

  withInterceptor(interceptor: Interceptor): Configurator {
    this.interceptors.push(interceptor);
    return this;
  }

  withMiddleware(...middleware: Array<Function>): IConfigurator {
    middleware.forEach((fn: Function) => {
      this.middleware.push(fn);
    });
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
    Object.assign(this.defaults, standardConfig, this.defaults);
    return this.rejectErrorResponses();
  }

  rejectErrorResponses(): Configurator {
    return this.withInterceptor({ response: rejectOnError });
  }
}

export default (): IConfigurator => new Configurator();

function rejectOnError(response: Response): Response {
  if (!response.ok) {
    throw response;
  }

  return response;
}
