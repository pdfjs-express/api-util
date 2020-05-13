const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')
const webpack = require('webpack');

const env = process.env.ENV;
const mode = env === 'production' ? 'production' : 'development'

module.exports = {
  entry: './src/index.ts',
  mode,
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
    }),
    new webpack.DefinePlugin({
      'process.env.ENV': env
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};