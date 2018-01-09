const path = require('path');
const paths = require('./paths');

module.exports = function *(task) {
	yield task
		.source(path.join(paths.source, '**/*.js'))
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
				"import/no-extraneous-dependencies": "off",
				"import/prefer-default-export": "off"
			}
		})
		.unflow({all: true, sourceMap: ''})
		.target(paths.target);
};
