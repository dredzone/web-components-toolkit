/* @flow */
import type { IConfigurator, RequestInit, Interceptor } from './http-client/configurator.js';
import createFetch from './http-client/fetch.js';
export type { Interceptor, IConfigurator, RequestInit };
export { default as jsonResponseMiddleware } from './http-client/middleware/json-response.js';

export default createFetch;
