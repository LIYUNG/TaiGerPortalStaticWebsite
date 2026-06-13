import { describe, it, expect } from 'vitest';
import { hasActiveAppointment } from './hasActiveAppointment';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

const FUTURE = '2999-01-01T10:30:00.000Z';
const PAST = '2000-01-01T10:30:00.000Z';

const ev = (requesterId: string, end: string): EventConfirmationCardEvent => ({
    _id: `e-${requesterId}-${end}`,
    start: '2999-01-01T10:00:00.000Z',
    end,
    requester_id: [{ _id: requesterId }]
});

describe('hasActiveAppointment', () => {
    it('is false with no events / no studentId', () => {
        expect(hasActiveAppointment([], 'me')).toBe(false);
        expect(hasActiveAppointment([ev('me', FUTURE)])).toBe(false);
    });

    it('is true when the student has a future appointment', () => {
        expect(hasActiveAppointment([ev('me', FUTURE)], 'me')).toBe(true);
    });

    it('ignores past appointments', () => {
        expect(hasActiveAppointment([ev('me', PAST)], 'me')).toBe(false);
    });

    it("ignores other students' future appointments", () => {
        expect(
            hasActiveAppointment(
                [ev('someone-else', FUTURE), ev('me', PAST)],
                'me'
            )
        ).toBe(false);
    });
});
