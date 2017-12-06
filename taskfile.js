const path = require('path');
const source = 'src';
const dist = 'lib';

module.exports = {
	*clean(task) {
		yield task.clear(dist);
	},
	*build (task, opts) {
		yield task
			.source(path.join(source, '**/*.js'))
			.unflow({all: true, sourceMap: ''})
			.xo({
				envs: ["browser", "es6"],
				parser: "babel-eslint",
				plugins: [
					"flowtype"
				],
				extends: [
					"plugin:flowtype/recommended"
				],
				parserOptions: {
					"ecmaVersion": 6,
					"sourceType": "module"
				},
				rules: {
					"import/no-unresolved": [
						"error", {
							"ignore": [""]
						}
					],
					"import/prefer-default-export": "off"
				}
			})
			.target(dist);
	},
	*default(task) {
		yield task.serial(['clean', 'build']);
	}
};