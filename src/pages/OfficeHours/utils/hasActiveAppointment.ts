import { isInTheFuture } from '@utils/contants';
import type {
    EventConfirmationCardEvent,
    EventParticipant
} from '@components/Calendar/components/EventConfirmationCard';

const includesUser = (
    participants: EventParticipant[] | undefined,
    userId: string
): boolean => (participants ?? []).some((p) => p?._id?.toString() === userId);

/**
 * A student may hold only ONE active appointment at a time (across all agents/
 * editors). They have one if any event where they are the requester is still in
 * the future (the meeting hasn't ended). Mirrors the server-side one-total guard
 * in `postEvent`, so the UI can disable booking before the request 403s.
 *
 * The student page's event list isn't role-scoped, so filter by requester id.
 */
export const hasActiveAppointment = (
    events: EventConfirmationCardEvent[] = [],
    studentId?: string
): boolean => {
    if (!studentId) {
        return false;
    }
    return events.some(
        (event) =>
            isInTheFuture(event.end) &&
            includesUser(event.requester_id, studentId)
    );
};

export default hasActiveAppointment;
