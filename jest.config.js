module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^electron$': '<rootDir>/tests/mocks/electron.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.worker\\.ts$': '<rootDir>/tests/mocks/worker.ts',
    '\\.\\./utils/workerConfig': '<rootDir>/tests/mocks/workerConfig.ts',
    '\\.\\./utils/workerPool': '<rootDir>/tests/mocks/workerPool.ts'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  fakeTimers: {
    enableGlobally: true
  }
}
