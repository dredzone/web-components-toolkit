/* @flow */
export interface Interceptor {
  /**
   * The current number of active requests.
   * Requests being processed by interceptors are considered active.
   */
  request?: (
    request: Request
  ) => Request | Response | Promise<Request | Response>;

  requestError?: (
    error: any
  ) => Request | Response | Promise<Request | Response>;

  /**
   * Called with the response after it is received. Response interceptors can modify
   * and return the Response, or create a new one to be returned to the caller.
   *
   * @param response The response.
   * @returns The response; or a Promise for one.
   */
  response?: (
    response: Response,
    request?: Request
  ) => Response | Promise<Response>;

  /**
   * Handles fetch errors and errors generated by previous interceptors. This
   * function acts as a Promise rejection handler. It may rethrow the error
   * to propagate the failure, or return a new Response to recover.
   *
   * @param error The rejection value from the fetch request or from a
   * previous interceptor.
   * @returns The response; or a Promise for one.
   */
  responseError?: (
    error: any,
    request?: Request
  ) => Response | Promise<Response>;
}

type InType = Request | Response | Promise<Request | Response>;

export default (
  input: InType,
  interceptors: Array<Interceptor> = [],
  successName: string,
  errorName: string,
  ...interceptorArgs: Array<any>
): Promise<any> =>
  interceptors.reduce((chain: Promise<any>, interceptor: Interceptor) => {
    // $FlowFixMe
    const successHandler: Function =
      interceptor[successName] && interceptor[successName].bind(interceptor);
    // $FlowFixMe
    const errorHandler: Function =
      interceptor[errorName] && interceptor[errorName].bind(interceptor);

    return chain.then(
      (successHandler &&
        (value => successHandler(value, ...interceptorArgs))) ||
        identity,
      (errorHandler && (reason => errorHandler(reason, ...interceptorArgs))) ||
        thrower
    );
  }, Promise.resolve(input));

function identity(x: any): any {
  return x;
}

function thrower(x: any): any {
  throw x;
}
