const express = require('express');
const path = require('path');

module.exports.serve = function* (task, opts) {
	const port = 3000;
	const app = express();
	app.use(express.static(process.cwd(), {extensions: ['js']}));
	app.listen(port, () => {
		return Promise.resolve();
	});
};