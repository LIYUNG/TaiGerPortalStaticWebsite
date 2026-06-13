import { describe, it, expect } from 'vitest';
import { buildEventsPaginatedQueryString } from './useEventsPaginated';

describe('buildEventsPaginatedQueryString', () => {
    it('converts 0-based page to 1-based and maps pageSize → limit', () => {
        const qs = buildEventsPaginatedQueryString({
            page: 0,
            pageSize: 10
        });
        expect(qs).toContain('page=1');
        expect(qs).toContain('limit=10');
    });

    it('passes through before / receiver_id / sortOrder and skips empty values', () => {
        const qs = buildEventsPaginatedQueryString({
            page: 2,
            pageSize: 20,
            before: '2025-06-13T00:00:00.000Z',
            receiver_id: 'rc1',
            sortOrder: 'desc',
            after: ''
        });
        expect(qs).toContain('page=3');
        expect(qs).toContain('limit=20');
        expect(qs).toContain('receiver_id=rc1');
        expect(qs).toContain('sortOrder=desc');
        expect(qs).toContain('before=');
        // skipEmptyString drops the empty `after`.
        expect(qs).not.toContain('after=');
    });
});
