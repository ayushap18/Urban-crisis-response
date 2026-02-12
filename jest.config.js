/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    // Handle CSS imports (if any)
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // Handle ESM modules if necessary
    '^@google/genai$': '<rootDir>/tests/mocks/googleGenAi.ts' 
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
};