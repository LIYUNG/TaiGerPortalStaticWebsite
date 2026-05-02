import { describe, expect, it } from 'vitest';
import { getPostLoginRedirectPath, sanitizeInternalPath } from './authRedirect';

describe('authRedirect', () => {
    it('prefers state over p for post-login redirects', () => {
        const searchParams = new URLSearchParams(
            '?p=/admissions-overview&state=/account/profile'
        );

        expect(getPostLoginRedirectPath(searchParams)).toBe('/account/profile');
    });

    it('falls back to p when state is missing', () => {
        const searchParams = new URLSearchParams('?p=/admissions-overview');

        expect(getPostLoginRedirectPath(searchParams)).toBe(
            '/admissions-overview'
        );
    });

    it('normalizes relative internal paths by adding a leading slash', () => {
        const searchParams = new URLSearchParams(
            '?state=programs/2532fde46751651537901408'
        );

        expect(getPostLoginRedirectPath(searchParams)).toBe(
            '/programs/2532fde46751651537901408'
        );
    });

    it('rejects unsafe internal paths', () => {
        expect(sanitizeInternalPath('https://example.com')).toBeNull();
        expect(sanitizeInternalPath('//example.com')).toBeNull();
        expect(sanitizeInternalPath('admissions-overview')).toBe(
            '/admissions-overview'
        );
    });

    it('rejects paths containing backslashes', () => {
        expect(sanitizeInternalPath('/some\\path')).toBeNull();
        expect(sanitizeInternalPath('some\\path')).toBeNull();
    });
});
