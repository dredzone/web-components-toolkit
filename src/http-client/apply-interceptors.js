/* @flow */
import type Interceptor from './configurator.js';

export default (
  input: Request | Response | Promise<Request | Response>,
  interceptors: Array<Interceptor> = [],
  successName: string,
  errorName: string
): Promise<any> =>
  interceptors.reduce((chain: Promise<any>, interceptor: Interceptor) => {
    const successHandler: Function = interceptor[successName];
    const errorHandler: Function = interceptor[errorName];
    return chain.then(
      (successHandler && successHandler.bind(interceptor)) || identity,
      (errorHandler && errorHandler.bind(interceptor)) || thrower
    );
  }, Promise.resolve(input));

function identity(x: any): any {
  return x;
}

function thrower(x: any): any {
  throw x;
}
