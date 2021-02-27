const path = require('path');
const { alias, configPaths } = require('react-app-rewire-alias');
const addRewireScssLoader = require('react-app-rewire-scss-loaders');

module.exports = function override(config) {
  alias(configPaths('./tsconfig.paths.json'))(config);
  config = addRewireScssLoader('sass-resources-loader', {
    resources: [path.resolve(__dirname, 'src/theme', '_variables.scss')],
  })(config, process.env.NODE_ENV);
  return config;
};
