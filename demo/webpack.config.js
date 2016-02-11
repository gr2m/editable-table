var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './entry.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        // loader: 'style-loader!css-loader'
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  modulesDirectories: [
    'node_modules'
  ],
  plugins: [
    new ExtractTextPlugin('bundle.css')
  ]
}
