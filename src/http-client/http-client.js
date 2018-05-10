/* @flow */

// Note: for now not restricting this to browser usage due to it potentially
// being used with an npm package like https://www.npmjs.com/package/node-fetch

import useFetch from './use-fetch.js';
import clone, { jsonClone } from '../object/clone.js';

export type THttpClientOptions = {
  mode?: string,
  data?: {},
  headers?: {},
  credentials?: 'include' | 'same-origin' | 'omit',
  returnRequestAndResponse?: boolean,
  [key: string]: any
};

export type THttpClient = {
  get(customRunOptions: THttpClientOptions): Promise<any>,
  post(customRunOptions: THttpClientOptions): Promise<any>,
  put(customRunOptions: THttpClientOptions): Promise<any>,
  patch(customRunOptions: THttpClientOptions): Promise<any>,
  delete(customRunOptions: THttpClientOptions): Promise<any>,
  options(customRunOptions: THttpClientOptions): THttpClientOptions,
  addRequestStep(customRunOptions: THttpClientOptions): THttpClient,
  addResponseStep(customRunOptions: THttpClientOptions): THttpClient
};

const defaultOptions: THttpClientOptions = {
  mode: 'cors',
  data: undefined,
  headers: {
    'X-Requested-By': 'DEEP-UI',
    'Content-Type': 'application/json'
  },
  credentials: 'same-origin', //'include',
  returnRequestAndResponse: false
};

const httpClientFactory = function(
  customInstanceOptions: THttpClientOptions = {}
) {
  const instanceOptions = Object.assign(
    {},
    defaultOptions,
    customInstanceOptions
  );
  const requestSteps = [];
  const responseSteps = [];

  function run(method, customRunOptions = {}) {
    let request: THttpClientOptions = Object.assign(
      {},
      instanceOptions,
      customRunOptions,
      {
        method: method
      }
    );

    let response = undefined;

    let promise: Promise<any> = Promise.resolve({
      request,
      response
    });

    requestSteps.forEach(function({ promiseMethod, callback, rejectCallback }) {
      // $FlowFixMe
      if (!promise[promiseMethod]) {
        throw new Error(
          `http-client: requestStep promise method is not valid: ${promiseMethod}`
        );
      }
      // $FlowFixMe
      promise = promise[promiseMethod](function(arg) {
        if (stepArgumentIsNormalized(arg)) {
          request = clone(arg.request);
          response = jsonClone(arg.response);
        } else {
          request = clone(arg);
        }
        return callback({
          request: clone(request),
          response: jsonClone(response)
        });
      }, rejectCallback);
    });

    //extract final request object
    promise = promise.then(function(arg) {
      if (stepArgumentIsNormalized(arg)) {
        request = clone(arg.request);
        response = jsonClone(arg.response);
      } else {
        request = clone(arg);
      }
      return {
        request: clone(request),
        response: jsonClone(response)
      };
    });

    responseSteps.forEach(function({
      promiseMethod,
      callback,
      rejectCallback
    }) {
      // $FlowFixMe
      if (!promise[promiseMethod]) {
        throw new Error(
          `http-client: responseStep method is not valid: ${promiseMethod}`
        );
      }
      // $FlowFixMe
      promise = promise[promiseMethod](function(arg) {
        if (stepArgumentIsNormalized(arg)) {
          response = jsonClone(arg.response);
        } else {
          response = jsonClone(arg);
        }
        return callback({
          request: clone(request),
          response: jsonClone(response)
        });
      }, rejectCallback);
    });

    // one more step to extract final response and determine shape of data to return
    promise = promise.then(function(arg) {
      if (stepArgumentIsNormalized(arg)) {
        response = jsonClone(arg.response);
      } else {
        response = jsonClone(arg);
      }

      if (request.returnRequestAndResponse) {
        return {
          request,
          response
        };
      }
      return response;
    });

    return promise;
  } //end doFetch()

  const httpClient: THttpClient = {
    get: run.bind(this, 'GET'),
    post: run.bind(this, 'POST'),
    put: run.bind(this, 'PUT'),
    patch: run.bind(this, 'PATCH'),
    delete: run.bind(this, 'DELETE'),
    options: (newOptions = {}) => {
      return clone(Object.assign(instanceOptions, newOptions));
    },
    addRequestStep: function() {
      requestSteps.push(normalizeAddStepArguments(arguments));
      return this;
    },
    addResponseStep: function() {
      responseSteps.push(normalizeAddStepArguments(arguments));
      return this;
    }
  };

  return useFetch(httpClient);
};

export default httpClientFactory;

export const getBodyFromReq = function(req: THttpClientOptions) {
  if (req.data) {
    return JSON.stringify(req.data);
  } else if (req.body) {
    return req.body;
  }
  return '';
};

function normalizeAddStepArguments(args) {
  let promiseMethod;
  let callback;
  let rejectCallback;
  if (typeof args[0] === 'string') {
    [promiseMethod, callback, rejectCallback] = args;
  } else {
    promiseMethod = 'then';
    [callback, rejectCallback] = args;
  }
  if (
    (promiseMethod !== 'then' && promiseMethod !== 'catch') ||
    typeof callback !== 'function'
  ) {
    throw new Error(
      'http-client: bad arguments passed to add(Request/Response)Step'
    );
  }
  return {
    promiseMethod,
    callback,
    rejectCallback
  };
}

function stepArgumentIsNormalized(arg) {
  return (
    typeof arg === 'object' &&
    Object.keys(arg).length === 2 &&
    arg.hasOwnProperty('request') &&
    arg.hasOwnProperty('response')
  );
}
