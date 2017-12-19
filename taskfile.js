const glob = require('glob');
const path = require('path');

glob.sync(path.join(process.cwd(), 'tasks', '*.task.js'))
	.forEach((file) => {
		const taskName = path.basename(file, '.js').split('.')[0];
		const task = require(file);
		if (typeof task === 'function') {
			module.exports[taskName] = task;
		} else {
			let tasks = [];
			Object.keys(task).forEach(key => {
				tasks.push(`${taskName}:${key}`);
				module.exports[`${taskName}:${key}`] = task[key];
			});
			module.exports[taskName] = function *(task) {
				yield task.parallel(tasks);
			}
		}
	});

module.exports.default = function *(task) {
	task.serial(['clean', 'flow:check', 'build', 'flow:copy']);
};