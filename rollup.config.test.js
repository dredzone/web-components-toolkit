import babel from 'rollup-plugin-babel';

export default {
	entry: 'test/tests.js',
	dest: 'bundles/umd/test.js',
	format: 'umd',
	moduleName: 'VoyaUtilityToolkitTests',
	sourceMap: 'inline',
	plugins: [
		babel({
			exclude: 'node_modules/**'
		})
	]
};