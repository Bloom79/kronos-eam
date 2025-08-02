/**
 * Webpack configuration overrides for Create React App
 * Handles browser polyfills and module resolution
 */

module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false, // We're using Web Crypto API instead
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    process: require.resolve('process/browser.js'),
  };

  // Handle fully specified ESM imports
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });

  // Add plugins to provide globals
  const webpack = require('webpack');
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
  ];

  return config;
};