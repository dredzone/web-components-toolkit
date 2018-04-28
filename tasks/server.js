const express = require('express');
const path = require('path');

module.exports.serve = function* (task, opts) {
	const port = 3000;
	const app = express();
	app.use('/node_modules', express.static('node_modules'));
	app.use('/lib', express.static('lib'));
	app.use(express.static(path.join(process.cwd(), 'test')));
	app.listen(port, () => {
		return Promise.resolve();
	});
};