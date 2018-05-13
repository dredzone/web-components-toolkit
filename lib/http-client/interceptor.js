/*  */


export default (
  input,
  interceptors = [],
  successName,
  errorName,
  ...interceptorArgs
) =>
  interceptors.reduce((chain, interceptor) => {
    // $FlowFixMe
    const successHandler = interceptor[successName] && interceptor[successName].bind(interceptor);
    // $FlowFixMe
    const errorHandler = interceptor[errorName] && interceptor[errorName].bind(interceptor);

    return chain.then(
      (successHandler && (value => successHandler(value, ...interceptorArgs))) || identity,
      (errorHandler && (reason => errorHandler(reason, ...interceptorArgs))) || thrower
    );
  }, Promise.resolve(input));

function identity(x) {
  return x;
}

function thrower(x) {
  throw x;
}
