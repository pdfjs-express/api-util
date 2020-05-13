const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'expressApiUtils',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'expressApiUtils',
      main: 'dist/**/*.d.ts',
      out: 'index.d.ts',
      removeSource: true,
      outputAsModuleFolder: true
    })
  ]
};