const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(png|jpg)/,
        type: 'asset/resource',
        generator: {
          publicPath: '/images/',
          outputPath: '../public/images/',
        },
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx'],
    plugins: [new TsconfigPathsPlugin({/* options: see below */})]
  },
  output: {
    path: path.resolve(__dirname, 'public/'),
    publicPath: '/public/',
    filename: 'bundle.js',
  },
};
