/// <reference types="vitest/globals" />
// jest-dom adds custom matchers for asserting on DOM nodes (works with Vitest).
// e.g. expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// Defaults for env when running in Vitest (no import.meta.env)
if (typeof process !== 'undefined') {
    if (!process.env.VITE_DEV_URL)
        process.env.VITE_DEV_URL = 'http://localhost:3000';
    if (!process.env.VITE_PROD_URL)
        process.env.VITE_PROD_URL = 'https://example.com';
    if (!process.env.VITE_DEV_TENANT_ID)
        process.env.VITE_DEV_TENANT_ID = 'TaiGer';
    if (!process.env.VITE_TENANT_ID) process.env.VITE_TENANT_ID = 'TaiGer_Prod';
}

// Central mocks so test files do not need to include them.
// Code uses "import i18next from 'i18next'" so the mock must provide default export.
const { i18nextMock } = vi.hoisted(() => {
    const i18nextMock = {
        t: (key: string) => key
    };
    return { i18nextMock };
});
vi.mock('i18next', () => ({
    default: i18nextMock,
    ...i18nextMock
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => undefined)
        }
    }),
    initReactI18next: { type: '3rdParty', init: () => undefined }
}));

// Note: export-to-csv and query-string are mocked in src/__mocks__/ directory

// Prevent real HTTP requests in tests (avoids Cross-Origin / Network Error warnings).
// vi.hoisted ensures the instance is available inside vi.mock (which is hoisted).
const { mockAxiosInstance } = vi.hoisted(() => {
    const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
        post: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
        put: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
        delete: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
        request: vi.fn().mockResolvedValue({ data: {}, status: 200 })
    };
    return { mockAxiosInstance };
});
vi.mock('axios', () => ({
    create: () => mockAxiosInstance,
    default: {
        create: () => mockAxiosInstance,
        ...mockAxiosInstance
    }
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
        (msg.includes('An update to ') &&
            msg.includes('inside a test was not wrapped in act(...)')) ||
        msg.includes('Error handled by React Router default ErrorBoundary') ||
        msg.includes('No route matches') ||
        msg.includes('No routes matched')
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
    observe(): void {
        // intentional no-op for test mock
    }
    disconnect(): void {
        // intentional no-op for test mock
    }
    unobserve(): void {
        // intentional no-op for test mock
    }
}
if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver =
        ResizeObserverMock as unknown as typeof ResizeObserver;
}
