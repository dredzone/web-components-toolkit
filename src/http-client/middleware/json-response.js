/* @flow */
import type { IFetch } from '../fetch.js';

export default (fetch: IFetch) => {
  return (...args: Array<any>): Promise<Response> => {
    return fetch(...args).then((response: Response) => {
      try {
        return response.json();
      } catch (err) {
        return response;
      }
    });
  };
};
