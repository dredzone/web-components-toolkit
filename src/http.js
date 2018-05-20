/* @flow */
import createStorage from './create-storage.js';
import clone from './object/clone.js';

export type HttpRequestOptions = RequestOptions & {
  [key: string]: any
};

export type HttpResponse = Response & {
  [key: string]: any
};

export type HttpError = Error & {
  status: number,
  response: HttpResponse,
  text?: string,
  json?: any
};

export type FetchLike = (url: string, opts: HttpRequestOptions) => Promise<HttpResponse>;

export type HttpMiddleware = (next: FetchLike) => FetchLike;

export type Middleware = (options?: { [key: string]: any }) => HttpMiddleware;

export type ResponseChain = {};

export type HttpConfig = {
  url: string,
  options: HttpRequestOptions,
  catchers: Map<number | string, (error: HttpError, originalRequest: IHttp) => void>,
  resolvers: Array<(resolver: ResponseChain, originalRequest: IHttp) => any>,
  middleware: Array<HttpMiddleware>
};

export interface IHttp {
  constructor(config: HttpConfig): void;

  url(url: string, replace: boolean): IHttp;
}

export default (url: string = '', options: HttpRequestOptions = {}): IHttp =>
  new Http({ url, options, catchers: new Map(), resolvers: [], middleware: [] });

const privates: Function = createStorage();

class Http implements IHttp {
  constructor(config: HttpConfig) {
    privates(this).config = config;
  }

  url(url: string, replace: boolean = false): IHttp {
    const config: HttpConfig = clone(privates(this).config);
    config.url = replace ? url : config.url + url;
    return new Http(config);
  }
}
