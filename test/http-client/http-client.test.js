import httpClientFactory from '../../lib/http-client/http-client.js';

describe('http-client - basic usage', () => {
  it('able to make a GET request', done => {
    let httpClient = httpClientFactory();
    httpClient
      .get({
        url: '/http-client-get-test'
      })
      .then(function(response) {
        chai.expect(response.foo).to.equal('1');
        done();
      });
  });

  it('able to make a POST request', done => {
    let httpClient = httpClientFactory();
    httpClient
      .post({
        url: '/http-client-post-test',
        data: {
          testData: '1'
        }
      })
      .then(function(response) {
        chai.expect(response.foo).to.equal('2');
        done();
      });
  });

  it("doesn't blow up when response isn't JSON", done => {
    let httpClient = httpClientFactory();
    httpClient
      .get({
        url: '/http-client-response-not-json'
      })
      .then(function(response) {
        chai.expect(response).to.equal('not json');
        done();
      });
  });

  it('options can be overwritten at any level', done => {
    let httpClient = httpClientFactory({
      credentials: 'include'
    });
    chai.expect(httpClient.options().credentials).to.equal('include');

    httpClient.options({
      credentials: 'omit'
    });
    chai.expect(httpClient.options().credentials).to.equal('omit');

    httpClient
      .get({
        url: '/http-client-get-test',
        credentials: 'same-origin',
        returnRequestAndResponse: true
      })
      .then(function({ request, response }) {
        chai.expect(request.credentials).to.equal('same-origin');
        done();
      });
  });

  it('request step can modify the request object', done => {
    let httpClient = httpClientFactory();
    httpClient.addRequestStep(({ request }) => {
      return Object.assign({}, request, {
        url: '/http-client-modified-url',
        returnRequestAndResponse: true
      });
    });
    httpClient
      .get({ url: '/will-be-overwritten' })
      .then(function({ request, response }) {
        chai.expect(request.url).to.equal('/http-client-modified-url');
        chai.expect(response).to.equal('response for modified url');
        done();
      });
  });

  it('request step can add a response object', done => {
    let httpClient = httpClientFactory();
    httpClient.addRequestStep(({ request }) => {
      if (request.url === '/does-not-exist') {
        return {
          request: request,
          response: 'shortcircuit response'
        };
      }
      return request;
    });
    httpClient.get({ url: '/does-not-exist' }).then(function(response) {
      chai.expect(response).to.equal('shortcircuit response');
      done();
    });
  });

  it('response step can modify the response object', done => {
    let httpClient = httpClientFactory();
    httpClient.addResponseStep(({ response }) => {
      response.foo = 'a response step was here';
      return response;
    });
    httpClient
      .get({
        url: '/http-client-get-test'
      })
      .then(function(response) {
        chai.expect(response.foo).to.equal('a response step was here');
        done();
      });
  });
});
