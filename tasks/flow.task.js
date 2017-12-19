const execFile = require('child_process').execFile;
const path = require('path');
const flow = require('flow-bin');
const flowCopySource = require('flow-copy-source');
const paths = require('./paths');

const flowCopyIgnore = '';

module.exports.check = function* (task) {
	yield new Promise((resolve, reject) => {
		execFile(flow, ['check'], (err, stdout) => {
			if (err) {
				reject(err);
			}
			console.log(stdout);
			resolve();
		});
	});
};

module.exports.copy = function* (task, opts) {
	yield flowCopySource([paths.source], paths.target, {ignore: flowCopyIgnore})
};
