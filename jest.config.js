module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^electron$': '<rootDir>/tests/mocks/electron.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
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
};
