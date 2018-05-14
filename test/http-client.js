import httpClientFactory from '../lib/http-client.js';

describe('http-client', () => {

	describe('standard configure', () => {
		let client;
		beforeEach(() => {
			client = httpClientFactory(config => {
				config.useStandardConfigurator();
			});
		});

		it('able to make a GET request', done => {
			client.fetch('/http-client-get-test')
				.then(response => response.json())
				.then(data => {
					chai.expect(data.foo).to.equal('1');
					done();
				})
		});

		it('able to make a POST request', done => {
			client.fetch('/http-client-post-test', {
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

	describe('mixin configure', () => {
		let client;
		beforeEach(() => {
			client = httpClientFactory(config => {
				config.withMixins(mixin);
			});
		});

		it('call mixin method', () => {
			chai.expect(client.testMethod()).equal('test');
		});
	});
});

const mixin = (base) => class extends base {
	testMethod() {
		return 'test';
	}
};