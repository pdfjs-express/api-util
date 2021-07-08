const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')
const webpack = require('webpack');

const env = process.env.ENV;
const mode = env === 'production' ? 'production' : 'development'

const globalConfig = {
  entry: './src/index.ts',
  mode,
  watch: mode === 'development',
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
      ENV: `'${env}'`
    })
  ]
}

const serverConfig = {
  ...globalConfig,
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/node'),
    library: 'expressApiUtils',
    libraryTarget: 'umd',
  },
}

const clientConfig = {
  ...globalConfig,
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: 'expressApiUtils',
    libraryTarget: 'umd',
  },
}

module.exports = [serverConfig, clientConfig]

