SystemJS.config({
	paths: {
		"utility-toolkit/": "lib/"
	},
	browserConfig: {
		"baseURL": "."
	},
	packages: {
		"utility-toolkit": {
			"meta": {
				"*.js": {}
			}
		}
	}
});

SystemJS.config({
	packageConfigPaths: [
		"npm:@*/*.json",
		"npm:*.json"
	],
	map: {},
	packages: {}
});