const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  cache: false,
  entry: path.resolve(__dirname, 'src/index.js'),
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(gif|png|jpg)/,
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
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    plugins: [new TsconfigPathsPlugin({})],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyPlugin({
      patterns: [{ from: 'static', to: '' }],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'public/'),
    publicPath: '/',
    filename: '[name].[contenthash].js',
    clean: true,
  },
};
