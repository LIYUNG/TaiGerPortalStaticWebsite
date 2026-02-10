import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

const root = resolve(__dirname, 'src');


export default defineConfig({
    plugins: [svgr(), react(), tsconfigPaths()],
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
    server: {
        port: 3006
    },
    build: {
        outDir: 'dist',
        minify: 'esbuild',
        sourcemap: true,
        chunkSizeWarningLimit: 800,
    }
});
