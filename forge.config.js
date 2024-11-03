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
            entry: path.join(__dirname, 'electron/main.ts'),
            config: path.join(__dirname, 'vite.config.mjs'),
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: path.join(__dirname, 'vite.config.mjs'),
          },
        ],
      },
    },
  ],
};
