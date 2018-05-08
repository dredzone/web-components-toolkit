import babel from 'rollup-plugin-babel';

export default {
	entry: 'lib/index.js',
	dest: 'bundles/umd/index.js',
	format: 'umd',
	moduleName: 'Voya',
	sourceMap: 'inline',
	plugins: [
		babel({
		runtimeHelpers: true,
		externalHelpers: false,
		exclude: 'node_modules/**'
		})
	]
};