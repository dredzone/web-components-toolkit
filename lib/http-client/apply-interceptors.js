/*  */

export default (
  input,
  interceptors = [],
  successName,
  errorName
) =>
  interceptors.reduce((chain, interceptor) => {
    const successHandler = interceptor[successName];
    const errorHandler = interceptor[errorName];
    return chain.then(
      (successHandler && successHandler.bind(interceptor)) || identity,
      (errorHandler && errorHandler.bind(interceptor)) || thrower
    );
  }, Promise.resolve(input));

function identity(x) {
  return x;
}

function thrower(x) {
  throw x;
}
