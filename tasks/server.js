const express = require('express');
const path = require('path');

module.exports.serve = function* (task, opts) {
	const port = 3000;
	const app = express();
	app.use('/node_modules', express.static('node_modules', {extensions: ['js']}));
	app.use('/lib', express.static('lib', {extensions: ['js']}));
	app.use(express.static(path.join(process.cwd(), 'test'), {extensions: ['js']}));
	app.listen(port, () => {
		return Promise.resolve();
	});
};