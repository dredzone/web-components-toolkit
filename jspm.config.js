SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "utility-toolkit/": "src/",
    "github:": "jspm_packages/github/"
  },
  browserConfig: {
	  "baseURL": "."
  },
  packages: {
    "utility-toolkit": {
      "main": "index.js",
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
