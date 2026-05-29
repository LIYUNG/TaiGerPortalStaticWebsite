import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path, { resolve } from 'path';

const root = resolve(__dirname, 'src');
const isCI = !!process.env.CI;
const ciHeapMb = 4096;

/** Skipped in CI until fork worker OOM on ProgramsTable is fixed. */
const ciSkippedTests = isCI ? ['src/pages/Program/ProgramsTable.test.tsx'] : [];

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'happy-dom',
        testTimeout: 10000,
        exclude: [
            'node_modules',
            'dist',
            'build',
            'public',
            'src/i18n',
            ...ciSkippedTests
        ],
        setupFiles: ['./setupTests.ts'],
        reporter: isCI ? ['dot'] : ['verbose'],
        cache: !isCI,
        pool: 'forks',
        maxWorkers: isCI ? 1 : 4,
        minWorkers: 1,
        fileParallelism: !isCI,
        isolate: true,
        vmMemoryLimit: isCI ? '1GB' : undefined,
        execArgv: isCI ? [`--max-old-space-size=${ciHeapMb}`] : undefined
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
