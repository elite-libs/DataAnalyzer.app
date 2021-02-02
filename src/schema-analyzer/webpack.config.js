const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './index.ts',
  output: {
    path: path.resolve('dist'),
    filename: 'schema-analyzer.bundle.js',
    library: {
      root: 'SchemaAnalyzer',
      amd: 'schema-analyzer',
      commonjs: 'schema-analyzer',
    },
    libraryTarget: 'umd', // 'var'
  },
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.tsx?$/,
        exclude: [/node_modules/, /dist/],
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devtool: 'source-map',
  // 'cheap-module-source-map' // 'source-map'
  // optimization: {
  //   runtimeChunk: true
  // }
}
