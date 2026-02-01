module.exports = {
    // Use happy-dom (no native canvas dependency; jsdom requires canvas.node on Windows)
    testEnvironment: '@happy-dom/jest-environment',

    // A list of directories that Jest should use to search for test files
    roots: ['<rootDir>/src'],

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
        '**/?(*.)+(spec|test).{js,jsx,ts,tsx}'
    ],

    // The module file extensions for importing modules in your tests
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],

    // Map env imports to Jest-only mock (real env.ts uses import.meta which Jest cannot parse)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^(\\.\\./)+env$': '<rootDir>/src/__mocks__/env.ts',
        '^(\\./)?env$': '<rootDir>/src/__mocks__/env.ts'
    },
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/(?!@mui/x-charts|@mui/material|@babel/runtime|d3-(color|format|interpolate|scale|shape|time|time-format|path|array)|internmap|query-string|export-to-csv)'
    ],
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
};
