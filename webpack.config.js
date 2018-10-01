const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './bot.js',
  target: 'node',
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/env'],
          },
        },
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json'],
  },
  externals: [nodeExternals()],
};
