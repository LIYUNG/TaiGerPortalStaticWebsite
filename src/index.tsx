import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import { AuthProvider } from '@components/AuthProvider/index';
import './index.css';
import i18n from './i18n';
import { CustomThemeProvider } from '@components/ThemeProvider';
import { queryClient } from '@/api';
import { SnackBarProvider } from '@contexts/use-snack-bar';
import { isChunkLoadError } from '@utils/chunkLoadError';

const RELOAD_KEY = 'chunk-load-reload';

function reloadOnChunkError(): void {
    if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1');
        window.location.reload();
    }
}

/**
 * Vite emits this when a dynamic import fails (e.g. after deploy, old chunk deleted).
 * preventDefault() stops the error from being thrown.
 * Ensure the server sends Cache-Control: no-cache on the HTML so users get fresh HTML after deploy.
 * See: https://vite.dev/guide/troubleshooting#_failed-to-fetch-dynamically-imported-module
 */
window.addEventListener('vite:preloadError', (event) => {
    (event as Event & { preventDefault: () => void }).preventDefault();
    reloadOnChunkError();
});

/**
 * Fallback for production builds where vite:preloadError is not emitted.
 */
window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        reloadOnChunkError();
    }
});

function prefetchDynamicChunks(): void {
    const idle =
        typeof requestIdleCallback !== 'undefined'
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 2000);
    idle(() => {
        void import('@pages/Dashboard');
    });
}

const storedLanguage = localStorage.getItem('locale') || 'en';
i18n.changeLanguage(storedLanguage);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const app = (
    <CustomThemeProvider>
        <I18nextProvider i18n={i18n}>
            <SnackBarProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <StrictMode>
                            <App />
                        </StrictMode>
                    </AuthProvider>
                </QueryClientProvider>
            </SnackBarProvider>
        </I18nextProvider>
    </CustomThemeProvider>
);

const root = createRoot(rootElement);
root.render(app);

prefetchDynamicChunks();
