import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    verbose: true,
    clearMocks: true,
    forceExit: true,
    detectOpenHandles: true,
};

export default config;