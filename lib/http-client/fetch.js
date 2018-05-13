/*  */
import type from '../type.js';
import { default as createConfig } from './configurator.js';
import { buildRequest, processRequest, processResponse } from './request.js';


export default (configure) => {
  if (type.undefined(fetch)) {
    throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
  }
  const config = createConfig();
  configure(config);

  const fetchApi = (input, init = {}) => {
    let request = buildRequest(input, init, config);

    return processRequest(request, config)
      .then((result) => {
        let response;

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

        return processResponse(response, config);
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
