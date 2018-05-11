/*  */
import { getBodyFromReq } from './http-client.js';

const useFetch = function(httpClient) {
  return httpClient.addResponseStep(function({ request, response }) {
    if (typeof response !== 'undefined') {
      return response;
    }
    let fetchOptions = {
      method: request.method,
      mode: request.mode,
      credentials: request.credentials,
      headers: request.headers
    };

    let body = getBodyFromReq(request);
    if (body) {
      fetchOptions.body = body;
    }

    if (!request.url) {
      throw new Error(`http-client: url option is not set`);
    }

    // $FlowFixMe
    return fetch(request.url, fetchOptions)
      .then(response => {
        if (!response.ok) throw response;
        return response.text();
      })
      .then(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          return response;
        }
      });
  });
};

export default useFetch;
