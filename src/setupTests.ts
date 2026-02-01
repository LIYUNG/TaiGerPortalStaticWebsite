// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

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
