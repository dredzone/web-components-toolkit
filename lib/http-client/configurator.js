/*  */


/**
 * The init object used to initialize a fetch Request.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 */

/**
 * A class for configuring HttpClients.
 */
class Configurator {

  constructor() {
    this.baseUrl = '';
    this.defaults = {};
    this.interceptors = [];
  }

  withBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    return this;
  }

  withDefaults(defaults) {
    this.defaults = defaults;
    return this;
  }

  withInterceptor(interceptor) {
    this.interceptors.push(interceptor);
    return this;
  }

  useStandardConfigurator() {
    let standardConfig = {
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'X-Requested-By': 'DEEP-UI'
      }
    };
    Object.assign(this.defaults, standardConfig, this.defaults);
    return this.rejectErrorResponses();
  }

  rejectErrorResponses() {
    return this.withInterceptor({ response: rejectOnError });
  }
}

export default () => new Configurator();

function rejectOnError(response) {
  if (!response.ok) {
    throw response;
  }

  return response;
}
