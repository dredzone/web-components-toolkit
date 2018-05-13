/* @flow */
import type IConfigurator from './http-client/configurator.js';
import type RequestInit from './http-client/configurator.js';
import type Interceptor from './http-client/interceptor.js';
import factory from './http-client/client-factory.js';
export type { Interceptor, IConfigurator, RequestInit };

export default factory;
