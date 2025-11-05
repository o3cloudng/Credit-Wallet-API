import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  // collectCoverage: true, // enable if you want coverage by default
  // moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  // increases timeout for DB migrations or slow tests
  testTimeout: 20000
};

export default config;

// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   setupFilesAfterEnv: ['./test/setup.ts']
// };

