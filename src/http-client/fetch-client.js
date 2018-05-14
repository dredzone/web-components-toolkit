/* @flow */
import createStorage from '../create-storage.js';
import type { Interceptor, RequestInit, IConfigurator } from './configurator.js';
import { buildRequest, processRequest, processResponse } from './request.js';

export interface IFetch {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;

  addInterceptor(interceptor: Interceptor): void;
}

const privates: Function = createStorage();

export class FetchClient implements IFetch {
  constructor(config: IConfigurator) {
    privates(this).config = config;
  }

  addInterceptor(interceptor: Interceptor): void {
    privates(this).config.withInterceptor(interceptor);
  }

  fetch(input: Request | string, init: RequestInit = {}): Promise<Response> {
    let request: Request = buildRequest(input, init, privates(this).config);

    return processRequest(request, privates(this).config.interceptors)
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
        return processResponse(response, privates(this).config.interceptors);
      })
      .then((result: Request | Response) => {
        if (result instanceof Request) {
          return this.fetch(result);
        }
        return result;
      });
  }
}
