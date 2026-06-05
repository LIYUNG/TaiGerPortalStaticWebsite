import { describe, it, expect, vi } from 'vitest';

// setupTests.ts globally mocks 'axios'; this suite exercises the real
// interceptor logic and the real AxiosHeaders, so use the actual module here.
vi.mock('axios', async () => await vi.importActual('axios'));

import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { stripJsonContentTypeForFormData } from './request';

/**
 * Regression guard for the axios 0.x -> 1.x upgrade.
 *
 * axios 0.x auto-stripped a pre-set `Content-Type: application/json` for
 * FormData bodies; axios 1.x sends it verbatim, which drops the
 * `multipart/form-data; boundary=...` header and makes multer `.array('files')`
 * parse zero files — breaking (multi-)file uploads. The interceptor must remove
 * the JSON content-type for FormData and leave it untouched for JSON bodies.
 */
const makeConfig = (data: unknown): InternalAxiosRequestConfig => {
    const headers = new AxiosHeaders();
    headers.set('Content-Type', 'application/json');
    headers.set('tenantId', 'test-tenant');
    return { headers, data } as InternalAxiosRequestConfig;
};

describe('stripJsonContentTypeForFormData', () => {
    it('removes the JSON Content-Type for a FormData body (single file)', () => {
        const fd = new FormData();
        fd.append(
            'files',
            new File(['a'], 'a.pdf', { type: 'application/pdf' })
        );

        const config = stripJsonContentTypeForFormData(makeConfig(fd));

        expect(config.headers.get('Content-Type')).toBeFalsy();
        // Unrelated headers are preserved.
        expect(config.headers.get('tenantId')).toBe('test-tenant');
    });

    it('removes the JSON Content-Type for a FormData body with MULTIPLE files', () => {
        const fd = new FormData();
        fd.append(
            'files',
            new File(['a'], 'a.pdf', { type: 'application/pdf' })
        );
        fd.append(
            'files',
            new File(['b'], 'b.pdf', { type: 'application/pdf' })
        );
        fd.append('message', '{}');

        const config = stripJsonContentTypeForFormData(makeConfig(fd));

        expect(config.headers.get('Content-Type')).toBeFalsy();
        // The multi-file field survives untouched so the browser can set the
        // boundary and multer can parse every file.
        expect(fd.getAll('files')).toHaveLength(2);
    });

    it('leaves the JSON Content-Type intact for a non-FormData (JSON) body', () => {
        const config = stripJsonContentTypeForFormData(makeConfig({ a: 1 }));
        expect(config.headers.get('Content-Type')).toBe('application/json');
    });
});
