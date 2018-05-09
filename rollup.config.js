import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'lib/index.js',
  dest: 'bundles/umd/index.js',
  format: 'umd',
  moduleName: 'VoyaUtilityToolkit',
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({})
  ]
};
