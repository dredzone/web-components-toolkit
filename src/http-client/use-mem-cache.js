/* @flow */
import type { THttpClient } from './http-client.js';
import { getBodyFromReq } from './http-client.js';
import { jsonClone } from '../object/clone';

const memCache = {};

const useMemCache = function(httpClient: THttpClient) {
  useSaveToMemCache(httpClient);
  useGetFromCache(httpClient);
  return httpClient;
};

export default useMemCache;

export const useGetFromCache = function(httpClient: THttpClient) {
  return httpClient.addRequestStep(function({ request, response }) {
    if (
      !response &&
      typeof memCache[cacheKey(request)] !== 'undefined' &&
      (typeof request.responseIsCachable === 'undefined' ||
        request.responseIsCachable({
          request: request,
          response: memCache[cacheKey(request)]
        }))
    ) {
      request.response = jsonClone(memCache[cacheKey(request)]);
      request.servedFromCache = true;
    } else {
      request.servedFromCache = false;
    }
    return request;
  });
};

export const useSaveToMemCache = function(httpClient: THttpClient) {
  return httpClient.addResponseStep(function({ request, response }) {
    if (
      typeof request.responseIsCachable === 'undefined' ||
      request.responseIsCachable({ request, response })
    ) {
      memCache[cacheKey(request)] = response;
      request.savedToCache = true;
    } else {
      request.savedToCache = false;
    }
    return response;
  });
};

export const bustMemCache = function(partialUrl: string = '') {
  Object.keys(memCache).forEach(function(k) {
    if (k.includes(partialUrl)) {
      memCache[k] = undefined;
    }
  });
};

function cacheKey(request) {
  return `${request.url}::${request.method}::${getBodyFromReq(request)}`;
}
