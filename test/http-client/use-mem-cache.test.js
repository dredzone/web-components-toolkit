import httpClientFactory from '../../lib/http-client/http-client.js';
import useMemCache, {
  bustMemCache
} from '../../lib/http-client/use-mem-cache.js';

describe('http-client w/ mem-cache', () => {
  it('response can be cached', done => {
    let httpClient = useMemCache(httpClientFactory());
    httpClient
      .get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      })
      .then(function({ request, response }) {
        chai.expect(response.foo).to.equal('1');
        chai.expect(request.servedFromCache).to.equal(false);
      })
      .then(function() {
        httpClient
          .get({
            url: '/http-client-get-test',
            returnRequestAndResponse: true
          })
          .then(function({ request, response }) {
            chai.expect(response.foo).to.equal('1');
            chai.expect(request.servedFromCache).to.equal(true);
            done();
          });
      });
  });

  it('cache can be busted', done => {
    let httpClient = useMemCache(httpClientFactory());
    httpClient
      .get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      })
      .then(function() {
        bustMemCache();
        httpClient
          .get({
            url: '/http-client-get-test',
            returnRequestAndResponse: true
          })
          .then(function({ request, response }) {
            chai.expect(response.foo).to.equal('1');
            chai.expect(request.servedFromCache).to.equal(false);
            done();
          });
      });
  });

  //TODO: FAILS due to jsonClone being used on a object that has a property that has a function as the value
  it('responseIsCachable can prevent cached response from being cached', done => {
    let httpClient = useMemCache(
      httpClientFactory({
        responseIsCachable: () => {
          return false;
        }
      })
    );
    httpClient
      .get({
        url: '/http-client-get-test',
        returnRequestAndResponse: true
      })
      .then(function() {
        httpClient
          .get({
            url: '/http-client-get-test',
            returnRequestAndResponse: true
          })
          .then(function({ request, response }) {
            chai.expect(response.foo).to.equal('1');
            chai.expect(request.servedFromCache).to.equal(false);
            done();
          });
      });
  });

  // it('responseIsCachable can prevent cached response from being returned', done => {});
});
