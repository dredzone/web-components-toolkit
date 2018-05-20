/*  */
import createStorage from './create-storage.js';
import clone from './object/clone.js';










export default (
	url = '',
	options = {}
) => new Http({url, options, catchers: new Map(), resolvers: [], middleware: []});

const privates = createStorage();

class Http {
	constructor(config) {
		privates(this).config = config;
	}

	url(url, replace = false) {
		const config = clone(privates(this).config);
		config.url = replace ? url : config.url + url;
		return new Http(config);
	}
}