var webpack = require('webpack');

var config = {
  devtool: 'cheap-inline-module-source-map',
  entry:  __dirname + "/src/App.js",
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js"
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015','react']
      }
    }]
  },
  devServer: {
    contentBase: "."  + '/dist',
    colors: true,
    historyApiFallback: true,
    inline: true
  },
}

if (false/*process.env.NODE_ENV === 'production'*/) {
  config.devtool = false;
  config.plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        unsafe: true
      },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    }),
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('production')}
    })
  ];
};

module.exports = config;
