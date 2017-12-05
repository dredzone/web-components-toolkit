SystemJS.config({
	paths: {
		"npm:": "jspm_packages/npm/",
		"utility-toolkit/": "lib/",
		"github:": "jspm_packages/github/"
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