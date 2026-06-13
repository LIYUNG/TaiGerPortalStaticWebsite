import { isInTheFuture } from '@utils/contants';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

export interface BucketedEvents {
    /** Future events still awaiting at least one confirmation. */
    pending: EventConfirmationCardEvent[];
    /** Future events confirmed by both requester and receiver. */
    upcoming: EventConfirmationCardEvent[];
    /** Events whose end is in the past. */
    past: EventConfirmationCardEvent[];
}

// Newest-first by start. Mirrors the previous `_.reverse(_.sortBy(events,
// ['start']))` (ascending then reversed = descending) used inline in the
// office-hours pages.
const sortByStartDesc = (
    events: EventConfirmationCardEvent[]
): EventConfirmationCardEvent[] =>
    [...events].sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
    );

/**
 * Split a flat events list into the three office-hours list sections. Replaces
 * the six duplicated `filter → sortBy → reverse → map` blocks that previously
 * lived inline (and recomputed each filter twice) in all_index/index/taiger_index.
 *
 * `isInTheFuture(end)` is the single source of truth for past-vs-future, so the
 * buckets stay consistent with `EventConfirmationCard`'s own past/future styling.
 */
export const bucketEvents = (
    events: EventConfirmationCardEvent[] = []
): BucketedEvents => {
    const future = events.filter((event) => isInTheFuture(event.end));
    return {
        pending: sortByStartDesc(
            future.filter(
                (event) =>
                    !event.isConfirmedReceiver || !event.isConfirmedRequester
            )
        ),
        upcoming: sortByStartDesc(
            future.filter(
                (event) =>
                    event.isConfirmedReceiver && event.isConfirmedRequester
            )
        ),
        past: sortByStartDesc(
            events.filter((event) => !isInTheFuture(event.end))
        )
    };
};

export default bucketEvents;
