const { join } = require('path');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // @nestjs/config@12 and @nestjs/throttler@6 ship ESM-only dist.
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(@nestjs\\+config|@nestjs\\+throttler))',
    '/node_modules/(?!(\\.pnpm|@nestjs/config|@nestjs/throttler))',
  ],
  // Resolve workspace packages that pnpm symlinks
  moduleNameMapper: {
    '^@lexdata/contracts(.*)$': join(__dirname, '../../packages/contracts/src$1'),
    '^@lexdata/legal-corpus(.*)$': join(__dirname, '../../packages/legal-corpus/src$1'),
  },
  testEnvironment: 'node',
};
