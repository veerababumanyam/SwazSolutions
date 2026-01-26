/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/backend/**/__tests__/**/*.test.js',
    '<rootDir>/backend/**/__tests__/**/*.test.cjs',
  ],
  transform: {},
  // Backend tests use CommonJS; force .test.js files to be treated as CJS
  moduleFileExtensions: ['js', 'cjs', 'json', 'node'],
  // Coverage configuration
  collectCoverageFrom: [
    'backend/routes/link-items.js',
    'backend/routes/gallery-uploads.js',
    'backend/services/vCardGenerator.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Silence console.error/warn from source code during tests
  silent: false,
  verbose: true,
};
