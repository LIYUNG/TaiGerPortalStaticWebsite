// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Defaults for env.ts when running in Jest (no import.meta.env)
if (typeof process !== 'undefined') {
    if (!process.env.VITE_DEV_URL) process.env.VITE_DEV_URL = 'http://localhost:3000';
    if (!process.env.VITE_PROD_URL) process.env.VITE_PROD_URL = 'https://example.com';
    if (!process.env.VITE_DEV_TENANT_ID) process.env.VITE_DEV_TENANT_ID = 'TaiGer';
    if (!process.env.VITE_TENANT_ID) process.env.VITE_TENANT_ID = 'TaiGer_Prod';
}

// Expose jest globally so test files can use jest.mock(), jest.fn(), etc.
// without importing from '@jest/globals' (avoids "Cannot use namespace 'jest' as a value").
if (typeof (globalThis as Record<string, unknown>).jest === 'undefined') {
    (globalThis as Record<string, unknown>).jest = jest;
}

// Central mocks so test files do not need to include them
jest.mock('i18next', () => ({
    t: (key: string) => key
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: { changeLanguage: (): Promise<void> => new Promise(() => undefined) }
    }),
    initReactI18next: { type: '3rdParty', init: (): void => undefined }
}));

// Note: export-to-csv and query-string are mocked in src/__mocks__/ directory

// Prevent real HTTP requests in tests (avoids Cross-Origin / Network Error warnings)
const mockAxiosInstance = {
    get: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
    post: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
    put: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
    delete: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
    request: jest.fn().mockResolvedValue({ data: {}, status: 200 })
};
jest.mock('axios', () => ({
    create: () => mockAxiosInstance,
    ...mockAxiosInstance
}));

// Suppress React Router v7 future-flag deprecation warnings in tests (we opt-in via createMemoryRouter where used)
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (
        msg.includes('React Router Future Flag Warning') ||
        msg.includes('v7_startTransition') ||
        msg.includes('v7_relativeSplatPath')
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};

// Suppress known test noise: React act() warnings and React Router ErrorBoundary route errors
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (
        (msg.includes('An update to ') && msg.includes('inside a test was not wrapped in act(...)')) ||
        msg.includes('Error handled by React Router default ErrorBoundary') ||
        (msg.includes('No route matches') || msg.includes('No routes matched'))
    ) {
        return;
    }
    try {
        originalConsoleError.apply(console, args);
    } catch {
        // Avoid rethrowing if ErrorBoundary or other code passes non-standard args
    }
};

// ResizeObserver is not available in happy-dom; many MUI/components use it
class ResizeObserverMock {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
}
if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
