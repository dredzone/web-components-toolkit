const flowCopySource = require('flow-copy-source');

module.exports = function *(task) {
	yield task.source('src/**/*.js', {ignore: '*.flow'})
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
		.target('lib');

	yield task
		.source('src/**/*.flow')
		.target('lib');

	yield flowCopySource(['src'], 'lib', {ignore: '*.flow'});
};
