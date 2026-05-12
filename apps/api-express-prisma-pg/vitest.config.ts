import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
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
