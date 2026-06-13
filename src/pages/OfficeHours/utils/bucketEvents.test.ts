import { describe, it, expect } from 'vitest';
import { bucketEvents } from './bucketEvents';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

// Far-past / far-future ends so the classification is deterministic regardless
// of when the test runs.
const PAST_END = '2000-01-01T10:00:00.000Z';
const FUTURE_END = '2999-01-01T10:00:00.000Z';

const makeEvent = (
    overrides: Partial<EventConfirmationCardEvent>
): EventConfirmationCardEvent => ({
    _id: 'e',
    start: '2999-01-01T09:30:00.000Z',
    end: FUTURE_END,
    isConfirmedReceiver: false,
    isConfirmedRequester: false,
    ...overrides
});

describe('bucketEvents', () => {
    it('returns empty buckets for empty / missing input', () => {
        expect(bucketEvents([])).toEqual({
            pending: [],
            upcoming: [],
            past: []
        });
        expect(bucketEvents()).toEqual({ pending: [], upcoming: [], past: [] });
    });

    it('classifies past events (end < now) into `past` regardless of confirmation', () => {
        const past = makeEvent({
            _id: 'p1',
            end: PAST_END,
            start: '2000-01-01T09:30:00.000Z',
            isConfirmedReceiver: true,
            isConfirmedRequester: true
        });
        const { pending, upcoming, past: pastBucket } = bucketEvents([past]);
        expect(pastBucket.map((e) => e._id)).toEqual(['p1']);
        expect(pending).toEqual([]);
        expect(upcoming).toEqual([]);
    });

    it('puts a future, both-confirmed event in `upcoming`', () => {
        const ev = makeEvent({
            _id: 'u1',
            isConfirmedReceiver: true,
            isConfirmedRequester: true
        });
        const { upcoming, pending } = bucketEvents([ev]);
        expect(upcoming.map((e) => e._id)).toEqual(['u1']);
        expect(pending).toEqual([]);
    });

    it('puts future events missing either confirmation in `pending`', () => {
        const onlyReceiver = makeEvent({
            _id: 'p-r',
            isConfirmedReceiver: true,
            isConfirmedRequester: false
        });
        const onlyRequester = makeEvent({
            _id: 'p-q',
            isConfirmedReceiver: false,
            isConfirmedRequester: true
        });
        const neither = makeEvent({ _id: 'p-n' });
        const { pending, upcoming } = bucketEvents([
            onlyReceiver,
            onlyRequester,
            neither
        ]);
        expect(pending.map((e) => e._id).sort()).toEqual(['p-n', 'p-q', 'p-r']);
        expect(upcoming).toEqual([]);
    });

    it('sorts each bucket newest-first by start', () => {
        const earlier = makeEvent({
            _id: 'early',
            start: '2999-01-01T09:00:00.000Z'
        });
        const later = makeEvent({
            _id: 'late',
            start: '2999-01-01T11:00:00.000Z'
        });
        const { pending } = bucketEvents([earlier, later]);
        expect(pending.map((e) => e._id)).toEqual(['late', 'early']);
    });
});
