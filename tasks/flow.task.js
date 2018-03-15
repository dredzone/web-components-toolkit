module.exports.check = function* (task) {
	const execFile = require('child_process').execFile;
	const flow = require('flow-bin');

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
