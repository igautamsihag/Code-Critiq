/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^next/image$': '<rootDir>/__mocks__/next/image.tsx',
    '^jose$': '<rootDir>/__mocks__/jose.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
}

module.exports = createJestConfig(config)
