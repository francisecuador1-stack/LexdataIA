/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // @nestjs/config@12 and @nestjs/throttler@6 ship ESM-only dist.
  // Jest runs in CJS mode, so these must be transformed by ts-jest.
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs/config|@nestjs/throttler)/)',
  ],
  testEnvironment: 'node',
};
