import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import { AuthProvider } from './components/AuthProvider/index';
import './index.css';
import i18n from './i18n';
import { CustomThemeProvider } from './components/ThemeProvider';
import { queryClient } from './api/client';
import { SnackBarProvider } from './contexts/use-snack-bar';

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
