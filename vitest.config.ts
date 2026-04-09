import { defineConfig } from 'vitest/config';
import path from 'path';

// Integration tests use 'node' environment (no browser APIs)
// Unit tests use 'happy-dom' environment
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['**/*.integration.test.ts', 'node'],
    ],
    setupFiles: [],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
