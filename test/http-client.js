import httpClientFactory from '../lib/http-client.js';

describe('http-client', () => {

	describe('standard configure', () => {
		let fetch;
		beforeEach(() => {
			fetch = httpClientFactory(config => {
				config.useStandardConfigurator();
			});
		});

		it('able to make a GET request', done => {
			fetch('/http-client-get-test')
				.then(response => response.json())
				.then(data => {
					chai.expect(data.foo).to.equal('1');
					done();
				})
		});
	});
});