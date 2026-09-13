/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // @nestjs/config@12 and @nestjs/throttler@6 ship ESM-only dist.
  // With pnpm, paths look like node_modules/.pnpm/@nestjs+config@12.../node_modules/@nestjs/config/
  // so the pattern must match both the .pnpm path and the hoisted path.
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!(@nestjs\\+config|@nestjs\\+throttler))',
    '/node_modules/(?!(\\.pnpm|@nestjs/config|@nestjs/throttler))',
  ],
  testEnvironment: 'node',
};
