const paths = require('./paths');

module.exports = function* (task) {
	yield task.clear(paths.target);
};


