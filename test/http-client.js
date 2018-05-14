import httpClientFactory, {jsonResponseMiddleware} from '../lib/http-client.js';

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

		it('able to make a POST request', done => {
			fetch('/http-client-post-test', {
				method: 'POST',
				body: JSON.stringify({ testData: '1' })
			})
			.then(response => response.json())
			.then(data => {
				chai.expect(data.foo).to.equal('2');
				done();
			})
		});
	});

	describe('middleware configure', () => {
		let fetch;
		beforeEach(() => {
			fetch = httpClientFactory(config => {
				config.useStandardConfigurator();
				config.withMiddleware(jsonResponseMiddleware);
			});
		});

		it('able to make a GET request with json-response middleware', done => {
			fetch('/http-client-get-test')
				.then(data => {
					chai.expect(data.foo).to.equal('1');
					done();
				})
		});

		it('able to make a POST request with json-response middleware', done => {
			fetch('/http-client-post-test', {
				method: 'POST',
				body: JSON.stringify({ testData: '1' })
			})
			.then(data => {
				chai.expect(data.foo).to.equal('2');
				done();
			})
		});
	});

});