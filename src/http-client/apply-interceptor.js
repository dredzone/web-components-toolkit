/* @flow */
import type Interceptor from './configurator.js';

export default (
  input: Request | Response | Promise<Request | Response>,
  interceptors: Array<Interceptor> = [],
  successName: string,
  errorName: string,
  ...interceptorArgs: Array<any>
): Promise<any> =>
  interceptors.reduce((chain: Promise<any>, interceptor: Interceptor) => {
    // $FlowFixMe
    const successHandler: Function = interceptor[successName] && interceptor[successName].bind(interceptor);
    // $FlowFixMe
    const errorHandler: Function = interceptor[errorName] && interceptor[errorName].bind(interceptor);

    return chain.then(
      (successHandler && (value => successHandler(value, ...interceptorArgs))) || identity,
      (errorHandler && (reason => errorHandler(reason, ...interceptorArgs))) || thrower
    );
  }, Promise.resolve(input));

function identity(x: any): any {
  return x;
}

function thrower(x: any): any {
  throw x;
}
