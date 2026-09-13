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
  testEnvironment: 'node',
};
