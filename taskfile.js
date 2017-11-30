module.exports.default = function *(task) {
	const path = require('path');
	const source = 'src';
	const dist = 'dist';

	yield task.clear(dist);
	yield task
		.source(path.join(source, '**/*.js'))
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
		.babel({preload: true})
		.target(dist);
};