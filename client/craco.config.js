// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const oneOf = webpackConfig.module.rules.find(r => r.oneOf).oneOf;

      oneOf.unshift({
        test: /\.m?js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules') // transpile tout node_modules
        ],
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [require.resolve('babel-preset-react-app')],
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      });

      return webpackConfig;
    },
  },
};
