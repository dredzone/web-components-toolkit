/* @flow */
import type from '../type.js';
import {
  type RequestInit,
  type IConfigurator,
  default as createConfig
} from './configurator.js';
import buildRequest from './build-request.js';
import applyInterceptors from './interceptor.js';

export interface IFetch {
  (input: Request | string, init?: RequestInit): Promise<Response>;
}

export default (configure: (configurator: IConfigurator) => void): IFetch => {
  if (type.undefined(fetch)) {
    throw new Error(
      "Requires Fetch API implementation, but the current environment doesn't support it."
    );
  }
  const config: IConfigurator = createConfig();
  configure(config);

  const fetchApi: Function = (
    input: Request | string,
    init: RequestInit = {}
  ): Promise<Response> => {
    let request: Request = buildRequest(input, init, config);

    return processRequest(request, config)
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

        return processResponse(response, request, config);
      })
      .then(result => {
        if (result instanceof Request) {
          return fetchApi(result);
        }
        return result;
      });
  };

  return fetchApi;
};

function processRequest(
  request: Request | Promise<Request>,
  config: IConfigurator
): Promise<any> {
  return applyInterceptors(
    request,
    config.interceptors,
    'request',
    'requestError',
    config
  );
}

function processResponse(
  response: Response | Promise<Response>,
  request: Request,
  config: IConfigurator
): Promise<any> {
  return applyInterceptors(
    response,
    config.interceptors,
    'response',
    'responseError',
    request,
    config
  );
}
