import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-oxc';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { '~': path.resolve(import.meta.dirname, './src') }
  },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude],
    setupFiles: './src/lib/test-setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      reportsDirectory: './coverage',
      exclude: ['src/lib/tests/**', '**/*.test.*', '**/*.spec.*']
    }
  }
});
