/* @flow */
import type IConfigurator from './http-client/configurator.js';
import type RequestInit from './http-client/configurator.js';
import type Interceptor from './http-client/interceptor.js';
import createFetch from './http-client/create-fetch.js';
export type { Interceptor, IConfigurator, RequestInit };

const httpClient: Function = createFetch;

export default httpClient;
