const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: path.join(__dirname, 'electron/main.js'),
            config: path.join(__dirname, 'vite.config.mjs'),
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: path.join(__dirname, 'vite.config.mjs'),
          },
        ],
        // Add Node.js built-in modules configuration
        resolve: {
          alias: {
            path: require.resolve('path-browserify'),
            fs: require.resolve('browserify-fs'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            util: require.resolve('util'),
            os: require.resolve('os-browserify/browser')
          }
        }
      },
    },
  ],
}
