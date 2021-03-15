const path = require('path');
const { alias, configPaths } = require('react-app-rewire-alias');
const addRewireScssLoader = require('react-app-rewire-scss-loaders');
const rewireWebpackBundleAnalyzer = require('react-app-rewire-webpack-bundle-analyzer');

module.exports = function override(config, env) {
  // Fucking CRApps feel entitled to overwrite tsconfig.json...
  alias(configPaths('./tsconfig.paths.json'))(config);

  // Customize SASS
  config = addRewireScssLoader('sass-resources-loader', {
    resources: [path.resolve(__dirname, 'src/theme', '_variables.scss')],
  })(config, env);

  // Add bundle analyzer visualization
  if (env !== 'development') {
    config = rewireWebpackBundleAnalyzer(config, env, {
      analyzerMode: 'static',
      reportFilename: 'build/report.html',
    });
  }

  return config;
};
