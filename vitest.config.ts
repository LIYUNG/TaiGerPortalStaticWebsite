import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path, { resolve } from 'path';

const root = resolve(__dirname, 'src');
const isCI = !!process.env.CI;

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'happy-dom',
        testTimeout: 10000,
        exclude: ['node_modules', 'dist', 'build', 'public', 'src/i18n'],
        setupFiles: ['./setupTests.ts'],
        reporter: isCI ? ['dot'] : ['verbose'],
        pool: 'forks',
        // Run one test file at a time in CI to cap peak memory.
        fileParallelism: !isCI,
        poolOptions: {
            forks: {
                maxForks: isCI ? 1 : 4,
                minForks: 1
            }
        }
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
            '@store': path.resolve(root, 'store')
        }
    }
});
