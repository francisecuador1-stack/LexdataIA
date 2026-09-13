const { join } = require('path');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(@nestjs\\+config|@nestjs\\+throttler))',
    '/node_modules/(?!(\\.pnpm|@nestjs/config|@nestjs/throttler))',
  ],
  moduleNameMapper: {
    '^@lexdata/contracts(.*)$': join(__dirname, '../../packages/contracts/src$1'),
    '^@lexdata/legal-corpus(.*)$': join(__dirname, '../../packages/legal-corpus/src$1'),
  },
  testEnvironment: 'node',
};
