import createHttpClient from '../lib/http-client.js';

describe('http-client', () => {
	it('able to make a GET request for JSON', done => {
		createHttpClient().get('/http-client-get-test')
			.then(response => response.json())
			.then(data => {
				chai.expect(data.foo).to.equal('1');
				done();
			})
	});

	it('able to make a POST request for JSON', done => {
		createHttpClient().post('/http-client-post-test', JSON.stringify({ testData: '1' }))
			.then(response => response.json())
			.then(data => {
				chai.expect(data.foo).to.equal('2');
				done();
			});
	});

	it('able to make a PUT request for JSON', done => {
		createHttpClient().put('/http-client-put-test')
			.then(response => response.json())
			.then(data => {
				chai.expect(data.created).to.equal(true);
				done();
			});
	});

	it('able to make a PATCH request for JSON', done => {
		createHttpClient().patch('/http-client-patch-test')
			.then(response => response.json())
			.then(data => {
				console.log('sjsjsj');
				chai.expect(data.updated).to.equal(true);
				done();
			});
	});

	it('able to make a DELETE request for JSON', done => {
		createHttpClient().delete('/http-client-delete-test')
			.then(response => response.json())
			.then(data => {
				chai.expect(data.deleted).to.equal(true);
				done();
			});
	});

	it("able to make a GET request for a TEXT", done => {
		createHttpClient().get('/http-client-response-not-json')
			.then(response => response.text())
			.then(response => {
				chai.expect(response).to.equal('not json');
				done();
			});
	});

	it("with interceptor", done => {
		let client = createHttpClient((config) => {
			config
				.useStandardConfigurator()
				.withInterceptor({
					request(request) {
						console.log('request interceptor ', request);
						return new Response(request.url);
				},
				response(response) {
					console.log('response interceptor ', response);
					return response;
				}
			});
		});
		client.get('/http-client-response-not-json')
			.then(response => response.text())
			.then(response => {
				chai.expect(response).to.equal('not json');
				done();
			});

	});
});
