const path = require('path');
const paths = require('./paths');

module.exports = function *(task) {
	yield task.source(path.join(paths.source, '**/*.js.flow')).target(paths.target);
};
