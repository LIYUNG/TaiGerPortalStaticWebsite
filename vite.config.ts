import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3006
    },
    build: {
        outDir: 'dist',
        minify: 'esbuild',
        sourcemap: true,
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('@mui/icons-material')) {
                            return 'vendor-mui-icons';
                        }
                        // Keep @emotion with @mui in one chunk to avoid "Cannot access before initialization"
                        // (emotion-use-insertion-effect and other internals must load in same bundle as MUI)
                        if (id.includes('@emotion') || id.includes('@mui')) {
                            return 'vendor-mui';
                        }
                        if (
                            id.includes('xlsx') ||
                            id.includes('jspdf') ||
                            id.includes('pdfjs-dist')
                        ) {
                            return 'vendor-docs';
                        }
                        if (id.includes('@editorjs')) {
                            return 'vendor-editor';
                        }
                        if (id.includes('@tanstack')) {
                            return 'vendor-tanstack';
                        }
                        if (id.includes('react-dom') || id.includes('react/')) {
                            return 'vendor-react';
                        }
                        if (
                            id.includes('i18next') ||
                            id.includes('react-i18next')
                        ) {
                            return 'vendor-i18n';
                        }
                        if (
                            id.includes('react-big-calendar')
                        ) {
                            return 'vendor-calendar';
                        }
                        if (
                            id.includes('react-router') ||
                            id.includes('@remix-run')
                        ) {
                            return 'vendor-router';
                        }
                        if (id.includes('react-redux') || id.includes('redux/')) {
                            return 'vendor-redux';
                        }
                        if (
                            id.includes('material-react-table') ||
                            id.includes('react-google-charts')
                        ) {
                            return 'vendor-tables';
                        }
                        if (id.includes('moment')) {
                            return 'vendor-moment';
                        }
                        if (id.includes('luxon')) {
                            return 'vendor-luxon';
                        }
                        if (
                            id.includes('react-markdown') ||
                            id.includes('remark-gfm')
                        ) {
                            return 'vendor-markdown';
                        }
                        if (id.includes('react-select')) {
                            return 'vendor-select';
                        }
                        if (id.includes('react-datasheet-grid')) {
                            return 'vendor-datasheet';
                        }
                        if (id.includes('@taiger-common')) {
                            return 'vendor-taiger';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    }
});
