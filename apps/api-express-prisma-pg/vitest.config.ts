import path from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const env = loadEnv('test', process.cwd(), '');

export default defineConfig({
  test: {
    globals: true,
    env,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      reportsDirectory: './coverage',
      exclude: ['src/**/__tests__/**', '**/*.test.*']
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './src')
    }
  }
});
