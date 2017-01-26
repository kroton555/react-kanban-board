var webpack = require('webpack');

var config = {
  devtool: false,
  entry:  __dirname + "/src/App.js",
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js"
  },
  plugins: [
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
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015','react']
      }
    }]
  }
}

module.exports = config;

 // plugins: [
 //    new webpack.DefinePlugin({
 //      'process.env': {
 //        // This has effect on the react lib size
 //        'NODE_ENV': JSON.stringify('production'),
 //      }
 //    }),
 //    new ExtractTextPlugin("bundle.css", {allChunks: false}),
 //    new webpack.optimize.AggressiveMergingPlugin(),
 //    new webpack.optimize.OccurrenceOrderPlugin(),
 //    new webpack.optimize.DedupePlugin(),
 //    new webpack.optimize.UglifyJsPlugin({
 //      mangle: true,
 //      compress: {
 //        warnings: false, // Suppress uglification warnings
 //        pure_getters: true,
 //        unsafe: true,
 //        unsafe_comps: true,
 //        screw_ie8: true
 //      },
 //      output: {
 //        comments: false,
 //      },
 //      exclude: [/\.min\.js$/gi] // skip pre-minified libs
 //    }),
 //    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]), 
 //    new CompressionPlugin({
 //      asset: "[path].gz[query]",
 //      algorithm: "gzip",
 //      test: /\.js$|\.css$|\.html$/,
 //      threshold: 10240,
 //      minRatio: 0
 //    })
 //  ],