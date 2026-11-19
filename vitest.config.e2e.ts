import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/setup/mongo-memory.global.ts'],
    hookTimeout: 120_000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      MONGO_URI: 'mongodb://localhost:27017/validations-test',
      DYNAMODB_ENDPOINT: 'http://localhost:8000',
      DYNAMODB_TABLE: 'validation-audit-test',
      EXTERNAL_API_URL: 'https://open.er-api.com/v6',
    },
  },
});