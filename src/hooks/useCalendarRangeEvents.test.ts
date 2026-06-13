import { describe, it, expect } from 'vitest';
import { buildCalendarRangeQueryString } from './useCalendarRangeEvents';

const range = {
    startTime: '2025-06-01T00:00:00.000Z',
    endTime: '2025-06-30T23:59:59.999Z'
};

describe('buildCalendarRangeQueryString', () => {
    it('always matches on start (rangeField=start) and carries the window', () => {
        const qs = buildCalendarRangeQueryString(range);
        expect(qs).toContain('rangeField=start');
        expect(qs).toContain('startTime=');
        expect(qs).toContain('endTime=');
        // No receiver scope when none is given.
        expect(qs).not.toContain('receiver_id');
    });

    it('scopes to a receiver when provided', () => {
        const qs = buildCalendarRangeQueryString(range, 'agent-1');
        expect(qs).toContain('receiver_id=agent-1');
    });

    it('omits an empty receiver_id', () => {
        const qs = buildCalendarRangeQueryString(range, '');
        expect(qs).not.toContain('receiver_id');
    });
});
