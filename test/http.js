import http from '../lib/http.js';

describe('http', () => {
	it('create http', () => {
		let api = http().url('http://www.google.com');
		// assert.instanceOf(http(), 'http is instance of Http');
	});
});
