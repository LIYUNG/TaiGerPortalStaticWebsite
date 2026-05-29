import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path, { resolve } from 'path';
import os from 'os';

const root = resolve(__dirname, 'src');
const isCI = !!process.env.CI;

// Cap workers at a level the smallest CI runner can handle without thrashing.
// Threads share a single Node process, so each thread does NOT pay the full
// module-graph import cost again — modules are loaded once per worker isolate.
const ciMaxThreads = Math.min(
    4,
    Math.max(1, Math.floor((os.cpus()?.length || 2) / 2))
);

/**
 * The ProgramsTable test is no longer auto-skipped — the config no longer
 * crashes the worker (see pool/isolate changes below). Keep this array so
 * we can quickly quarantine a test again if it regresses.
 */
const ciSkippedTests: string[] = [];

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
        // Forks pool: one OS process per worker. Threads can't accept
        // --max-old-space-size via execArgv (Node worker_threads rejects it),
        // and they share a single heap across all workers — meaning one
        // memory-hungry test brings the whole run down. Forks give each
        // worker its own heap budget and recycle cleanly on OOM.
        // Threads pool: workers share a single Node process and Vite's
        // transform cache, which avoids the per-file process-startup cost
        // that made the forks pool slow (~2.5s of import per file × 358
        // files). Each thread still gets its own V8 isolate when
        // isolate: true, so file-scoped vi.mock factories don't bleed.
        pool: 'threads',
        isolate: true,
        maxWorkers: isCI ? ciMaxThreads : 4,
        // execArgv is intentionally not set: Node's worker_threads rejects
        // --max-old-space-size (ERR_WORKER_INVALID_EXEC_ARGV). The main
        // process's heap limit (raise via NODE_OPTIONS in the CI runner)
        // is what governs worker thread allocations.
        fileParallelism: true,
        // Reset call/instance history between tests (no implementation reset
        // — that would strip `vi.fn(() => ...)` impls set at vi.mock() time
        // and break any test that relies on them after the first case runs).
        clearMocks: true,
        sequence: {
            // Run shorter files first so a slow file doesn't gate workers.
            shuffle: false
        },
        // Pre-bundle heavy CJS/ESM-interop deps once at the Vite level.
        // Avoids repeated SSR-transform work for every file that touches MUI.
        server: {
            deps: {
                inline: [
                    /^@mui\//,
                    /^@emotion\//,
                    'material-react-table',
                    /^react-i18next/,
                    /^@testing-library\//
                ]
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
