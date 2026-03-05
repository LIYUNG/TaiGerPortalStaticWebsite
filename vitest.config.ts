import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path, { resolve } from 'path';

const root = resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 10000,
    exclude: ['node_modules', 'dist', 'build', 'public', 'src/i18n'],
    setupFiles: ['./setupTests.ts'],
  },
  pool: 'forks',
  reporter: ['verbose'],
  poolOptions: {
    forks: {
      maxForks: 8,
      minForks: 4,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(root),
      '@api': path.resolve(root, 'api'),
      '@components': path.resolve(root, 'components'),
      '@contexts': path.resolve(root, 'contexts'),
      '@utils': path.resolve(root, 'utils'),
      '@hooks': path.resolve(root, 'hooks'),
      '@pages': path.resolve(root, 'pages'),
      '@store': path.resolve(root, 'store'),
    },
  },
});
