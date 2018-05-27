/*  */
import createStorage from './create-storage.js';
import { clone, merge } from './object.js';







export const HttpMethods = Object.freeze({
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE'
});

export default () => new Http(createConfig());

const privates = createStorage();

class HttpError extends Error {
  constructor(response) {
    super(`${response.status} for ${response.url}`);
    this.name = 'HttpError';
    this.response = response;
  }
}

class Http {
  constructor(config) {
    privates(this).config = config;
  }

  catcher(errorId, catcher) {
    const config = clone(privates(this).config);
    config.catchers.set(errorId, catcher);
    return new Http(config);
  }

  middleware(middleware, clear = false) {
    const config = clone(privates(this).config);
    config.middleware = clear ? middleware : config.middleware.concat(middleware);
    return new Http(config);
  }

  url(url, replace = false) {
    const config = clone(privates(this).config);
    config.url = replace ? url : config.url + url;
    return new Http(config);
  }

  options(options, mixin = true) {
    const config = clone(privates(this).config);
    config.options = mixin ? merge(config.options, options) : Object.assign({}, options);
    return new Http(config);
  }

  headers(headerValues) {
    const config = clone(privates(this).config);
    config.options.headers = merge(config.options.headers, headerValues);
    return new Http(config);
  }

  accept(headerValue) {
    return this.headers({ Accept: headerValue });
  }

  content(headerValue) {
    return this.headers({ 'Content-Type': headerValue });
  }

  mode(value) {
    return this.options({ mode: value });
  }

  credentials(value) {
    return this.options({ credentials: value });
  }

  cache(value) {
    return this.options({ cache: value });
  }

  integrity(value) {
    return this.options({ integrity: value });
  }

  keepalive(value = true) {
    return this.options({ keepalive: value });
  }

  redirect(value) {
    return this.options({ redirect: value });
  }

  body(contents) {
    const config = clone(privates(this).config);
    config.options.body = contents;
    return new Http(config);
  }

  auth(headerValue) {
    return this.headers({ Authorization: headerValue });
  }

  json(value) {
    return this.content('application/json').body(JSON.stringify(value));
  }

  form(value) {
    return this.body(convertFormUrl(value)).content('application/x-www-form-urlencoded');
  }

  method(value = HttpMethods.Get) {
    return this.options({ method: value });
  }

  get() {
    return this.method(HttpMethods.Get).send();
  }

  post() {
    return this.method(HttpMethods.Post).send();
  }

  insert() {
    return this.method(HttpMethods.Put).send();
  }

  update() {
    return this.method(HttpMethods.Patch).send();
  }

  delete() {
    return this.method(HttpMethods.Delete).send();
  }

  send() {
    const { url, options, middleware, resolvers, catchers } = privates(this).config;
    const request = applyMiddleware(middleware)(fetch);
    const wrapper = request(url, options).then((response) => {
      if (!response.ok) {
        throw new HttpError(response);
      }
      return response;
    });

    const doCatch = (promise) => {
      return promise.catch(err => {
        if (catchers.has(err.status)) {
          return catchers.get(err.status)(err, this);
        }
        if (catchers.has(err.name)) {
          return catchers.get(err.name)(err, this);
        }
        throw err;
      });
    };

    const wrapTypeParser = (funName) => (cb) =>
      funName
        ? doCatch(
            wrapper
              // $FlowFixMe
              .then(response => response && response[funName]())
              .then(response => (response && cb && cb(response)) || response)
          )
        : doCatch(wrapper.then(response => (response && cb && cb(response)) || response));

    const responseChain = {
      res: wrapTypeParser(null),
      json: wrapTypeParser('json')
    };

    return resolvers.reduce((chain, r) => r(chain, options), responseChain);
  }
}

function applyMiddleware(middlewares) {
  return (fetchFunction) => {
    if (middlewares.length === 0) {
      return fetchFunction;
    }

    if (middlewares.length === 1) {
      return middlewares[0](fetchFunction);
    }

    return (middlewares.reduceRight(
      (acc, curr, idx) => (idx === middlewares.length - 2 ? curr(acc(fetchFunction)) : curr((acc)))
    ));
  };
}

function createConfig() {
  return Object.assign(
    {},
    {
      url: '',
      options: {},
      catchers: new Map(),
      resolvers: [],
      middleware: []
    }
  );
}

function convertFormUrl(formObject) {
  return Object.keys(formObject)
    .map(
      key =>
        encodeURIComponent(key) +
        '=' +
        `${encodeURIComponent(typeof formObject[key] === 'object' ? JSON.stringify(formObject[key]) : formObject[key])}`
    )
    .join('&');
}
